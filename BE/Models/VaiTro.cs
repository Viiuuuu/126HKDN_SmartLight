using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("VaiTro")]
public class VaiTro
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maVaiTro")]
    public int MaVaiTro { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("tenVaiTro")]
    public string TenVaiTro { get; set; } = null!;

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
