using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("DuLieuGiamSatDen")]
public class DuLieuGiamSatDen
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maDuLieu")]
    public long MaDuLieu { get; set; }

    [Required]
    [Column("maDen", TypeName = "char(10)")]
    public string MaDen { get; set; } = null!;

    [Column("dienAp", TypeName = "decimal(6,2)")]
    public decimal? DienAp { get; set; }

    [Column("dongDien", TypeName = "decimal(7,3)")]
    public decimal? DongDien { get; set; }

    [Column("congSuatThucTe", TypeName = "decimal(8,2)")]
    public decimal? CongSuatThucTe { get; set; }

    [Column("nhietDoLed", TypeName = "decimal(5,2)")]
    public decimal? NhietDoLed { get; set; }

    [Column("doSang")]
    public byte? DoSang { get; set; }

    [Column("thoiGianDo")]
    public DateTime ThoiGianDo { get; set; } = DateTime.Now;
}
