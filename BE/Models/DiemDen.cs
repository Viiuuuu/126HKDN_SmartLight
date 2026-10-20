using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("DiemDen")]
public class DiemDen
{
    [Key]
    [Column("maDen", TypeName = "char(10)")]
    public string MaDen { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("tenDen")]
    public string TenDen { get; set; } = null!;

    [MaxLength(50)]
    [Column("loaiBongDen")]
    public string? LoaiBongDen { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("viTri")]
    public string ViTri { get; set; } = null!;

    [Column("viDo", TypeName = "decimal(10,7)")]
    public decimal? ViDo { get; set; }

    [Column("kinhDo", TypeName = "decimal(10,7)")]
    public decimal? KinhDo { get; set; }

    [Column("congSuat", TypeName = "decimal(8,2)")]
    public decimal? CongSuat { get; set; }

    [Column("dienAp", TypeName = "decimal(6,2)")]
    public decimal? DienAp { get; set; }

    [Column("dongDien", TypeName = "decimal(7,3)")]
    public decimal? DongDien { get; set; }

    [Column("congSuatThucTe", TypeName = "decimal(8,2)")]
    public decimal? CongSuatThucTe { get; set; }

    [Column("nhietDoLed", TypeName = "decimal(5,2)")]
    public decimal? NhietDoLed { get; set; }

    [Column("lanDoCuoi")]
    public DateTime? LanDoCuoi { get; set; }

    [Column("doSang")]
    public byte? DoSang { get; set; }

    [Column("trangThaiHoatDong")]
    public byte TrangThaiHoatDong { get; set; } = 0;

    [MaxLength(255)]
    [Column("moTa")]
    public string? MoTa { get; set; }

    [Column("daXoa")]
    public bool DaXoa { get; set; } = false;

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("ngayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }

    [Required]
    [Column("maTuyen", TypeName = "char(10)")]
    public string MaTuyen { get; set; } = null!;
}
