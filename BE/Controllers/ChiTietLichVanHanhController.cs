using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChiTietLichVanHanhController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public ChiTietLichVanHanhController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/ChiTietLichVanHanh
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChiTietLichVanHanh>>> GetAll([FromQuery] int? maLich)
    {
        var query = _context.ChiTietLichVanHanh.AsNoTracking().AsQueryable();

        if (maLich.HasValue)
        {
            query = query.Where(x => x.MaLich == maLich.Value);
        }

        return await query.OrderBy(x => x.GioThucHien).ToListAsync();
    }

    // GET: api/ChiTietLichVanHanh/1
    [HttpGet("{id}")]
    public async Task<ActionResult<ChiTietLichVanHanh>> GetById(int id)
    {
        var item = await _context.ChiTietLichVanHanh.AsNoTracking().FirstOrDefaultAsync(x => x.MaChiTiet == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy chi tiết lịch với mã: {id}" });
        }
        return Ok(item);
    }
}
