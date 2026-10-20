using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiemDenController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public DiemDenController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/DiemDen
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DiemDen>>> GetAll([FromQuery] string? maTuyen)
    {
        var query = _context.DiemDen.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maTuyen))
        {
            query = query.Where(x => x.MaTuyen == maTuyen);
        }
        return await query.ToListAsync();
    }

    // GET: api/DiemDen/DEN00001
    [HttpGet("{id}")]
    public async Task<ActionResult<DiemDen>> GetById(string id)
    {
        var item = await _context.DiemDen.AsNoTracking().FirstOrDefaultAsync(x => x.MaDen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy điểm đèn với mã: {id}" });
        }
        return Ok(item);
    }
}
