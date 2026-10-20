using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LenhDieuKhienController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public LenhDieuKhienController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/LenhDieuKhien
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LenhDieuKhien>>> GetAll(
        [FromQuery] string? maTu,
        [FromQuery] string? maTuyen,
        [FromQuery] string? maDen,
        [FromQuery] byte? trangThaiLenh,
        [FromQuery] int? limit)
    {
        var query = _context.LenhDieuKhien.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(maTu))
        {
            query = query.Where(x => x.MaTu == maTu);
        }

        if (!string.IsNullOrEmpty(maTuyen))
        {
            query = query.Where(x => x.MaTuyen == maTuyen);
        }

        if (!string.IsNullOrEmpty(maDen))
        {
            query = query.Where(x => x.MaDen == maDen);
        }

        if (trangThaiLenh.HasValue)
        {
            query = query.Where(x => x.TrangThaiLenh == trangThaiLenh.Value);
        }

        query = query.OrderByDescending(x => x.ThoiGianTao);

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/LenhDieuKhien/1
    [HttpGet("{id}")]
    public async Task<ActionResult<LenhDieuKhien>> GetById(long id)
    {
        var item = await _context.LenhDieuKhien.AsNoTracking().FirstOrDefaultAsync(x => x.MaLenh == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy lệnh điều khiển với mã: {id}" });
        }
        return Ok(item);
    }
}
