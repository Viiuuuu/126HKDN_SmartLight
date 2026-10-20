using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DuLieuGiamSatDenController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public DuLieuGiamSatDenController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/DuLieuGiamSatDen
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DuLieuGiamSatDen>>> GetAll(
        [FromQuery] string? maDen,
        [FromQuery] int? limit)
    {
        var query = _context.DuLieuGiamSatDen.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(maDen))
        {
            query = query.Where(x => x.MaDen == maDen);
        }

        query = query.OrderByDescending(x => x.ThoiGianDo);

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/DuLieuGiamSatDen/1
    [HttpGet("{id}")]
    public async Task<ActionResult<DuLieuGiamSatDen>> GetById(long id)
    {
        var item = await _context.DuLieuGiamSatDen.AsNoTracking().FirstOrDefaultAsync(x => x.MaDuLieu == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy dữ liệu giám sát đèn với mã: {id}" });
        }
        return Ok(item);
    }
}
