using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("PhienDangNhap")]
public class PhienDangNhap
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maPhien")]
    public long MaPhien { get; set; }

    [Required]
    [MaxLength(64)]
    [Column("maRefreshToken")]
    public string MaRefreshToken { get; set; } = null!;

    [Column("thoiGianDangNhap")]
    public DateTime ThoiGianDangNhap { get; set; } = DateTime.Now;

    [Column("thoiGianHetHan")]
    public DateTime ThoiGianHetHan { get; set; }

    [Column("thoiGianDangXuat")]
    public DateTime? ThoiGianDangXuat { get; set; }

    [Column("daThuHoi")]
    public bool DaThuHoi { get; set; } = false;

    [Required]
    [Column("maNguoiDung", TypeName = "char(6)")]
    public string MaNguoiDung { get; set; } = null!;
}
