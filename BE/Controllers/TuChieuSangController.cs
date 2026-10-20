using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TuChieuSangController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public TuChieuSangController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/TuChieuSang
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TuChieuSang>>> GetAll([FromQuery] string? maKhuVuc)
    {
        var query = _context.TuChieuSang.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maKhuVuc))
        {
            query = query.Where(x => x.MaKhuVuc == maKhuVuc);
        }
        return await query.ToListAsync();
    }

    // GET: api/TuChieuSang/TC00001
    [HttpGet("{id}")]
    public async Task<ActionResult<TuChieuSang>> GetById(string id)
    {
        var item = await _context.TuChieuSang.AsNoTracking().FirstOrDefaultAsync(x => x.MaTu == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tủ chiếu sáng với mã: {id}" });
        }
        return Ok(item);
    }
}
