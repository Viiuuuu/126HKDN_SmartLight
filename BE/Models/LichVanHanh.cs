using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("LichVanHanh")]
public class LichVanHanh
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maLich")]
    public int MaLich { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("tenLich")]
    public string TenLich { get; set; } = null!;

    [Column("ngayBatDau")]
    public DateOnly NgayBatDau { get; set; }

    [Column("ngayKetThuc")]
    public DateOnly? NgayKetThuc { get; set; }

    [Column("dangApDung")]
    public bool DangApDung { get; set; } = false;

    [Column("maTu", TypeName = "char(10)")]
    public string? MaTu { get; set; }

    [Column("maTuyen", TypeName = "char(10)")]
    public string? MaTuyen { get; set; }

    [Column("maDen", TypeName = "char(10)")]
    public string? MaDen { get; set; }

    [Column("maNguoiTao", TypeName = "char(6)")]
    public string? MaNguoiTao { get; set; }

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("ngayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }
}
