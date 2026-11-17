using System.Globalization;
using System.Text;
using SmartLight.DeviceSimulator.Models;
using SmartLight.DeviceSimulator.Protocol;

namespace SmartLight.DeviceSimulator.Services;

public enum CommandResponseMode
{
    Normal = 1,
    ForceError = 2,
    SilentTimeout = 3
}

/// <summary>
/// Quản lý trạng thái nội bộ Tủ -> Tuyến -> Đèn, xử lý lệnh điều khiển và sinh dữ liệu đo lường giả lập.
/// </summary>
public sealed class CabinetSimulationEngine
{
    private readonly object _sync = new();
    private readonly SimulatedCabinet _cabinet;
    private readonly Random _random;
    private DateTime _lastEnergySampleUtc = DateTime.UtcNow;

    public CommandResponseMode ResponseMode { get; set; } = CommandResponseMode.Normal;
    public bool FaultInjectionEnabled { get; set; }
    public TimeSpan SimulatedCommandDelay { get; set; } = TimeSpan.FromMilliseconds(250);

    public string MaTu => _cabinet.MaTu;
    public string TenTu => _cabinet.TenTu;
    public string MaThietBi => _cabinet.MaThietBi;

    public CabinetSimulationEngine(SimulatedCabinet cabinet, int? randomSeed = null)
    {
        _cabinet = cabinet;
        _random = randomSeed.HasValue ? new Random(randomSeed.Value) : Random.Shared;
        RefreshElectricalReadings(TimeSpan.Zero);
    }

    public HelloMessage CreateHelloMessage()
    {
        lock (_sync)
        {
            return new HelloMessage(_cabinet.MaThietBi, _cabinet.MaTu, DateTime.Now);
        }
    }

    public HeartbeatMessage CreateHeartbeatMessage()
    {
        lock (_sync)
        {
            return new HeartbeatMessage(_cabinet.MaThietBi, DateTime.Now);
        }
    }

    /// <summary>
    /// Thực thi lệnh điều khiển theo chế độ kiểm thử hiện tại. Trả về null nếu đang ở chế độ SilentTimeout.
    /// </summary>
    public AckMessage? ProcessCommand(CommandMessage command)
    {
        lock (_sync)
        {
            var action = (command.HanhDong ?? string.Empty).Trim().ToUpperInvariant();
            var targetType = (command.TargetType ?? string.Empty).Trim().ToUpperInvariant();
            var targetCode = (command.TargetCode ?? string.Empty).Trim().ToUpperInvariant();

            if (ResponseMode == CommandResponseMode.SilentTimeout)
            {
                return null;
            }

            if (ResponseMode == CommandResponseMode.ForceError)
            {
                return new AckMessage(
                    command.MaLenh,
                    _cabinet.MaThietBi,
                    Success: false,
                    $"[SIM] Giả lập thiết bị báo lỗi khi thực thi {action} trên {targetType} {targetCode}.",
                    DateTime.Now);
            }

            if (action is not ("BAT" or "TAT" or "DIM"))
            {
                return CreateFailureAck(command.MaLenh, $"Hành động '{command.HanhDong}' không hợp lệ.");
            }

            if (action == "DIM" && command.MucSang is null or > 100)
            {
                return CreateFailureAck(command.MaLenh, "Lệnh DIM yêu cầu mucSang trong khoảng 0..100.");
            }

            string resultDescription;
            switch (targetType)
            {
                case "TU":
                    if (!_cabinet.MaTu.Equals(targetCode, StringComparison.OrdinalIgnoreCase))
                    {
                        return CreateFailureAck(command.MaLenh, $"Mã tủ '{targetCode}' không khớp với thiết bị {_cabinet.MaTu}.");
                    }
                    foreach (var lamp in _cabinet.AllLamps)
                    {
                        ApplyActionToLamp(lamp, action, command.MucSang);
                    }
                    resultDescription = $"Đã thực thi {FormatAction(action, command.MucSang)} toàn bộ tủ {_cabinet.MaTu}.";
                    break;

                case "TUYEN":
                    var route = _cabinet.Routes.FirstOrDefault(r =>
                        r.MaTuyen.Equals(targetCode, StringComparison.OrdinalIgnoreCase));
                    if (route is null)
                    {
                        return CreateFailureAck(command.MaLenh, $"Không tìm thấy tuyến '{targetCode}' thuộc tủ {_cabinet.MaTu}.");
                    }
                    foreach (var lamp in route.Lamps)
                    {
                        ApplyActionToLamp(lamp, action, command.MucSang);
                    }
                    resultDescription = $"Đã thực thi {FormatAction(action, command.MucSang)} tuyến {route.MaTuyen} ({route.Lamps.Count} đèn).";
                    break;

                case "DEN":
                    var singleLamp = _cabinet.AllLamps.FirstOrDefault(d =>
                        d.MaDen.Equals(targetCode, StringComparison.OrdinalIgnoreCase));
                    if (singleLamp is null)
                    {
                        return CreateFailureAck(command.MaLenh, $"Không tìm thấy điểm đèn '{targetCode}' thuộc tủ {_cabinet.MaTu}.");
                    }
                    ApplyActionToLamp(singleLamp, action, command.MucSang);
                    resultDescription = $"Đã thực thi {FormatAction(action, command.MucSang)} điểm đèn {singleLamp.MaDen}.";
                    break;

                default:
                    return CreateFailureAck(command.MaLenh, $"Loại đối tượng '{command.TargetType}' không được hỗ trợ.");
            }

            RefreshRouteAndCabinetAggregates();
            RefreshElectricalReadings(TimeSpan.Zero);

            return new AckMessage(command.MaLenh, _cabinet.MaThietBi, Success: true, resultDescription, DateTime.Now);
        }
    }

    /// <summary>
    /// Sinh gói dữ liệu đo lường mới nhất cho tủ, các tuyến và từng điểm đèn.
    /// </summary>
    public TelemetryMessage SampleTelemetry()
    {
        lock (_sync)
        {
            var nowUtc = DateTime.UtcNow;
            var elapsed = nowUtc - _lastEnergySampleUtc;
            if (elapsed < TimeSpan.Zero || elapsed > TimeSpan.FromMinutes(10))
            {
                elapsed = TimeSpan.Zero;
            }
            _lastEnergySampleUtc = nowUtc;

            var cabinetData = RefreshElectricalReadings(elapsed);
            var allLamps = _cabinet.AllLamps.ToList();

            byte ResolveLampStatus(SimulatedLamp lamp, int index)
            {
                if (FaultInjectionEnabled && index == 0) return 3; // 3: Sự cố (Quá nhiệt / hở mạch)
                if (lamp.IsOn && lamp.DoSang > 0) return 1;       // 1: Bật
                return 2;                                          // 2: Tắt
            }

            byte ResolveRouteStatus(SimulatedRoute route)
            {
                var lamps = route.Lamps;
                if (FaultInjectionEnabled && lamps.Any(l => l == allLamps.FirstOrDefault())) return 3; // 3: Tuyến có đèn sự cố
                if (route.IsOn && lamps.Any(l => l.IsOn && l.DoSang > 0)) return 1;                   // 1: Hoạt động
                return 2;                                                                               // 2: Dừng
            }

            var routeSnapshots = _cabinet.Routes
                .Select(r => new RouteTelemetrySnapshot(r.MaTuyen, ResolveRouteStatus(r), r.MucSangHienTai))
                .ToList();
            var lampData = allLamps
                .Select((d, idx) => new LampTelemetryData(
                    d.MaDen,
                    d.DienAp,
                    d.DongDien,
                    d.CongSuatThucTe,
                    d.NhietDoLed,
                    d.DoSang,
                    ResolveLampStatus(d, idx)))
                .ToList();

            return new TelemetryMessage(
                _cabinet.MaThietBi,
                _cabinet.MaTu,
                DateTime.Now,
                cabinetData,
                routeSnapshots,
                lampData);
        }
    }

    public string BuildStateSummary()
    {
        lock (_sync)
        {
            var telemetry = RefreshElectricalReadings(TimeSpan.Zero);
            var allLamps = _cabinet.AllLamps.ToList();

            byte ResolveLampStatus(SimulatedLamp lamp, int index)
            {
                if (FaultInjectionEnabled && index == 0) return 3;
                if (lamp.IsOn && lamp.DoSang > 0) return 1;
                return 2;
            }

            byte ResolveRouteStatus(SimulatedRoute route)
            {
                var lamps = route.Lamps;
                if (FaultInjectionEnabled && lamps.Any(l => l == allLamps.FirstOrDefault())) return 3;
                if (route.IsOn && lamps.Any(l => l.IsOn && l.DoSang > 0)) return 1;
                return 2;
            }

            var sb = new StringBuilder();
            sb.AppendLine($"=== TRẠNG THÁI TỦ {_cabinet.MaTu} ({_cabinet.TenTu}) | {_cabinet.MaThietBi} ===");
            sb.AppendLine(string.Create(CultureInfo.InvariantCulture,
                $"Nguồn: {_cabinet.TrangThaiNguon} | U=({telemetry.DienApPha1:F2}, {telemetry.DienApPha2:F2}, {telemetry.DienApPha3:F2})V | I=({telemetry.DongDienPha1:F2}, {telemetry.DongDienPha2:F2}, {telemetry.DongDienPha3:F2})A | P={telemetry.CongSuat:F3}kW | E={telemetry.DienNang:F3}kWh"));

            foreach (var route in _cabinet.Routes)
            {
                var routeStatusText = ResolveRouteStatus(route) switch
                {
                    1 => "HOẠT ĐỘNG",
                    2 => "DỪNG",
                    3 => "SỰ CỐ",
                    _ => "CHƯA XÁC ĐỊNH"
                };
                sb.AppendLine($"  [Tuyến {route.MaTuyen}] {route.TenTuyen} -> {routeStatusText} ({route.MucSangHienTai}%)");
                for (var i = 0; i < route.Lamps.Count; i++)
                {
                    var lamp = route.Lamps[i];
                    var lampIdx = allLamps.IndexOf(lamp);
                    var lampStatusText = ResolveLampStatus(lamp, lampIdx) switch
                    {
                        1 => "BẬT",
                        2 => "TẮT",
                        3 => "SỰ CỐ",
                        _ => "CHƯA XÁC ĐỊNH"
                    };
                    sb.AppendLine(string.Create(CultureInfo.InvariantCulture,
                        $"     - {lamp.MaDen} ({lamp.TenDen}): {lampStatusText} | Sáng={lamp.DoSang}% | U={lamp.DienAp:F1}V | I={lamp.DongDien:F3}A | P={lamp.CongSuatThucTe:F2}W | LED={lamp.NhietDoLed:F1}°C"));
                }
            }
            return sb.ToString();
        }
    }

    private AckMessage CreateFailureAck(long maLenh, string message) =>
        new(maLenh, _cabinet.MaThietBi, Success: false, message, DateTime.Now);

    private static string FormatAction(string action, byte? mucSang) =>
        action == "DIM" ? $"DIM {mucSang}%" : action;

    private static void ApplyActionToLamp(SimulatedLamp lamp, string action, byte? mucSang)
    {
        switch (action)
        {
            case "BAT":
                lamp.IsOn = true;
                lamp.DoSang = 100;
                break;
            case "TAT":
                lamp.IsOn = false;
                lamp.DoSang = 0;
                break;
            case "DIM":
                var brightness = mucSang ?? 0;
                lamp.DoSang = brightness;
                lamp.IsOn = brightness > 0;
                break;
        }
    }

    private void RefreshRouteAndCabinetAggregates()
    {
        foreach (var route in _cabinet.Routes)
        {
            var anyOn = route.Lamps.Any(d => d.IsOn && d.DoSang > 0);
            route.IsOn = anyOn;
            route.MucSangHienTai = route.Lamps.Count == 0
                ? (byte)0
                : (byte)Math.Round(route.Lamps.Average(d => d.IsOn ? d.DoSang : 0));
        }

        _cabinet.TrangThaiNguon = _cabinet.AllLamps.Any(d => d.IsOn && d.DoSang > 0) ? "ON" : "OFF";
    }

    private CabinetTelemetryData RefreshElectricalReadings(TimeSpan elapsed)
    {
        var basePhase1 = Round2(222.0m + Jitter(-2.5m, 2.5m));
        var basePhase2 = FaultInjectionEnabled ? Round2(174.5m + Jitter(-1.5m, 1.5m)) : Round2(223.0m + Jitter(-2.5m, 2.5m));
        var basePhase3 = Round2(221.5m + Jitter(-2.5m, 2.5m));

        var lamps = _cabinet.AllLamps.ToList();
        for (var i = 0; i < lamps.Count; i++)
        {
            var lamp = lamps[i];
            var isFaultedFirstLamp = FaultInjectionEnabled && i == 0;

            if (!lamp.IsOn || lamp.DoSang == 0)
            {
                lamp.DienAp = 0.00m;
                lamp.CongSuatThucTe = 0.00m;
                lamp.DongDien = 0.000m;
                lamp.NhietDoLed = MoveToward(lamp.NhietDoLed, 29.00m, 0.80m);
                continue;
            }

            var phaseVoltage = (i % 3) switch
            {
                0 => basePhase1,
                1 => basePhase2,
                _ => basePhase3
            };

            if (isFaultedFirstLamp)
            {
                // Giả lập sự cố hở mạch / quá nhiệt đèn để kiểm thử cảnh báo thiết bị
                lamp.DienAp = phaseVoltage;
                lamp.CongSuatThucTe = 0.00m;
                lamp.DongDien = 0.000m;
                lamp.NhietDoLed = Round2(Math.Clamp(86.50m + Jitter(-0.5m, 1.0m), -40m, 150m));
                continue;
            }

            var loadFactor = lamp.DoSang / 100.0m;
            var actualWatts = Math.Max(0m, lamp.CongSuatDinhMuc * loadFactor * (1m + Jitter(-0.02m, 0.02m)));
            var currentAmp = phaseVoltage > 0m ? actualWatts / (phaseVoltage * 0.95m) : 0m;
            var targetTemp = 30.0m + (0.16m * lamp.DoSang) + Jitter(-0.4m, 0.4m);

            lamp.DienAp = phaseVoltage;
            lamp.CongSuatThucTe = Round2(actualWatts);
            lamp.DongDien = Math.Round(Math.Max(0m, currentAmp), 3, MidpointRounding.AwayFromZero);
            lamp.NhietDoLed = Round2(Math.Clamp(MoveToward(lamp.NhietDoLed, targetTemp, 1.20m), -40m, 150m));
        }

        decimal p1Watts = 0m, p2Watts = 0m, p3Watts = 0m;
        for (var i = 0; i < lamps.Count; i++)
        {
            switch (i % 3)
            {
                case 0: p1Watts += lamps[i].CongSuatThucTe; break;
                case 1: p2Watts += lamps[i].CongSuatThucTe; break;
                default: p3Watts += lamps[i].CongSuatThucTe; break;
            }
        }

        var totalKw = Math.Round((p1Watts + p2Watts + p3Watts) / 1000.0m, 3, MidpointRounding.AwayFromZero);
        if (elapsed > TimeSpan.Zero && totalKw > 0m)
        {
            _cabinet.DienNangTichLuyKwh = Math.Round(
                _cabinet.DienNangTichLuyKwh + totalKw * (decimal)elapsed.TotalHours,
                3,
                MidpointRounding.AwayFromZero);
        }

        var i1 = basePhase1 > 0m ? Round2(p1Watts / (basePhase1 * 0.95m)) : 0.00m;
        var i2 = basePhase2 > 0m ? Round2(p2Watts / (basePhase2 * 0.95m)) : 0.00m;
        var i3 = basePhase3 > 0m ? Round2(p3Watts / (basePhase3 * 0.95m)) : 0.00m;

        return new CabinetTelemetryData(
            _cabinet.TrangThaiNguon,
            basePhase1,
            basePhase2,
            basePhase3,
            i1,
            i2,
            i3,
            totalKw,
            _cabinet.DienNangTichLuyKwh);
    }

    private decimal Jitter(decimal min, decimal max)
    {
        var t = (decimal)_random.NextDouble();
        return min + (max - min) * t;
    }

    private static decimal MoveToward(decimal current, decimal target, decimal maxStep)
    {
        if (Math.Abs(target - current) <= maxStep) return target;
        return current < target ? current + maxStep : current - maxStep;
    }

    private static decimal Round2(decimal value) =>
        Math.Round(Math.Max(0m, value), 2, MidpointRounding.AwayFromZero);
}

