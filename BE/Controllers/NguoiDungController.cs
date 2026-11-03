using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using BE.Data;
using BE.Models;
using BE.Security;

namespace BE.Controllers;

public class CreateNguoiDungRequest
{
    public string? MaNguoiDung { get; set; }

    [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
    [MaxLength(50)]
    public string TenDangNhap { get; set; } = null!;

    [MaxLength(255)]
    public string? MatKhau { get; set; }

    [Required(ErrorMessage = "Họ tên không được để trống.")]
    [MaxLength(100)]
    public string HoTen { get; set; } = null!;

    public DateOnly? NgaySinh { get; set; }

    [Required(ErrorMessage = "Email không được để trống.")]
    [MaxLength(255)]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Số điện thoại không được để trống.")]
    [MaxLength(15)]
    public string SoDienThoai { get; set; } = null!;

    public byte TrangThaiTaiKhoan { get; set; } = 1; // 1: Hoạt động, 2: Tạm khóa, 0: Nghỉ
    public int MaVaiTro { get; set; } = RbacHelper.ROLE_OPERATOR;
    public string? TenVaiTro { get; set; }
    public string? MaKhuVuc { get; set; }
}

public class UpdateNguoiDungRequest
{
    [MaxLength(50)]
    public string? TenDangNhap { get; set; }

    [MaxLength(255)]
    public string? MatKhau { get; set; }

    [MaxLength(100)]
    public string? HoTen { get; set; }

    public DateOnly? NgaySinh { get; set; }

    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(15)]
    public string? SoDienThoai { get; set; }

    public byte? TrangThaiTaiKhoan { get; set; }
    public int? MaVaiTro { get; set; }
    public string? TenVaiTro { get; set; }
    public string? MaKhuVuc { get; set; }
}

public class UpdateTrangThaiRequest
{
    public byte TrangThaiTaiKhoan { get; set; } // 1 = Hoạt động, 2 = Tạm khóa
}

public class UpdateVaiTroRequest
{
    public int? MaVaiTro { get; set; }
    public string? TenVaiTro { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class NguoiDungController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public NguoiDungController(SmartLightDbContext context)
    {
        _context = context;
    }

    // =========================================================================
    // GET: api/NguoiDung
    // Lấy danh sách người dùng kèm thông tin vai trò, hỗ trợ tìm kiếm & lọc
    // =========================================================================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll(
        [FromQuery] int? maVaiTro,
        [FromQuery] string? maKhuVuc,
        [FromQuery] byte? trangThaiTaiKhoan,
        [FromQuery] string? tuKhoa)
    {
        // Kiểm tra nếu người gọi là Nhân viên kỹ thuật -> không cho phép xem danh sách tài khoản quản trị
        var caller = await RbacHelper.ResolveCallerAsync(_context, Request);
        if (caller.ErrorResult != null) return caller.ErrorResult;

        var query = from u in _context.NguoiDung.AsNoTracking()
                    where !u.DaXoa
                    join r in _context.VaiTro.AsNoTracking() on u.MaVaiTro equals r.MaVaiTro into roleJoin
                    from role in roleJoin.DefaultIfEmpty()
                    select new
                    {
                        maNguoiDung = u.MaNguoiDung.Trim(),
                        tenDangNhap = u.TenDangNhap,
                        hoTen = u.HoTen,
                        ngaySinh = u.NgaySinh,
                        email = u.Email,
                        soDienThoai = u.SoDienThoai,
                        trangThaiTaiKhoan = u.TrangThaiTaiKhoan,
                        lanDangNhapCuoi = u.LanDangNhapCuoi,
                        daXoa = u.DaXoa,
                        ngayTao = u.NgayTao,
                        ngayCapNhat = u.NgayCapNhat,
                        maVaiTro = u.MaVaiTro,
                        tenVaiTro = role != null ? role.TenVaiTro : RbacHelper.GetDefaultRoleName(u.MaVaiTro),
                        maKhuVuc = u.MaKhuVuc != null ? u.MaKhuVuc.Trim() : null
                    };

        if (maVaiTro.HasValue)
        {
            query = query.Where(x => x.maVaiTro == maVaiTro.Value);
        }

        if (!string.IsNullOrEmpty(maKhuVuc))
        {
            var kv = maKhuVuc.Trim();
            query = query.Where(x => x.maKhuVuc == kv);
        }

        if (trangThaiTaiKhoan.HasValue)
        {
            query = query.Where(x => x.trangThaiTaiKhoan == trangThaiTaiKhoan.Value);
        }

        if (!string.IsNullOrWhiteSpace(tuKhoa))
        {
            var kw = tuKhoa.Trim().ToLower();
            query = query.Where(x =>
                x.tenDangNhap.ToLower().Contains(kw) ||
                x.hoTen.ToLower().Contains(kw) ||
                x.email.ToLower().Contains(kw) ||
                x.soDienThoai.Contains(kw) ||
                x.maNguoiDung.ToLower().Contains(kw));
        }

        var result = await query.OrderBy(x => x.maNguoiDung).ToListAsync();
        return Ok(result);
    }

    // =========================================================================
    // GET: api/NguoiDung/ND0001
    // Xem chi tiết người dùng kèm vai trò và danh sách quyền hạn
    // =========================================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetById(string id)
    {
        var cleanId = id.Trim();
        var item = await _context.NguoiDung.AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaNguoiDung == cleanId && !x.DaXoa);

        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng với mã: {id}" });
        }

        var roleName = await _context.VaiTro.AsNoTracking()
            .Where(r => r.MaVaiTro == item.MaVaiTro)
            .Select(r => r.TenVaiTro)
            .FirstOrDefaultAsync() ?? RbacHelper.GetDefaultRoleName(item.MaVaiTro);

        var permissions = await (
            from vq in _context.VaiTroQuyenHan.AsNoTracking()
            join q in _context.QuyenHan.AsNoTracking() on vq.MaQuyenHan equals q.MaQuyenHan
            where vq.MaVaiTro == item.MaVaiTro && !q.DaXoa
            select new
            {
                maQuyenHan = q.MaQuyenHan,
                tenQuyenHan = q.TenQuyenHan,
                moTa = q.MoTa,
                duocXem = true,
                duocCapNhat = item.MaVaiTro == RbacHelper.ROLE_ADMIN || vq.DuocCapNhat
            }
        ).ToListAsync();

        return Ok(new
        {
            maNguoiDung = item.MaNguoiDung.Trim(),
            tenDangNhap = item.TenDangNhap,
            hoTen = item.HoTen,
            ngaySinh = item.NgaySinh,
            email = item.Email,
            soDienThoai = item.SoDienThoai,
            trangThaiTaiKhoan = item.TrangThaiTaiKhoan,
            lanDangNhapCuoi = item.LanDangNhapCuoi,
            daXoa = item.DaXoa,
            ngayTao = item.NgayTao,
            ngayCapNhat = item.NgayCapNhat,
            maVaiTro = item.MaVaiTro,
            tenVaiTro = roleName,
            maKhuVuc = item.MaKhuVuc?.Trim(),
            danhSachQuyen = permissions
        });
    }

    // =========================================================================
    // POST: api/NguoiDung
    // Thêm người dùng mới (Chỉ Quản trị viên - Admin)
    // =========================================================================
    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] CreateNguoiDungRequest request)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Thêm tài khoản người dùng mới");
        if (forbidden != null) return forbidden;

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var username = request.TenDangNhap.Trim();
        var fullName = request.HoTen.Trim();
        var email = request.Email.Trim();
        var phoneDigits = new string(request.SoDienThoai.Where(char.IsDigit).ToArray());
        var phone = string.IsNullOrEmpty(phoneDigits) ? request.SoDienThoai.Trim() : phoneDigits;

        if (!email.Contains('@') || !email.Contains('.'))
        {
            return BadRequest(new { message = "Địa chỉ email không đúng định dạng hợp lệ." });
        }

        if (await _context.NguoiDung.AnyAsync(u => u.TenDangNhap == username))
        {
            return Conflict(new { message = $"Tên đăng nhập '{username}' đã tồn tại trên hệ thống." });
        }

        if (await _context.NguoiDung.AnyAsync(u => u.Email == email))
        {
            return Conflict(new { message = $"Email '{email}' đã được sử dụng cho tài khoản khác." });
        }

        if (await _context.NguoiDung.AnyAsync(u => u.SoDienThoai == phone))
        {
            return Conflict(new { message = $"Số điện thoại '{phone}' đã được sử dụng cho tài khoản khác." });
        }

        int resolvedRoleId = await ResolveRoleIdAsync(request.MaVaiTro, request.TenVaiTro);

        // Tự động sinh mã người dùng CHAR(6) dạng ND0004, ND0005...
        string newId = request.MaNguoiDung?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(newId) || newId.Length > 6 || await _context.NguoiDung.AnyAsync(u => u.MaNguoiDung == newId))
        {
            var allIds = await _context.NguoiDung
                .Where(u => u.MaNguoiDung.StartsWith("ND"))
                .Select(u => u.MaNguoiDung)
                .ToListAsync();

            int maxNum = 0;
            foreach (var code in allIds)
            {
                if (int.TryParse(code.Trim().Substring(2), out int n) && n > maxNum)
                {
                    maxNum = n;
                }
            }
            newId = $"ND{(maxNum + 1):D4}";
        }

        var rawPassword = string.IsNullOrWhiteSpace(request.MatKhau) ? "SmartLight@2026" : request.MatKhau.Trim();
        var passwordHash = PhienDangNhapController.HashPassword(rawPassword);

        byte status = request.TrangThaiTaiKhoan switch
        {
            0 => 2,
            2 => 2,
            _ => 1
        };

        string? validKhuVuc = null;
        if (!string.IsNullOrWhiteSpace(request.MaKhuVuc))
        {
            var kv = request.MaKhuVuc.Trim();
            if (await _context.KhuVuc.AnyAsync(k => k.MaKhuVuc == kv))
            {
                validKhuVuc = kv;
            }
        }

        var newUser = new NguoiDung
        {
            MaNguoiDung = newId,
            TenDangNhap = username,
            MatKhau = passwordHash,
            HoTen = fullName,
            NgaySinh = request.NgaySinh ?? new DateOnly(1998, 1, 1),
            Email = email,
            SoDienThoai = phone.Length > 15 ? phone.Substring(0, 15) : phone,
            TrangThaiTaiKhoan = status,
            DaXoa = false,
            NgayTao = DateTime.Now,
            MaVaiTro = resolvedRoleId,
            MaKhuVuc = validKhuVuc
        };

        _context.NguoiDung.Add(newUser);
        await _context.SaveChangesAsync();

        var roleName = RbacHelper.GetDefaultRoleName(resolvedRoleId);
        await RbacHelper.LogActivityAsync(
            _context,
            caller.User?.MaNguoiDung ?? "ND0001",
            "THEM_NGUOI_DUNG",
            "NguoiDung",
            newUser.MaNguoiDung,
            $"Tạo mới tài khoản '{newUser.TenDangNhap}' ({newUser.HoTen}) với vai trò [{roleName}].");

        return CreatedAtAction(nameof(GetById), new { id = newUser.MaNguoiDung.Trim() }, new
        {
            maNguoiDung = newUser.MaNguoiDung.Trim(),
            tenDangNhap = newUser.TenDangNhap,
            hoTen = newUser.HoTen,
            ngaySinh = newUser.NgaySinh,
            email = newUser.Email,
            soDienThoai = newUser.SoDienThoai,
            trangThaiTaiKhoan = newUser.TrangThaiTaiKhoan,
            ngayTao = newUser.NgayTao,
            maVaiTro = newUser.MaVaiTro,
            tenVaiTro = roleName,
            maKhuVuc = newUser.MaKhuVuc?.Trim()
        });
    }

    // =========================================================================
    // PUT: api/NguoiDung/ND0002
    // Cập nhật thông tin người dùng và vai trò (Chỉ Quản trị viên - Admin)
    // =========================================================================
    [HttpPut("{id}")]
    public async Task<ActionResult<object>> Update(string id, [FromBody] UpdateNguoiDungRequest request)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Cập nhật thông tin người dùng");
        if (forbidden != null) return forbidden;

        var cleanId = id.Trim();
        var user = await _context.NguoiDung.FirstOrDefaultAsync(x => x.MaNguoiDung == cleanId && !x.DaXoa);
        if (user == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng với mã: {id}" });
        }

        bool isSelf = caller.User != null && caller.User.MaNguoiDung.Trim().Equals(cleanId, StringComparison.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(request.TenDangNhap))
        {
            var newUsername = request.TenDangNhap.Trim();
            if (!newUsername.Equals(user.TenDangNhap, StringComparison.OrdinalIgnoreCase))
            {
                if (await _context.NguoiDung.AnyAsync(u => u.TenDangNhap == newUsername && u.MaNguoiDung != cleanId))
                {
                    return Conflict(new { message = $"Tên đăng nhập '{newUsername}' đã tồn tại." });
                }
                user.TenDangNhap = newUsername;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.HoTen))
        {
            user.HoTen = request.HoTen.Trim();
        }

        if (request.NgaySinh.HasValue)
        {
            user.NgaySinh = request.NgaySinh.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var newEmail = request.Email.Trim();
            if (!newEmail.Equals(user.Email, StringComparison.OrdinalIgnoreCase))
            {
                if (await _context.NguoiDung.AnyAsync(u => u.Email == newEmail && u.MaNguoiDung != cleanId))
                {
                    return Conflict(new { message = $"Email '{newEmail}' đã được sử dụng." });
                }
                user.Email = newEmail;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.SoDienThoai))
        {
            var digits = new string(request.SoDienThoai.Where(char.IsDigit).ToArray());
            var newPhone = string.IsNullOrEmpty(digits) ? request.SoDienThoai.Trim() : digits;
            if (newPhone.Length > 15) newPhone = newPhone.Substring(0, 15);
            if (newPhone != user.SoDienThoai)
            {
                if (await _context.NguoiDung.AnyAsync(u => u.SoDienThoai == newPhone && u.MaNguoiDung != cleanId))
                {
                    return Conflict(new { message = $"Số điện thoại '{newPhone}' đã được sử dụng." });
                }
                user.SoDienThoai = newPhone;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.MatKhau))
        {
            user.MatKhau = PhienDangNhapController.HashPassword(request.MatKhau.Trim());
        }

        // Xử lý thay đổi vai trò
        if (request.MaVaiTro.HasValue || !string.IsNullOrWhiteSpace(request.TenVaiTro))
        {
            int newRoleId = await ResolveRoleIdAsync(request.MaVaiTro, request.TenVaiTro);
            if (isSelf && newRoleId != RbacHelper.ROLE_ADMIN)
            {
                return BadRequest(new { message = "Quản trị viên không được tự hạ quyền của chính mình." });
            }
            user.MaVaiTro = newRoleId;
        }

        // Xử lý thay đổi trạng thái tài khoản
        if (request.TrangThaiTaiKhoan.HasValue)
        {
            byte newStatus = request.TrangThaiTaiKhoan.Value == 1 ? (byte)1 : (byte)2;
            if (isSelf && newStatus != 1)
            {
                return BadRequest(new { message = "Quản trị viên không được tự khóa tài khoản đang đăng nhập của chính mình." });
            }
            user.TrangThaiTaiKhoan = newStatus;

            if (newStatus != 1)
            {
                await RevokeUserSessionsAsync(cleanId);
            }
        }

        if (request.MaKhuVuc != null)
        {
            var kv = request.MaKhuVuc.Trim();
            if (string.IsNullOrEmpty(kv))
            {
                user.MaKhuVuc = null;
            }
            else if (await _context.KhuVuc.AnyAsync(k => k.MaKhuVuc == kv))
            {
                user.MaKhuVuc = kv;
            }
        }

        user.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();

        var roleName = RbacHelper.GetDefaultRoleName(user.MaVaiTro);
        await RbacHelper.LogActivityAsync(
            _context,
            caller.User?.MaNguoiDung ?? "ND0001",
            "CAP_NHAT_NGUOI_DUNG",
            "NguoiDung",
            user.MaNguoiDung,
            $"Cập nhật tài khoản '{user.TenDangNhap}' ({user.HoTen}) - Vai trò: [{roleName}], Trạng thái: {(user.TrangThaiTaiKhoan == 1 ? "Hoạt động" : "Tạm khóa")}.");

        return Ok(new
        {
            maNguoiDung = user.MaNguoiDung.Trim(),
            tenDangNhap = user.TenDangNhap,
            hoTen = user.HoTen,
            ngaySinh = user.NgaySinh,
            email = user.Email,
            soDienThoai = user.SoDienThoai,
            trangThaiTaiKhoan = user.TrangThaiTaiKhoan,
            ngayCapNhat = user.NgayCapNhat,
            maVaiTro = user.MaVaiTro,
            tenVaiTro = roleName,
            maKhuVuc = user.MaKhuVuc?.Trim()
        });
    }

    // =========================================================================
    // PUT & PATCH: api/NguoiDung/ND0002/trang-thai
    // Khóa hoặc mở khóa tài khoản người dùng (Chỉ Quản trị viên - Admin)
    // =========================================================================
    [HttpPut("{id}/trang-thai")]
    [HttpPatch("{id}/trang-thai")]
    public async Task<ActionResult> UpdateStatus(string id, [FromBody] UpdateTrangThaiRequest request)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Khóa/Mở khóa tài khoản người dùng");
        if (forbidden != null) return forbidden;

        var cleanId = id.Trim();
        var user = await _context.NguoiDung.FirstOrDefaultAsync(x => x.MaNguoiDung == cleanId && !x.DaXoa);
        if (user == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng với mã: {id}" });
        }

        bool isSelf = caller.User != null && caller.User.MaNguoiDung.Trim().Equals(cleanId, StringComparison.OrdinalIgnoreCase);
        byte targetStatus = request.TrangThaiTaiKhoan == 1 ? (byte)1 : (byte)2;

        if (isSelf && targetStatus != 1)
        {
            return BadRequest(new { message = "Không được phép tự khóa tài khoản Quản trị viên đang đăng nhập." });
        }

        // Không cho phép khóa tài khoản Quản trị viên gốc duy nhất
        if (user.MaVaiTro == RbacHelper.ROLE_ADMIN && targetStatus != 1)
        {
            var activeAdmins = await _context.NguoiDung
                .CountAsync(u => !u.DaXoa && u.MaVaiTro == RbacHelper.ROLE_ADMIN && u.TrangThaiTaiKhoan == 1 && u.MaNguoiDung != cleanId);
            if (activeAdmins == 0)
            {
                return BadRequest(new { message = "Không thể khóa tài khoản Quản trị viên đang hoạt động duy nhất của hệ thống." });
            }
        }

        user.TrangThaiTaiKhoan = targetStatus;
        user.NgayCapNhat = DateTime.Now;

        if (targetStatus != 1)
        {
            await RevokeUserSessionsAsync(cleanId);
        }

        await _context.SaveChangesAsync();

        var actionCode = targetStatus == 1 ? "MO_KHOA_TAI_KHOAN" : "KHOA_TAI_KHOAN";
        var actionText = targetStatus == 1 ? "Mở khóa tài khoản" : "Tạm khóa tài khoản";
        await RbacHelper.LogActivityAsync(
            _context,
            caller.User?.MaNguoiDung ?? "ND0001",
            actionCode,
            "NguoiDung",
            user.MaNguoiDung,
            $"{actionText} '{user.TenDangNhap}' ({user.HoTen}).");

        return Ok(new
        {
            message = $"{actionText} '{user.TenDangNhap}' thành công.",
            maNguoiDung = user.MaNguoiDung.Trim(),
            trangThaiTaiKhoan = user.TrangThaiTaiKhoan
        });
    }

    // =========================================================================
    // PUT: api/NguoiDung/ND0002/vai-tro
    // Thay đổi vai trò cho người dùng (Chỉ Quản trị viên - Admin)
    // =========================================================================
    [HttpPut("{id}/vai-tro")]
    public async Task<ActionResult> UpdateRole(string id, [FromBody] UpdateVaiTroRequest request)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Phân quyền vai trò người dùng");
        if (forbidden != null) return forbidden;

        var cleanId = id.Trim();
        var user = await _context.NguoiDung.FirstOrDefaultAsync(x => x.MaNguoiDung == cleanId && !x.DaXoa);
        if (user == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng với mã: {id}" });
        }

        int newRoleId = await ResolveRoleIdAsync(request.MaVaiTro, request.TenVaiTro);
        bool isSelf = caller.User != null && caller.User.MaNguoiDung.Trim().Equals(cleanId, StringComparison.OrdinalIgnoreCase);

        if (isSelf && newRoleId != RbacHelper.ROLE_ADMIN)
        {
            return BadRequest(new { message = "Quản trị viên không được phép tự hạ vai trò của chính mình." });
        }

        var oldRoleName = RbacHelper.GetDefaultRoleName(user.MaVaiTro);
        var newRoleName = RbacHelper.GetDefaultRoleName(newRoleId);

        user.MaVaiTro = newRoleId;
        user.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context,
            caller.User?.MaNguoiDung ?? "ND0001",
            "PHAN_QUYEN_VAI_TRO",
            "NguoiDung",
            user.MaNguoiDung,
            $"Thay đổi vai trò của '{user.TenDangNhap}' ({user.HoTen}) từ [{oldRoleName}] sang [{newRoleName}].");

        return Ok(new
        {
            message = $"Đã cập nhật vai trò của '{user.HoTen}' thành [{newRoleName}].",
            maNguoiDung = user.MaNguoiDung.Trim(),
            maVaiTro = user.MaVaiTro,
            tenVaiTro = newRoleName
        });
    }

    private async Task<int> ResolveRoleIdAsync(int? maVaiTro, string? tenVaiTro)
    {
        if (maVaiTro.HasValue && maVaiTro.Value >= 1 && maVaiTro.Value <= 3)
        {
            return maVaiTro.Value;
        }

        if (!string.IsNullOrWhiteSpace(tenVaiTro))
        {
            var lower = tenVaiTro.Trim().ToLowerInvariant();
            if (lower.Contains("quản trị") || lower.Contains("quan tri") || lower.Contains("admin"))
                return RbacHelper.ROLE_ADMIN;
            if (lower.Contains("kỹ thuật") || lower.Contains("ky thuat") || lower.Contains("tech"))
                return RbacHelper.ROLE_TECHNICIAN;
            if (lower.Contains("vận hành") || lower.Contains("van hanh") || lower.Contains("operator"))
                return RbacHelper.ROLE_OPERATOR;

            var dbRole = await _context.VaiTro.AsNoTracking()
                .FirstOrDefaultAsync(r => r.TenVaiTro == tenVaiTro.Trim());
            if (dbRole != null) return dbRole.MaVaiTro;
        }

        return RbacHelper.ROLE_OPERATOR;
    }

    private async Task RevokeUserSessionsAsync(string maNguoiDung)
    {
        var activeSessions = await _context.PhienDangNhap
            .Where(s => s.MaNguoiDung == maNguoiDung && !s.DaThuHoi)
            .ToListAsync();

        var now = DateTime.Now;
        foreach (var s in activeSessions)
        {
            s.DaThuHoi = true;
            s.ThoiGianDangXuat = now;
        }
    }
}
