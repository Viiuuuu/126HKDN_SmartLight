using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using BE.Security;
using System.Security.Cryptography;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace BE.Controllers;

public class DangNhapRequest
{
    [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập")]
    public string TenDangNhap { get; set; } = null!;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
    public string MatKhau { get; set; } = null!;
}

public class QuyenHanSessionDto
{
    public int MaQuyenHan { get; set; }
    public string TenQuyenHan { get; set; } = string.Empty;
    public bool DuocXem { get; set; } = true;
    public bool DuocCapNhat { get; set; }
}

public class DangNhapResponse
{
    public string MaNguoiDung { get; set; } = null!;
    public string TenDangNhap { get; set; } = null!;
    public string HoTen { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string VaiTro { get; set; } = null!;
    public int MaVaiTro { get; set; }
    public string? MaKhuVuc { get; set; }
    public string Token { get; set; } = null!;
    public DateTime ThoiGianHetHan { get; set; }
    public List<QuyenHanSessionDto> DanhSachQuyen { get; set; } = new();
}

public class DangXuatRequest
{
    public string? Token { get; set; }
    public string? MaNguoiDung { get; set; }
}

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

    // =========================================================================
    // POST: api/PhienDangNhap/dang-nhap (Đạt tiêu chuẩn ATTT Cấp độ 3)
    // =========================================================================
    [HttpPost("dang-nhap")]
    public async Task<ActionResult<DangNhapResponse>> DangNhap([FromBody] DangNhapRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var rawUsername = request.TenDangNhap?.Trim() ?? "";
        var normalizedUsername = RbacHelper.NormalizeUsernameAlias(rawUsername);
        var now = DateTime.Now;

        // 1. ATTT Cấp độ 3: Chống tấn công Brute-force (Giới hạn tối đa 5 lần sai liên tiếp trong 15 phút)
        var lockoutThreshold = now.AddMinutes(-15);
        var lastSuccessTime = await _context.NhatKyHeThong
            .Where(x => x.HanhDong == "DANG_NHAP" && x.KetQua == 1 && x.DoiTuong == normalizedUsername)
            .OrderByDescending(x => x.ThoiGian)
            .Select(x => (DateTime?)x.ThoiGian)
            .FirstOrDefaultAsync();

        var failureQuery = _context.NhatKyHeThong
            .Where(x => x.HanhDong == "DANG_NHAP" && x.KetQua == 0 && x.DoiTuong == normalizedUsername && x.ThoiGian >= lockoutThreshold);

        if (lastSuccessTime.HasValue)
        {
            failureQuery = failureQuery.Where(x => x.ThoiGian > lastSuccessTime.Value);
        }

        var failedAttempts = await failureQuery.CountAsync();
        if (failedAttempts >= 5)
        {
            _context.NhatKyHeThong.Add(new NhatKyHeThong
            {
                HanhDong = "DANG_NHAP_BI_CHAN",
                DoiTuong = normalizedUsername,
                NoiDung = $"Tài khoản {normalizedUsername} bị tạm khóa do đã nhập sai mật khẩu quá 5 lần trong 15 phút.",
                KetQua = 0,
                ThoiGian = now
            });
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                message = "Tài khoản của bạn tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút (Quy chuẩn ATTT cấp độ 3).",
                lockout = true,
                remainingMinutes = 15
            });
        }

        // 2. Tra cứu người dùng trong hệ thống
        var user = await _context.NguoiDung.FirstOrDefaultAsync(x => x.TenDangNhap == normalizedUsername && !x.DaXoa);

        // 3. ATTT Cấp độ 3: Xác thực mật khẩu qua PBKDF2 Hash và chống tấn công dò quét người dùng (User Enumeration)
        bool isPasswordValid = false;
        if (user != null)
        {
            isPasswordValid = VerifyPassword(user.MatKhau, request.MatKhau);
        }

        if (user == null || !isPasswordValid)
        {
            _context.NhatKyHeThong.Add(new NhatKyHeThong
            {
                MaNguoiDung = user?.MaNguoiDung,
                HanhDong = "DANG_NHAP",
                DoiTuong = normalizedUsername,
                NoiDung = "Đăng nhập thất bại: Tên đăng nhập hoặc mật khẩu không chính xác.",
                KetQua = 0,
                ThoiGian = now
            });
            await _context.SaveChangesAsync();

            var remaining = Math.Max(0, 5 - (failedAttempts + 1));
            return BadRequest(new
            {
                message = "Tên đăng nhập hoặc mật khẩu không chính xác.",
                remainingAttempts = remaining
            });
        }

        // 4. Kiểm tra trạng thái tài khoản (1: Hoạt động; 0: Nghỉ/Tạm khóa; 2: Khóa)
        if (user.TrangThaiTaiKhoan != 1)
        {
            _context.NhatKyHeThong.Add(new NhatKyHeThong
            {
                MaNguoiDung = user.MaNguoiDung,
                HanhDong = "DANG_NHAP",
                DoiTuong = normalizedUsername,
                NoiDung = "Đăng nhập thất bại: Tài khoản đang bị vô hiệu hóa hoặc khóa bởi Quản trị viên.",
                KetQua = 0,
                ThoiGian = now
            });
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Tài khoản của bạn hiện đang bị khóa bởi Quản trị viên hệ thống."
            });
        }

        // 5. ATTT Cấp độ 3: Khởi tạo phiên làm việc bảo mật (Session Management)
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var tokenHex = Convert.ToHexString(tokenBytes).ToLowerInvariant();
        var expiration = now.AddHours(8);

        var newSession = new PhienDangNhap
        {
            MaRefreshToken = tokenHex,
            ThoiGianDangNhap = now,
            ThoiGianHetHan = expiration,
            DaThuHoi = false,
            MaNguoiDung = user.MaNguoiDung
        };
        _context.PhienDangNhap.Add(newSession);

        user.LanDangNhapCuoi = now;

        var roleName = await _context.VaiTro
            .Where(r => r.MaVaiTro == user.MaVaiTro)
            .Select(r => r.TenVaiTro)
            .FirstOrDefaultAsync() ?? RbacHelper.GetDefaultRoleName(user.MaVaiTro);

        var danhSachQuyen = await (
            from vq in _context.VaiTroQuyenHan.AsNoTracking()
            join q in _context.QuyenHan.AsNoTracking() on vq.MaQuyenHan equals q.MaQuyenHan
            where vq.MaVaiTro == user.MaVaiTro && !q.DaXoa
            select new QuyenHanSessionDto
            {
                MaQuyenHan = q.MaQuyenHan,
                TenQuyenHan = q.TenQuyenHan,
                DuocXem = true,
                DuocCapNhat = user.MaVaiTro == RbacHelper.ROLE_ADMIN || vq.DuocCapNhat
            }
        ).ToListAsync();

        // 6. ATTT Cấp độ 3: Ghi nhận nhật ký kiểm toán (Audit Trail)
        _context.NhatKyHeThong.Add(new NhatKyHeThong
        {
            MaNguoiDung = user.MaNguoiDung,
            HanhDong = "DANG_NHAP",
            DoiTuong = user.TenDangNhap,
            NoiDung = $"Đăng nhập thành công với vai trò: {roleName}",
            KetQua = 1,
            ThoiGian = now
        });

        await _context.SaveChangesAsync();

        return Ok(new DangNhapResponse
        {
            MaNguoiDung = user.MaNguoiDung.Trim(),
            TenDangNhap = user.TenDangNhap,
            HoTen = user.HoTen,
            Email = user.Email,
            VaiTro = roleName,
            MaVaiTro = user.MaVaiTro,
            MaKhuVuc = user.MaKhuVuc?.Trim(),
            Token = tokenHex,
            ThoiGianHetHan = expiration,
            DanhSachQuyen = danhSachQuyen
        });
    }

    // =========================================================================
    // GET: api/PhienDangNhap/kiem-tra
    // Xác thực phiên đăng nhập hiện tại và trả về vai trò + quyền hạn từ CSDL
    // =========================================================================
    [HttpGet("kiem-tra")]
    public async Task<ActionResult> KiemTraPhien()
    {
        var caller = await RbacHelper.ResolveCallerAsync(_context, Request, requireAuthentication: true);
        if (caller.ErrorResult != null)
        {
            return caller.ErrorResult;
        }

        var user = caller.User!;
        var danhSachQuyen = await (
            from vq in _context.VaiTroQuyenHan.AsNoTracking()
            join q in _context.QuyenHan.AsNoTracking() on vq.MaQuyenHan equals q.MaQuyenHan
            where vq.MaVaiTro == user.MaVaiTro && !q.DaXoa
            select new QuyenHanSessionDto
            {
                MaQuyenHan = q.MaQuyenHan,
                TenQuyenHan = q.TenQuyenHan,
                DuocXem = true,
                DuocCapNhat = user.MaVaiTro == RbacHelper.ROLE_ADMIN || vq.DuocCapNhat
            }
        ).ToListAsync();

        return Ok(new
        {
            maNguoiDung = user.MaNguoiDung.Trim(),
            tenDangNhap = user.TenDangNhap,
            hoTen = user.HoTen,
            email = user.Email,
            soDienThoai = user.SoDienThoai,
            maVaiTro = user.MaVaiTro,
            vaiTro = caller.RoleName,
            trangThaiTaiKhoan = user.TrangThaiTaiKhoan,
            maKhuVuc = user.MaKhuVuc?.Trim(),
            danhSachQuyen
        });
    }

    // =========================================================================
    // POST: api/PhienDangNhap/dang-xuat
    // =========================================================================
    [HttpPost("dang-xuat")]
    public async Task<ActionResult> DangXuat([FromBody] DangXuatRequest? request)
    {
        var now = DateTime.Now;

        var token = request?.Token?.Trim();
        if (string.IsNullOrEmpty(token) && Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var authStr = authHeader.ToString();
            if (authStr.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = authStr.Substring(7).Trim();
            }
        }

        var maNguoiDung = request?.MaNguoiDung?.Trim();
        if (string.IsNullOrEmpty(maNguoiDung) && Request.Headers.TryGetValue("X-User-Id", out var userHeader))
        {
            maNguoiDung = userHeader.ToString().Trim();
        }

        PhienDangNhap? activeSession = null;

        if (!string.IsNullOrEmpty(token))
        {
            activeSession = await _context.PhienDangNhap
                .FirstOrDefaultAsync(x => x.MaRefreshToken == token && !x.DaThuHoi);
        }

        string? resolvedMaNguoiDung = null;
        if (!string.IsNullOrEmpty(maNguoiDung))
        {
            if (maNguoiDung.StartsWith("ND", StringComparison.OrdinalIgnoreCase))
            {
                resolvedMaNguoiDung = maNguoiDung;
            }
            else
            {
                var alias = RbacHelper.NormalizeUsernameAlias(maNguoiDung);
                resolvedMaNguoiDung = await _context.NguoiDung
                    .Where(u => u.TenDangNhap == maNguoiDung || u.TenDangNhap == alias)
                    .Select(u => u.MaNguoiDung)
                    .FirstOrDefaultAsync() ?? maNguoiDung;
            }
        }

        if (activeSession == null && !string.IsNullOrEmpty(resolvedMaNguoiDung))
        {
            activeSession = await _context.PhienDangNhap
                .Where(x => x.MaNguoiDung == resolvedMaNguoiDung && !x.DaThuHoi)
                .OrderByDescending(x => x.ThoiGianDangNhap)
                .FirstOrDefaultAsync();
        }

        if (activeSession == null && !string.IsNullOrEmpty(resolvedMaNguoiDung))
        {
            activeSession = await _context.PhienDangNhap
                .Where(x => x.MaNguoiDung == resolvedMaNguoiDung && x.ThoiGianDangXuat == null)
                .OrderByDescending(x => x.ThoiGianDangNhap)
                .FirstOrDefaultAsync();
        }

        if (activeSession != null)
        {
            activeSession.DaThuHoi = true;
            activeSession.ThoiGianDangXuat = now;
        }

        var auditUserId = activeSession?.MaNguoiDung ?? resolvedMaNguoiDung;
        if (!string.IsNullOrEmpty(auditUserId) && auditUserId.Length <= 6)
        {
            var exists = await _context.NguoiDung.AnyAsync(u => u.MaNguoiDung == auditUserId);
            if (exists)
            {
                _context.NhatKyHeThong.Add(new NhatKyHeThong
                {
                    MaNguoiDung = auditUserId,
                    HanhDong = "DANG_XUAT",
                    DoiTuong = auditUserId,
                    NoiDung = "Đăng xuất khỏi hệ thống thành công",
                    KetQua = 1,
                    ThoiGian = now
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new
        {
            message = "Đăng xuất an toàn thành công.",
            thoiGianDangXuat = now,
            sessionUpdated = activeSession != null
        });
    }

    // =========================================================================
    // Helper: Xác thực mật khẩu PBKDF2 của ASP.NET Core Identity V3 & fallback
    // =========================================================================
    public static bool VerifyPassword(string hashedPassword, string providedPassword)
    {
        if (string.IsNullOrEmpty(hashedPassword) || string.IsNullOrEmpty(providedPassword))
            return false;

        try
        {
            var hasher = new PasswordHasher<string>();
            var verifyResult = hasher.VerifyHashedPassword("SmartLightUser", hashedPassword, providedPassword);
            if (verifyResult == PasswordVerificationResult.Success ||
                verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                return true;
            }
        }
        catch
        {
            // Bỏ qua ngoại lệ format băm không đúng để kiểm tra fallback
        }

        return hashedPassword == providedPassword;
    }

    public static string HashPassword(string plainPassword)
    {
        var hasher = new PasswordHasher<string>();
        return hasher.HashPassword("SmartLightUser", plainPassword);
    }
}
