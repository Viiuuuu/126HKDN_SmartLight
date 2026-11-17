using SmartLight.HesService.Data;
using SmartLight.HesService.Options;
using SmartLight.HesService.Services;

var builder = WebApplication.CreateBuilder(args);

var hesOptions = HesServiceOptions.FromConfiguration(builder.Configuration);

builder.Services.AddSingleton(hesOptions);
builder.Services.AddSingleton<RuntimeFrameBuffer>();
builder.Services.AddSingleton<PendingDispatchCoordinator>();
builder.Services.AddSingleton<IHesRepository, HesSqlRepository>();
builder.Services.AddSingleton<TcpGatewayHostedService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<TcpGatewayHostedService>());
builder.Services.AddSingleton<CommandDispatcherHostedService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<CommandDispatcherHostedService>());

builder.Services.AddCors(options =>
{
    options.AddPolicy("HesCors", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("HesCors");

app.MapGet("/hes/health", () => Results.Ok(new
{
    ok = true,
    service = "SmartLight.HesService",
    utc = DateTime.UtcNow
}));

app.MapGet("/hes/status", (
    HesServiceOptions opts,
    TcpGatewayHostedService tcpGateway,
    RuntimeFrameBuffer frameBuffer) =>
{
    var sessions = tcpGateway.GetActiveSessions();
    return Results.Ok(new
    {
        serviceRunning = true,
        startedAtUtc = tcpGateway.StartedAtUtc,
        uptimeSeconds = Math.Max(0, (long)(DateTime.UtcNow - tcpGateway.StartedAtUtc).TotalSeconds),
        tcpListening = tcpGateway.IsListening,
        tcpPort = tcpGateway.ListeningPort,
        activeSessionCount = sessions.Count,
        sessions,
        traffic = frameBuffer.GetSnapshot(),
        config = opts.ToDto()
    });
});

app.MapGet("/hes/sessions", (TcpGatewayHostedService tcpGateway)
    => Results.Ok(tcpGateway.GetActiveSessions()));

app.MapGet("/hes/frames", (
    RuntimeFrameBuffer frameBuffer,
    int? limit,
    string? direction,
    string? type,
    string? maTu,
    long? afterSeq) =>
{
    var frames = frameBuffer.Query(limit ?? 200, direction, type, maTu, afterSeq);
    return Results.Ok(new
    {
        snapshot = frameBuffer.GetSnapshot(),
        frames
    });
});

app.MapPost("/hes/frames/clear", (RuntimeFrameBuffer frameBuffer) =>
{
    frameBuffer.Clear();
    return Results.Ok(new { cleared = true });
});

app.MapGet("/hes/config", (HesServiceOptions opts) => Results.Ok(opts.ToDto()));

app.MapPost("/hes/config", async (
    UpdateHesConfigRequest req,
    HesServiceOptions opts,
    TcpGatewayHostedService tcpGateway) =>
{
    var previousPort = opts.TcpPort;

    if (req.TcpPort.HasValue) opts.TcpPort = req.TcpPort.Value;
    if (req.CommandPollIntervalMs.HasValue) opts.CommandPollIntervalMs = req.CommandPollIntervalMs.Value;
    if (req.CommandTimeoutSeconds.HasValue) opts.CommandTimeoutSeconds = req.CommandTimeoutSeconds.Value;
    if (req.HeartbeatTimeoutSeconds.HasValue) opts.HeartbeatTimeoutSeconds = req.HeartbeatTimeoutSeconds.Value;
    if (req.RingBufferCapacity.HasValue) opts.RingBufferCapacity = req.RingBufferCapacity.Value;

    var tcpRestarted = false;
    if (opts.TcpPort != previousPort || req.RestartTcpListener == true)
    {
        await tcpGateway.RestartListenerAsync();
        tcpRestarted = true;
    }

    return Results.Ok(new
    {
        tcpRestarted,
        config = opts.ToDto()
    });
});

app.MapPost("/hes/commands", async (
    EnqueueHesCommandRequest req,
    IHesRepository repository,
    CancellationToken ct) =>
{
    var hanhDong = (req.HanhDong ?? string.Empty).Trim().ToUpperInvariant();
    if (hanhDong is not ("BAT" or "TAT" or "DIM"))
    {
        return Results.BadRequest(new { message = "HanhDong phải là BAT, TAT hoặc DIM." });
    }

    var targetCount = (!string.IsNullOrWhiteSpace(req.MaTu) ? 1 : 0)
                    + (!string.IsNullOrWhiteSpace(req.MaTuyen) ? 1 : 0)
                    + (!string.IsNullOrWhiteSpace(req.MaDen) ? 1 : 0);
    if (targetCount != 1)
    {
        return Results.BadRequest(new { message = "Phải chỉ định đúng 1 đối tượng điều khiển (MaTu, MaTuyen hoặc MaDen)." });
    }

    if (hanhDong == "DIM" && (!req.MucSang.HasValue || req.MucSang.Value > 100))
    {
        return Results.BadRequest(new { message = "Lệnh DIM yêu cầu MucSang trong khoảng 0..100." });
    }

    var maLenh = await repository.EnqueueCommandAsync(
        req.MaTu,
        req.MaTuyen,
        req.MaDen,
        hanhDong,
        req.MucSang,
        req.NguonLenh ?? 1,
        req.MaNguoiDung,
        ct);

    return Results.Ok(new { maLenh });
});

app.Run();

public sealed record UpdateHesConfigRequest(
    int? TcpPort,
    int? CommandPollIntervalMs,
    int? CommandTimeoutSeconds,
    int? HeartbeatTimeoutSeconds,
    int? RingBufferCapacity,
    bool? RestartTcpListener);

public sealed record EnqueueHesCommandRequest(
    string? MaTu,
    string? MaTuyen,
    string? MaDen,
    string? HanhDong,
    byte? MucSang,
    byte? NguonLenh,
    string? MaNguoiDung);

