using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using BE.Security;

namespace BE.Controllers;

public class QuyenVaiTroItemRequest
{
    public int MaQuyenHan { get; set; }
    public string? TenQuyenHan { get; set; }
    public bool DuocXem { get; set; } = true;
    public bool DuocCapNhat { get; set; }
}

public class CapNhatQuyenVaiTroRequest
{
    public List<QuyenVaiTroItemRequest> DanhSachQuyen { get; set; } = new();
}

[ApiController]
[Route("api/[controller]")]
public class VaiTroQuyenHanController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public VaiTroQuyenHanController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/VaiTroQuyenHan
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaiTroQuyenHan>>> GetAll(
        [FromQuery] int? maVaiTro,
        [FromQuery] int? maQuyenHan)
    {
        var query = _context.VaiTroQuyenHan.AsNoTracking().AsQueryable();

        if (maVaiTro.HasValue)
        {
            query = query.Where(x => x.MaVaiTro == maVaiTro.Value);
        }

        if (maQuyenHan.HasValue)
        {
            query = query.Where(x => x.MaQuyenHan == maQuyenHan.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/VaiTroQuyenHan/ma-tran
    // Trả về ma trận phân quyền đầy đủ giữa 3 vai trò và danh mục quyền hạn
    [HttpGet("ma-tran")]
    public async Task<ActionResult<object>> GetMatrix()
    {
        var roles = await _context.VaiTro.AsNoTracking().Where(r => !r.DaXoa).OrderBy(r => r.MaVaiTro).ToListAsync();
        var permissions = await _context.QuyenHan.AsNoTracking().Where(q => !q.DaXoa).OrderBy(q => q.MaQuyenHan).ToListAsync();
        var mappings = await _context.VaiTroQuyenHan.AsNoTracking().ToListAsync();
        var userCounts = await _context.NguoiDung.AsNoTracking()
            .Where(u => !u.DaXoa)
            .GroupBy(u => u.MaVaiTro)
            .Select(g => new { MaVaiTro = g.Key, SoLuong = g.Count() })
            .ToListAsync();

        var roleMatrix = roles.Select(r => new
        {
            maVaiTro = r.MaVaiTro,
            tenVaiTro = r.TenVaiTro,
            moTa = r.MoTa,
            soTaiKhoan = userCounts.FirstOrDefault(c => c.MaVaiTro == r.MaVaiTro)?.SoLuong ?? 0,
            quyenHan = permissions.Select(q =>
            {
                var map = mappings.FirstOrDefault(m => m.MaVaiTro == r.MaVaiTro && m.MaQuyenHan == q.MaQuyenHan);
                bool isAdmin = r.MaVaiTro == RbacHelper.ROLE_ADMIN;
                return new
                {
                    maQuyenHan = q.MaQuyenHan,
                    tenQuyenHan = q.TenQuyenHan,
                    moTa = q.MoTa,
                    duocXem = isAdmin || map != null,
                    duocCapNhat = isAdmin || (map != null && map.DuocCapNhat)
                };
            }).ToList()
        }).ToList();

        return Ok(roleMatrix);
    }

    // GET: api/VaiTroQuyenHan/{maQuyenHan}/{maVaiTro}
    [HttpGet("{maQuyenHan:int}/{maVaiTro:int}")]
    public async Task<ActionResult<VaiTroQuyenHan>> GetById(int maQuyenHan, int maVaiTro)
    {
        var item = await _context.VaiTroQuyenHan.AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaQuyenHan == maQuyenHan && x.MaVaiTro == maVaiTro);

        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy phân quyền cho Quyền: {maQuyenHan}, Vai trò: {maVaiTro}" });
        }

        return Ok(item);
    }

    // PUT: api/VaiTroQuyenHan/vai-tro/{maVaiTro}
    // Cập nhật cấu hình phân quyền cho một vai trò (Chỉ Quản trị viên - Admin)
    [HttpPut("vai-tro/{maVaiTro:int}")]
    public async Task<ActionResult> UpdateRolePermissions(int maVaiTro, [FromBody] CapNhatQuyenVaiTroRequest request)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Cập nhật phân quyền theo vai trò");
        if (forbidden != null) return forbidden;

        var role = await _context.VaiTro.FirstOrDefaultAsync(r => r.MaVaiTro == maVaiTro && !r.DaXoa);
        if (role == null)
        {
            return NotFound(new { message = $"Không tìm thấy vai trò với mã: {maVaiTro}" });
        }

        if (maVaiTro == RbacHelper.ROLE_ADMIN)
        {
            return BadRequest(new { message = "Vai trò Quản trị viên luôn có toàn quyền hệ thống mặc định, không được thu hồi." });
        }

        var validPermissionIds = await _context.QuyenHan.AsNoTracking()
            .Where(q => !q.DaXoa)
            .Select(q => q.MaQuyenHan)
            .ToListAsync();

        var existingMappings = await _context.VaiTroQuyenHan
            .Where(vq => vq.MaVaiTro == maVaiTro)
            .ToListAsync();

        _context.VaiTroQuyenHan.RemoveRange(existingMappings);

        int grantedCount = 0;
        if (request?.DanhSachQuyen != null)
        {
            foreach (var item in request.DanhSachQuyen.DistinctBy(x => x.MaQuyenHan))
            {
                if (!validPermissionIds.Contains(item.MaQuyenHan)) continue;
                if (!item.DuocXem && !item.DuocCapNhat) continue;

                _context.VaiTroQuyenHan.Add(new VaiTroQuyenHan
                {
                    MaVaiTro = maVaiTro,
                    MaQuyenHan = item.MaQuyenHan,
                    DuocCapNhat = item.DuocCapNhat
                });
                grantedCount++;
            }
        }

        role.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context,
            caller.User?.MaNguoiDung ?? "ND0001",
            "CAP_NHAT_PHAN_QUYEN",
            "VaiTro_QuyenHan",
            maVaiTro.ToString(),
            $"Cập nhật bảng phân quyền cho vai trò [{role.TenVaiTro}] ({grantedCount} nhóm quyền được cấp).");

        return Ok(new
        {
            message = $"Đã lưu cấu hình phân quyền cho vai trò [{role.TenVaiTro}] thành công.",
            maVaiTro,
            tenVaiTro = role.TenVaiTro,
            soQuyenDuocCap = grantedCount
        });
    }
}
