namespace SmartLight.HesService.Options;

/// <summary>
/// Runtime configuration for the HES TCP Gateway, Command Dispatcher, and Ring Buffer.
/// Thread-safe getters/setters allow live adjustments from the HES SCADA configuration page.
/// </summary>
public sealed class HesServiceOptions
{
    private readonly object _sync = new();

    private int _tcpPort = 8088;
    private int _httpPort = 5088;
    private int _commandPollIntervalMs = 500;
    private int _commandTimeoutSeconds = 15;
    private int _heartbeatTimeoutSeconds = 45;
    private int _ringBufferCapacity = 4096;

    public string ConnectionString { get; set; } = string.Empty;

    public int TcpPort
    {
        get { lock (_sync) return _tcpPort; }
        set { lock (_sync) _tcpPort = Math.Clamp(value, 1024, 65535); }
    }

    public int HttpPort
    {
        get { lock (_sync) return _httpPort; }
        set { lock (_sync) _httpPort = Math.Clamp(value, 1024, 65535); }
    }

    public int CommandPollIntervalMs
    {
        get { lock (_sync) return _commandPollIntervalMs; }
        set { lock (_sync) _commandPollIntervalMs = Math.Clamp(value, 100, 10000); }
    }

    public int CommandTimeoutSeconds
    {
        get { lock (_sync) return _commandTimeoutSeconds; }
        set { lock (_sync) _commandTimeoutSeconds = Math.Clamp(value, 3, 300); }
    }

    public int HeartbeatTimeoutSeconds
    {
        get { lock (_sync) return _heartbeatTimeoutSeconds; }
        set { lock (_sync) _heartbeatTimeoutSeconds = Math.Clamp(value, 10, 600); }
    }

    public int RingBufferCapacity
    {
        get { lock (_sync) return _ringBufferCapacity; }
        set { lock (_sync) _ringBufferCapacity = Math.Clamp(value, 128, 16384); }
    }

    public static HesServiceOptions FromConfiguration(IConfiguration config)
    {
        var section = config.GetSection("Hes");
        var opts = new HesServiceOptions
        {
            ConnectionString = config.GetConnectionString("DefaultConnection") ?? string.Empty
        };

        if (int.TryParse(section["TcpPort"], out var tcpPort)) opts.TcpPort = tcpPort;
        if (int.TryParse(section["HttpPort"], out var httpPort)) opts.HttpPort = httpPort;
        if (int.TryParse(section["CommandPollIntervalMs"], out var pollMs)) opts.CommandPollIntervalMs = pollMs;
        if (int.TryParse(section["CommandTimeoutSeconds"], out var cmdTimeout)) opts.CommandTimeoutSeconds = cmdTimeout;
        if (int.TryParse(section["HeartbeatTimeoutSeconds"], out var hbTimeout)) opts.HeartbeatTimeoutSeconds = hbTimeout;
        if (int.TryParse(section["RingBufferCapacity"], out var cap)) opts.RingBufferCapacity = cap;

        return opts;
    }

    public HesRuntimeConfigDto ToDto()
    {
        lock (_sync)
        {
            return new HesRuntimeConfigDto(
                _tcpPort,
                _httpPort,
                _commandPollIntervalMs,
                _commandTimeoutSeconds,
                _heartbeatTimeoutSeconds,
                _ringBufferCapacity);
        }
    }
}

public sealed record HesRuntimeConfigDto(
    int TcpPort,
    int HttpPort,
    int CommandPollIntervalMs,
    int CommandTimeoutSeconds,
    int HeartbeatTimeoutSeconds,
    int RingBufferCapacity);

