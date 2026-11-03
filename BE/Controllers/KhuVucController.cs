using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using BE.Security;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KhuVucController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public KhuVucController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/KhuVuc
    [HttpGet]
    public async Task<ActionResult<IEnumerable<KhuVuc>>> GetAll()
    {
        return await _context.KhuVuc.AsNoTracking().ToListAsync();
    }

    // GET: api/KhuVuc/KV001
    [HttpGet("{id}")]
    public async Task<ActionResult<KhuVuc>> GetById(string id)
    {
        var item = await _context.KhuVuc.AsNoTracking().FirstOrDefaultAsync(x => x.MaKhuVuc == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy khu vực với mã: {id}" });
        }
        return Ok(item);
    }

    // POST: api/KhuVuc (Chỉ Quản trị viên - Admin)
    [HttpPost]
    public async Task<ActionResult<KhuVuc>> Create([FromBody] KhuVuc model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Thêm mới khu vực chiếu sáng");
        if (forbidden != null) return forbidden;

        if (string.IsNullOrWhiteSpace(model.MaKhuVuc))
        {
            return BadRequest(new { message = "Mã khu vực không được để trống." });
        }

        model.MaKhuVuc = model.MaKhuVuc.Trim();

        var exists = await _context.KhuVuc.AnyAsync(x => x.MaKhuVuc == model.MaKhuVuc);
        if (exists)
        {
            return Conflict(new { message = $"Mã khu vực đã tồn tại: {model.MaKhuVuc}" });
        }

        model.NgayTao = DateTime.Now;
        model.NgayCapNhat = null;
        _context.KhuVuc.Add(model);
        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "THEM_KHU_VUC", "KhuVuc", model.MaKhuVuc,
            $"Thêm mới khu vực chiếu sáng: {model.TenPhuongXa} ({model.MaKhuVuc}).");

        return CreatedAtAction(nameof(GetById), new { id = model.MaKhuVuc }, model);
    }

    // PUT: api/KhuVuc/KV001 (Chỉ Quản trị viên - Admin)
    [HttpPut("{id}")]
    public async Task<ActionResult<KhuVuc>> Update(string id, [FromBody] KhuVuc model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Cập nhật thông tin khu vực chiếu sáng");
        if (forbidden != null) return forbidden;

        var item = await _context.KhuVuc.FirstOrDefaultAsync(x => x.MaKhuVuc == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy khu vực với mã: {id}" });
        }

        item.TenPhuongXa = string.IsNullOrWhiteSpace(model.TenPhuongXa)
            ? item.TenPhuongXa
            : model.TenPhuongXa.Trim();
        item.MoTa = model.MoTa;
        item.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "CAP_NHAT_KHU_VUC", "KhuVuc", item.MaKhuVuc,
            $"Cập nhật khu vực chiếu sáng: {item.TenPhuongXa} ({item.MaKhuVuc}).");

        return Ok(item);
    }

    // DELETE: api/KhuVuc/KV001 (Chỉ Quản trị viên - Admin)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context, Request, new[] { RbacHelper.ROLE_ADMIN }, "Xóa khu vực chiếu sáng");
        if (forbidden != null) return forbidden;

        var item = await _context.KhuVuc.FirstOrDefaultAsync(x => x.MaKhuVuc == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy khu vực với mã: {id}" });
        }

        var hasCabinet = await _context.TuChieuSang.AnyAsync(x => x.MaKhuVuc == id);
        if (hasCabinet)
        {
            return BadRequest(new { message = "Khu vực còn tủ chiếu sáng nên không thể xóa." });
        }

        _context.KhuVuc.Remove(item);
        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context, caller.User?.MaNguoiDung, "XOA_KHU_VUC", "KhuVuc", id,
            $"Xóa khu vực chiếu sáng: {item.TenPhuongXa} ({id}).");

        return NoContent();
    }
}
