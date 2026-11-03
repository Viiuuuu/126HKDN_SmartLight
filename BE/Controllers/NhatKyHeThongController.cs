using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using BE.Security;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NhatKyHeThongController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public NhatKyHeThongController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/NhatKyHeThong
    // Admin: Xem toàn bộ nhật ký hoạt động hệ thống
    // Operator: Chỉ được xem lịch sử hoạt động cá nhân của chính mình
    // Technician: Không có quyền truy cập nhật ký hệ thống
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NhatKyHeThong>>> GetAll(
        [FromQuery] string? maNguoiDung,
        [FromQuery] string? hanhDong,
        [FromQuery] byte? ketQua,
        [FromQuery] int? limit)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context,
            Request,
            new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR },
            "Xem nhật ký hoạt động");
        if (forbidden != null) return forbidden;

        var query = _context.NhatKyHeThong.AsNoTracking().AsQueryable();

        // Nếu là Nhân viên vận hành, bắt buộc giới hạn trong phạm vi tài khoản cá nhân
        if (caller.IsOperator && caller.User != null)
        {
            var selfId = caller.User.MaNguoiDung.Trim();
            query = query.Where(x => x.MaNguoiDung == selfId);
        }
        else if (!string.IsNullOrEmpty(maNguoiDung))
        {
            var cleanUserId = maNguoiDung.Trim();
            query = query.Where(x => x.MaNguoiDung == cleanUserId);
        }

        if (!string.IsNullOrEmpty(hanhDong))
        {
            query = query.Where(x => x.HanhDong == hanhDong);
        }

        if (ketQua.HasValue)
        {
            query = query.Where(x => x.KetQua == ketQua.Value);
        }

        query = query.OrderByDescending(x => x.ThoiGian);

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/NhatKyHeThong/1
    [HttpGet("{id}")]
    public async Task<ActionResult<NhatKyHeThong>> GetById(long id)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context,
            Request,
            new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR },
            "Xem chi tiết nhật ký hoạt động");
        if (forbidden != null) return forbidden;

        var item = await _context.NhatKyHeThong.AsNoTracking().FirstOrDefaultAsync(x => x.MaNhatKy == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy nhật ký hệ thống với mã: {id}" });
        }

        if (caller.IsOperator && caller.User != null && item.MaNguoiDung?.Trim() != caller.User.MaNguoiDung.Trim())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Nhân viên vận hành chỉ được phép xem lịch sử hoạt động cá nhân của chính mình."
            });
        }

        return Ok(item);
    }
}
