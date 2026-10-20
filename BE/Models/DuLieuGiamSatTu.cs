using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("DuLieuGiamSatTu")]
public class DuLieuGiamSatTu
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maDuLieu")]
    public long MaDuLieu { get; set; }

    [Column("dienApPha1", TypeName = "decimal(6,2)")]
    public decimal? DienApPha1 { get; set; }

    [Column("dienApPha2", TypeName = "decimal(6,2)")]
    public decimal? DienApPha2 { get; set; }

    [Column("dienApPha3", TypeName = "decimal(6,2)")]
    public decimal? DienApPha3 { get; set; }

    [Column("dongDienPha1", TypeName = "decimal(7,2)")]
    public decimal? DongDienPha1 { get; set; }

    [Column("dongDienPha2", TypeName = "decimal(7,2)")]
    public decimal? DongDienPha2 { get; set; }

    [Column("dongDienPha3", TypeName = "decimal(7,2)")]
    public decimal? DongDienPha3 { get; set; }

    [Column("congSuat", TypeName = "decimal(10,3)")]
    public decimal? CongSuat { get; set; }

    [Column("dienNang", TypeName = "decimal(15,3)")]
    public decimal? DienNang { get; set; }

    [Column("thoiGianDo")]
    public DateTime ThoiGianDo { get; set; } = DateTime.Now;

    [Required]
    [Column("maTu", TypeName = "char(10)")]
    public string MaTu { get; set; } = null!;
}
