using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuyenHanController : ControllerBase
{
    private readonly SmartLightDbContext _context;

    public QuyenHanController(SmartLightDbContext context)
    {
        _context = context;
    }

    // GET: api/QuyenHan
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuyenHan>>> GetAll()
    {
        return await _context.QuyenHan.AsNoTracking().ToListAsync();
    }

    // GET: api/QuyenHan/1
    [HttpGet("{id}")]
    public async Task<ActionResult<QuyenHan>> GetById(int id)
    {
        var item = await _context.QuyenHan.AsNoTracking().FirstOrDefaultAsync(x => x.MaQuyenHan == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy quyền hạn với mã: {id}" });
        }
        return Ok(item);
    }
}
