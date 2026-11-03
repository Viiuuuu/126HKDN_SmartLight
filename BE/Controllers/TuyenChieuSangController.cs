using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TuyenChieuSangController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public TuyenChieuSangController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/TuyenChieuSang
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TuyenChieuSang>>> GetAll([FromQuery] string? maTu)
    {
        var query = _context.TuyenChieuSang.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maTu))
        {
            query = query.Where(x => x.MaTu == maTu);
        }
        return await query.ToListAsync();
    }

    // GET: api/TuyenChieuSang/TCS00001
    [HttpGet("{id}")]
    public async Task<ActionResult<TuyenChieuSang>> GetById(string id)
    {
        var item = await _context.TuyenChieuSang.AsNoTracking().FirstOrDefaultAsync(x => x.MaTuyen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tuyến chiếu sáng với mã: {id}" });
        }
        return Ok(item);
    }

    /// <summary>
    /// Chuẩn hoá dữ liệu theo CHECK constraint của DB (trạng thái 0-3, chiều dài &gt; 0,
    /// mức sáng 0-100) để tránh lỗi 500.
    /// </summary>
    private static void NormalizeRouteState(TuyenChieuSang model)
    {
        if (model.TrangThaiHoatDong > 3)
        {
            model.TrangThaiHoatDong = 3;
        }

        if (model.ChieuDai.HasValue && model.ChieuDai.Value <= 0)
        {
            model.ChieuDai = null;
        }

        if (model.MucSangHienTai.HasValue)
        {
            model.MucSangHienTai = (byte)Math.Clamp((int)model.MucSangHienTai.Value, 0, 100);
        }
    }

    // POST: api/TuyenChieuSang
    [HttpPost]
    public async Task<ActionResult<TuyenChieuSang>> Create([FromBody] TuyenChieuSang model)
    {
        if (string.IsNullOrWhiteSpace(model.MaTuyen) || string.IsNullOrWhiteSpace(model.MaTu))
        {
            return BadRequest(new { message = "Mã tuyến và mã tủ không được để trống." });
        }

        if (string.IsNullOrWhiteSpace(model.TenTuyen) || string.IsNullOrWhiteSpace(model.ViTri))
        {
            return BadRequest(new { message = "Tên tuyến và vị trí không được để trống." });
        }

        model.MaTuyen = model.MaTuyen.Trim();
        model.MaTu = model.MaTu.Trim();
        NormalizeRouteState(model);

        var exists = await _context.TuyenChieuSang.AnyAsync(x => x.MaTuyen == model.MaTuyen);
        if (exists)
        {
            return Conflict(new { message = $"Mã tuyến đã tồn tại: {model.MaTuyen}" });
        }

        var cabinetExists = await _context.TuChieuSang.AnyAsync(x => x.MaTu == model.MaTu);
        if (!cabinetExists)
        {
            return BadRequest(new { message = $"Không tìm thấy tủ chiếu sáng: {model.MaTu}" });
        }

        model.NgayTao = DateTime.Now;
        model.NgayCapNhat = null;
        _context.TuyenChieuSang.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = model.MaTuyen }, model);
    }

    // PUT: api/TuyenChieuSang/TCS00001
    [HttpPut("{id}")]
    public async Task<ActionResult<TuyenChieuSang>> Update(string id, [FromBody] TuyenChieuSang model)
    {
        var item = await _context.TuyenChieuSang.FirstOrDefaultAsync(x => x.MaTuyen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tuyến chiếu sáng với mã: {id}" });
        }

        if (!string.IsNullOrWhiteSpace(model.TenTuyen)) item.TenTuyen = model.TenTuyen.Trim();
        if (!string.IsNullOrWhiteSpace(model.ViTri)) item.ViTri = model.ViTri.Trim();
        if (!string.IsNullOrWhiteSpace(model.MaTu)) item.MaTu = model.MaTu.Trim();
        NormalizeRouteState(model);
        item.TrangThaiHoatDong = model.TrangThaiHoatDong;
        item.ChieuDai = model.ChieuDai ?? item.ChieuDai;
        item.MucSangHienTai = model.MucSangHienTai ?? item.MucSangHienTai;
        item.MoTa = model.MoTa;
        item.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    // DELETE: api/TuyenChieuSang/TCS00001
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await _context.TuyenChieuSang.FirstOrDefaultAsync(x => x.MaTuyen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tuyến chiếu sáng với mã: {id}" });
        }

        var hasLight = await _context.DiemDen.AnyAsync(x => x.MaTuyen == id);
        if (hasLight)
        {
            return BadRequest(new { message = "Tuyến còn điểm đèn nên không thể xóa." });
        }

        _context.TuyenChieuSang.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
