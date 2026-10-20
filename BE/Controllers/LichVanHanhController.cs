using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LichVanHanhController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public LichVanHanhController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/LichVanHanh
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LichVanHanh>>> GetAll(
        [FromQuery] string? maTu,
        [FromQuery] string? maTuyen,
        [FromQuery] string? maDen,
        [FromQuery] bool? dangApDung)
    {
        var query = _context.LichVanHanh.AsNoTracking().AsQueryable();

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

        if (dangApDung.HasValue)
        {
            query = query.Where(x => x.DangApDung == dangApDung.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/LichVanHanh/1
    [HttpGet("{id}")]
    public async Task<ActionResult<LichVanHanh>> GetById(int id)
    {
        var item = await _context.LichVanHanh.AsNoTracking().FirstOrDefaultAsync(x => x.MaLich == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy lịch vận hành với mã: {id}" });
        }
        return Ok(item);
    }
}
