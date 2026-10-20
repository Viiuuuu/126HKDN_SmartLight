using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("ChiTietLichVanHanh")]
public class ChiTietLichVanHanh
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maChiTiet")]
    public int MaChiTiet { get; set; }

    [Column("maLich")]
    public int MaLich { get; set; }

    [Column("thuTrongTuan")]
    public byte? ThuTrongTuan { get; set; }

    [Column("gioThucHien")]
    public TimeOnly GioThucHien { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("hanhDong")]
    public string HanhDong { get; set; } = null!;

    [Column("mucSang")]
    public byte? MucSang { get; set; }
}
