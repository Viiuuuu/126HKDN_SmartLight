using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using SmartLight.DeviceSimulator.Protocol;

namespace SmartLight.DeviceSimulator.Services;

/// <summary>
/// TCP Client kết nối tới HES Server, duy trì heartbeat, bắn telemetry định kỳ và xử lý gói CMD.
/// </summary>
public sealed class HesTcpClientWorker
{
    private readonly CabinetSimulationEngine _engine;
    private readonly string _host;
    private readonly int _port;
    private readonly TimeSpan _heartbeatInterval;
    private readonly TimeSpan _telemetryInterval;
    private readonly TimeSpan _reconnectDelay;
    private readonly Action<string> _log;

    private readonly SemaphoreSlim _sendLock = new(1, 1);
    private volatile bool _manualOffline;
    private volatile bool _isConnected;
    private CancellationTokenSource? _sessionCts;
    private TcpClient? _activeClient;
    private StreamWriter? _activeWriter;

    public bool IsConnected => _isConnected;
    public bool IsManualOffline => _manualOffline;

    public HesTcpClientWorker(
        CabinetSimulationEngine engine,
        string host,
        int port,
        TimeSpan heartbeatInterval,
        TimeSpan telemetryInterval,
        Action<string> log,
        TimeSpan? reconnectDelay = null)
    {
        _engine = engine;
        _host = host;
        _port = port;
        _heartbeatInterval = heartbeatInterval;
        _telemetryInterval = telemetryInterval;
        _log = log;
        _reconnectDelay = reconnectDelay ?? TimeSpan.FromSeconds(4);
    }

    public async Task RunAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (_manualOffline)
            {
                await DelayQuietlyAsync(TimeSpan.FromMilliseconds(500), stoppingToken);
                continue;
            }

            try
            {
                await RunSingleSessionAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _log($"[TCP] Kết nối gián đoạn: {ex.Message}");
            }
            finally
            {
                CleanupActiveSession();
            }

            if (!stoppingToken.IsCancellationRequested && !_manualOffline)
            {
                _log($"[TCP] Thử kết nối lại tới {_host}:{_port} sau {_reconnectDelay.TotalSeconds:0.#}s...");
                await DelayQuietlyAsync(_reconnectDelay, stoppingToken);
            }
        }
    }

    public void ToggleOfflineMode()
    {
        _manualOffline = !_manualOffline;
        if (_manualOffline)
        {
            _log("[TCP] Đã chuyển sang chế độ OFFLINE chủ động (ngắt kết nối TCP).");
            CancelActiveSession();
        }
        else
        {
            _log("[TCP] Đã bật lại ONLINE, đang kết nối tới HES Server...");
        }
    }

    public async Task<bool> SendTelemetryNowAsync(CancellationToken cancellationToken = default)
    {
        if (!_isConnected || _activeWriter is null)
        {
            _log("[TELEMETRY] Chưa kết nối tới HES Server, không thể gửi bản tin.");
            return false;
        }

        var packet = _engine.SampleTelemetry();
        await SendJsonLineAsync(packet, cancellationToken);
        _log($"[TELEMETRY -> HES] P={packet.Tu.CongSuat:F3}kW | E={packet.Tu.DienNang:F3}kWh | Đèn={packet.Den.Count}");
        return true;
    }

    private async Task RunSingleSessionAsync(CancellationToken stoppingToken)
    {
        using var client = new TcpClient();
        using var sessionCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
        _sessionCts = sessionCts;
        _activeClient = client;

        _log($"[TCP] Đang kết nối tới HES Server {_host}:{_port}...");
        await client.ConnectAsync(_host, _port, sessionCts.Token);

        using var stream = client.GetStream();
        using var reader = new StreamReader(stream, new UTF8Encoding(false), detectEncodingFromByteOrderMarks: false, leaveOpen: true);
        using var writer = new StreamWriter(stream, new UTF8Encoding(false), bufferSize: 1024, leaveOpen: true)
        {
            AutoFlush = true,
            NewLine = "\n"
        };

        _activeWriter = writer;
        _isConnected = true;
        _log($"[TCP] Đã kết nối tới {_host}:{_port}.");

        var hello = _engine.CreateHelloMessage();
        await SendJsonLineAsync(hello, sessionCts.Token);
        _log($"[HELLO -> HES] {hello.MaThietBi} ({hello.MaTu})");

        // Gửi mẫu telemetry đầu tiên ngay khi bắt tay thành công để Web/HES có số liệu tức thì
        await SendTelemetryNowAsync(sessionCts.Token);

        var readTask = ReadLoopAsync(reader, sessionCts.Token);
        var heartbeatTask = HeartbeatLoopAsync(sessionCts.Token);
        var telemetryTask = TelemetryLoopAsync(sessionCts.Token);

        var completedTask = await Task.WhenAny(readTask, heartbeatTask, telemetryTask);
        await sessionCts.CancelAsync();

        try
        {
            await Task.WhenAll(readTask, heartbeatTask, telemetryTask);
        }
        catch (OperationCanceledException) when (!stoppingToken.IsCancellationRequested)
        {
            // Bỏ qua lỗi hủy các tác vụ song song khi 1 luồng kết thúc phiên
        }

        if (completedTask.IsFaulted && completedTask.Exception is not null)
        {
            throw completedTask.Exception.InnerException ?? completedTask.Exception;
        }
    }

    private async Task ReadLoopAsync(StreamReader reader, CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);
            if (line is null)
            {
                _log("[TCP] HES Server đã đóng kết nối.");
                break;
            }

            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            await HandleIncomingLineAsync(line, ct);
        }
    }

    private async Task HandleIncomingLineAsync(string jsonLine, CancellationToken ct)
    {
        try
        {
            using var doc = JsonDocument.Parse(jsonLine);
            if (!doc.RootElement.TryGetProperty("type", out var typeProp))
            {
                _log($"[HES -> SIM] Gói tin thiếu trường 'type': {jsonLine}");
                return;
            }

            var msgType = (typeProp.GetString() ?? string.Empty).Trim().ToUpperInvariant();
            if (msgType != HesMessageTypes.Command)
            {
                _log($"[HES -> SIM] Nhận gói '{msgType}': {jsonLine}");
                return;
            }

            var cmd = JsonSerializer.Deserialize<CommandMessage>(jsonLine, HesJson.Options);
            if (cmd is null)
            {
                return;
            }

            _log($"[CMD <- HES] MaLenh=#{cmd.MaLenh} | {cmd.TargetType}:{cmd.TargetCode} | {cmd.HanhDong}" +
                 (cmd.MucSang.HasValue ? $" ({cmd.MucSang}%)" : string.Empty));

            if (_engine.SimulatedCommandDelay > TimeSpan.Zero)
            {
                await Task.Delay(_engine.SimulatedCommandDelay, ct);
            }

            var ack = _engine.ProcessCommand(cmd);
            if (ack is null)
            {
                _log($"[SILENT] Chế độ SilentTimeout đang bật -> KHÔNG gửi ACK cho lệnh #{cmd.MaLenh}.");
                return;
            }

            await SendJsonLineAsync(ack, ct);
            _log($"[ACK -> HES] MaLenh=#{ack.MaLenh} | Success={ack.Success} | {ack.Message}");
        }
        catch (JsonException ex)
        {
            _log($"[PARSE ERR] JSON không hợp lệ: {ex.Message}");
        }
    }

    private async Task HeartbeatLoopAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(_heartbeatInterval);
        while (await timer.WaitForNextTickAsync(ct))
        {
            var hb = _engine.CreateHeartbeatMessage();
            await SendJsonLineAsync(hb, ct);
            _log($"[HEARTBEAT -> HES] {hb.MaThietBi}");
        }
    }

    private async Task TelemetryLoopAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(_telemetryInterval);
        while (await timer.WaitForNextTickAsync(ct))
        {
            await SendTelemetryNowAsync(ct);
        }
    }

    private async Task SendJsonLineAsync<T>(T payload, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(payload, HesJson.Options);
        await _sendLock.WaitAsync(ct);
        try
        {
            if (_activeWriter is null)
            {
                throw new IOException("Socket writer không khả dụng.");
            }
            await _activeWriter.WriteLineAsync(json.AsMemory(), ct);
        }
        finally
        {
            _sendLock.Release();
        }
    }

    private void CancelActiveSession()
    {
        try
        {
            _sessionCts?.Cancel();
            _activeClient?.Close();
        }
        catch
        {
            // Bỏ qua lỗi khi đóng socket chủ động
        }
    }

    private void CleanupActiveSession()
    {
        _isConnected = false;
        _activeWriter = null;
        _activeClient = null;
        _sessionCts?.Dispose();
        _sessionCts = null;
    }

    private static async Task DelayQuietlyAsync(TimeSpan delay, CancellationToken ct)
    {
        try
        {
            await Task.Delay(delay, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // Bỏ qua khi đang dừng chương trình
        }
    }
}

