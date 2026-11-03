using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using BE.Security;

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

    // POST: api/CauHinhCanhBao (Admin & Operator)
    [HttpPost]
    public async Task<ActionResult<CauHinhCanhBao>> Create([FromBody] CauHinhCanhBao model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context,
            Request,
            new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR },
            "Thêm cấu hình cảnh báo");
        if (forbidden != null) return forbidden;

        if (string.IsNullOrWhiteSpace(model.TenCanhBao))
        {
            return BadRequest(new { message = "Tên cấu hình cảnh báo không được để trống." });
        }

        model.TenCanhBao = model.TenCanhBao.Trim();
        model.NgayTao = DateTime.Now;
        model.NgayCapNhat = null;

        _context.CauHinhCanhBao.Add(model);
        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context,
            caller.User?.MaNguoiDung,
            "CAU_HINH_CANH_BAO",
            "CauHinhCanhBao",
            model.MaCauHinh.ToString(),
            $"Thêm mới cấu hình cảnh báo: {model.TenCanhBao}.");

        return CreatedAtAction(nameof(GetById), new { id = model.MaCauHinh }, model);
    }

    // PUT: api/CauHinhCanhBao/1 (Admin & Operator)
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CauHinhCanhBao>> Update(int id, [FromBody] CauHinhCanhBao model)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(
            _context,
            Request,
            new[] { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR },
            "Cập nhật cấu hình cảnh báo");
        if (forbidden != null) return forbidden;

        var item = await _context.CauHinhCanhBao.FirstOrDefaultAsync(x => x.MaCauHinh == id);
        if (item == null)
        {
            return NotFound(new { message = $"Không tìm thấy cấu hình cảnh báo với mã: {id}" });
        }

        if (!string.IsNullOrWhiteSpace(model.TenCanhBao)) item.TenCanhBao = model.TenCanhBao.Trim();
        if (!string.IsNullOrWhiteSpace(model.LoaiCanhBao)) item.LoaiCanhBao = model.LoaiCanhBao.Trim();
        if (model.NguongGiaTri > 0) item.NguongGiaTri = model.NguongGiaTri;
        if (model.MucDo >= 1 && model.MucDo <= 3) item.MucDo = model.MucDo;
        item.DangBat = model.DangBat;
        item.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();

        await RbacHelper.LogActivityAsync(
            _context,
            caller.User?.MaNguoiDung,
            "CAU_HINH_CANH_BAO",
            "CauHinhCanhBao",
            item.MaCauHinh.ToString(),
            $"Cập nhật cấu hình cảnh báo: {item.TenCanhBao}.");

        return Ok(item);
    }
}
