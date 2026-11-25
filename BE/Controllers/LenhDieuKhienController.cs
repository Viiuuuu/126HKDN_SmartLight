using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using BE.Data;
using BE.Models;
using BE.Security;

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

    // POST: api/LenhDieuKhien (Admin & Operator)
    [HttpPost]
    public async Task<ActionResult<LenhDieuKhien>> Create([FromBody] CreateLenhDieuKhienRequest request)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR }, "Gửi lệnh điều khiển chiếu sáng");
        if (forbidden != null) return forbidden;

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

        var normalizedId = RbacHelper.NormalizeUsernameAlias(userIdentifier ?? "");
        var userId = caller.User?.MaNguoiDung ?? await _context.NguoiDung
            .Where(user => user.TrangThaiTaiKhoan == 1 && !user.DaXoa &&
                (user.MaNguoiDung == userIdentifier || user.TenDangNhap == userIdentifier || user.TenDangNhap == normalizedId))
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
            TrangThaiLenh = 1, // 1: Da tiep nhan / Dang thuc hien
            ThoiGianTao = DateTime.Now,
            ThoiGianGui = DateTime.Now,
            MaNguoiDung = userId
        };

        _context.LenhDieuKhien.Add(command);

        // Cap nhat ngay trang thai thiet bi trong co so du lieu
        if (request.MaDen is not null)
        {
            var lamp = await _context.DiemDen.FirstOrDefaultAsync(x => x.MaDen == request.MaDen && !x.DaXoa);
            if (lamp != null)
            {
                if (action == "BAT")
                {
                    lamp.TrangThaiHoatDong = 1;
                    lamp.DoSang = 100;
                }
                else if (action == "TAT")
                {
                    lamp.TrangThaiHoatDong = 2;
                    lamp.DoSang = 0;
                }
                else if (action == "DIM" && request.MucSang.HasValue)
                {
                    lamp.TrangThaiHoatDong = request.MucSang.Value > 0 ? (byte)1 : (byte)2;
                    lamp.DoSang = request.MucSang.Value;
                }
                lamp.NgayCapNhat = DateTime.Now;
            }
        }
        else if (request.MaTuyen is not null)
        {
            var route = await _context.TuyenChieuSang.FirstOrDefaultAsync(x => x.MaTuyen == request.MaTuyen && !x.DaXoa);
            if (route != null)
            {
                if (action == "BAT")
                {
                    route.TrangThaiHoatDong = 1;
                    route.MucSangHienTai = 100;
                }
                else if (action == "TAT")
                {
                    route.TrangThaiHoatDong = 2;
                    route.MucSangHienTai = 0;
                }
                else if (action == "DIM" && request.MucSang.HasValue)
                {
                    route.TrangThaiHoatDong = request.MucSang.Value > 0 ? (byte)1 : (byte)2;
                    route.MucSangHienTai = request.MucSang.Value;
                }
                route.NgayCapNhat = DateTime.Now;

                // Dong bo cac den truc thuoc tuyen
                var routeLamps = await _context.DiemDen.Where(d => d.MaTuyen == route.MaTuyen && !d.DaXoa).ToListAsync();
                foreach (var l in routeLamps)
                {
                    if (action == "BAT") { l.TrangThaiHoatDong = 1; l.DoSang = 100; }
                    else if (action == "TAT") { l.TrangThaiHoatDong = 2; l.DoSang = 0; }
                    else if (action == "DIM" && request.MucSang.HasValue)
                    {
                        l.TrangThaiHoatDong = request.MucSang.Value > 0 ? (byte)1 : (byte)2;
                        l.DoSang = request.MucSang.Value;
                    }
                    l.NgayCapNhat = DateTime.Now;
                }
            }
        }
        else if (request.MaTu is not null)
        {
            var cabinet = await _context.TuChieuSang.FirstOrDefaultAsync(x => x.MaTu == request.MaTu && !x.DaXoa);
            if (cabinet != null)
            {
                if (action == "BAT") cabinet.TrangThaiNguon = "ON";
                else if (action == "TAT") cabinet.TrangThaiNguon = "OFF";
                cabinet.NgayCapNhat = DateTime.Now;
            }
        }

        await _context.SaveChangesAsync();

        var targetCode = request.MaTu ?? request.MaTuyen ?? request.MaDen;
        await RbacHelper.LogActivityAsync(
            _context, userId, "DIEU_KHIEN_CHIEU_SANG", "LenhDieuKhien", targetCode,
            $"Gửi lệnh điều khiển [{action}{(request.MucSang.HasValue ? $" {request.MucSang}%" : "")}] tới thiết bị {targetCode}.");

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
