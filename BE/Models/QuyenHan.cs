using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("QuyenHan")]
public class QuyenHan
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maQuyenHan")]
    public int MaQuyenHan { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("tenQuyenHan")]
    public string TenQuyenHan { get; set; } = null!;

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
