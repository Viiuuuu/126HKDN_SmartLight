using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("KhuVuc")]
public class KhuVuc
{
    [Key]
    [Column("maKhuVuc", TypeName = "char(5)")]
    public string MaKhuVuc { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("tenPhuongXa")]
    public string TenPhuongXa { get; set; } = null!;

    [MaxLength(255)]
    [Column("moTa")]
    public string? MoTa { get; set; }

    [Column("daXoa")]
    public bool DaXoa { get; set; } = false;

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("ngayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }
}
