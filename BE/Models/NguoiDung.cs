using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BE.Models;

[Table("NguoiDung")]
public class NguoiDung
{
    [Key]
    [Column("maNguoiDung", TypeName = "char(6)")]
    public string MaNguoiDung { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    [Column("tenDangNhap")]
    public string TenDangNhap { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    [Column("matKhau")]
    [JsonIgnore]
    public string MatKhau { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("hoTen")]
    public string HoTen { get; set; } = null!;

    [Column("ngaySinh")]
    public DateOnly NgaySinh { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = null!;

    [Required]
    [MaxLength(15)]
    [Column("soDienThoai")]
    public string SoDienThoai { get; set; } = null!;

    [Column("trangThaiTaiKhoan")]
    public byte TrangThaiTaiKhoan { get; set; } = 1;

    [Column("lanDangNhapCuoi")]
    public DateTime? LanDangNhapCuoi { get; set; }

    [Column("daXoa")]
    public bool DaXoa { get; set; } = false;

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("ngayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }

    [Column("maVaiTro")]
    public int MaVaiTro { get; set; }

    [Column("maKhuVuc", TypeName = "char(5)")]
    public string? MaKhuVuc { get; set; }
}
