using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CanhBaoController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public CanhBaoController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/CanhBao
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CanhBao>>> GetAll(
        [FromQuery] byte? trangThaiXuLy,
        [FromQuery] byte? mucDo,
        [FromQuery] string? maTu,
        [FromQuery] string? maTuyen,
        [FromQuery] string? maDen,
        [FromQuery] int? limit)
    {
        var query = _context.CanhBao.AsNoTracking().AsQueryable();

        if (trangThaiXuLy.HasValue)
        {
            query = query.Where(x => x.TrangThaiXuLy == trangThaiXuLy.Value);
        }

        if (mucDo.HasValue)
        {
            query = query.Where(x => x.MucDo == mucDo.Value);
        }

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

        query = query.OrderByDescending(x => x.ThoiGianPhatSinh);

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/CanhBao/1
    [HttpGet("{id}")]
    public async Task<ActionResult<CanhBao>> GetById(long id)
    {
        var item = await _context.CanhBao.AsNoTracking().FirstOrDefaultAsync(x => x.MaCanhBao == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy cảnh báo với mã: {id}" });
        }
        return Ok(item);
    }

    // PUT: api/CanhBao/1
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] CanhBaoUpdateDto dto)
    {
        var item = await _context.CanhBao.FirstOrDefaultAsync(x => x.MaCanhBao == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy cảnh báo với mã: {id}" });
        }

        if (dto.TrangThaiXuLy.HasValue)
        {
            item.TrangThaiXuLy = dto.TrangThaiXuLy.Value;
            if (item.TrangThaiXuLy == 2)
            {
                item.ThoiGianXuLy = DateTime.Now;
            }
            else if (item.TrangThaiXuLy == 0)
            {
                item.ThoiGianXuLy = null;
            }
        }

        if (dto.GhiChuXuLy != null)
        {
            item.GhiChuXuLy = dto.GhiChuXuLy;
        }

        if (!string.IsNullOrEmpty(dto.MaNguoiXuLy))
        {
            item.MaNguoiXuLy = dto.MaNguoiXuLy;
        }

        await _context.SaveChangesAsync();
        return Ok(item);
    }
}

public class CanhBaoUpdateDto
{
    public byte? TrangThaiXuLy { get; set; }
    public string? GhiChuXuLy { get; set; }
    public string? MaNguoiXuLy { get; set; }
}
