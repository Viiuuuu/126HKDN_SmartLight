using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VaiTroController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public VaiTroController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/VaiTro
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaiTro>>> GetAll()
    {
        return await _context.VaiTro.AsNoTracking().Where(x => !x.DaXoa).ToListAsync();
    }

    // GET: api/VaiTro/1
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetById(int id)
    {
        var item = await _context.VaiTro.AsNoTracking().FirstOrDefaultAsync(x => x.MaVaiTro == id && !x.DaXoa);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy vai trò với mã: {id}" });
        }

        var accountCount = await _context.NguoiDung.AsNoTracking()
            .CountAsync(u => u.MaVaiTro == id && !u.DaXoa);

        var permissions = await (
            from vq in _context.VaiTroQuyenHan.AsNoTracking()
            join q in _context.QuyenHan.AsNoTracking() on vq.MaQuyenHan equals q.MaQuyenHan
            where vq.MaVaiTro == id && !q.DaXoa
            select new
            {
                maQuyenHan = q.MaQuyenHan,
                tenQuyenHan = q.TenQuyenHan,
                moTa = q.MoTa,
                duocXem = true,
                duocCapNhat = vq.DuocCapNhat
            }
        ).ToListAsync();

        return Ok(new
        {
            item.MaVaiTro,
            item.TenVaiTro,
            item.MoTa,
            item.DaXoa,
            item.NgayTao,
            item.NgayCapNhat,
            soTaiKhoan = accountCount,
            danhSachQuyen = permissions
        });
    }
}
