using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using SmartLight.HesService.Data;
using SmartLight.HesService.Options;
using SmartLight.HesService.Protocol;

namespace SmartLight.HesService.Services;

public sealed record HesSessionDto(
    long SessionId,
    string MaTu,
    string MaThietBi,
    string RemoteEndPoint,
    DateTime ConnectedAtUtc,
    DateTime LastSeenUtc,
    DateTime? LastTelemetryUtc,
    long RxFrames,
    long TxFrames);

public sealed class CabinetSession : IDisposable
{
    private long _rxFrames;
    private long _txFrames;
    private long _lastSeenTicks = DateTime.UtcNow.Ticks;
    private long _lastTelemetryTicks;

    public CabinetSession(long sessionId, TcpClient client, string remoteEndPoint)
    {
        SessionId = sessionId;
        Client = client;
        Stream = client.GetStream();
        RemoteEndPoint = remoteEndPoint;
        ConnectedAtUtc = DateTime.UtcNow;
    }

    public long SessionId { get; }
    public TcpClient Client { get; }
    public NetworkStream Stream { get; }
    public string RemoteEndPoint { get; }
    public DateTime ConnectedAtUtc { get; }
    public SemaphoreSlim WriteLock { get; } = new(1, 1);
    public string MaTu { get; set; } = string.Empty;
    public string MaThietBi { get; set; } = string.Empty;
    public bool AuthenticatedHello { get; set; }

    public DateTime LastSeenUtc
    {
        get => new(Interlocked.Read(ref _lastSeenTicks), DateTimeKind.Utc);
        set => Interlocked.Exchange(ref _lastSeenTicks, value.Ticks);
    }

    public DateTime? LastTelemetryUtc
    {
        get
        {
            var ticks = Interlocked.Read(ref _lastTelemetryTicks);
            return ticks == 0 ? null : new DateTime(ticks, DateTimeKind.Utc);
        }
        set => Interlocked.Exchange(ref _lastTelemetryTicks, value?.Ticks ?? 0);
    }

    public long RxFrames => Interlocked.Read(ref _rxFrames);
    public long TxFrames => Interlocked.Read(ref _txFrames);

    public void IncrementRx() => Interlocked.Increment(ref _rxFrames);
    public void IncrementTx() => Interlocked.Increment(ref _txFrames);

    public HesSessionDto ToDto() => new(
        SessionId,
        MaTu,
        MaThietBi,
        RemoteEndPoint,
        ConnectedAtUtc,
        LastSeenUtc,
        LastTelemetryUtc,
        RxFrames,
        TxFrames);

    public void Dispose()
    {
        try { Stream.Dispose(); } catch { }
        try { Client.Dispose(); } catch { }
        WriteLock.Dispose();
    }
}

public sealed class TcpGatewayHostedService : BackgroundService
{
    private readonly HesServiceOptions _options;
    private readonly IHesRepository _repository;
    private readonly RuntimeFrameBuffer _frameBuffer;
    private readonly PendingDispatchCoordinator _dispatchCoordinator;
    private readonly ILogger<TcpGatewayHostedService> _logger;

    private readonly ConcurrentDictionary<string, CabinetSession> _sessionsByMaTu = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<long, CabinetSession> _sessionsById = new();
    private readonly SemaphoreSlim _listenerLifecycleLock = new(1, 1);

    private long _sessionSeq;
    private TcpListener? _listener;
    private CancellationTokenSource? _acceptLoopCts;
    private volatile bool _isListening;
    private volatile int _listeningPort;

    public TcpGatewayHostedService(
        HesServiceOptions options,
        IHesRepository repository,
        RuntimeFrameBuffer frameBuffer,
        PendingDispatchCoordinator dispatchCoordinator,
        ILogger<TcpGatewayHostedService> logger)
    {
        _options = options;
        _repository = repository;
        _frameBuffer = frameBuffer;
        _dispatchCoordinator = dispatchCoordinator;
        _logger = logger;
    }

    public DateTime StartedAtUtc { get; } = DateTime.UtcNow;
    public bool IsListening => _isListening;
    public int ListeningPort => _listeningPort;

    public IReadOnlyList<HesSessionDto> GetActiveSessions()
        => _sessionsByMaTu.Values.OrderBy(s => s.MaTu, StringComparer.OrdinalIgnoreCase).Select(s => s.ToDto()).ToList();

    public bool TryGetSession(string maTu, out CabinetSession? session)
    {
        if (string.IsNullOrWhiteSpace(maTu))
        {
            session = null;
            return false;
        }
        return _sessionsByMaTu.TryGetValue(maTu.Trim(), out session);
    }

    public async Task<CommandDispatchOutcome> SendCommandAsync(ClaimedCommand cmd, CancellationToken ct)
    {
        if (!TryGetSession(cmd.OwnerMaTu, out var session) || session is null || !session.Client.Connected)
        {
            return new CommandDispatchOutcome(false, DateTime.Now,
                $"Tủ {cmd.OwnerMaTu} ({cmd.OwnerMaThietBi}) chưa kết nối TCP với HES.");
        }

        var message = new CommandMessage
        {
            Type = HesMessageTypes.Command,
            MaLenh = cmd.MaLenh,
            TargetType = cmd.TargetType,
            TargetCode = cmd.TargetCode,
            HanhDong = cmd.HanhDong,
            MucSang = cmd.MucSang,
            Timestamp = DateTime.UtcNow
        };

        var json = HesJson.Serialize(message);
        var payload = HesJson.Utf8NoBom.GetBytes(json + "\n");

        try
        {
            await session.WriteLock.WaitAsync(ct);
            try
            {
                await session.Stream.WriteAsync(payload, ct);
                await session.Stream.FlushAsync(ct);
            }
            finally
            {
                session.WriteLock.Release();
            }

            session.IncrementTx();
            _frameBuffer.IncrementCommandSent();
            _frameBuffer.Record(
                "TX",
                HesMessageTypes.Command,
                cmd.OwnerMaTu,
                cmd.OwnerMaThietBi,
                session.RemoteEndPoint,
                $"CMD #{cmd.MaLenh}: {cmd.HanhDong} {cmd.TargetType}={cmd.TargetCode}" +
                (cmd.MucSang.HasValue ? $" ({cmd.MucSang}%)" : string.Empty),
                json);

            _logger.LogInformation("[TX CMD] #{MaLenh} -> {MaTu}/{TargetType}:{TargetCode} ({Action} {Dim})",
                cmd.MaLenh, cmd.OwnerMaTu, cmd.TargetType, cmd.TargetCode, cmd.HanhDong, cmd.MucSang);

            return new CommandDispatchOutcome(true, DateTime.Now, null);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogWarning(ex, "Failed to send command #{MaLenh} to {MaTu}", cmd.MaLenh, cmd.OwnerMaTu);
            return new CommandDispatchOutcome(false, DateTime.Now, $"Lỗi truyền TCP xuống tủ {cmd.OwnerMaTu}: {ex.Message}");
        }
    }

    public async Task RestartListenerAsync()
    {
        await _listenerLifecycleLock.WaitAsync();
        try
        {
            _isListening = false;
            try { _acceptLoopCts?.Cancel(); } catch { }
            try { _listener?.Stop(); } catch { }
        }
        finally
        {
            _listenerLifecycleLock.Release();
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await _repository.ResetAllCabinetsOfflineAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not reset cabinet connection flags on startup (will retry on incoming traffic).");
        }

        var reaperTask = MonitorHeartbeatTimeoutsAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            var port = _options.TcpPort;
            CancellationTokenSource loopCts;
            TcpListener listener;

            await _listenerLifecycleLock.WaitAsync(stoppingToken);
            try
            {
                _acceptLoopCts?.Dispose();
                _acceptLoopCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
                loopCts = _acceptLoopCts;

                listener = new TcpListener(IPAddress.Any, port);
                listener.Start();
                _listener = listener;
                _listeningPort = port;
                _isListening = true;
                _logger.LogInformation("HES TCP Gateway listening on 0.0.0.0:{Port}", port);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _isListening = false;
                _logger.LogError(ex, "Unable to bind HES TCP listener on port {Port}. Retrying in 5s...", port);
                _listenerLifecycleLock.Release();
                await Task.Delay(5000, stoppingToken);
                continue;
            }
            _listenerLifecycleLock.Release();

            try
            {
                while (!loopCts.Token.IsCancellationRequested)
                {
                    var client = await listener.AcceptTcpClientAsync(loopCts.Token);
                    _ = Task.Run(() => HandleClientAsync(client, stoppingToken), stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Listener stopped cleanly for restart or shutdown
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "TCP Accept loop interrupted on port {Port}", port);
            }
            finally
            {
                _isListening = false;
                try { listener.Stop(); } catch { }
            }

            if (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(500, stoppingToken);
            }
        }

        await reaperTask;
    }

    private async Task HandleClientAsync(TcpClient client, CancellationToken stoppingToken)
    {
        var remote = client.Client.RemoteEndPoint?.ToString() ?? "unknown";
        var sessionId = Interlocked.Increment(ref _sessionSeq);
        using var session = new CabinetSession(sessionId, client, remote);
        _sessionsById[sessionId] = session;

        _logger.LogInformation("TCP socket connected: #{SessionId} from {Remote}", sessionId, remote);

        try
        {
            client.NoDelay = true;
            using var reader = new StreamReader(session.Stream, HesJson.Utf8NoBom, detectEncodingFromByteOrderMarks: false, leaveOpen: true);

            while (!stoppingToken.IsCancellationRequested && client.Connected)
            {
                var line = await reader.ReadLineAsync(stoppingToken);
                if (line is null) break;
                if (string.IsNullOrWhiteSpace(line)) continue;

                session.LastSeenUtc = DateTime.UtcNow;
                session.IncrementRx();

                await ProcessIncomingFrameAsync(session, line, stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Shutdown
        }
        catch (IOException)
        {
            _logger.LogInformation("TCP socket closed cleanly/EOF: {Remote} ({MaTu})", remote, session.MaTu);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "TCP connection error for {Remote} ({MaTu})", remote, session.MaTu);
        }
        finally
        {
            _sessionsById.TryRemove(sessionId, out _);

            if (!string.IsNullOrEmpty(session.MaTu) &&
                _sessionsByMaTu.TryGetValue(session.MaTu, out var registered) &&
                ReferenceEquals(registered, session))
            {
                _sessionsByMaTu.TryRemove(new KeyValuePair<string, CabinetSession>(session.MaTu, session));
                try
                {
                    await _repository.SetCabinetConnectionStateAsync(session.MaTu, false, DateTime.Now, CancellationToken.None);
                    _logger.LogInformation("Cabinet offline: {MaTu} ({MaThietBi})", session.MaTu, session.MaThietBi);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to update offline state in SQL for {MaTu}", session.MaTu);
                }
            }
        }
    }

    private async Task ProcessIncomingFrameAsync(CabinetSession session, string rawJson, CancellationToken ct)
    {
        HesEnvelope? envelope;
        try
        {
            envelope = HesJson.Deserialize<HesEnvelope>(rawJson);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Malformed JSON frame from {Remote}: {Raw}", session.RemoteEndPoint, rawJson);
            _frameBuffer.Record("RX", "INVALID", session.MaTu, session.MaThietBi, session.RemoteEndPoint, $"JSON lỗi: {ex.Message}", rawJson);
            return;
        }

        var msgType = (envelope?.Type ?? string.Empty).Trim().ToUpperInvariant();
        switch (msgType)
        {
            case HesMessageTypes.Hello:
                await HandleHelloAsync(session, rawJson, ct);
                break;

            case HesMessageTypes.Heartbeat:
                await HandleHeartbeatAsync(session, rawJson, ct);
                break;

            case HesMessageTypes.Ack:
                await HandleAckAsync(session, rawJson, ct);
                break;

            case HesMessageTypes.Telemetry:
                await HandleTelemetryAsync(session, rawJson, ct);
                break;

            default:
                _frameBuffer.Record("RX", msgType.Length == 0 ? "UNKNOWN" : msgType,
                    session.MaTu, session.MaThietBi, session.RemoteEndPoint, $"Loại gói không hỗ trợ: {msgType}", rawJson);
                break;
        }
    }

    private async Task HandleHelloAsync(CabinetSession session, string rawJson, CancellationToken ct)
    {
        var msg = HesJson.Deserialize<HelloMessage>(rawJson);
        if (msg is null) return;

        var resolved = await _repository.ResolveCabinetAsync(msg.MaThietBi, msg.MaTu, ct);
        var maTu = resolved?.MaTu ?? msg.MaTu.Trim();
        var maThietBi = resolved?.MaThietBi ?? msg.MaThietBi.Trim();

        session.MaTu = maTu;
        session.MaThietBi = maThietBi;
        session.AuthenticatedHello = true;

        if (!string.IsNullOrEmpty(maTu))
        {
            _sessionsByMaTu.AddOrUpdate(maTu, session, (_, existing) =>
            {
                if (!ReferenceEquals(existing, session))
                {
                    _logger.LogInformation("Replacing previous TCP session for {MaTu} ({OldRemote} -> {NewRemote})",
                        maTu, existing.RemoteEndPoint, session.RemoteEndPoint);
                    try { existing.Client.Close(); } catch { }
                }
                return session;
            });

            await _repository.SetCabinetConnectionStateAsync(maTu, true, DateTime.Now, ct);
        }

        var summary = resolved is null
            ? $"HELLO từ thiết bị chưa khai báo DB: {maThietBi} ({maTu})"
            : $"HELLO xác thực tủ {maTu} ({maThietBi}) thành công";

        _frameBuffer.Record("RX", HesMessageTypes.Hello, maTu, maThietBi, session.RemoteEndPoint, summary, rawJson);
        _logger.LogInformation("[RX HELLO] {MaTu} ({MaThietBi}) from {Remote}", maTu, maThietBi, session.RemoteEndPoint);
    }

    private async Task HandleHeartbeatAsync(CabinetSession session, string rawJson, CancellationToken ct)
    {
        var msg = HesJson.Deserialize<HeartbeatMessage>(rawJson);
        var maThietBi = string.IsNullOrEmpty(session.MaThietBi) ? (msg?.MaThietBi ?? string.Empty).Trim() : session.MaThietBi;
        var maTu = session.MaTu;

        if (string.IsNullOrEmpty(maTu) && !string.IsNullOrEmpty(maThietBi))
        {
            var resolved = await _repository.ResolveCabinetAsync(maThietBi, null, ct);
            if (resolved is not null)
            {
                maTu = resolved.MaTu;
                session.MaTu = resolved.MaTu;
                session.MaThietBi = resolved.MaThietBi;
                _sessionsByMaTu[maTu] = session;
            }
        }

        if (!string.IsNullOrEmpty(maTu))
        {
            await _repository.SetCabinetConnectionStateAsync(maTu, true, DateTime.Now, ct);
        }

        _frameBuffer.Record("RX", HesMessageTypes.Heartbeat, maTu, maThietBi, session.RemoteEndPoint,
            $"HEARTBEAT OK từ {maTu} ({maThietBi})", rawJson);
    }

    private async Task HandleAckAsync(CabinetSession session, string rawJson, CancellationToken ct)
    {
        var ack = HesJson.Deserialize<AckMessage>(rawJson);
        if (ack is null) return;

        var maTu = session.MaTu;
        var maThietBi = string.IsNullOrEmpty(session.MaThietBi) ? ack.MaThietBi.Trim() : session.MaThietBi;
        var resultLabel = ack.Success ? "OK" : "ERR";

        _frameBuffer.Record("RX", HesMessageTypes.Ack, maTu, maThietBi, session.RemoteEndPoint,
            $"ACK #{ack.MaLenh} [{resultLabel}]: {ack.Message}", rawJson);

        try
        {
            await _dispatchCoordinator.WaitIfDispatchingAsync(ack.MaLenh, ct);
            var applied = await _repository.ApplyCommandAckAsync(ack.MaLenh, ack.Success, ack.Message, DateTime.Now, ct);
            if (applied)
            {
                if (ack.Success) _frameBuffer.IncrementCommandSuccess();
                else _frameBuffer.IncrementCommandFailed();
            }
            _logger.LogInformation("[RX ACK] #{MaLenh} Success={Success} Applied={Applied} Msg={Msg}",
                ack.MaLenh, ack.Success, applied, ack.Message);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Error applying ACK for command #{MaLenh}", ack.MaLenh);
        }
    }

    private async Task HandleTelemetryAsync(CabinetSession session, string rawJson, CancellationToken ct)
    {
        var msg = HesJson.Deserialize<TelemetryMessage>(rawJson);
        if (msg is null) return;

        var resolved = string.IsNullOrEmpty(session.MaTu)
            ? await _repository.ResolveCabinetAsync(msg.MaThietBi, msg.MaTu, ct)
            : null;

        var maTu = !string.IsNullOrEmpty(session.MaTu)
            ? session.MaTu
            : (resolved?.MaTu ?? msg.MaTu.Trim());
        var maThietBi = !string.IsNullOrEmpty(session.MaThietBi)
            ? session.MaThietBi
            : (resolved?.MaThietBi ?? msg.MaThietBi.Trim());

        if (string.IsNullOrEmpty(session.MaTu) && !string.IsNullOrEmpty(maTu))
        {
            session.MaTu = maTu;
            session.MaThietBi = maThietBi;
            _sessionsByMaTu[maTu] = session;
        }

        session.LastTelemetryUtc = DateTime.UtcNow;

        var powerText = msg.Tu is null ? "?" : $"{msg.Tu.TrangThaiNguon} P={msg.Tu.CongSuat:0.000}kW";
        _frameBuffer.Record("RX", HesMessageTypes.Telemetry, maTu, maThietBi, session.RemoteEndPoint,
            $"TELEMETRY {maTu}: {powerText}, {msg.Tuyen.Count} tuyến, {msg.Den.Count} đèn", rawJson);

        if (string.IsNullOrEmpty(maTu)) return;

        var measuredAtLocal = msg.ThoiGianDo == default
            ? DateTime.Now
            : msg.ThoiGianDo.Kind == DateTimeKind.Utc
                ? msg.ThoiGianDo.ToLocalTime()
                : msg.ThoiGianDo;

        try
        {
            await _repository.SaveTelemetryAsync(maTu, msg, measuredAtLocal, ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Error saving TELEMETRY for {MaTu}", maTu);
        }
    }

    private async Task MonitorHeartbeatTimeoutsAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(5000, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            var timeout = TimeSpan.FromSeconds(_options.HeartbeatTimeoutSeconds);
            var cutoffUtc = DateTime.UtcNow - timeout;

            foreach (var session in _sessionsById.Values)
            {
                if (session.LastSeenUtc < cutoffUtc)
                {
                    _logger.LogWarning("Closing timed-out TCP session #{SessionId} ({MaTu}, last seen {LastSeen:u})",
                        session.SessionId, session.MaTu, session.LastSeenUtc);
                    try { session.Client.Close(); } catch { }
                }
            }
        }
    }
}
