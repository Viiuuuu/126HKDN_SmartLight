using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("TuyenChieuSang")]
public class TuyenChieuSang
{
    [Key]
    [Column("maTuyen", TypeName = "char(10)")]
    public string MaTuyen { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("tenTuyen")]
    public string TenTuyen { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    [Column("viTri")]
    public string ViTri { get; set; } = null!;

    [Column("trangThaiHoatDong")]
    public byte TrangThaiHoatDong { get; set; } = 0;

    [MaxLength(255)]
    [Column("moTa")]
    public string? MoTa { get; set; }

    [Column("chieuDai")]
    public int? ChieuDai { get; set; }

    [Column("mucSangHienTai")]
    public byte? MucSangHienTai { get; set; }

    [Column("daXoa")]
    public bool DaXoa { get; set; } = false;

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("ngayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }

    [Required]
    [Column("maTu", TypeName = "char(10)")]
    public string MaTu { get; set; } = null!;
}
