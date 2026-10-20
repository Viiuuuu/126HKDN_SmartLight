using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("NhatKyHeThong")]
public class NhatKyHeThong
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maNhatKy")]
    public long MaNhatKy { get; set; }

    [Column("maNguoiDung", TypeName = "char(6)")]
    public string? MaNguoiDung { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("hanhDong")]
    public string HanhDong { get; set; } = null!;

    [MaxLength(100)]
    [Column("doiTuong")]
    public string? DoiTuong { get; set; }

    [MaxLength(20)]
    [Column("maDoiTuong")]
    public string? MaDoiTuong { get; set; }

    [MaxLength(500)]
    [Column("noiDung")]
    public string? NoiDung { get; set; }

    [Column("ketQua")]
    public byte KetQua { get; set; } = 1;

    [Column("thoiGian")]
    public DateTime ThoiGian { get; set; } = DateTime.Now;
}
