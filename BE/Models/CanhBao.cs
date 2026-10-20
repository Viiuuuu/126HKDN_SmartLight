using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("CanhBao")]
public class CanhBao
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("maCanhBao")]
    public long MaCanhBao { get; set; }

    [Column("maCauHinh")]
    public int? MaCauHinh { get; set; }

    [Column("maTu", TypeName = "char(10)")]
    public string? MaTu { get; set; }

    [Column("maTuyen", TypeName = "char(10)")]
    public string? MaTuyen { get; set; }

    [Column("maDen", TypeName = "char(10)")]
    public string? MaDen { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("noiDung")]
    public string NoiDung { get; set; } = null!;

    [Column("mucDo")]
    public byte MucDo { get; set; } = 1;

    [Column("trangThaiXuLy")]
    public byte TrangThaiXuLy { get; set; } = 0;

    [Column("thoiGianPhatSinh")]
    public DateTime ThoiGianPhatSinh { get; set; } = DateTime.Now;

    [Column("thoiGianXuLy")]
    public DateTime? ThoiGianXuLy { get; set; }

    [MaxLength(255)]
    [Column("ghiChuXuLy")]
    public string? GhiChuXuLy { get; set; }

    [Column("maNguoiXuLy", TypeName = "char(6)")]
    public string? MaNguoiXuLy { get; set; }
}
