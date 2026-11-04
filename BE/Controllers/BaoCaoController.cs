using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using BE.Security;

namespace BE.Controllers;

/// <summary>
/// API cho trang Báo cáo &amp; thống kê.
/// Toàn bộ số liệu được tổng hợp trực tiếp từ các bảng hiện có (không thêm bảng mới).
/// Lịch sử "báo cáo đã tạo" được lưu vào NhatKyHeThong với hành động TAO_BAO_CAO.
/// Chỉ Quản trị viên và Nhân viên vận hành được truy cập.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BaoCaoController : ControllerBase
{
    private const string ACTION_TAO_BAO_CAO = "TAO_BAO_CAO";
    private const double GIO_SANG_MAC_DINH = 12.0; // Số giờ chiếu sáng/đêm dùng để tính sản lượng kế hoạch

    private static readonly string[] LoaiBaoCao =
    {
        "Tổng hợp vận hành", "Tiêu thụ điện năng", "Sự cố thiết bị", "Phân bổ khu vực"
    };

    private static readonly int[] RolesAllowed = { RbacHelper.ROLE_ADMIN, RbacHelper.ROLE_OPERATOR };

    private readonly SmartLightDbContext _context;

    public BaoCaoController(SmartLightDbContext context)
    {
        _context = context;
    }

    // ---------------------------------------------------------------- DTO
    public class TaoBaoCaoRequest
    {
        public string? Ten { get; set; }
        public string? Loai { get; set; }
        public string? DinhDang { get; set; }
        public string? MaKhuVuc { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
    }

    private sealed class BaoCaoMeta
    {
        public string Ten { get; set; } = "";
        public string Loai { get; set; } = "";
        public string DinhDang { get; set; } = "PDF";
        public string? MaKhuVuc { get; set; }
        public string? TenKhuVuc { get; set; }
        public string KyDuLieu { get; set; } = "";
        public string? TuNgay { get; set; }
        public string? DenNgay { get; set; }
    }

    // ---------------------------------------------------------------- Helpers
    private static (DateTime From, DateTime To) NormalizeRange(DateTime? tuNgay, DateTime? denNgay)
    {
        var to = (denNgay ?? DateTime.Today).Date;
        var from = (tuNgay ?? to.AddDays(-6)).Date;
        if (from > to) (from, to) = (to, from);
        if ((to - from).TotalDays > 400) from = to.AddDays(-400);
        return (from, to.AddDays(1).AddTicks(-1));
    }

    private static string? CleanArea(string? maKhuVuc) =>
        string.IsNullOrWhiteSpace(maKhuVuc) ? null : maKhuVuc.Trim();

    /// <summary>Tập mã tủ thuộc khu vực (null = toàn bộ).</summary>
    private async Task<HashSet<string>?> GetCabinetIdsAsync(string? maKhuVuc)
    {
        if (maKhuVuc == null) return null;
        var ids = await _context.TuChieuSang.AsNoTracking()
            .Where(t => !t.DaXoa && t.MaKhuVuc == maKhuVuc)
            .Select(t => t.MaTu).ToListAsync();
        return ids.Select(x => x.Trim()).ToHashSet();
    }

    private static string FormatKy(DateTime from, DateTime to) =>
        from.Date == to.Date ? from.ToString("dd/MM/yyyy") : $"{from:dd/MM/yyyy} – {to:dd/MM/yyyy}";

    private sealed class Snapshot
    {
        public double DienNang { get; set; }
        public int SuCo { get; set; }
        public Dictionary<DateTime, double> TheoNgay { get; set; } = new();
        public Dictionary<string, int> SuCoTheoKhuVuc { get; set; } = new();
    }

    private async Task<Snapshot> BuildSnapshotAsync(DateTime from, DateTime to, HashSet<string>? cabinets, Dictionary<string, string> tuToKv)
    {
        var snap = new Snapshot();

        // Điện năng: chênh lệch chỉ số tích lũy (max - min) theo từng tủ mỗi ngày;
        // nếu chỉ có 1 bản ghi/ngày thì ước lượng bằng công suất trung bình x 24h.
        var readings = await _context.DuLieuGiamSatTu.AsNoTracking()
            .Where(d => d.ThoiGianDo >= from && d.ThoiGianDo <= to)
            .Select(d => new { d.MaTu, d.ThoiGianDo, d.DienNang, d.CongSuat })
            .ToListAsync();

        foreach (var g in readings
                     .Where(r => cabinets == null || cabinets.Contains(r.MaTu.Trim()))
                     .GroupBy(r => new { Tu = r.MaTu.Trim(), Ngay = r.ThoiGianDo.Date }))
        {
            double kwh = 0;
            var dn = g.Where(x => x.DienNang.HasValue).Select(x => (double)x.DienNang!.Value).ToList();
            if (dn.Count >= 2) kwh = dn.Max() - dn.Min();
            if (kwh <= 0)
            {
                var cs = g.Where(x => x.CongSuat.HasValue).Select(x => (double)x.CongSuat!.Value).ToList();
                if (cs.Count > 0) kwh = cs.Average() * 24.0;
            }
            if (kwh <= 0) continue;
            snap.TheoNgay[g.Key.Ngay] = snap.TheoNgay.GetValueOrDefault(g.Key.Ngay) + kwh;
            snap.DienNang += kwh;
        }

        var alerts = await _context.CanhBao.AsNoTracking()
            .Where(c => c.ThoiGianPhatSinh >= from && c.ThoiGianPhatSinh <= to)
            .Select(c => new { c.MaTu, c.MaTuyen, c.MaDen })
            .ToListAsync();

        var tuyenToTu = await _context.TuyenChieuSang.AsNoTracking()
            .Select(t => new { t.MaTuyen, t.MaTu }).ToListAsync();
        var tuyenMap = tuyenToTu.ToDictionary(x => x.MaTuyen.Trim(), x => x.MaTu.Trim());
        var denToTuyen = (await _context.DiemDen.AsNoTracking()
            .Select(d => new { d.MaDen, d.MaTuyen }).ToListAsync())
            .ToDictionary(x => x.MaDen.Trim(), x => x.MaTuyen.Trim());

        foreach (var a in alerts)
        {
            var tu = a.MaTu?.Trim();
            if (tu == null && a.MaTuyen != null) tuyenMap.TryGetValue(a.MaTuyen.Trim(), out tu);
            if (tu == null && a.MaDen != null && denToTuyen.TryGetValue(a.MaDen.Trim(), out var tuyen)) tuyenMap.TryGetValue(tuyen, out tu);

            if (cabinets != null && (tu == null || !cabinets.Contains(tu))) continue;
            snap.SuCo++;
            var kv = tu != null && tuToKv.TryGetValue(tu, out var k) ? k : "?";
            snap.SuCoTheoKhuVuc[kv] = snap.SuCoTheoKhuVuc.GetValueOrDefault(kv) + 1;
        }

        return snap;
    }

    private static object Trend(double current, double previous)
    {
        double? percent = previous > 0 ? Math.Round((current - previous) / previous * 100.0, 1) : null;
        return new { giaTri = Math.Round(current, 1), kyTruoc = Math.Round(previous, 1), phanTram = percent };
    }

    // ---------------------------------------------------------------- GET tong-quan
    // GET: api/BaoCao/tong-quan?tuNgay=2024-12-12&denNgay=2024-12-18&maKhuVuc=KV001
    [HttpGet("tong-quan")]
    public async Task<ActionResult> TongQuan([FromQuery] DateTime? tuNgay, [FromQuery] DateTime? denNgay, [FromQuery] string? maKhuVuc)
    {
        var (_, forbidden) = await RbacHelper.EnforceRolesAsync(_context, Request, RolesAllowed, "Xem báo cáo thống kê");
        if (forbidden != null) return forbidden;

        var (from, to) = NormalizeRange(tuNgay, denNgay);
        var area = CleanArea(maKhuVuc);
        var span = to - from;
        var prevTo = from.AddTicks(-1);
        var prevFrom = prevTo - span;

        var cabinets = await GetCabinetIdsAsync(area);
        var tuToKv = (await _context.TuChieuSang.AsNoTracking().Where(t => !t.DaXoa)
            .Select(t => new { t.MaTu, t.MaKhuVuc }).ToListAsync())
            .ToDictionary(x => x.MaTu.Trim(), x => x.MaKhuVuc.Trim());

        var current = await BuildSnapshotAsync(from, to, cabinets, tuToKv);
        var previous = await BuildSnapshotAsync(prevFrom, prevTo, cabinets, tuToKv);

        // Tình trạng thiết bị (điểm đèn)
        var lightsQuery = from d in _context.DiemDen.AsNoTracking()
                          join tuyen in _context.TuyenChieuSang.AsNoTracking() on d.MaTuyen equals tuyen.MaTuyen
                          where !d.DaXoa && !tuyen.DaXoa
                          select new { d.TrangThaiHoatDong, d.CongSuat, d.LanDoCuoi, tuyen.MaTu };
        var lights = (await lightsQuery.ToListAsync())
            .Where(x => cabinets == null || cabinets.Contains(x.MaTu.Trim())).ToList();

        var offlineThreshold = DateTime.Now.AddHours(-1);
        int tong = lights.Count;
        int suCo = lights.Count(x => x.TrangThaiHoatDong == 3);
        int matTinHieu = lights.Count(x => x.TrangThaiHoatDong != 3 && x.TrangThaiHoatDong != 0 && x.LanDoCuoi.HasValue && x.LanDoCuoi < offlineThreshold);
        int baoTri = lights.Count(x => x.TrangThaiHoatDong == 0);
        int binhThuong = Math.Max(0, tong - suCo - matTinHieu - baoTri);
        double tyLeHoatDong = tong > 0 ? Math.Round(binhThuong * 100.0 / tong, 1) : 0;

        // Kế hoạch: tổng công suất định mức (kW) của các đèn đang vận hành x số giờ chiếu sáng mặc định
        double ratedKw = lights.Where(x => x.TrangThaiHoatDong != 0).Sum(x => (double)(x.CongSuat ?? 0)) / 1000.0;
        double keHoachNgay = Math.Round(ratedKw * GIO_SANG_MAC_DINH, 1);

        // Chuỗi biểu đồ theo ngày (tối đa 366 điểm; nếu dài hơn nhóm theo tháng)
        var days = (int)Math.Floor((to.Date - from.Date).TotalDays) + 1;
        var series = new List<object>();
        if (days <= 92)
        {
            for (var d = from.Date; d <= to.Date; d = d.AddDays(1))
                series.Add(new { nhan = d.ToString("dd/MM"), ngay = d.ToString("yyyy-MM-dd"),
                    thucTe = Math.Round(current.TheoNgay.GetValueOrDefault(d), 1), keHoach = keHoachNgay });
        }
        else
        {
            foreach (var g in current.TheoNgay.GroupBy(x => new DateTime(x.Key.Year, x.Key.Month, 1)).OrderBy(g => g.Key))
            {
                var daysInMonth = DateTime.DaysInMonth(g.Key.Year, g.Key.Month);
                series.Add(new { nhan = $"T.{g.Key.Month}", ngay = g.Key.ToString("yyyy-MM-01"),
                    thucTe = Math.Round(g.Sum(x => x.Value), 1), keHoach = Math.Round(keHoachNgay * daysInMonth, 1) });
            }
        }

        // Sự cố theo khu vực
        var areaNames = await _context.KhuVuc.AsNoTracking().Where(k => !k.DaXoa)
            .Select(k => new { k.MaKhuVuc, k.TenPhuongXa }).ToListAsync();
        var nameMap = areaNames.ToDictionary(x => x.MaKhuVuc.Trim(), x => x.TenPhuongXa);
        var maxCases = current.SuCoTheoKhuVuc.Values.DefaultIfEmpty(0).Max();
        var suCoKhuVuc = current.SuCoTheoKhuVuc
            .OrderByDescending(x => x.Value).Take(5)
            .Select(x => new
            {
                maKhuVuc = x.Key,
                tenKhuVuc = nameMap.GetValueOrDefault(x.Key, "Chưa xác định"),
                soCa = x.Value,
                tyLe = maxCases > 0 ? Math.Round(x.Value * 100.0 / maxCases) : 0
            }).ToList();

        // Số báo cáo đã tạo trong kỳ
        int soBaoCao = await _context.NhatKyHeThong.AsNoTracking()
            .CountAsync(x => x.HanhDong == ACTION_TAO_BAO_CAO && x.KetQua == 1 && x.ThoiGian >= from && x.ThoiGian <= to);
        int soBaoCaoTruoc = await _context.NhatKyHeThong.AsNoTracking()
            .CountAsync(x => x.HanhDong == ACTION_TAO_BAO_CAO && x.KetQua == 1 && x.ThoiGian >= prevFrom && x.ThoiGian <= prevTo);

        // Tỷ lệ hoạt động kỳ trước không có lịch sử trạng thái => so sánh bằng 0 điểm
        return Ok(new
        {
            tuNgay = from.ToString("yyyy-MM-dd"),
            denNgay = to.ToString("yyyy-MM-dd"),
            maKhuVuc = area,
            chiSo = new
            {
                soBaoCao = Trend(soBaoCao, soBaoCaoTruoc),
                dienNangTieuThu = Trend(current.DienNang, previous.DienNang),
                tyLeHoatDong = new { giaTri = tyLeHoatDong, kyTruoc = (double?)null, phanTram = (double?)null },
                suCo = Trend(current.SuCo, previous.SuCo)
            },
            bieuDo = series,
            tinhTrangThietBi = new { tong, binhThuong, suCo, matTinHieu, baoTri, tyLeHoatDong },
            suCoTheoKhuVuc = suCoKhuVuc
        });
    }

    // ---------------------------------------------------------------- GET danh-sach
    // GET: api/BaoCao/danh-sach?loai=&maKhuVuc=&tuNgay=&denNgay=&tuKhoa=&page=1&pageSize=4
    [HttpGet("danh-sach")]
    public async Task<ActionResult> DanhSach(
        [FromQuery] string? loai, [FromQuery] string? maKhuVuc,
        [FromQuery] DateTime? tuNgay, [FromQuery] DateTime? denNgay,
        [FromQuery] string? tuKhoa, [FromQuery] int page = 1, [FromQuery] int pageSize = 4)
    {
        var (_, forbidden) = await RbacHelper.EnforceRolesAsync(_context, Request, RolesAllowed, "Xem danh sách báo cáo");
        if (forbidden != null) return forbidden;

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.NhatKyHeThong.AsNoTracking().Where(x => x.HanhDong == ACTION_TAO_BAO_CAO && x.KetQua == 1);
        if (tuNgay.HasValue) query = query.Where(x => x.ThoiGian >= tuNgay.Value.Date);
        if (denNgay.HasValue) query = query.Where(x => x.ThoiGian < denNgay.Value.Date.AddDays(1));

        var rows = await query.OrderByDescending(x => x.ThoiGian).Take(2000).ToListAsync();
        var userIds = rows.Where(r => r.MaNguoiDung != null).Select(r => r.MaNguoiDung!.Trim()).Distinct().ToList();
        var userNames = await _context.NguoiDung.AsNoTracking()
            .Where(u => userIds.Contains(u.MaNguoiDung)).Select(u => new { u.MaNguoiDung, u.HoTen }).ToListAsync();
        var userMap = userNames.ToDictionary(u => u.MaNguoiDung.Trim(), u => u.HoTen);

        var items = rows.Select(r =>
        {
            BaoCaoMeta? meta = null;
            try { meta = JsonSerializer.Deserialize<BaoCaoMeta>(r.NoiDung ?? "", new JsonSerializerOptions { PropertyNameCaseInsensitive = true }); } catch { }
            meta ??= new BaoCaoMeta { Ten = r.DoiTuong ?? "Báo cáo", Loai = "Tổng hợp vận hành" };
            return new
            {
                id = r.MaNhatKy,
                ten = meta.Ten,
                loai = meta.Loai,
                kyDuLieu = meta.KyDuLieu,
                thoiGianTao = r.ThoiGian,
                nguoiTao = r.MaNguoiDung != null ? userMap.GetValueOrDefault(r.MaNguoiDung.Trim(), r.MaNguoiDung.Trim()) : "Hệ thống",
                dinhDang = meta.DinhDang,
                trangThai = "Sẵn sàng",
                maKhuVuc = meta.MaKhuVuc,
                khuVuc = meta.TenKhuVuc ?? "Toàn thành phố",
                tuNgay = meta.TuNgay,
                denNgay = meta.DenNgay
            };
        }).ToList();

        if (!string.IsNullOrWhiteSpace(loai)) items = items.Where(i => i.loai == loai).ToList();
        if (!string.IsNullOrWhiteSpace(maKhuVuc)) items = items.Where(i => i.maKhuVuc == maKhuVuc.Trim()).ToList();
        if (!string.IsNullOrWhiteSpace(tuKhoa))
        {
            var k = tuKhoa.Trim();
            items = items.Where(i => $"{i.ten} {i.loai} {i.khuVuc} {i.nguoiTao}".Contains(k, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return Ok(new
        {
            tongSo = items.Count,
            trang = page,
            kichThuocTrang = pageSize,
            tongTrang = Math.Max(1, (int)Math.Ceiling(items.Count / (double)pageSize)),
            danhSach = items.Skip((page - 1) * pageSize).Take(pageSize).ToList()
        });
    }

    // ---------------------------------------------------------------- POST tao-bao-cao
    // POST: api/BaoCao/tao-bao-cao
    [HttpPost("tao-bao-cao")]
    public async Task<ActionResult> TaoBaoCao([FromBody] TaoBaoCaoRequest req)
    {
        var (caller, forbidden) = await RbacHelper.EnforceRolesAsync(_context, Request, RolesAllowed, "Tạo báo cáo thống kê");
        if (forbidden != null) return forbidden;

        var ten = (req.Ten ?? "").Trim();
        if (string.IsNullOrEmpty(ten)) return BadRequest(new { message = "Tên báo cáo không được để trống." });
        if (ten.Length > 90) return BadRequest(new { message = "Tên báo cáo tối đa 90 ký tự." });

        var loai = (req.Loai ?? "").Trim();
        if (!LoaiBaoCao.Contains(loai)) return BadRequest(new { message = "Loại báo cáo không hợp lệ." });

        var dinhDang = (req.DinhDang ?? "PDF").Trim().ToUpperInvariant();
        if (dinhDang != "PDF" && dinhDang != "XLSX" && dinhDang != "CSV")
            return BadRequest(new { message = "Định dạng báo cáo chỉ hỗ trợ PDF, XLSX hoặc CSV." });

        var area = CleanArea(req.MaKhuVuc);
        string? tenKv = null;
        if (area != null)
        {
            tenKv = await _context.KhuVuc.AsNoTracking().Where(k => k.MaKhuVuc == area && !k.DaXoa)
                .Select(k => k.TenPhuongXa).FirstOrDefaultAsync();
            if (tenKv == null) return BadRequest(new { message = "Khu vực không tồn tại." });
        }

        var (from, to) = NormalizeRange(req.TuNgay, req.DenNgay);
        var meta = new BaoCaoMeta
        {
            Ten = ten, Loai = loai, DinhDang = dinhDang, MaKhuVuc = area, TenKhuVuc = tenKv,
            KyDuLieu = FormatKy(from, to), TuNgay = from.ToString("yyyy-MM-dd"), DenNgay = to.ToString("yyyy-MM-dd")
        };

        var entry = new NhatKyHeThong
        {
            MaNguoiDung = caller.User?.MaNguoiDung.Trim(),
            HanhDong = ACTION_TAO_BAO_CAO,
            DoiTuong = ten.Length > 100 ? ten[..100] : ten,
            MaDoiTuong = area,
            NoiDung = JsonSerializer.Serialize(meta),
            KetQua = 1,
            ThoiGian = DateTime.Now
        };
        _context.NhatKyHeThong.Add(entry);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(DanhSach), new { id = entry.MaNhatKy }, new
        {
            id = entry.MaNhatKy, ten, loai, dinhDang, kyDuLieu = meta.KyDuLieu,
            thoiGianTao = entry.ThoiGian, trangThai = "Sẵn sàng", khuVuc = tenKv ?? "Toàn thành phố"
        });
    }

    // ---------------------------------------------------------------- GET xuat (CSV)
    // GET: api/BaoCao/xuat?loai=Tiêu thụ điện năng&tuNgay=...&denNgay=...&maKhuVuc=...
    [HttpGet("xuat")]
    public async Task<IActionResult> Xuat([FromQuery] string? loai, [FromQuery] DateTime? tuNgay, [FromQuery] DateTime? denNgay, [FromQuery] string? maKhuVuc)
    {
        var (_, forbidden) = await RbacHelper.EnforceRolesAsync(_context, Request, RolesAllowed, "Xuất báo cáo thống kê");
        if (forbidden != null) return forbidden;

        loai = string.IsNullOrWhiteSpace(loai) ? LoaiBaoCao[0] : loai.Trim();
        if (!LoaiBaoCao.Contains(loai)) return BadRequest(new { message = "Loại báo cáo không hợp lệ." });

        var (from, to) = NormalizeRange(tuNgay, denNgay);
        var area = CleanArea(maKhuVuc);
        var cabinets = await GetCabinetIdsAsync(area);
        var tuToKv = (await _context.TuChieuSang.AsNoTracking().Where(t => !t.DaXoa)
            .Select(t => new { t.MaTu, t.MaKhuVuc }).ToListAsync())
            .ToDictionary(x => x.MaTu.Trim(), x => x.MaKhuVuc.Trim());
        var nameMap = (await _context.KhuVuc.AsNoTracking().Select(k => new { k.MaKhuVuc, k.TenPhuongXa }).ToListAsync())
            .ToDictionary(x => x.MaKhuVuc.Trim(), x => x.TenPhuongXa);

        var sb = new StringBuilder();
        void Row(params object?[] cells) =>
            sb.AppendLine(string.Join(",", cells.Select(c => "\"" + Convert.ToString(c, CultureInfo.InvariantCulture)?.Replace("\"", "\"\"") + "\"")));

        Row("Báo cáo", loai);
        Row("Kỳ dữ liệu", FormatKy(from, to));
        Row("Khu vực", area != null ? nameMap.GetValueOrDefault(area, area) : "Toàn thành phố");
        Row("Thời điểm xuất", DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
        sb.AppendLine();

        var snap = await BuildSnapshotAsync(from, to, cabinets, tuToKv);

        if (loai == "Tiêu thụ điện năng" || loai == "Tổng hợp vận hành")
        {
            Row("Ngày", "Điện năng tiêu thụ (kWh)");
            foreach (var d in snap.TheoNgay.OrderBy(x => x.Key)) Row(d.Key.ToString("dd/MM/yyyy"), Math.Round(d.Value, 2));
            Row("Tổng", Math.Round(snap.DienNang, 2));
            sb.AppendLine();
        }

        if (loai == "Sự cố thiết bị" || loai == "Tổng hợp vận hành" || loai == "Phân bổ khu vực")
        {
            if (loai == "Phân bổ khu vực" || loai == "Tổng hợp vận hành")
            {
                Row("Khu vực", "Số sự cố");
                foreach (var kv in snap.SuCoTheoKhuVuc.OrderByDescending(x => x.Value))
                    Row(nameMap.GetValueOrDefault(kv.Key, "Chưa xác định"), kv.Value);
                Row("Tổng", snap.SuCo);
                sb.AppendLine();
            }

            if (loai == "Sự cố thiết bị" || loai == "Tổng hợp vận hành")
            {
                var alerts = await _context.CanhBao.AsNoTracking()
                    .Where(c => c.ThoiGianPhatSinh >= from && c.ThoiGianPhatSinh <= to)
                    .OrderByDescending(c => c.ThoiGianPhatSinh).Take(1000).ToListAsync();
                Row("Thời gian", "Thiết bị", "Nội dung", "Mức độ", "Trạng thái xử lý");
                foreach (var a in alerts)
                {
                    var tu = a.MaTu?.Trim();
                    if (cabinets != null && tu != null && !cabinets.Contains(tu)) continue;
                    Row(a.ThoiGianPhatSinh.ToString("dd/MM/yyyy HH:mm"),
                        a.MaDen?.Trim() ?? a.MaTuyen?.Trim() ?? tu ?? "",
                        a.NoiDung,
                        a.MucDo switch { 3 => "Nghiêm trọng", 2 => "Cảnh báo", _ => "Thông tin" },
                        a.TrangThaiXuLy switch { 2 => "Đã xử lý", 1 => "Đang xử lý", _ => "Mới" });
                }
            }
        }

        var bytes = new UTF8Encoding(true).GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        var fileName = $"bao-cao-{from:yyyyMMdd}-{to:yyyyMMdd}.csv";
        return File(bytes, "text/csv; charset=utf-8", fileName);
    }
}

