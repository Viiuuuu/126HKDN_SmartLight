using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

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

    // POST: api/KhuVuc
    [HttpPost]
    public async Task<ActionResult<KhuVuc>> Create([FromBody] KhuVuc model)
    {
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

        return CreatedAtAction(nameof(GetById), new { id = model.MaKhuVuc }, model);
    }

    // PUT: api/KhuVuc/KV001
    [HttpPut("{id}")]
    public async Task<ActionResult<KhuVuc>> Update(string id, [FromBody] KhuVuc model)
    {
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
        return Ok(item);
    }

    // DELETE: api/KhuVuc/KV001
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
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
        return NoContent();
    }
}
