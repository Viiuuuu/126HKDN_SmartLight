using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using BE.Data;
using BE.Models;
using BE.Security;

namespace BE.Controllers;

public class UpdateTuyenChieuSangRequest
{
    public string? TenTuyen { get; set; }
    public string? ViTri { get; set; }
    public byte? TrangThaiHoatDong { get; set; }
    public string? MoTa { get; set; }
    public int? ChieuDai { get; set; }
    public string? HinhDangGeoJson { get; set; }
    public byte? MucSangHienTai { get; set; }
    public string? MaTu { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class TuyenChieuSangController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public TuyenChieuSangController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/TuyenChieuSang
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TuyenChieuSang>>> GetAll([FromQuery] string? maTu)
    {
        var query = _context.TuyenChieuSang.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(maTu))
        {
            query = query.Where(x => x.MaTu == maTu);
        }
        return await query.ToListAsync();
    }

    // GET: api/TuyenChieuSang/TCS00001
    [HttpGet("{id}")]
    public async Task<ActionResult<TuyenChieuSang>> GetById(string id)
    {
        var item = await _context.TuyenChieuSang.AsNoTracking().FirstOrDefaultAsync(x => x.MaTuyen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tuyến chiếu sáng với mã: {id}" });
        }
        return Ok(item);
    }

    private static void NormalizeRouteState(TuyenChieuSang model)
    {
        if (model.TrangThaiHoatDong > 3)
        {
            model.TrangThaiHoatDong = 3;
        }

        if (model.ChieuDai.HasValue && model.ChieuDai.Value <= 0)
        {
            model.ChieuDai = null;
        }

        if (model.MucSangHienTai.HasValue)
        {
            model.MucSangHienTai = (byte)Math.Clamp((int)model.MucSangHienTai.Value, 0, 100);
        }
    }

    private static bool IsValidRouteGeometry(string? geoJson)
    {
        if (string.IsNullOrWhiteSpace(geoJson)) return true;

        try
        {
            using var document = JsonDocument.Parse(geoJson);
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object ||
                !root.TryGetProperty("type", out var type) ||
                type.ValueKind != JsonValueKind.String ||
                type.GetString() != "LineString" ||
                !root.TryGetProperty("coordinates", out var coordinates) ||
                coordinates.ValueKind != JsonValueKind.Array || coordinates.GetArrayLength() < 2)
            {
                return false;
            }

            foreach (var point in coordinates.EnumerateArray())
            {
                if (point.ValueKind != JsonValueKind.Array || point.GetArrayLength() < 2) return false;
                var values = point.EnumerateArray().ToArray();
                if (!values[0].TryGetDouble(out var longitude) ||
                    !values[1].TryGetDouble(out var latitude) ||
                    longitude is < -180 or > 180 || latitude is < -90 or > 90)
                {
                    return false;
                }
            }

            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    // POST: api/TuyenChieuSang (Admin & Operator)
    [HttpPost]
    public async Task<ActionResult<TuyenChieuSang>> Create([FromBody] TuyenChieuSang model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR }, "Thêm mới tuyến chiếu sáng");
        if (forbidden != null) return forbidden;

        if (string.IsNullOrWhiteSpace(model.MaTuyen) || string.IsNullOrWhiteSpace(model.MaTu))
        {
            return BadRequest(new { message = "Mã tuyến và mã tủ không được để trống." });
        }

        if (string.IsNullOrWhiteSpace(model.TenTuyen) || string.IsNullOrWhiteSpace(model.ViTri))
        {
            return BadRequest(new { message = "Tên tuyến và vị trí không được để trống." });
        }
        if (!IsValidRouteGeometry(model.HinhDangGeoJson))
        {
            return BadRequest(new { message = "Hình học tuyến phải là GeoJSON LineString hợp lệ với ít nhất 2 tọa độ [kinh độ, vĩ độ]." });
        }

        model.MaTuyen = model.MaTuyen.Trim();
        model.MaTu = model.MaTu.Trim();
        NormalizeRouteState(model);

        var exists = await _context.TuyenChieuSang.AnyAsync(x => x.MaTuyen == model.MaTuyen);
        if (exists)
        {
            return Conflict(new { message = $"Mã tuyến đã tồn tại: {model.MaTuyen}" });
        }

        var cabinetExists = await _context.TuChieuSang.AnyAsync(x => x.MaTu == model.MaTu);
        if (!cabinetExists)
        {
            return BadRequest(new { message = $"Không tìm thấy tủ chiếu sáng: {model.MaTu}" });
        }

        model.NgayTao = DateTime.Now;
        model.NgayCapNhat = null;
        _context.TuyenChieuSang.Add(model);
        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "THEM_TUYEN_CHIEU_SANG", "TuyenChieuSang", model.MaTuyen,
            $"Thêm mới tuyến chiếu sáng: {model.TenTuyen} ({model.MaTuyen}).");

        return CreatedAtAction(nameof(GetById), new { id = model.MaTuyen }, model);
    }

    // PUT: api/TuyenChieuSang/TCS00001 (Admin & Operator)
    [HttpPut("{id}")]
    public async Task<ActionResult<TuyenChieuSang>> Update(string id, [FromBody] UpdateTuyenChieuSangRequest model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR }, "Cập nhật thông tin tuyến chiếu sáng");
        if (forbidden != null) return forbidden;

        var item = await _context.TuyenChieuSang.FirstOrDefaultAsync(x => x.MaTuyen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tuyến chiếu sáng với mã: {id}" });
        }

        if (!string.IsNullOrWhiteSpace(model.TenTuyen)) item.TenTuyen = model.TenTuyen.Trim();
        if (!string.IsNullOrWhiteSpace(model.ViTri)) item.ViTri = model.ViTri.Trim();
        if (model.HinhDangGeoJson != null)
        {
            if (!IsValidRouteGeometry(model.HinhDangGeoJson))
            {
                return BadRequest(new { message = "Hình học tuyến phải là GeoJSON LineString hợp lệ với ít nhất 2 tọa độ [kinh độ, vĩ độ]." });
            }
            item.HinhDangGeoJson = string.IsNullOrWhiteSpace(model.HinhDangGeoJson)
                ? null
                : model.HinhDangGeoJson.Trim();
        }
        if (!string.IsNullOrWhiteSpace(model.MaTu))
        {
            var cabCode = model.MaTu.Trim();
            var cabExists = await _context.TuChieuSang.AnyAsync(x => x.MaTu == cabCode);
            if (cabExists)
            {
                item.MaTu = cabCode;
            }
        }
        if (model.TrangThaiHoatDong.HasValue)
        {
            item.TrangThaiHoatDong = model.TrangThaiHoatDong.Value > 3 ? (byte)3 : model.TrangThaiHoatDong.Value;
        }
        if (model.ChieuDai.HasValue) item.ChieuDai = model.ChieuDai;
        if (model.MucSangHienTai.HasValue)
        {
            item.MucSangHienTai = (byte)Math.Clamp((int)model.MucSangHienTai.Value, 0, 100);
        }
        if (model.MoTa != null) item.MoTa = model.MoTa.Trim();
        item.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "CAP_NHAT_TUYEN_CHIEU_SANG", "TuyenChieuSang", item.MaTuyen,
            $"Cập nhật thông tin tuyến chiếu sáng: {item.TenTuyen} ({item.MaTuyen}).");

        return Ok(item);
    }

    // DELETE: api/TuyenChieuSang/TCS00001 (Admin & Operator)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR }, "Xóa tuyến chiếu sáng");
        if (forbidden != null) return forbidden;

        var item = await _context.TuyenChieuSang.FirstOrDefaultAsync(x => x.MaTuyen == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy tuyến chiếu sáng với mã: {id}" });
        }

        var hasLight = await _context.DiemDen.AnyAsync(x => x.MaTuyen == id);
        if (hasLight)
        {
            return BadRequest(new { message = "Tuyến còn điểm đèn nên không thể xóa." });
        }

        _context.TuyenChieuSang.Remove(item);
        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "XOA_TUYEN_CHIEU_SANG", "TuyenChieuSang", id,
            $"Xóa tuyến chiếu sáng: {item.TenTuyen} ({id}).");

        return NoContent();
    }
}
