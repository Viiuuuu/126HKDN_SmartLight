using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartLight.DeviceSimulator.Protocol;

/// <summary>
/// Các loại bản tin trao đổi giữa Tủ (Simulator/RTU) và HES Service qua TCP NDJSON.
/// </summary>
public static class HesMessageTypes
{
    public const string Hello = "HELLO";
    public const string Heartbeat = "HEARTBEAT";
    public const string Command = "CMD";
    public const string Ack = "ACK";
    public const string Telemetry = "TELEMETRY";
}

public static class HesJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
}

public sealed record HelloMessage(
    string MaThietBi,
    string MaTu,
    DateTime Timestamp)
{
    public string Type => HesMessageTypes.Hello;
}

public sealed record HeartbeatMessage(
    string MaThietBi,
    DateTime Timestamp)
{
    public string Type => HesMessageTypes.Heartbeat;
}

public sealed class CommandMessage
{
    public string Type { get; set; } = HesMessageTypes.Command;
    public long MaLenh { get; set; }
    public string TargetType { get; set; } = string.Empty; // TU | TUYEN | DEN
    public string TargetCode { get; set; } = string.Empty;
    public string HanhDong { get; set; } = string.Empty;   // BAT | TAT | DIM
    public byte? MucSang { get; set; }
}

public sealed record AckMessage(
    long MaLenh,
    string MaThietBi,
    bool Success,
    string Message,
    DateTime Timestamp)
{
    public string Type => HesMessageTypes.Ack;
}

public sealed record TelemetryMessage(
    string MaThietBi,
    string MaTu,
    DateTime ThoiGianDo,
    CabinetTelemetryData Tu,
    IReadOnlyList<RouteTelemetrySnapshot> Tuyen,
    IReadOnlyList<LampTelemetryData> Den)
{
    public string Type => HesMessageTypes.Telemetry;
}

/// <summary>
/// Dữ liệu đo lường cấp tủ, ánh xạ trực tiếp tới bảng DuLieuGiamSatTu.
/// </summary>
public sealed record CabinetTelemetryData(
    string TrangThaiNguon,
    decimal DienApPha1,
    decimal DienApPha2,
    decimal DienApPha3,
    decimal DongDienPha1,
    decimal DongDienPha2,
    decimal DongDienPha3,
    decimal CongSuat,
    decimal DienNang);

/// <summary>
/// Trạng thái hiện tại của từng tuyến trực thuộc tủ.
/// </summary>
public sealed record RouteTelemetrySnapshot(
    string MaTuyen,
    byte TrangThaiHoatDong,
    byte MucSangHienTai);

/// <summary>
/// Dữ liệu đo lường từng điểm đèn, ánh xạ trực tiếp tới bảng DuLieuGiamSatDen.
/// </summary>
public sealed record LampTelemetryData(
    string MaDen,
    decimal DienAp,
    decimal DongDien,
    decimal CongSuatThucTe,
    decimal NhietDoLed,
    byte DoSang,
    byte TrangThaiHoatDong);

