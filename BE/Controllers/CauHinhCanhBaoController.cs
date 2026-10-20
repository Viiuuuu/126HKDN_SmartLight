using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CauHinhCanhBaoController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public CauHinhCanhBaoController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/CauHinhCanhBao
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CauHinhCanhBao>>> GetAll([FromQuery] bool? dangBat)
    {
        var query = _context.CauHinhCanhBao.AsNoTracking().AsQueryable();

        if (dangBat.HasValue)
        {
            query = query.Where(x => x.DangBat == dangBat.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/CauHinhCanhBao/1
    [HttpGet("{id}")]
    public async Task<ActionResult<CauHinhCanhBao>> GetById(int id)
    {
        var item = await _context.CauHinhCanhBao.AsNoTracking().FirstOrDefaultAsync(x => x.MaCauHinh == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy cấu hình cảnh báo với mã: {id}" });
        }
        return Ok(item);
    }
}
