using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VaiTroQuyenHanController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public VaiTroQuyenHanController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/VaiTroQuyenHan
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaiTroQuyenHan>>> GetAll(
        [FromQuery] int? maVaiTro,
        [FromQuery] int? maQuyenHan)
    {
        var query = _context.VaiTroQuyenHan.AsNoTracking().AsQueryable();

        if (maVaiTro.HasValue)
        {
            query = query.Where(x => x.MaVaiTro == maVaiTro.Value);
        }

        if (maQuyenHan.HasValue)
        {
            query = query.Where(x => x.MaQuyenHan == maQuyenHan.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/VaiTroQuyenHan/{maQuyenHan}/{maVaiTro}
    [HttpGet("{maQuyenHan}/{maVaiTro}")]
    public async Task<ActionResult<VaiTroQuyenHan>> GetById(int maQuyenHan, int maVaiTro)
    {
        var item = await _context.VaiTroQuyenHan.AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaQuyenHan == maQuyenHan && x.MaVaiTro == maVaiTro);

        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy phân quyền cho Quyền: {maQuyenHan}, Vai trò: {maVaiTro}" });
        }

        return Ok(item);
    }
}
