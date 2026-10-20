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
        return await _context.VaiTro.AsNoTracking().ToListAsync();
    }

    // GET: api/VaiTro/1
    [HttpGet("{id}")]
    public async Task<ActionResult<VaiTro>> GetById(int id)
    {
        var item = await _context.VaiTro.AsNoTracking().FirstOrDefaultAsync(x => x.MaVaiTro == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy vai trò với mã: {id}" });
        }
        return Ok(item);
    }
}
