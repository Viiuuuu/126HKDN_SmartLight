using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KhuVucController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public KhuVucController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/KhuVuc
    [HttpGet]
    public async Task<ActionResult<IEnumerable<KhuVuc>>> GetAll()
    {
        return await _context.KhuVuc.AsNoTracking().ToListAsync();
    }

    // GET: api/KhuVuc/KV001
    [HttpGet("{id}")]
    public async Task<ActionResult<KhuVuc>> GetById(string id)
    {
        var item = await _context.KhuVuc.AsNoTracking().FirstOrDefaultAsync(x => x.MaKhuVuc == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy khu vực với mã: {id}" });
        }
        return Ok(item);
    }
}
