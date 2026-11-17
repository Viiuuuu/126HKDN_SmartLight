using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartLight.HesService.Protocol;

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
    public static readonly Encoding Utf8NoBom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false);

    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public static string Serialize<T>(T value) => JsonSerializer.Serialize(value, Options);

    public static T? Deserialize<T>(string json) => JsonSerializer.Deserialize<T>(json, Options);
}

public sealed class HesEnvelope
{
    public string Type { get; set; } = string.Empty;
}

public sealed class HelloMessage
{
    public string Type { get; set; } = HesMessageTypes.Hello;
    public string MaThietBi { get; set; } = string.Empty;
    public string MaTu { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public sealed class HeartbeatMessage
{
    public string Type { get; set; } = HesMessageTypes.Heartbeat;
    public string MaThietBi { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public sealed class CommandMessage
{
    public string Type { get; set; } = HesMessageTypes.Command;
    public long MaLenh { get; set; }
    public string TargetType { get; set; } = string.Empty;
    public string TargetCode { get; set; } = string.Empty;
    public string HanhDong { get; set; } = string.Empty;
    public byte? MucSang { get; set; }
    public DateTime Timestamp { get; set; }
}

public sealed class AckMessage
{
    public string Type { get; set; } = HesMessageTypes.Ack;
    public long MaLenh { get; set; }
    public string MaThietBi { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public sealed class TelemetryMessage
{
    public string Type { get; set; } = HesMessageTypes.Telemetry;
    public string MaThietBi { get; set; } = string.Empty;
    public string MaTu { get; set; } = string.Empty;
    public DateTime ThoiGianDo { get; set; }
    public TuTelemetryDto? Tu { get; set; }
    public List<TuyenTelemetryDto> Tuyen { get; set; } = new();
    public List<DenTelemetryDto> Den { get; set; } = new();
}

public sealed class TuTelemetryDto
{
    public string TrangThaiNguon { get; set; } = "ON";
    public decimal DienApPha1 { get; set; }
    public decimal DienApPha2 { get; set; }
    public decimal DienApPha3 { get; set; }
    public decimal DongDienPha1 { get; set; }
    public decimal DongDienPha2 { get; set; }
    public decimal DongDienPha3 { get; set; }
    public decimal CongSuat { get; set; }
    public decimal DienNang { get; set; }
}

public sealed class TuyenTelemetryDto
{
    public string MaTuyen { get; set; } = string.Empty;
    public byte TrangThaiHoatDong { get; set; }
    public byte MucSangHienTai { get; set; }
}

public sealed class DenTelemetryDto
{
    public string MaDen { get; set; } = string.Empty;
    public decimal DienAp { get; set; }
    public decimal DongDien { get; set; }
    public decimal CongSuatThucTe { get; set; }
    public decimal NhietDoLed { get; set; }
    public byte DoSang { get; set; }
    public byte TrangThaiHoatDong { get; set; }
}

