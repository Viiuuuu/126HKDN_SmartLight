using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TuChieuSangController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public TuChieuSangController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/TuChieuSang
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TuChieuSang>>> GetAll([FromQuery] string? maKhuVuc)
    {
        var query = _context.TuChieuSang.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maKhuVuc))
        {
            query = query.Where(x => x.MaKhuVuc == maKhuVuc);
        }
        return await query.ToListAsync();
    }

    // GET: api/TuChieuSang/TC00001
    [HttpGet("{id}")]
    public async Task<ActionResult<TuChieuSang>> GetById(string id)
    {
        var item = await _context.TuChieuSang.AsNoTracking().FirstOrDefaultAsync(x => x.MaTu == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tủ chiếu sáng với mã: {id}" });
        }
        return Ok(item);
    }

    /// <summary>
    /// DB chỉ chấp nhận trangThaiNguon ∈ {UNKNOWN, OFF, ON} và cheDoVanHanh ∈ {0,1,2}.
    /// Chuẩn hoá dữ liệu từ FE để tránh lỗi CHECK constraint (HTTP 500).
    /// </summary>
    private static void NormalizeCabinetState(TuChieuSang model)
    {
        var source = (model.TrangThaiNguon ?? string.Empty).Trim().ToUpperInvariant();
        model.TrangThaiNguon = source switch
        {
            "ON" => "ON",
            "OFF" => "OFF",
            _ => "UNKNOWN"
        };

        if (model.CheDoVanHanh > 2)
        {
            model.CheDoVanHanh = 2;
        }
    }

    // POST: api/TuChieuSang
    [HttpPost]
    public async Task<ActionResult<TuChieuSang>> Create([FromBody] TuChieuSang model)
    {
        if (string.IsNullOrWhiteSpace(model.MaTu) || string.IsNullOrWhiteSpace(model.MaKhuVuc))
        {
            return BadRequest(new { message = "Mã tủ và mã khu vực không được để trống." });
        }

        model.MaTu = model.MaTu.Trim();
        model.MaKhuVuc = model.MaKhuVuc.Trim();
        NormalizeCabinetState(model);

        var exists = await _context.TuChieuSang.AnyAsync(x => x.MaTu == model.MaTu);
        if (exists)
        {
            return Conflict(new { message = $"Mã tủ đã tồn tại: {model.MaTu}" });
        }

        var areaExists = await _context.KhuVuc.AnyAsync(x => x.MaKhuVuc == model.MaKhuVuc);
        if (!areaExists)
        {
            return BadRequest(new { message = $"Không tìm thấy khu vực: {model.MaKhuVuc}" });
        }

        model.NgayTao = DateTime.Now;
        model.NgayCapNhat = null;
        _context.TuChieuSang.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = model.MaTu }, model);
    }

    // PUT: api/TuChieuSang/TC00001
    [HttpPut("{id}")]
    public async Task<ActionResult<TuChieuSang>> Update(string id, [FromBody] TuChieuSang model)
    {
        var item = await _context.TuChieuSang.FirstOrDefaultAsync(x => x.MaTu == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tủ chiếu sáng với mã: {id}" });
        }

        if (!string.IsNullOrWhiteSpace(model.TenTu)) item.TenTu = model.TenTu.Trim();
        if (!string.IsNullOrWhiteSpace(model.DiaChi)) item.DiaChi = model.DiaChi.Trim();
        if (!string.IsNullOrWhiteSpace(model.MaKhuVuc)) item.MaKhuVuc = model.MaKhuVuc.Trim();
        NormalizeCabinetState(model);
        item.ViDo = model.ViDo ?? item.ViDo;
        item.KinhDo = model.KinhDo ?? item.KinhDo;
        item.TrangThaiKetNoi = model.TrangThaiKetNoi;
        item.TrangThaiNguon = string.IsNullOrWhiteSpace(model.TrangThaiNguon)
            ? item.TrangThaiNguon
            : model.TrangThaiNguon.Trim();
        item.LanKetNoiCuoi = model.LanKetNoiCuoi ?? item.LanKetNoiCuoi;
        item.CheDoVanHanh = model.CheDoVanHanh;
        item.MaThietBi = model.MaThietBi;
        item.MoTa = model.MoTa;
        item.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    // DELETE: api/TuChieuSang/TC00001
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await _context.TuChieuSang.FirstOrDefaultAsync(x => x.MaTu == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tủ chiếu sáng với mã: {id}" });
        }

        var hasRoute = await _context.TuyenChieuSang.AnyAsync(x => x.MaTu == id);
        if (hasRoute)
        {
            return BadRequest(new { message = "Tủ còn tuyến chiếu sáng nên không thể xóa." });
        }

        _context.TuChieuSang.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
