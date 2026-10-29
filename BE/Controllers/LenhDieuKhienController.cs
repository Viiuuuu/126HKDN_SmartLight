using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LenhDieuKhienController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public LenhDieuKhienController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/LenhDieuKhien
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LenhDieuKhien>>> GetAll(
        [FromQuery] string? maTu,
        [FromQuery] string? maTuyen,
        [FromQuery] string? maDen,
        [FromQuery] byte? trangThaiLenh,
        [FromQuery] int? limit)
    {
        var query = _context.LenhDieuKhien.AsNoTracking().AsQueryable();

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

        if (trangThaiLenh.HasValue)
        {
            query = query.Where(x => x.TrangThaiLenh == trangThaiLenh.Value);
        }

        query = query.OrderByDescending(x => x.ThoiGianTao);

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/LenhDieuKhien/1
    [HttpGet("{id}")]
    public async Task<ActionResult<LenhDieuKhien>> GetById(long id)
    {
        var item = await _context.LenhDieuKhien.AsNoTracking().FirstOrDefaultAsync(x => x.MaLenh == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy lệnh điều khiển với mã: {id}" });
        }
        return Ok(item);
    }

    // POST: api/LenhDieuKhien
    [HttpPost]
    public async Task<ActionResult<LenhDieuKhien>> Create([FromBody] CreateLenhDieuKhienRequest request)
    {
        var targetCount = new[] { request.MaTu, request.MaTuyen, request.MaDen }.Count(value => !string.IsNullOrWhiteSpace(value));
        if (targetCount != 1)
        {
            return BadRequest(new { message = "Lệnh phải áp dụng cho đúng một tủ, tuyến hoặc điểm đèn." });
        }

        var action = request.HanhDong.Trim().ToUpperInvariant();
        if (action is not ("BAT" or "TAT" or "DIM"))
        {
            return BadRequest(new { message = "Hành động chỉ được là BAT, TAT hoặc DIM." });
        }

        if ((action == "DIM" && request.MucSang is null) ||
            (action != "DIM" && request.MucSang is not null) ||
            request.MucSang > 100)
        {
            return BadRequest(new { message = "Lệnh DIM cần mức sáng từ 0 đến 100; lệnh BAT/TAT không nhận mức sáng." });
        }

        if (request.NguonLenh != 1)
        {
            return BadRequest(new { message = "Chỉ nhận lệnh thủ công tại endpoint này; lệnh từ lịch được tạo bởi bộ lập lịch." });
        }

        if (request.MaLich is not null)
        {
            return BadRequest(new { message = "Lệnh thủ công không được gắn với lịch vận hành." });
        }

        var userIdentifier = request.MaNguoiDung;
        if (string.IsNullOrWhiteSpace(userIdentifier))
        {
            userIdentifier = Request.Headers["X-User-Id"].FirstOrDefault();
        }

        var userId = await _context.NguoiDung
            .Where(user => user.TrangThaiTaiKhoan == 1 && !user.DaXoa &&
                (user.MaNguoiDung == userIdentifier || user.TenDangNhap == userIdentifier))
            .Select(user => user.MaNguoiDung)
            .FirstOrDefaultAsync();
        if (userId is null)
        {
            return BadRequest(new { message = "Không xác định được người dùng đang đăng nhập; hãy đăng nhập lại bằng tài khoản hợp lệ." });
        }

        if (request.MaTu is not null &&
            !await _context.TuChieuSang.AnyAsync(item => item.MaTu == request.MaTu && !item.DaXoa))
        {
            return BadRequest(new { message = $"Không tìm thấy tủ chiếu sáng '{request.MaTu}'." });
        }

        if (request.MaTuyen is not null &&
            !await _context.TuyenChieuSang.AnyAsync(item => item.MaTuyen == request.MaTuyen && !item.DaXoa))
        {
            return BadRequest(new { message = $"Không tìm thấy tuyến chiếu sáng '{request.MaTuyen}'." });
        }

        if (request.MaDen is not null &&
            !await _context.DiemDen.AnyAsync(item => item.MaDen == request.MaDen && !item.DaXoa))
        {
            return BadRequest(new { message = $"Không tìm thấy điểm đèn '{request.MaDen}'." });
        }

        var command = new LenhDieuKhien
        {
            MaTu = request.MaTu,
            MaTuyen = request.MaTuyen,
            MaDen = request.MaDen,
            HanhDong = action,
            MucSang = request.MucSang,
            NguonLenh = 1,
            TrangThaiLenh = 0,
            ThoiGianTao = DateTime.Now,
            MaNguoiDung = userId
        };

        _context.LenhDieuKhien.Add(command);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = command.MaLenh }, command);
    }
}

public sealed class CreateLenhDieuKhienRequest
{
    public string? MaTu { get; set; }
    public string? MaTuyen { get; set; }
    public string? MaDen { get; set; }

    [Required]
    [MaxLength(10)]
    public string HanhDong { get; set; } = string.Empty;

    [Range(0, 100)]
    public byte? MucSang { get; set; }

    public byte NguonLenh { get; set; } = 1;
    public string? MaNguoiDung { get; set; }
    public int? MaLich { get; set; }
}
