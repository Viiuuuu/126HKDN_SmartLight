using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DuLieuGiamSatTuController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public DuLieuGiamSatTuController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/DuLieuGiamSatTu
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DuLieuGiamSatTu>>> GetAll([FromQuery] string? maTu, [FromQuery] int? limit)
    {
        var query = _context.DuLieuGiamSatTu.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maTu))
        {
            query = query.Where(x => x.MaTu == maTu);
        }

        query = query.OrderByDescending(x => x.ThoiGianDo);

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/DuLieuGiamSatTu/1
    [HttpGet("{id}")]
    public async Task<ActionResult<DuLieuGiamSatTu>> GetById(long id)
    {
        var item = await _context.DuLieuGiamSatTu.AsNoTracking().FirstOrDefaultAsync(x => x.MaDuLieu == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy dữ liệu giám sát tủ với mã: {id}" });
        }
        return Ok(item);
    }
}
