using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("LenhDieuKhien")]
public class LenhDieuKhien
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maLenh")]
    public long MaLenh { get; set; }

    [Column("maTu", TypeName = "char(10)")]
    public string? MaTu { get; set; }

    [Column("maTuyen", TypeName = "char(10)")]
    public string? MaTuyen { get; set; }

    [Column("maDen", TypeName = "char(10)")]
    public string? MaDen { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("hanhDong")]
    public string HanhDong { get; set; } = null!;

    [Column("mucSang")]
    public byte? MucSang { get; set; }

    [Column("nguonLenh")]
    public byte NguonLenh { get; set; } = 1;

    [Column("trangThaiLenh")]
    public byte TrangThaiLenh { get; set; } = 0;

    [Column("thoiGianTao")]
    public DateTime ThoiGianTao { get; set; } = DateTime.Now;

    [Column("thoiGianGui")]
    public DateTime? ThoiGianGui { get; set; }

    [Column("thoiGianPhanHoi")]
    public DateTime? ThoiGianPhanHoi { get; set; }

    [MaxLength(255)]
    [Column("noiDungPhanHoi")]
    public string? NoiDungPhanHoi { get; set; }

    [Column("maNguoiDung", TypeName = "char(6)")]
    public string? MaNguoiDung { get; set; }

    [Column("maLich")]
    public int? MaLich { get; set; }
}
