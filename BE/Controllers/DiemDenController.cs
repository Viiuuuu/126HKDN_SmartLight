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

    // GET: api/DiemDen/dieu-khien?maTu=... | ?maTuyen=... | ?maDen=...
    [HttpGet("dieu-khien")]
    public async Task<ActionResult<IEnumerable<DiemDenControlDto>>> GetForControl(
        [FromQuery] string? maTu,
        [FromQuery] string? maTuyen,
        [FromQuery] string? maDen)
    {
        var targetCount = new[] { maTu, maTuyen, maDen }.Count(value => !string.IsNullOrWhiteSpace(value));
        if (targetCount != 1)
        {
            return BadRequest(new { message = "Cần chọn đúng một tủ, tuyến hoặc điểm đèn để tải dữ liệu điều khiển." });
        }

        var query = _context.DiemDen.AsNoTracking().Where(light => !light.DaXoa);
        if (!string.IsNullOrWhiteSpace(maTu))
        {
            query = query.Where(light => _context.TuyenChieuSang.Any(route =>
                route.MaTuyen == light.MaTuyen && route.MaTu == maTu && !route.DaXoa));
        }
        else if (!string.IsNullOrWhiteSpace(maTuyen))
        {
            query = query.Where(light => light.MaTuyen == maTuyen);
        }
        else
        {
            query = query.Where(light => light.MaDen == maDen);
        }

        var monitoring = _context.DuLieuGiamSatDen.AsNoTracking();
        var result = await query
            .OrderBy(light => light.MaDen)
            .Select(light => new DiemDenControlDto
            {
                MaDen = light.MaDen,
                TenDen = light.TenDen,
                ViTri = light.ViTri,
                MaTuyen = light.MaTuyen,
                TrangThaiHoatDong = light.TrangThaiHoatDong,
                DoSang = monitoring
                    .Where(data => data.MaDen == light.MaDen)
                    .OrderByDescending(data => data.ThoiGianDo)
                    .Select(data => (byte?)data.DoSang)
                    .FirstOrDefault() ?? light.DoSang,
                ThoiGianDo = monitoring
                    .Where(data => data.MaDen == light.MaDen)
                    .OrderByDescending(data => data.ThoiGianDo)
                    .Select(data => (DateTime?)data.ThoiGianDo)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(result);
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

public sealed class DiemDenControlDto
{
    public string MaDen { get; set; } = string.Empty;
    public string TenDen { get; set; } = string.Empty;
    public string ViTri { get; set; } = string.Empty;
    public string MaTuyen { get; set; } = string.Empty;
    public byte TrangThaiHoatDong { get; set; }
    public byte? DoSang { get; set; }
    public DateTime? ThoiGianDo { get; set; }
}
