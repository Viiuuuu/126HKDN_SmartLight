namespace SmartLight.DeviceSimulator.Models;

public sealed class SimulatedLamp
{
    public required string MaDen { get; init; }
    public required string TenDen { get; init; }
    public required string MaTuyen { get; init; }
    public decimal CongSuatDinhMuc { get; init; }
    public bool IsOn { get; set; }
    public byte DoSang { get; set; }
    public decimal DienAp { get; set; }
    public decimal DongDien { get; set; }
    public decimal CongSuatThucTe { get; set; }
    public decimal NhietDoLed { get; set; } = 30.00m;
}

public sealed class SimulatedRoute
{
    public required string MaTuyen { get; init; }
    public required string TenTuyen { get; init; }
    public bool IsOn { get; set; }
    public byte MucSangHienTai { get; set; }
    public List<SimulatedLamp> Lamps { get; } = [];
}

public sealed class SimulatedCabinet
{
    public required string MaTu { get; init; }
    public required string TenTu { get; init; }
    public required string MaThietBi { get; init; }
    public string TrangThaiNguon { get; set; } = "ON";
    public decimal DienNangTichLuyKwh { get; set; }
    public List<SimulatedRoute> Routes { get; } = [];

    public IEnumerable<SimulatedLamp> AllLamps => Routes.SelectMany(r => r.Lamps);
}

/// <summary>
/// Dữ liệu cây Tủ -> Tuyến -> Điểm đèn khởi tạo khớp với seed trong dbSmartLight.sql.
/// </summary>
public static class SimulatorCatalog
{
    public static IReadOnlyList<string> SupportedDeviceIds =>
        ["SIM-TU-001", "SIM-TU-002", "SIM-TU-003", "SIM-TU-004"];

    public static SimulatedCabinet CreateByDeviceId(string deviceId)
    {
        var normalized = (deviceId ?? string.Empty).Trim().ToUpperInvariant();
        return normalized switch
        {
            "SIM-TU-001" => BuildBachDang01(),
            "SIM-TU-002" => Build2Thang9_01(),
            "SIM-TU-003" => BuildDienBienPhu01(),
            "SIM-TU-004" => BuildVoNguyenGiap01(),
            _ => throw new ArgumentException(
                $"Không tìm thấy cấu hình tủ mẫu '{deviceId}'. Các mã hợp lệ: {string.Join(", ", SupportedDeviceIds)}")
        };
    }

    private static SimulatedCabinet BuildBachDang01()
    {
        var cabinet = new SimulatedCabinet
        {
            MaTu = "TC00001",
            TenTu = "Tủ Bạch Đằng 01",
            MaThietBi = "SIM-TU-001",
            TrangThaiNguon = "ON",
            DienNangTichLuyKwh = 125.400m
        };

        var r1 = new SimulatedRoute { MaTuyen = "TCS00001", TenTuyen = "Tuyến Bạch Đằng A", IsOn = true, MucSangHienTai = 100 };
        r1.Lamps.Add(new SimulatedLamp { MaDen = "DEN00001", TenDen = "Đèn Bạch Đằng 01", MaTuyen = r1.MaTuyen, CongSuatDinhMuc = 120m, IsOn = true, DoSang = 100, NhietDoLed = 41.50m });
        r1.Lamps.Add(new SimulatedLamp { MaDen = "DEN00002", TenDen = "Đèn Bạch Đằng 02", MaTuyen = r1.MaTuyen, CongSuatDinhMuc = 120m, IsOn = true, DoSang = 100, NhietDoLed = 40.00m });

        var r2 = new SimulatedRoute { MaTuyen = "TCS00002", TenTuyen = "Tuyến Bạch Đằng B", IsOn = true, MucSangHienTai = 70 };
        r2.Lamps.Add(new SimulatedLamp { MaDen = "DEN00003", TenDen = "Đèn Bạch Đằng 03", MaTuyen = r2.MaTuyen, CongSuatDinhMuc = 100m, IsOn = true, DoSang = 70, NhietDoLed = 39.50m });

        cabinet.Routes.Add(r1);
        cabinet.Routes.Add(r2);
        return cabinet;
    }

    private static SimulatedCabinet Build2Thang9_01()
    {
        var cabinet = new SimulatedCabinet
        {
            MaTu = "TC00002",
            TenTu = "Tủ 2 Tháng 9 01",
            MaThietBi = "SIM-TU-002",
            TrangThaiNguon = "ON",
            DienNangTichLuyKwh = 210.850m
        };

        var r3 = new SimulatedRoute { MaTuyen = "TCS00003", TenTuyen = "Tuyến 2 Tháng 9", IsOn = true, MucSangHienTai = 100 };
        r3.Lamps.Add(new SimulatedLamp { MaDen = "DEN00004", TenDen = "Đèn 2 Tháng 9 01", MaTuyen = r3.MaTuyen, CongSuatDinhMuc = 150m, IsOn = true, DoSang = 100, NhietDoLed = 42.00m });
        r3.Lamps.Add(new SimulatedLamp { MaDen = "DEN00005", TenDen = "Đèn 2 Tháng 9 02", MaTuyen = r3.MaTuyen, CongSuatDinhMuc = 150m, IsOn = true, DoSang = 100, NhietDoLed = 44.00m });

        cabinet.Routes.Add(r3);
        return cabinet;
    }

    private static SimulatedCabinet BuildDienBienPhu01()
    {
        var cabinet = new SimulatedCabinet
        {
            MaTu = "TC00003",
            TenTu = "Tủ Điện Biên Phủ 01",
            MaThietBi = "SIM-TU-003",
            TrangThaiNguon = "OFF",
            DienNangTichLuyKwh = 84.120m
        };

        var r4 = new SimulatedRoute { MaTuyen = "TCS00004", TenTuyen = "Tuyến Điện Biên Phủ", IsOn = false, MucSangHienTai = 0 };
        r4.Lamps.Add(new SimulatedLamp { MaDen = "DEN00006", TenDen = "Đèn Điện Biên Phủ 01", MaTuyen = r4.MaTuyen, CongSuatDinhMuc = 100m, IsOn = false, DoSang = 0, NhietDoLed = 29.00m });

        cabinet.Routes.Add(r4);
        return cabinet;
    }

    private static SimulatedCabinet BuildVoNguyenGiap01()
    {
        var cabinet = new SimulatedCabinet
        {
            MaTu = "TC00004",
            TenTu = "Tủ Võ Nguyên Giáp 01",
            MaThietBi = "SIM-TU-004",
            TrangThaiNguon = "ON",
            DienNangTichLuyKwh = 167.300m
        };

        var r5 = new SimulatedRoute { MaTuyen = "TCS00005", TenTuyen = "Tuyến Võ Nguyên Giáp", IsOn = true, MucSangHienTai = 80 };
        r5.Lamps.Add(new SimulatedLamp { MaDen = "DEN00007", TenDen = "Đèn Võ Nguyên Giáp 01", MaTuyen = r5.MaTuyen, CongSuatDinhMuc = 120m, IsOn = true, DoSang = 80, NhietDoLed = 41.00m });
        r5.Lamps.Add(new SimulatedLamp { MaDen = "DEN00008", TenDen = "Đèn Võ Nguyên Giáp 02", MaTuyen = r5.MaTuyen, CongSuatDinhMuc = 120m, IsOn = true, DoSang = 80, NhietDoLed = 42.00m });

        cabinet.Routes.Add(r5);
        return cabinet;
    }
}

