using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhienDangNhapController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public PhienDangNhapController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/PhienDangNhap
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhienDangNhap>>> GetAll([FromQuery] string? maNguoiDung)
    {
        var query = _context.PhienDangNhap.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maNguoiDung))
        {
            query = query.Where(x => x.MaNguoiDung == maNguoiDung);
        }
        return await query.OrderByDescending(x => x.ThoiGianDangNhap).ToListAsync();
    }

    // GET: api/PhienDangNhap/1
    [HttpGet("{id}")]
    public async Task<ActionResult<PhienDangNhap>> GetById(long id)
    {
        var item = await _context.PhienDangNhap.AsNoTracking().FirstOrDefaultAsync(x => x.MaPhien == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy phiên đăng nhập với mã: {id}" });
        }
        return Ok(item);
    }
}
