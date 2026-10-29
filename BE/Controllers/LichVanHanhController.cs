using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LichVanHanhController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public LichVanHanhController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/LichVanHanh
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LichVanHanh>>> GetAll(
        [FromQuery] string? maTu,
        [FromQuery] string? maTuyen,
        [FromQuery] string? maDen,
        [FromQuery] bool? dangApDung)
    {
        var query = _context.LichVanHanh.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(maTu))
        {
            query = query.Where(x => x.MaTu == maTu);
        }

        if (!string.IsNullOrEmpty(maTuyen))
        {
            query = query.Where(x => x.MaTuyen == maTuyen);
        }

        if (!string.IsNullOrEmpty(maDen))
        {
            query = query.Where(x => x.MaDen == maDen);
        }

        if (dangApDung.HasValue)
        {
            query = query.Where(x => x.DangApDung == dangApDung.Value);
        }

        return await query.OrderByDescending(x => x.NgayTao).ToListAsync();
    }

    // GET: api/LichVanHanh/1
    [HttpGet("{id}")]
    public async Task<ActionResult<LichVanHanh>> GetById(int id)
    {
        var item = await _context.LichVanHanh.AsNoTracking().FirstOrDefaultAsync(x => x.MaLich == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy lịch vận hành với mã: {id}" });
        }
        return Ok(item);
    }

    // POST: api/LichVanHanh
    [HttpPost]
    public async Task<ActionResult<LichVanHanh>> Create([FromBody] SaveLichVanHanhRequest request)
    {
        var error = await ValidateRequest(request);
        if (error is not null) return BadRequest(new { message = error });

        var schedule = new LichVanHanh
        {
            TenLich = request.TenLich.Trim(),
            NgayBatDau = request.NgayBatDau,
            NgayKetThuc = request.NgayKetThuc,
            DangApDung = request.DangApDung,
            MaTu = request.MaTu,
            MaTuyen = request.MaTuyen,
            MaDen = request.MaDen,
            MaNguoiTao = request.MaNguoiTao,
            NgayTao = DateTime.Now
        };

        _context.LichVanHanh.Add(schedule);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = schedule.MaLich }, schedule);
    }

    // PUT: api/LichVanHanh/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveLichVanHanhRequest request)
    {
        var schedule = await _context.LichVanHanh.FirstOrDefaultAsync(item => item.MaLich == id);
        if (schedule is null)
        {
            return NotFound(new { message = $"Không tìm thấy lịch vận hành với mã: {id}" });
        }

        var error = await ValidateRequest(request);
        if (error is not null) return BadRequest(new { message = error });

        schedule.TenLich = request.TenLich.Trim();
        schedule.NgayBatDau = request.NgayBatDau;
        schedule.NgayKetThuc = request.NgayKetThuc;
        schedule.DangApDung = request.DangApDung;
        schedule.MaTu = request.MaTu;
        schedule.MaTuyen = request.MaTuyen;
        schedule.MaDen = request.MaDen;
        schedule.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/LichVanHanh/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var schedule = await _context.LichVanHanh.FirstOrDefaultAsync(item => item.MaLich == id);
        if (schedule is null)
        {
            return NotFound(new { message = $"Không tìm thấy lịch vận hành với mã: {id}" });
        }

        if (await _context.LenhDieuKhien.AnyAsync(command => command.MaLich == id))
        {
            return Conflict(new { message = "Không thể xóa lịch đã phát sinh lệnh điều khiển; hãy tạm dừng lịch để lưu lịch sử." });
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();
        var details = await _context.ChiTietLichVanHanh.Where(item => item.MaLich == id).ToListAsync();
        _context.ChiTietLichVanHanh.RemoveRange(details);
        _context.LichVanHanh.Remove(schedule);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return NoContent();
    }

    private async Task<string?> ValidateRequest(SaveLichVanHanhRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TenLich) || request.TenLich.Trim().Length > 100)
        {
            return "Tên lịch là bắt buộc và không được vượt quá 100 ký tự.";
        }

        if (request.NgayBatDau == default ||
            (request.NgayKetThuc.HasValue && request.NgayKetThuc.Value < request.NgayBatDau))
        {
            return "Ngày bắt đầu không hợp lệ hoặc ngày kết thúc sớm hơn ngày bắt đầu.";
        }

        var targetCount = new[] { request.MaTu, request.MaTuyen, request.MaDen }
            .Count(value => !string.IsNullOrWhiteSpace(value));
        if (targetCount != 1)
        {
            return "Lịch phải áp dụng cho đúng một tủ, tuyến hoặc điểm đèn.";
        }

        if (request.MaTu is not null &&
            !await _context.TuChieuSang.AnyAsync(item => item.MaTu == request.MaTu && !item.DaXoa))
        {
            return $"Không tìm thấy tủ chiếu sáng '{request.MaTu}'.";
        }

        if (request.MaTuyen is not null &&
            !await _context.TuyenChieuSang.AnyAsync(item => item.MaTuyen == request.MaTuyen && !item.DaXoa))
        {
            return $"Không tìm thấy tuyến chiếu sáng '{request.MaTuyen}'.";
        }

        if (request.MaDen is not null &&
            !await _context.DiemDen.AnyAsync(item => item.MaDen == request.MaDen && !item.DaXoa))
        {
            return $"Không tìm thấy điểm đèn '{request.MaDen}'.";
        }

        if (request.MaNguoiTao is not null &&
            !await _context.NguoiDung.AnyAsync(user => user.MaNguoiDung == request.MaNguoiTao && !user.DaXoa))
        {
            return "Mã người tạo lịch không hợp lệ.";
        }

        return null;
    }
}

public sealed class SaveLichVanHanhRequest
{
    [Required]
    [MaxLength(100)]
    public string TenLich { get; set; } = string.Empty;

    public DateOnly NgayBatDau { get; set; }
    public DateOnly? NgayKetThuc { get; set; }
    public bool DangApDung { get; set; }
    public string? MaTu { get; set; }
    public string? MaTuyen { get; set; }
    public string? MaDen { get; set; }
    public string? MaNguoiTao { get; set; }
}
