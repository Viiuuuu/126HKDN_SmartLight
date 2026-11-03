using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Security;

/// <summary>
/// Bộ kiểm tra phân quyền người dùng theo vai trò (RBAC) phía Backend.
/// Xác thực danh tính và vai trò trực tiếp từ SQL Server thông qua Token phiên đăng nhập
/// hoặc định danh người dùng (X-User-Id), tuyệt đối không tin tưởng dữ liệu vai trò do Client tự gửi.
/// </summary>
public static class RbacHelper
{
    public const int ROLE_ADMIN = 1;      // Quản trị viên
    public const int ROLE_OPERATOR = 2;   // Nhân viên vận hành
    public const int ROLE_TECHNICIAN = 3; // Nhân viên kỹ thuật

    public sealed class CallerContext
    {
        public NguoiDung? User { get; init; }
        public int MaVaiTro => User?.MaVaiTro ?? 0;
        public string RoleName { get; init; } = string.Empty;
        public bool IsAuthenticated => User != null;
        public bool IsAdmin => MaVaiTro == ROLE_ADMIN;
        public bool IsOperator => MaVaiTro == ROLE_OPERATOR;
        public bool IsTechnician => MaVaiTro == ROLE_TECHNICIAN;
        public ActionResult? ErrorResult { get; init; }
    }

    /// <summary>
    /// Phân giải người dùng hiện tại từ Authorization Bearer Token hoặc X-User-Id header.
    /// </summary>
    public static async Task<CallerContext> ResolveCallerAsync(
        SmartLightDbContext db,
        HttpRequest request,
        bool requireAuthentication = false)
    {
        string? token = null;
        if (request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var rawAuth = authHeader.ToString().Trim();
            if (rawAuth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = rawAuth.Substring(7).Trim();
            }
        }

        string? userHeader = null;
        if (request.Headers.TryGetValue("X-User-Id", out var rawUserHeader))
        {
            userHeader = rawUserHeader.ToString().Trim();
        }

        NguoiDung? user = null;

        // 1. Ưu tiên tra cứu từ PhienDangNhap qua Token hợp lệ (nếu không phải demo-token)
        if (!string.IsNullOrEmpty(token) && !token.StartsWith("demo-token-", StringComparison.OrdinalIgnoreCase))
        {
            var session = await db.PhienDangNhap
                .AsNoTracking()
                .Where(s => s.MaRefreshToken == token && !s.DaThuHoi && s.ThoiGianHetHan > DateTime.Now)
                .OrderByDescending(s => s.ThoiGianDangNhap)
                .FirstOrDefaultAsync();

            if (session != null)
            {
                user = await db.NguoiDung
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.MaNguoiDung == session.MaNguoiDung && !u.DaXoa);
            }
        }

        // 2. Tra cứu qua X-User-Id (hỗ trợ cả mã NDxxxx, tên đăng nhập hoặc bí danh demo)
        if (user == null && !string.IsNullOrEmpty(userHeader))
        {
            var normalized = NormalizeUsernameAlias(userHeader);
            user = await db.NguoiDung
                .AsNoTracking()
                .FirstOrDefaultAsync(u => !u.DaXoa &&
                    (u.MaNguoiDung == userHeader || u.TenDangNhap == userHeader || u.TenDangNhap == normalized));
        }

        if (user == null)
        {
            if (requireAuthentication)
            {
                return new CallerContext
                {
                    ErrorResult = new ObjectResult(new
                    {
                        message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
                    })
                    {
                        StatusCode = StatusCodes.Status401Unauthorized
                    }
                };
            }

            return new CallerContext();
        }

        // 3. Kiểm tra trạng thái khóa tài khoản (1 = Hoạt động; 0 = Nghỉ; 2 = Tạm khóa)
        if (user.TrangThaiTaiKhoan != 1)
        {
            return new CallerContext
            {
                User = user,
                ErrorResult = new ObjectResult(new
                {
                    message = "Tài khoản của bạn hiện đang bị khóa hoặc ngừng hoạt động bởi Quản trị viên."
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                }
            };
        }

        var roleName = await db.VaiTro
            .AsNoTracking()
            .Where(r => r.MaVaiTro == user.MaVaiTro)
            .Select(r => r.TenVaiTro)
            .FirstOrDefaultAsync() ?? GetDefaultRoleName(user.MaVaiTro);

        return new CallerContext
        {
            User = user,
            RoleName = roleName
        };
    }

    /// <summary>
    /// Kiểm tra người gọi có nằm trong danh sách vai trò được phép hay không.
    /// Nếu request có định danh người dùng (X-User-Id hoặc Token), bắt buộc đúng vai trò.
    /// Nếu requireAuth = true, bắt buộc phải đăng nhập.
    /// </summary>
    public static async Task<(CallerContext Caller, ActionResult? ForbiddenResult)> EnforceRolesAsync(
        SmartLightDbContext db,
        HttpRequest request,
        int[] allowedRoles,
        string actionDescription,
        bool requireAuth = false)
    {
        var caller = await ResolveCallerAsync(db, request, requireAuth);
        if (caller.ErrorResult != null)
        {
            return (caller, caller.ErrorResult);
        }

        if (caller.User != null && !allowedRoles.Contains(caller.MaVaiTro))
        {
            await LogActivityAsync(
                db,
                caller.User.MaNguoiDung,
                "TRUY_CAP_TRAI_PHEP",
                actionDescription,
                caller.User.MaNguoiDung,
                $"Từ chối quyền thực hiện [{actionDescription}] đối với vai trò {caller.RoleName}.",
                0);

            var forbidden = new ObjectResult(new
            {
                message = $"Vai trò [{caller.RoleName}] không có quyền thực hiện thao tác: {actionDescription}."
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return (caller, forbidden);
        }

        return (caller, null);
    }

    /// <summary>
    /// Ghi nhận nhật ký hoạt động vào bảng NhatKyHeThong
    /// </summary>
    public static async Task LogActivityAsync(
        SmartLightDbContext db,
        string? maNguoiDung,
        string hanhDong,
        string? doiTuong,
        string? maDoiTuong,
        string noiDung,
        byte ketQua = 1)
    {
        try
        {
            string? validUserId = null;
            if (!string.IsNullOrWhiteSpace(maNguoiDung))
            {
                var trimmed = maNguoiDung.Trim();
                var exists = await db.NguoiDung.AsNoTracking().AnyAsync(u => u.MaNguoiDung == trimmed);
                if (exists) validUserId = trimmed;
            }

            db.NhatKyHeThong.Add(new NhatKyHeThong
            {
                MaNguoiDung = validUserId,
                HanhDong = hanhDong.Length > 100 ? hanhDong.Substring(0, 100) : hanhDong,
                DoiTuong = doiTuong != null && doiTuong.Length > 100 ? doiTuong.Substring(0, 100) : doiTuong,
                MaDoiTuong = maDoiTuong != null && maDoiTuong.Length > 20 ? maDoiTuong.Substring(0, 20) : maDoiTuong,
                NoiDung = noiDung.Length > 500 ? noiDung.Substring(0, 500) : noiDung,
                KetQua = ketQua,
                ThoiGian = DateTime.Now
            });
            await db.SaveChangesAsync();
        }
        catch
        {
            // Tránh làm gián đoạn luồng chính nếu lỗi ghi log phụ
        }
    }

    public static string NormalizeUsernameAlias(string rawUsername)
    {
        var trimmed = (rawUsername ?? string.Empty).Trim();
        var lower = trimmed.ToLowerInvariant();
        if (lower == "admin") return "admin_demo";
        if (lower == "operator" || lower == "vanhanh") return "vanhanh_demo";
        if (lower == "technician" || lower == "kythuat") return "kythuat_demo";
        return trimmed;
    }

    public static string GetDefaultRoleName(int maVaiTro) => maVaiTro switch
    {
        ROLE_ADMIN => "Quản trị viên",
        ROLE_OPERATOR => "Nhân viên vận hành",
        ROLE_TECHNICIAN => "Nhân viên kỹ thuật",
        _ => "Người dùng"
    };
}

