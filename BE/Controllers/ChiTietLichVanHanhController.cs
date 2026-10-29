using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
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

    // POST: api/ChiTietLichVanHanh
    [HttpPost]
    public async Task<ActionResult<ChiTietLichVanHanh>> Create([FromBody] SaveChiTietLichVanHanhRequest request)
    {
        var error = await ValidateRequest(request);
        if (error is not null) return BadRequest(new { message = error });

        var detail = new ChiTietLichVanHanh
        {
            MaLich = request.MaLich,
            ThuTrongTuan = request.ThuTrongTuan,
            GioThucHien = request.GioThucHien,
            HanhDong = request.HanhDong.Trim().ToUpperInvariant(),
            MucSang = request.MucSang
        };
        _context.ChiTietLichVanHanh.Add(detail);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = detail.MaChiTiet }, detail);
    }

    // PUT: api/ChiTietLichVanHanh/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveChiTietLichVanHanhRequest request)
    {
        var detail = await _context.ChiTietLichVanHanh.FirstOrDefaultAsync(item => item.MaChiTiet == id);
        if (detail is null)
        {
            return NotFound(new { message = $"Không tìm thấy chi tiết lịch với mã: {id}" });
        }

        var error = await ValidateRequest(request);
        if (error is not null) return BadRequest(new { message = error });

        detail.MaLich = request.MaLich;
        detail.ThuTrongTuan = request.ThuTrongTuan;
        detail.GioThucHien = request.GioThucHien;
        detail.HanhDong = request.HanhDong.Trim().ToUpperInvariant();
        detail.MucSang = request.MucSang;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/ChiTietLichVanHanh/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var detail = await _context.ChiTietLichVanHanh.FirstOrDefaultAsync(item => item.MaChiTiet == id);
        if (detail is null)
        {
            return NotFound(new { message = $"Không tìm thấy chi tiết lịch với mã: {id}" });
        }

        _context.ChiTietLichVanHanh.Remove(detail);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string?> ValidateRequest(SaveChiTietLichVanHanhRequest request)
    {
        if (!await _context.LichVanHanh.AnyAsync(item => item.MaLich == request.MaLich))
        {
            return $"Không tìm thấy lịch vận hành với mã: {request.MaLich}.";
        }

        if (request.ThuTrongTuan is < 1 or > 7)
        {
            return "Ngày trong tuần phải từ 1 (Thứ Hai) đến 7 (Chủ Nhật), hoặc bỏ trống để áp dụng hằng ngày.";
        }

        var action = request.HanhDong.Trim().ToUpperInvariant();
        if (action is not ("BAT" or "TAT" or "DIM"))
        {
            return "Hành động chỉ được là BAT, TAT hoặc DIM.";
        }

        if ((action == "DIM" && request.MucSang is null) ||
            (action != "DIM" && request.MucSang is not null) ||
            request.MucSang > 100)
        {
            return "Lệnh DIM cần mức sáng từ 0 đến 100; lệnh BAT/TAT không nhận mức sáng.";
        }

        return null;
    }
}

public sealed class SaveChiTietLichVanHanhRequest
{
    [Range(1, int.MaxValue)]
    public int MaLich { get; set; }

    public byte? ThuTrongTuan { get; set; }
    public TimeOnly GioThucHien { get; set; }

    [Required]
    [MaxLength(10)]
    public string HanhDong { get; set; } = string.Empty;

    [Range(0, 100)]
    public byte? MucSang { get; set; }
}
