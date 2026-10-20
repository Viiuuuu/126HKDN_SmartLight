using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NhatKyHeThongController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public NhatKyHeThongController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/NhatKyHeThong
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NhatKyHeThong>>> GetAll(
        [FromQuery] string? maNguoiDung,
        [FromQuery] string? hanhDong,
        [FromQuery] byte? ketQua,
        [FromQuery] int? limit)
    {
        var query = _context.NhatKyHeThong.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(maNguoiDung))
        {
            query = query.Where(x => x.MaNguoiDung == maNguoiDung);
        }

        if (!string.IsNullOrEmpty(hanhDong))
        {
            query = query.Where(x => x.HanhDong == hanhDong);
        }

        if (ketQua.HasValue)
        {
            query = query.Where(x => x.KetQua == ketQua.Value);
        }

        query = query.OrderByDescending(x => x.ThoiGian);

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/NhatKyHeThong/1
    [HttpGet("{id}")]
    public async Task<ActionResult<NhatKyHeThong>> GetById(long id)
    {
        var item = await _context.NhatKyHeThong.AsNoTracking().FirstOrDefaultAsync(x => x.MaNhatKy == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy nhật ký hệ thống với mã: {id}" });
        }
        return Ok(item);
    }
}
