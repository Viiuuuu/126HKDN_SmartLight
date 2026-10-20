using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

[Table("VaiTro_QuyenHan")]
public class VaiTroQuyenHan
{
    [Column("maQuyenHan")]
    public int MaQuyenHan { get; set; }

    [Column("maVaiTro")]
    public int MaVaiTro { get; set; }

    [Column("duocCapNhat")]
    public bool DuocCapNhat { get; set; } = false;
}
