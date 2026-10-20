using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("TuChieuSang")]
public class TuChieuSang
{
    [Key]
    [Column("maTu", TypeName = "char(10)")]
    public string MaTu { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("tenTu")]
    public string TenTu { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    [Column("diaChi")]
    public string DiaChi { get; set; } = null!;

    [Column("viDo", TypeName = "decimal(10,7)")]
    public decimal? ViDo { get; set; }

    [Column("kinhDo", TypeName = "decimal(10,7)")]
    public decimal? KinhDo { get; set; }

    [Column("trangThaiKetNoi")]
    public bool TrangThaiKetNoi { get; set; } = false;

    [MaxLength(20)]
    [Column("trangThaiNguon")]
    public string TrangThaiNguon { get; set; } = "UNKNOWN";

    [Column("lanKetNoiCuoi")]
    public DateTime? LanKetNoiCuoi { get; set; }

    [Column("cheDoVanHanh")]
    public byte CheDoVanHanh { get; set; } = 0;

    [MaxLength(50)]
    [Column("maThietBi")]
    public string? MaThietBi { get; set; }

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
    [Column("maKhuVuc", TypeName = "char(5)")]
    public string MaKhuVuc { get; set; } = null!;
}
