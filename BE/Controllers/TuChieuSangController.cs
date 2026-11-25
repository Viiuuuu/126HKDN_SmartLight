using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using BE.Security;

namespace BE.Controllers;

public class UpdateTuChieuSangRequest
{
    public string? TenTu { get; set; }
    public string? DiaChi { get; set; }
    public decimal? ViDo { get; set; }
    public decimal? KinhDo { get; set; }
    public bool? TrangThaiKetNoi { get; set; }
    public string? TrangThaiNguon { get; set; }
    public DateTime? LanKetNoiCuoi { get; set; }
    public byte? CheDoVanHanh { get; set; }
    public string? MaThietBi { get; set; }
    public string? MoTa { get; set; }
    public string? MaKhuVuc { get; set; }
}

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

    // POST: api/TuChieuSang (Admin & Operator)
    [HttpPost]
    public async Task<ActionResult<TuChieuSang>> Create([FromBody] TuChieuSang model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR }, "Thêm mới tủ chiếu sáng");
        if (forbidden != null) return forbidden;

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

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "THEM_TU_CHIEU_SANG", "TuChieuSang", model.MaTu,
            $"Thêm mới tủ chiếu sáng: {model.TenTu} ({model.MaTu}).");

        return CreatedAtAction(nameof(GetById), new { id = model.MaTu }, model);
    }

    // PUT: api/TuChieuSang/TC00001 (Admin & Operator)
    [HttpPut("{id}")]
    public async Task<ActionResult<TuChieuSang>> Update(string id, [FromBody] UpdateTuChieuSangRequest model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR }, "Cập nhật thông tin tủ chiếu sáng");
        if (forbidden != null) return forbidden;

        var item = await _context.TuChieuSang.FirstOrDefaultAsync(x => x.MaTu == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tủ chiếu sáng với mã: {id}" });
        }

        if (!string.IsNullOrWhiteSpace(model.TenTu)) item.TenTu = model.TenTu.Trim();
        if (!string.IsNullOrWhiteSpace(model.DiaChi)) item.DiaChi = model.DiaChi.Trim();
        if (!string.IsNullOrWhiteSpace(model.MaKhuVuc))
        {
            var areaCode = model.MaKhuVuc.Trim();
            var areaExists = await _context.KhuVuc.AnyAsync(x => x.MaKhuVuc == areaCode);
            if (areaExists)
            {
                item.MaKhuVuc = areaCode;
            }
        }

        if (model.ViDo.HasValue) item.ViDo = model.ViDo;
        if (model.KinhDo.HasValue) item.KinhDo = model.KinhDo;
        if (model.TrangThaiKetNoi.HasValue) item.TrangThaiKetNoi = model.TrangThaiKetNoi.Value;
        if (!string.IsNullOrWhiteSpace(model.TrangThaiNguon))
        {
            var source = model.TrangThaiNguon.Trim().ToUpperInvariant();
            item.TrangThaiNguon = source switch
            {
                "ON" => "ON",
                "OFF" => "OFF",
                _ => "UNKNOWN"
            };
        }
        if (model.LanKetNoiCuoi.HasValue) item.LanKetNoiCuoi = model.LanKetNoiCuoi;
        if (model.CheDoVanHanh.HasValue)
        {
            item.CheDoVanHanh = model.CheDoVanHanh.Value > 2 ? (byte)2 : model.CheDoVanHanh.Value;
        }
        if (model.MaThietBi != null) item.MaThietBi = model.MaThietBi.Trim();
        if (model.MoTa != null) item.MoTa = model.MoTa.Trim();
        item.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "CAP_NHAT_TU_CHIEU_SANG", "TuChieuSang", item.MaTu,
            $"Cập nhật thông tin tủ chiếu sáng: {item.TenTu} ({item.MaTu}).");

        return Ok(item);
    }

    // DELETE: api/TuChieuSang/TC00001 (Admin & Operator)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR }, "Xóa tủ chiếu sáng");
        if (forbidden != null) return forbidden;

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

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "XOA_TU_CHIEU_SANG", "TuChieuSang", id,
            $"Xóa tủ chiếu sáng: {item.TenTu} ({id}).");

        return NoContent();
    }
}
