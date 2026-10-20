using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NguoiDungController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public NguoiDungController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/NguoiDung
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NguoiDung>>> GetAll(
        [FromQuery] int? maVaiTro,
        [FromQuery] string? maKhuVuc)
    {
        var query = _context.NguoiDung.AsNoTracking().AsQueryable();

        if (maVaiTro.HasValue)
        {
            query = query.Where(x => x.MaVaiTro == maVaiTro.Value);
        }

        if (!string.IsNullOrEmpty(maKhuVuc))
        {
            query = query.Where(x => x.MaKhuVuc == maKhuVuc);
        }

        return await query.ToListAsync();
    }

    // GET: api/NguoiDung/ND0001
    [HttpGet("{id}")]
    public async Task<ActionResult<NguoiDung>> GetById(string id)
    {
        var item = await _context.NguoiDung.AsNoTracking().FirstOrDefaultAsync(x => x.MaNguoiDung == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng với mã: {id}" });
        }
        return Ok(item);
    }
}
