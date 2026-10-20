using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("CauHinhCanhBao")]
public class CauHinhCanhBao
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maCauHinh")]
    public int MaCauHinh { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("tenCanhBao")]
    public string TenCanhBao { get; set; } = null!;

    [Required]
    [MaxLength(30)]
    [Column("loaiCanhBao")]
    public string LoaiCanhBao { get; set; } = null!;

    [Column("nguongGiaTri", TypeName = "decimal(10,2)")]
    public decimal NguongGiaTri { get; set; }

    [Column("mucDo")]
    public byte MucDo { get; set; } = 1;

    [Column("dangBat")]
    public bool DangBat { get; set; } = true;

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("ngayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }
}
