using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TuyenChieuSangController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public TuyenChieuSangController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/TuyenChieuSang
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TuyenChieuSang>>> GetAll([FromQuery] string? maTu)
    {
        var query = _context.TuyenChieuSang.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maTu))
        {
            query = query.Where(x => x.MaTu == maTu);
        }
        return await query.ToListAsync();
    }

    // GET: api/TuyenChieuSang/TCS00001
    [HttpGet("{id}")]
    public async Task<ActionResult<TuyenChieuSang>> GetById(string id)
    {
        var item = await _context.TuyenChieuSang.AsNoTracking().FirstOrDefaultAsync(x => x.MaTuyen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tuyến chiếu sáng với mã: {id}" });
        }
        return Ok(item);
    }
}
