using SmartLight.HesService.Data;
using SmartLight.HesService.Options;

namespace SmartLight.HesService.Services;

public sealed class CommandDispatcherHostedService : BackgroundService
{
    private readonly HesServiceOptions _options;
    private readonly IHesRepository _repository;
    private readonly TcpGatewayHostedService _tcpGateway;
    private readonly RuntimeFrameBuffer _frameBuffer;
    private readonly PendingDispatchCoordinator _dispatchCoordinator;
    private readonly ILogger<CommandDispatcherHostedService> _logger;

    public CommandDispatcherHostedService(
        HesServiceOptions options,
        IHesRepository repository,
        TcpGatewayHostedService tcpGateway,
        RuntimeFrameBuffer frameBuffer,
        PendingDispatchCoordinator dispatchCoordinator,
        ILogger<CommandDispatcherHostedService> logger)
    {
        _options = options;
        _repository = repository;
        _tcpGateway = tcpGateway;
        _frameBuffer = frameBuffer;
        _dispatchCoordinator = dispatchCoordinator;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("HES Command Dispatcher started (poll={PollMs}ms, cmdTimeout={TimeoutS}s).",
            _options.CommandPollIntervalMs, _options.CommandTimeoutSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            await DispatchBatchSafeAsync(stoppingToken);
            await SweepTimeoutsSafeAsync(stoppingToken);

            try
            {
                await Task.Delay(_options.CommandPollIntervalMs, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    public async Task DispatchBatchSafeAsync(CancellationToken ct)
    {
        var trackedIds = new List<long>();
        try
        {
            var outcomes = await _repository.DispatchPendingCommandsAsync(
                async (claimed, token) =>
                {
                    _dispatchCoordinator.BeginDispatch(claimed.MaLenh);
                    trackedIds.Add(claimed.MaLenh);
                    return await _tcpGateway.SendCommandAsync(claimed, token);
                },
                ct);

            foreach (var (cmd, outcome) in outcomes)
            {
                if (!outcome.Sent)
                {
                    _frameBuffer.IncrementCommandFailed();
                    _logger.LogWarning("[CMD #{MaLenh}] Dispatch failed: {Reason}", cmd.MaLenh, outcome.ErrorMessage);
                }
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error polling/dispatching pending commands from SQL Server.");
        }
        finally
        {
            foreach (var id in trackedIds)
            {
                _dispatchCoordinator.CompleteDispatch(id);
            }
        }
    }

    public async Task SweepTimeoutsSafeAsync(CancellationToken ct)
    {
        try
        {
            var timedOut = await _repository.TimeoutExpiredCommandsAsync(_options.CommandTimeoutSeconds, DateTime.Now, ct);
            if (timedOut > 0)
            {
                _frameBuffer.IncrementCommandTimeout(timedOut);
                _logger.LogWarning("Marked {Count} awaiting-ACK command(s) as timed out (trangThaiLenh=4).", timedOut);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sweeping timed-out commands.");
        }
    }
}

