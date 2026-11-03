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

    /// <summary>
    /// Chuẩn hoá dữ liệu theo CHECK constraint của DB (trạng thái 0-3, độ sáng 0-100,
    /// toạ độ phải có đủ cặp vĩ độ/kinh độ) để tránh lỗi 500.
    /// </summary>
    private static void NormalizeLampState(DiemDen model)
    {
        if (model.TrangThaiHoatDong > 3)
        {
            model.TrangThaiHoatDong = 3;
        }

        if (model.DoSang.HasValue)
        {
            model.DoSang = (byte)Math.Clamp((int)model.DoSang.Value, 0, 100);
        }

        if (model.CongSuat.HasValue && model.CongSuat.Value <= 0)
        {
            model.CongSuat = null;
        }

        // DB yêu cầu toạ độ phải có đủ cả vĩ độ và kinh độ
        if (model.ViDo.HasValue != model.KinhDo.HasValue)
        {
            model.ViDo = null;
            model.KinhDo = null;
        }
    }

    // POST: api/DiemDen
    [HttpPost]
    public async Task<ActionResult<DiemDen>> Create([FromBody] DiemDen model)
    {
        if (string.IsNullOrWhiteSpace(model.MaDen) || string.IsNullOrWhiteSpace(model.MaTuyen))
        {
            return BadRequest(new { message = "Mã điểm đèn và mã tuyến không được để trống." });
        }

        if (string.IsNullOrWhiteSpace(model.TenDen) || string.IsNullOrWhiteSpace(model.ViTri))
        {
            return BadRequest(new { message = "Tên điểm đèn và vị trí không được để trống." });
        }

        model.MaDen = model.MaDen.Trim();
        model.MaTuyen = model.MaTuyen.Trim();
        NormalizeLampState(model);

        var exists = await _context.DiemDen.AnyAsync(x => x.MaDen == model.MaDen);
        if (exists)
        {
            return Conflict(new { message = $"Mã điểm đèn đã tồn tại: {model.MaDen}" });
        }

        var routeExists = await _context.TuyenChieuSang.AnyAsync(x => x.MaTuyen == model.MaTuyen);
        if (!routeExists)
        {
            return BadRequest(new { message = $"Không tìm thấy tuyến chiếu sáng: {model.MaTuyen}" });
        }

        model.NgayTao = DateTime.Now;
        model.NgayCapNhat = null;
        _context.DiemDen.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = model.MaDen }, model);
    }

    // PUT: api/DiemDen/DEN00001
    [HttpPut("{id}")]
    public async Task<ActionResult<DiemDen>> Update(string id, [FromBody] DiemDen model)
    {
        var item = await _context.DiemDen.FirstOrDefaultAsync(x => x.MaDen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy điểm đèn với mã: {id}" });
        }

        if (!string.IsNullOrWhiteSpace(model.TenDen)) item.TenDen = model.TenDen.Trim();
        if (!string.IsNullOrWhiteSpace(model.LoaiBongDen)) item.LoaiBongDen = model.LoaiBongDen.Trim();
        if (!string.IsNullOrWhiteSpace(model.ViTri)) item.ViTri = model.ViTri.Trim();
        if (!string.IsNullOrWhiteSpace(model.MaTuyen)) item.MaTuyen = model.MaTuyen.Trim();
        NormalizeLampState(model);
        item.ViDo = model.ViDo ?? item.ViDo;
        item.KinhDo = model.KinhDo ?? item.KinhDo;
        item.CongSuat = model.CongSuat ?? item.CongSuat;
        item.DienAp = model.DienAp ?? item.DienAp;
        item.DongDien = model.DongDien ?? item.DongDien;
        item.CongSuatThucTe = model.CongSuatThucTe ?? item.CongSuatThucTe;
        item.NhietDoLed = model.NhietDoLed ?? item.NhietDoLed;
        item.DoSang = model.DoSang ?? item.DoSang;
        item.TrangThaiHoatDong = model.TrangThaiHoatDong;
        item.LanDoCuoi = model.LanDoCuoi ?? item.LanDoCuoi;
        item.MoTa = model.MoTa;
        item.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    // DELETE: api/DiemDen/DEN00001
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await _context.DiemDen.FirstOrDefaultAsync(x => x.MaDen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy điểm đèn với mã: {id}" });
        }

        _context.DiemDen.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
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
