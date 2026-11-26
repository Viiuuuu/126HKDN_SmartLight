using System.Text;
using SmartLight.DeviceSimulator.Models;
using SmartLight.DeviceSimulator.Services;

Console.OutputEncoding = Encoding.UTF8;
Console.InputEncoding = Encoding.UTF8;

var options = SimulatorOptions.Parse(args);
if (options.ShowHelp)
{
    SimulatorOptions.PrintHelp();
    return 0;
}

var logLock = new object();
void Log(string message)
{
    lock (logLock)
    {
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {message}");
    }
}

using var appCts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    appCts.Cancel();
};

var isAllMode = options.DeviceId.Equals("ALL", StringComparison.OrdinalIgnoreCase);
var deviceIdsToRun = isAllMode
    ? SimulatorCatalog.SupportedDeviceIds
    : [options.DeviceId];

var workers = new List<HesTcpClientWorker>();
var engines = new List<CabinetSimulationEngine>();

foreach (var dId in deviceIdsToRun)
{
    try
    {
        var cab = SimulatorCatalog.CreateByDeviceId(dId);
        var eng = new CabinetSimulationEngine(cab);
        var w = new HesTcpClientWorker(
            eng,
            options.Host,
            options.Port,
            TimeSpan.FromSeconds(options.HeartbeatSeconds),
            TimeSpan.FromSeconds(options.TelemetrySeconds),
            Log);
        engines.Add(eng);
        workers.Add(w);
    }
    catch (ArgumentException ex)
    {
        Console.Error.WriteLine($"Lỗi cấu hình {dId}: {ex.Message}");
        return 1;
    }
}

if (isAllMode)
{
    Console.WriteLine("=================================================================");
    Console.WriteLine("  SMARTLIGHT - GIẢ LẬP ĐỒNG THỜI TOÀN BỘ 4 TỦ CHIẾU SÁNG (ALL)");
    Console.WriteLine("=================================================================");
    Console.WriteLine($"  HES Endpoint : {options.Host}:{options.Port}");
    Console.WriteLine($"  Số tủ chạy   : {engines.Count} tủ ({string.Join(", ", engines.Select(e => e.MaTu))})");
    Console.WriteLine("  Tất cả 4 tủ sẽ tự động kết nối TCP và duy trì Online đồng thời!");
    Console.WriteLine("=================================================================");
}
else
{
    PrintBanner(engines[0], options);
}

var workerTasks = workers.Select(w => w.RunAsync(appCts.Token)).ToList();

if (!options.Headless && !Console.IsInputRedirected)
{
    _ = Task.Run(async () => await RunConsoleMenuAsync(engines[0], workers[0], appCts), appCts.Token);
}

try
{
    await Task.WhenAll(workerTasks);
}
catch (OperationCanceledException)
{
    // Thoát êm khi nhấn Ctrl+C hoặc Q
}

Log("Simulator đã dừng.");
return 0;

static void PrintBanner(CabinetSimulationEngine engine, SimulatorOptions opt)
{
    Console.WriteLine("=================================================================");
    Console.WriteLine("  SMARTLIGHT - TỦ CHIẾU SÁNG GIẢ LẬP (TCP/IP + TELEMETRY)");
    Console.WriteLine("=================================================================");
    Console.WriteLine($"  Thiết bị     : {engine.MaThietBi} ({engine.MaTu} - {engine.TenTu})");
    Console.WriteLine($"  HES Endpoint : {opt.Host}:{opt.Port}");
    Console.WriteLine($"  Heartbeat    : mỗi {opt.HeartbeatSeconds}s | Telemetry: mỗi {opt.TelemetrySeconds}s");
    Console.WriteLine("-----------------------------------------------------------------");
    Console.WriteLine("  [1] Chế độ Normal        (Trả ACK thành công -> trangThaiLenh = 2)");
    Console.WriteLine("  [2] Chế độ ForceError    (Trả ACK thất bại   -> trangThaiLenh = 3)");
    Console.WriteLine("  [3] Chế độ SilentTimeout (Không gửi ACK      -> trangThaiLenh = 4)");
    Console.WriteLine("  [4] Ngắt / Kết nối lại TCP (Test Offline/Online)");
    Console.WriteLine("  [5] Xem trạng thái hiện tại Tủ -> Tuyến -> Đèn");
    Console.WriteLine("  [6] Bật/Tắt giả lập sự cố đo lường (Sụt áp / Quá nhiệt / Hở mạch)");
    Console.WriteLine("  [7] Gửi ngay 1 gói Telemetry");
    Console.WriteLine("  [Q] Thoát Simulator");
    Console.WriteLine("=================================================================");
}

static async Task RunConsoleMenuAsync(
    CabinetSimulationEngine engine,
    HesTcpClientWorker worker,
    CancellationTokenSource appCts)
{
    while (!appCts.IsCancellationRequested)
    {
        if (!Console.KeyAvailable)
        {
            await Task.Delay(120, appCts.Token);
            continue;
        }

        var key = Console.ReadKey(intercept: true).Key;
        switch (key)
        {
            case ConsoleKey.D1:
            case ConsoleKey.NumPad1:
                engine.ResponseMode = CommandResponseMode.Normal;
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [MODE] Đã chọn: Bình thường (ACK thành công).");
                break;

            case ConsoleKey.D2:
            case ConsoleKey.NumPad2:
                engine.ResponseMode = CommandResponseMode.ForceError;
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [MODE] Đã chọn: Báo lỗi (ACK thất bại).");
                break;

            case ConsoleKey.D3:
            case ConsoleKey.NumPad3:
                engine.ResponseMode = CommandResponseMode.SilentTimeout;
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [MODE] Đã chọn: Im lặng (Không trả ACK để test Timeout).");
                break;

            case ConsoleKey.D4:
            case ConsoleKey.NumPad4:
                worker.ToggleOfflineMode();
                break;

            case ConsoleKey.D5:
            case ConsoleKey.NumPad5:
                Console.WriteLine();
                Console.WriteLine(engine.BuildStateSummary());
                break;

            case ConsoleKey.D6:
            case ConsoleKey.NumPad6:
                engine.FaultInjectionEnabled = !engine.FaultInjectionEnabled;
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [FAULT] Giả lập sự cố đo lường: {(engine.FaultInjectionEnabled ? "ĐANG BẬT" : "ĐÃ TẮT")}.");
                break;

            case ConsoleKey.D7:
            case ConsoleKey.NumPad7:
                await worker.SendTelemetryNowAsync(appCts.Token);
                break;

            case ConsoleKey.Q:
                await appCts.CancelAsync();
                break;
        }
    }
}

internal sealed record SimulatorOptions(
    string DeviceId,
    string Host,
    int Port,
    int HeartbeatSeconds,
    int TelemetrySeconds,
    bool Headless,
    bool ShowHelp)
{
    public static SimulatorOptions Parse(string[] args)
    {
        var deviceId = "ALL"; // Mặc định chạy đồng thời toàn bộ 4 tủ khi không truyền tham số
        var host = "127.0.0.1";
        var port = 8088;
        var hbSec = 10;
        var teleSec = 5;
        var headless = false;
        var help = false;

        for (var i = 0; i < args.Length; i++)
        {
            var arg = args[i];
            switch (arg.ToLowerInvariant())
            {
                case "--help":
                case "-h":
                    help = true;
                    break;
                case "--all":
                case "-a":
                    deviceId = "ALL";
                    break;
                case "--headless":
                    headless = true;
                    break;
                case "--device":
                case "-d":
                    if (i + 1 < args.Length) deviceId = args[++i];
                    break;
                case "--host":
                    if (i + 1 < args.Length) host = args[++i];
                    break;
                case "--port":
                case "-p":
                    if (i + 1 < args.Length && int.TryParse(args[++i], out var parsedPort) && parsedPort > 0)
                        port = parsedPort;
                    break;
                case "--heartbeat-sec":
                    if (i + 1 < args.Length && int.TryParse(args[++i], out var parsedHb) && parsedHb > 0)
                        hbSec = parsedHb;
                    break;
                case "--telemetry-sec":
                    if (i + 1 < args.Length && int.TryParse(args[++i], out var parsedTele) && parsedTele > 0)
                        teleSec = parsedTele;
                    break;
            }
        }

        return new SimulatorOptions(deviceId, host, port, hbSec, teleSec, headless, help);
    }

    public static void PrintHelp()
    {
        Console.WriteLine("Cách dùng: dotnet run --project SmartLight.DeviceSimulator -- [tùy chọn]");
        Console.WriteLine("  -a, --all                  Chạy đồng thời TẤT CẢ 4 tủ chiếu sáng (SIM-TU-001..004)");
        Console.WriteLine("  -d, --device <maThietBi>   Mã thiết bị tủ (SIM-TU-001..004 hoặc ALL, mặc định: SIM-TU-001)");
        Console.WriteLine("      --host <ip>            IP của HES TCP Server (mặc định: 127.0.0.1)");
        Console.WriteLine("  -p, --port <port>          Cổng TCP của HES Server (mặc định: 8088)");
        Console.WriteLine("      --heartbeat-sec <s>    Chu kỳ gửi HEARTBEAT tính bằng giây (mặc định: 10)");
        Console.WriteLine("      --telemetry-sec <s>    Chu kỳ gửi TELEMETRY tính bằng giây (mặc định: 5)");
        Console.WriteLine("      --headless             Chạy không menu phím (phù hợp chạy nền/CI)");
    }
}

