using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SmartLight.HES.WebForms.Data
{
    public sealed class HesWebRepository
    {
        private readonly string _connectionString;
        private readonly string _hesServiceUrl;

        public HesWebRepository()
        {
            var cs = ConfigurationManager.ConnectionStrings["dbSmartLight"]?.ConnectionString;
            _connectionString = string.IsNullOrWhiteSpace(cs)
                ? "Server=localhost;Database=dbSmartLight;Trusted_Connection=True;TrustServerCertificate=True;"
                : cs;

            var url = ConfigurationManager.AppSettings["HesServiceUrl"];
            _hesServiceUrl = string.IsNullOrWhiteSpace(url) ? "http://127.0.0.1:5088" : url.TrimEnd('/');
        }

        private SqlConnection CreateOpenConnection()
        {
            var conn = new SqlConnection(_connectionString);
            conn.Open();
            return conn;
        }

        private List<Dictionary<string, object>> QueryRows(string sql, Action<SqlCommand> bind = null)
        {
            var rows = new List<Dictionary<string, object>>();
            using (var conn = CreateOpenConnection())
            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = sql;
                bind?.Invoke(cmd);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var row = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                        for (var i = 0; i < reader.FieldCount; i++)
                        {
                            var val = reader.IsDBNull(i) ? null : reader.GetValue(i);
                            if (val is string s) val = s.Trim();
                            row[reader.GetName(i)] = val;
                        }
                        rows.Add(row);
                    }
                }
            }
            return rows;
        }

        private JObject RequestHesJson(string method, string relativePath, object payload = null)
        {
            try
            {
                var req = (HttpWebRequest)WebRequest.Create(_hesServiceUrl + relativePath);
                req.Method = method;
                req.Timeout = 4000;
                req.ReadWriteTimeout = 4000;
                req.Accept = "application/json";

                if (payload != null)
                {
                    var bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(payload));
                    req.ContentType = "application/json; charset=utf-8";
                    req.ContentLength = bytes.Length;
                    using (var reqStream = req.GetRequestStream())
                    {
                        reqStream.Write(bytes, 0, bytes.Length);
                    }
                }

                using (var resp = (HttpWebResponse)req.GetResponse())
                using (var reader = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
                {
                    var text = reader.ReadToEnd();
                    return string.IsNullOrWhiteSpace(text) ? new JObject() : JObject.Parse(text);
                }
            }
            catch
            {
                return null;
            }
        }

        public object GetSystemStatus()
        {
            var sqlOk = false;
            var sqlLatencyMs = -1L;
            var dbName = "dbSmartLight";
            var sqlError = (string)null;

            try
            {
                var sw = Stopwatch.StartNew();
                using (var conn = CreateOpenConnection())
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "SELECT DB_NAME()";
                    dbName = Convert.ToString(cmd.ExecuteScalar()) ?? "dbSmartLight";
                }
                sw.Stop();
                sqlLatencyMs = sw.ElapsedMilliseconds;
                sqlOk = true;
            }
            catch (Exception ex)
            {
                sqlError = ex.Message;
            }

            var hesStatus = RequestHesJson("GET", "/hes/status");
            var hesRunning = hesStatus != null && hesStatus.Value<bool?>("serviceRunning") == true;

            var tcpPort = 8088;
            var tcpListening = false;
            var activeSessionCount = 0;
            if (hesStatus != null)
            {
                tcpPort = hesStatus.Value<int?>("tcpPort") ?? 8088;
                tcpListening = hesStatus.Value<bool?>("tcpListening") == true;
                activeSessionCount = hesStatus.Value<int?>("activeSessionCount") ?? 0;
            }

            return new
            {
                sqlConnected = sqlOk,
                sqlLatencyMs,
                databaseName = dbName,
                sqlError,
                hesServiceUrl = _hesServiceUrl,
                hesRunning,
                tcpListening,
                tcpPort,
                activeSessionCount,
                hesStatus,
                serverTimeText = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
            };
        }

        public object GetOverviewData(string keyword = null)
        {
            var cabinets = QueryRows(@"
                SELECT
                    RTRIM(t.maTu) AS maTu,
                    t.tenTu,
                    t.diaChi,
                    ISNULL(RTRIM(t.maThietBi), '') AS maThietBi,
                    ISNULL(kv.tenPhuongXa, '') AS tenKhuVuc,
                    CAST(t.trangThaiKetNoi AS INT) AS trangThaiKetNoi,
                    t.trangThaiNguon,
                    t.cheDoVanHanh,
                    t.lanKetNoiCuoi,
                    dl.dienApPha1,
                    dl.dienApPha2,
                    dl.dienApPha3,
                    dl.dongDienPha1,
                    dl.dongDienPha2,
                    dl.dongDienPha3,
                    dl.congSuat,
                    dl.dienNang,
                    dl.thoiGianDo
                FROM dbo.TuChieuSang t
                LEFT JOIN dbo.KhuVuc kv ON t.maKhuVuc = kv.maKhuVuc
                OUTER APPLY (
                    SELECT TOP (1)
                        dienApPha1, dienApPha2, dienApPha3,
                        dongDienPha1, dongDienPha2, dongDienPha3,
                        congSuat, dienNang, thoiGianDo
                    FROM dbo.DuLieuGiamSatTu
                    WHERE maTu = t.maTu
                    ORDER BY maDuLieu DESC
                ) dl
                WHERE t.daXoa = 0
                ORDER BY RTRIM(t.maTu) ASC;");

            var openAlertCount = Convert.ToInt32(QueryRows(
                "SELECT COUNT(*) AS cnt FROM dbo.CanhBao WHERE trangThaiXuLy IN (0, 1);")[0]["cnt"]);

            var recentAlerts = QueryRows(@"
                SELECT TOP (6)
                    c.maCanhBao,
                    c.noiDung,
                    c.mucDo,
                    c.trangThaiXuLy,
                    c.thoiGianPhatSinh,
                    ISNULL(RTRIM(c.maTu), '') AS maTu,
                    ISNULL(RTRIM(c.maTuyen), '') AS maTuyen,
                    ISNULL(RTRIM(c.maDen), '') AS maDen
                FROM dbo.CanhBao c
                ORDER BY c.thoiGianPhatSinh DESC, c.maCanhBao DESC;");

            var onlineCount = 0;
            decimal totalPowerKw = 0m;
            var filtered = new List<Dictionary<string, object>>();
            var cleanKw = string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim();

            foreach (var row in cabinets)
            {
                var isOnline = Convert.ToInt32(row["trangThaiKetNoi"]) == 1;
                if (isOnline) onlineCount++;

                if (row["congSuat"] != null && string.Equals(Convert.ToString(row["trangThaiNguon"]), "ON", StringComparison.OrdinalIgnoreCase))
                {
                    totalPowerKw += Convert.ToDecimal(row["congSuat"]);
                }

                if (cleanKw == null ||
                    Convert.ToString(row["maTu"]).IndexOf(cleanKw, StringComparison.OrdinalIgnoreCase) >= 0 ||
                    Convert.ToString(row["tenTu"]).IndexOf(cleanKw, StringComparison.OrdinalIgnoreCase) >= 0 ||
                    Convert.ToString(row["tenKhuVuc"]).IndexOf(cleanKw, StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    filtered.Add(row);
                }
            }

            var status = GetSystemStatus();
            var counts = QueryRows(@"
                SELECT 
                    (SELECT COUNT(*) FROM dbo.TuyenChieuSang WHERE daXoa = 0) AS totalRoutes,
                    (SELECT COUNT(*) FROM dbo.TuyenChieuSang WHERE daXoa = 0 AND trangThaiHoatDong = 1) AS activeRoutes,
                    (SELECT COUNT(*) FROM dbo.DiemDen WHERE daXoa = 0) AS totalLamps,
                    (SELECT COUNT(*) FROM dbo.DiemDen WHERE daXoa = 0 AND trangThaiHoatDong = 1) AS activeLamps;")[0];

            var totalRoutes = Convert.ToInt32(counts["totalRoutes"]);
            var activeRoutes = Convert.ToInt32(counts["activeRoutes"]);
            var totalLamps = Convert.ToInt32(counts["totalLamps"]);
            var activeLamps = Convert.ToInt32(counts["activeLamps"]);

            return new
            {
                systemStatus = status,
                kpi = new
                {
                    totalCabinets = cabinets.Count,
                    onlineCabinets = onlineCount,
                    offlineCabinets = cabinets.Count - onlineCount,
                    totalRoutes,
                    activeRoutes,
                    totalLamps,
                    activeLamps,
                    openAlerts = openAlertCount,
                    totalPowerKw = Math.Round(totalPowerKw, 3)
                },
                cabinets = filtered,
                recentAlerts
            };
        }

        public object GetTelemetryData(string mode, string code, int? page = null, int pageSize = 10)
        {
            var isLamp = string.Equals(mode, "lamp", StringComparison.OrdinalIgnoreCase);
            pageSize = Math.Min(50, Math.Max(5, pageSize));

            var cabinets = QueryRows(@"
                SELECT RTRIM(t.maTu) AS code, t.tenTu AS name, ISNULL(kv.tenPhuongXa, '') AS area,
                       CAST(t.trangThaiKetNoi AS INT) AS online, t.trangThaiNguon AS powerState
                FROM dbo.TuChieuSang t
                LEFT JOIN dbo.KhuVuc kv ON t.maKhuVuc = kv.maKhuVuc
                WHERE t.daXoa = 0
                ORDER BY RTRIM(t.maTu) ASC;");

            var routes = QueryRows(@"
                SELECT RTRIM(ty.maTuyen) AS maTuyen, ty.tenTuyen, ty.viTri, RTRIM(ty.maTu) AS maTu,
                       ty.trangThaiHoatDong, ty.mucSangHienTai
                FROM dbo.TuyenChieuSang ty
                WHERE ty.daXoa = 0
                ORDER BY RTRIM(ty.maTuyen) ASC;");

            var lamps = QueryRows(@"
                SELECT RTRIM(d.maDen) AS code, d.tenDen AS name, RTRIM(d.maTuyen) AS maTuyen,
                       RTRIM(ty.maTu) AS maTu, ty.tenTuyen, d.loaiBongDen,
                       d.congSuat, d.dienAp, d.dongDien, d.congSuatThucTe, d.nhietDoLed, d.doSang, d.trangThaiHoatDong, d.lanDoCuoi
                FROM dbo.DiemDen d
                INNER JOIN dbo.TuyenChieuSang ty ON d.maTuyen = ty.maTuyen
                WHERE d.daXoa = 0 AND ty.daXoa = 0
                ORDER BY RTRIM(d.maDen) ASC;");

            var selectedCode = string.IsNullOrWhiteSpace(code) ? null : code.Trim();
            if (!isLamp)
            {
                if (selectedCode == null && cabinets.Count > 0)
                {
                    selectedCode = Convert.ToString(cabinets[0]["code"]);
                }

                var totalRecords = 0;
                var totalPages = 1;
                var effectivePage = 1;
                var history = new List<Dictionary<string, object>>();
                var chartSeries = new List<Dictionary<string, object>>();
                var cabinetRoutes = new List<Dictionary<string, object>>();
                var cabinetLamps = new List<Dictionary<string, object>>();
                var sampleLamp = (Dictionary<string, object>)null;

                if (selectedCode != null)
                {
                    totalRecords = Convert.ToInt32(QueryRows(
                        "SELECT COUNT(*) AS cnt FROM dbo.DuLieuGiamSatTu WHERE RTRIM(maTu) = @code;",
                        c => c.Parameters.AddWithValue("@code", selectedCode))[0]["cnt"]);

                    totalPages = Math.Max(1, (int)Math.Ceiling((double)totalRecords / pageSize));
                    effectivePage = (page == null || page.Value <= 0 || page.Value > totalPages)
                        ? totalPages
                        : page.Value;

                    var startIdx = (effectivePage - 1) * pageSize + 1;
                    var endIdx = Math.Min(totalRecords, effectivePage * pageSize);
                    var fetchCount = totalRecords > 0 ? (endIdx - startIdx + 1) : 0;
                    var offset = Math.Max(0, totalRecords - endIdx);

                    history = totalRecords > 0 ? QueryRows(@"
                        SELECT maDuLieu, RTRIM(maTu) AS maTu, dienApPha1, dienApPha2, dienApPha3,
                               dongDienPha1, dongDienPha2, dongDienPha3, congSuat, dienNang, thoiGianDo
                        FROM dbo.DuLieuGiamSatTu
                        WHERE RTRIM(maTu) = @code
                        ORDER BY maDuLieu DESC
                        OFFSET @off ROWS FETCH NEXT @cnt ROWS ONLY;",
                        c =>
                        {
                            c.Parameters.AddWithValue("@code", selectedCode);
                            c.Parameters.AddWithValue("@off", offset);
                            c.Parameters.AddWithValue("@cnt", fetchCount);
                        }) : new List<Dictionary<string, object>>();

                    chartSeries = QueryRows(@"
                        SELECT TOP (20) maDuLieu, dienApPha1, dienApPha2, dienApPha3, congSuat, thoiGianDo
                        FROM dbo.DuLieuGiamSatTu
                        WHERE RTRIM(maTu) = @code
                        ORDER BY maDuLieu DESC;",
                        c => c.Parameters.AddWithValue("@code", selectedCode));
                    chartSeries.Reverse();

                    foreach (var r in routes)
                    {
                        if (string.Equals(Convert.ToString(r["maTu"]), selectedCode, StringComparison.OrdinalIgnoreCase))
                        {
                            cabinetRoutes.Add(r);
                        }
                    }
                    foreach (var l in lamps)
                    {
                        if (string.Equals(Convert.ToString(l["maTu"]), selectedCode, StringComparison.OrdinalIgnoreCase))
                        {
                            cabinetLamps.Add(l);
                        }
                    }
                    sampleLamp = cabinetLamps.Count > 0 ? cabinetLamps[0] : null;
                }

                var latestRow = (history.Count > 0 && effectivePage == totalPages)
                    ? history[0]
                    : (chartSeries.Count > 0 ? chartSeries[chartSeries.Count - 1] : null);

                return new
                {
                    mode = "cabinet",
                    selectedCode,
                    cabinets,
                    routes = cabinetRoutes,
                    lamps = cabinetLamps,
                    latest = latestRow,
                    sampleLamp,
                    chartSeries,
                    history,
                    totalRecords,
                    page = effectivePage,
                    totalPages,
                    pageSize
                };
            }
            else
            {
                if (selectedCode == null && lamps.Count > 0)
                {
                    selectedCode = Convert.ToString(lamps[0]["code"]);
                }

                var totalRecords = 0;
                var totalPages = 1;
                var effectivePage = 1;
                var history = new List<Dictionary<string, object>>();
                var chartSeries = new List<Dictionary<string, object>>();
                Dictionary<string, object> currentLamp = null;

                if (selectedCode != null)
                {
                    foreach (var l in lamps)
                    {
                        if (string.Equals(Convert.ToString(l["code"]), selectedCode, StringComparison.OrdinalIgnoreCase))
                        {
                            currentLamp = l;
                            break;
                        }
                    }

                    totalRecords = Convert.ToInt32(QueryRows(
                        "SELECT COUNT(*) AS cnt FROM dbo.DuLieuGiamSatDen WHERE RTRIM(maDen) = @code;",
                        c => c.Parameters.AddWithValue("@code", selectedCode))[0]["cnt"]);

                    totalPages = Math.Max(1, (int)Math.Ceiling((double)totalRecords / pageSize));
                    effectivePage = (page == null || page.Value <= 0 || page.Value > totalPages)
                        ? totalPages
                        : page.Value;

                    var startIdx = (effectivePage - 1) * pageSize + 1;
                    var endIdx = Math.Min(totalRecords, effectivePage * pageSize);
                    var fetchCount = totalRecords > 0 ? (endIdx - startIdx + 1) : 0;
                    var offset = Math.Max(0, totalRecords - endIdx);

                    history = totalRecords > 0 ? QueryRows(@"
                        SELECT maDuLieu, RTRIM(maDen) AS maDen, dienAp, dongDien, congSuatThucTe, nhietDoLed, doSang, thoiGianDo
                        FROM dbo.DuLieuGiamSatDen
                        WHERE RTRIM(maDen) = @code
                        ORDER BY maDuLieu DESC
                        OFFSET @off ROWS FETCH NEXT @cnt ROWS ONLY;",
                        c =>
                        {
                            c.Parameters.AddWithValue("@code", selectedCode);
                            c.Parameters.AddWithValue("@off", offset);
                            c.Parameters.AddWithValue("@cnt", fetchCount);
                        }) : new List<Dictionary<string, object>>();

                    chartSeries = QueryRows(@"
                        SELECT TOP (20) maDuLieu, dienAp, dongDien, congSuatThucTe, nhietDoLed, doSang, thoiGianDo
                        FROM dbo.DuLieuGiamSatDen
                        WHERE RTRIM(maDen) = @code
                        ORDER BY maDuLieu DESC;",
                        c => c.Parameters.AddWithValue("@code", selectedCode));
                    chartSeries.Reverse();
                }

                var latestRow = (history.Count > 0 && effectivePage == totalPages)
                    ? history[0]
                    : (chartSeries.Count > 0 ? chartSeries[chartSeries.Count - 1] : null);

                return new
                {
                    mode = "lamp",
                    selectedCode,
                    cabinets,
                    lamps,
                    latest = latestRow,
                    sampleLamp = currentLamp,
                    chartSeries,
                    history,
                    totalRecords,
                    page = effectivePage,
                    totalPages,
                    pageSize
                };
            }
        }

        public string BuildTelemetryCsv(string mode, string code)
        {
            var sb = new StringBuilder();
            if (string.Equals(mode, "lamp", StringComparison.OrdinalIgnoreCase))
            {
                sb.AppendLine("MaDuLieu,MaDen,ThoiGianDo,DienAp_V,DongDien_A,CongSuat_W,NhietDoLED_C,DoSang_%");
                var rows = QueryRows(@"
                    SELECT TOP (200) maDuLieu, RTRIM(maDen) AS maDen, thoiGianDo, dienAp, dongDien, congSuatThucTe, nhietDoLed, doSang
                    FROM dbo.DuLieuGiamSatDen
                    WHERE (@code IS NULL OR RTRIM(maDen) = @code)
                    ORDER BY maDuLieu DESC;",
                    c => c.Parameters.AddWithValue("@code", string.IsNullOrWhiteSpace(code) ? (object)DBNull.Value : code.Trim()));
                foreach (var r in rows)
                {
                    sb.AppendFormat("{0},{1},{2},{3},{4},{5},{6},{7}\r\n",
                        r["maDuLieu"], r["maDen"], r["thoiGianDo"], r["dienAp"], r["dongDien"],
                        r["congSuatThucTe"], r["nhietDoLed"], r["doSang"]);
                }
            }
            else
            {
                sb.AppendLine("MaDuLieu,MaTu,ThoiGianDo,Ua_V,Ub_V,Uc_V,Ia_A,Ib_A,Ic_A,CongSuat_kW,DienNang_kWh");
                var rows = QueryRows(@"
                    SELECT TOP (200) maDuLieu, RTRIM(maTu) AS maTu, thoiGianDo, dienApPha1, dienApPha2, dienApPha3,
                           dongDienPha1, dongDienPha2, dongDienPha3, congSuat, dienNang
                    FROM dbo.DuLieuGiamSatTu
                    WHERE (@code IS NULL OR RTRIM(maTu) = @code)
                    ORDER BY maDuLieu DESC;",
                    c => c.Parameters.AddWithValue("@code", string.IsNullOrWhiteSpace(code) ? (object)DBNull.Value : code.Trim()));
                foreach (var r in rows)
                {
                    sb.AppendFormat("{0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10}\r\n",
                        r["maDuLieu"], r["maTu"], r["thoiGianDo"], r["dienApPha1"], r["dienApPha2"], r["dienApPha3"],
                        r["dongDienPha1"], r["dongDienPha2"], r["dongDienPha3"], r["congSuat"], r["dienNang"]);
                }
            }
            return sb.ToString();
        }

        public object GetDeviceTreeAndLogs()
        {
            var cabinets = QueryRows(@"
                SELECT RTRIM(t.maTu) AS maTu, t.tenTu, t.diaChi, ISNULL(RTRIM(t.maThietBi), '') AS maThietBi,
                       CAST(t.trangThaiKetNoi AS INT) AS trangThaiKetNoi, t.trangThaiNguon, t.lanKetNoiCuoi,
                       dl.congSuat, dl.dienApPha1
                FROM dbo.TuChieuSang t
                OUTER APPLY (
                    SELECT TOP (1) congSuat, dienApPha1
                    FROM dbo.DuLieuGiamSatTu WHERE maTu = t.maTu ORDER BY maDuLieu DESC
                ) dl
                WHERE t.daXoa = 0
                ORDER BY RTRIM(t.maTu) ASC;");

            var routes = QueryRows(@"
                SELECT RTRIM(ty.maTuyen) AS maTuyen, ty.tenTuyen, ty.viTri, RTRIM(ty.maTu) AS maTu,
                       ty.trangThaiHoatDong, ty.mucSangHienTai
                FROM dbo.TuyenChieuSang ty
                WHERE ty.daXoa = 0
                ORDER BY RTRIM(ty.maTuyen) ASC;");

            var lamps = QueryRows(@"
                SELECT RTRIM(d.maDen) AS maDen, d.tenDen, d.viTri, RTRIM(d.maTuyen) AS maTuyen,
                       RTRIM(ty.maTu) AS maTu,
                       d.congSuat, d.dienAp, d.dongDien, d.congSuatThucTe, d.nhietDoLed,
                       d.doSang, d.trangThaiHoatDong, d.lanDoCuoi
                FROM dbo.DiemDen d
                INNER JOIN dbo.TuyenChieuSang ty ON d.maTuyen = ty.maTuyen
                WHERE d.daXoa = 0 AND ty.daXoa = 0
                ORDER BY RTRIM(d.maDen) ASC;");

            var recentCommands = QueryCommands(null, null, null, null, null, 25);

            return new
            {
                cabinets,
                routes,
                lamps,
                recentCommands,
                systemStatus = GetSystemStatus()
            };
        }

        public object EnqueueCommand(string targetType, string targetCode, string hanhDong, byte? mucSang)
        {
            var type = (targetType ?? string.Empty).Trim().ToUpperInvariant();
            var code = (targetCode ?? string.Empty).Trim();
            var action = (hanhDong ?? string.Empty).Trim().ToUpperInvariant();

            if (string.IsNullOrEmpty(code) || (type != "TU" && type != "TUYEN" && type != "DEN"))
                throw new ArgumentException("Đối tượng điều khiển phải là TU, TUYEN hoặc DEN.");
            if (action != "BAT" && action != "TAT" && action != "DIM")
                throw new ArgumentException("Hành động phải là BAT, TAT hoặc DIM.");

            byte? effectiveDim = action == "DIM"
                ? (byte)Math.Min(100, Math.Max(0, (int)(mucSang ?? 100)))
                : (byte?)null; // Bắt buộc là NULL với lệnh BAT và TAT theo ràng buộc CK_Lenh_MucSang

            using (var conn = CreateOpenConnection())
            using (var cmd = conn.CreateCommand())
            {
                // Ràng buộc CHECK CK_Lenh_DoiTuong: đúng 1 trong 3 trường (maTu, maTuyen, maDen) nhận giá trị, 2 trường còn lại NULL
                cmd.CommandText = @"
                    DECLARE @user CHAR(10);
                    SELECT TOP (1) @user = maNguoiDung
                    FROM dbo.NguoiDung
                    WHERE daXoa = 0
                    ORDER BY CASE WHEN maVaiTro = 1 THEN 0 ELSE 1 END, maNguoiDung ASC;

                    INSERT INTO dbo.LenhDieuKhien
                        (maTu, maTuyen, maDen, hanhDong, mucSang, nguonLenh, trangThaiLenh, thoiGianTao, maNguoiDung)
                    OUTPUT INSERTED.maLenh
                    VALUES
                        (@maTu, @maTuyen, @maDen, @hanhDong, @mucSang, 1, 0, GETDATE(), @user);";

                cmd.Parameters.AddWithValue("@maTu", type == "TU" ? (object)code : DBNull.Value);
                cmd.Parameters.AddWithValue("@maTuyen", type == "TUYEN" ? (object)code : DBNull.Value);
                cmd.Parameters.AddWithValue("@maDen", type == "DEN" ? (object)code : DBNull.Value);
                cmd.Parameters.AddWithValue("@hanhDong", action);
                cmd.Parameters.AddWithValue("@mucSang", effectiveDim.HasValue ? (object)effectiveDim.Value : DBNull.Value);

                var maLenh = Convert.ToInt64(cmd.ExecuteScalar());
                return new
                {
                    maLenh,
                    targetType = type,
                    targetCode = code,
                    hanhDong = action,
                    mucSang = effectiveDim,
                    trangThaiLenh = 0
                };
            }
        }

        public List<Dictionary<string, object>> QueryCommands(
            string device, string action, int? status, string fromDate, string toDate, int limit = 60)
        {
            DateTime parsedFrom;
            DateTime parsedTo;
            var hasFrom = DateTime.TryParse(fromDate, out parsedFrom);
            var hasTo = DateTime.TryParse(toDate, out parsedTo);

            return QueryRows(@"
                SELECT TOP (@lim)
                    l.maLenh,
                    ISNULL(RTRIM(l.maTu), '') AS maTu,
                    ISNULL(RTRIM(l.maTuyen), '') AS maTuyen,
                    ISNULL(RTRIM(l.maDen), '') AS maDen,
                    l.hanhDong,
                    l.mucSang,
                    l.nguonLenh,
                    l.trangThaiLenh,
                    l.thoiGianTao,
                    l.thoiGianGui,
                    l.thoiGianPhanHoi,
                    ISNULL(l.noiDungPhanHoi, '') AS noiDungPhanHoi,
                    ISNULL(nd.hoTen, ISNULL(nd.tenDangNhap, 'Hệ thống')) AS nguoiThucHien,
                    RTRIM(COALESCE(l.maTu, ty.maTu, tyDen.maTu, '')) AS ownerMaTu,
                    COALESCE(tu1.tenTu, tu2.tenTu, tu3.tenTu, '') AS ownerTenTu,
                    COALESCE(d.tenDen, ty.tenTuyen, tu1.tenTu, '') AS targetName
                FROM dbo.LenhDieuKhien l
                LEFT JOIN dbo.NguoiDung nd ON l.maNguoiDung = nd.maNguoiDung
                LEFT JOIN dbo.TuChieuSang tu1 ON l.maTu = tu1.maTu
                LEFT JOIN dbo.TuyenChieuSang ty ON l.maTuyen = ty.maTuyen
                LEFT JOIN dbo.TuChieuSang tu2 ON ty.maTu = tu2.maTu
                LEFT JOIN dbo.DiemDen d ON l.maDen = d.maDen
                LEFT JOIN dbo.TuyenChieuSang tyDen ON d.maTuyen = tyDen.maTuyen
                LEFT JOIN dbo.TuChieuSang tu3 ON tyDen.maTu = tu3.maTu
                WHERE (@dev IS NULL
                       OR RTRIM(ISNULL(l.maTu, '')) LIKE '%' + @dev + '%'
                       OR RTRIM(ISNULL(l.maTuyen, '')) LIKE '%' + @dev + '%'
                       OR RTRIM(ISNULL(l.maDen, '')) LIKE '%' + @dev + '%'
                       OR RTRIM(COALESCE(l.maTu, ty.maTu, tyDen.maTu, '')) LIKE '%' + @dev + '%')
                  AND (@act IS NULL OR UPPER(RTRIM(l.hanhDong)) = @act)
                  AND (@st IS NULL OR l.trangThaiLenh = @st)
                  AND (@fromDt IS NULL OR l.thoiGianTao >= @fromDt)
                  AND (@toDt IS NULL OR l.thoiGianTao < DATEADD(DAY, 1, @toDt))
                ORDER BY l.maLenh DESC;",
                c =>
                {
                    c.Parameters.AddWithValue("@lim", Math.Min(200, Math.Max(10, limit)));
                    c.Parameters.AddWithValue("@dev", string.IsNullOrWhiteSpace(device) ? (object)DBNull.Value : device.Trim());
                    c.Parameters.AddWithValue("@act", string.IsNullOrWhiteSpace(action) ? (object)DBNull.Value : action.Trim().ToUpperInvariant());
                    c.Parameters.AddWithValue("@st", status.HasValue ? (object)status.Value : DBNull.Value);
                    c.Parameters.AddWithValue("@fromDt", hasFrom ? (object)parsedFrom.Date : DBNull.Value);
                    c.Parameters.AddWithValue("@toDt", hasTo ? (object)parsedTo.Date : DBNull.Value);
                });
        }

        public object GetCommandsDashboard(string device, string action, int? status, string fromDate, string toDate)
        {
            var statsRow = QueryRows(@"
                SELECT
                    COUNT(CASE WHEN CAST(thoiGianTao AS DATE) = CAST(GETDATE() AS DATE) THEN 1 END) AS totalToday,
                    COUNT(CASE WHEN trangThaiLenh IN (0, 1) THEN 1 END) AS inFlight,
                    COUNT(CASE WHEN trangThaiLenh = 2 THEN 1 END) AS totalSuccess,
                    COUNT(CASE WHEN trangThaiLenh IN (3, 4) THEN 1 END) AS totalFailOrTimeout,
                    COUNT(*) AS totalAll
                FROM dbo.LenhDieuKhien;")[0];

            var list = QueryCommands(device, action, status, fromDate, toDate, 80);
            var frames = RequestHesJson("GET", "/hes/frames?limit=40");

            return new
            {
                stats = statsRow,
                commands = list,
                recentFrames = frames != null ? frames["frames"] : new JArray(),
                systemStatus = GetSystemStatus()
            };
        }

        public object GetCommStreamData(int limit = 100, string direction = "ALL", string type = "ALL", string maTu = "")
        {
            var query = string.Format(
                "/hes/frames?limit={0}&direction={1}&type={2}&maTu={3}",
                Math.Min(500, Math.Max(10, limit)),
                Uri.EscapeDataString(direction ?? "ALL"),
                Uri.EscapeDataString(type ?? "ALL"),
                Uri.EscapeDataString(maTu ?? string.Empty));

            var hesFrames = RequestHesJson("GET", query);
            var hesStatus = RequestHesJson("GET", "/hes/status");

            var filterTu = string.IsNullOrWhiteSpace(maTu) ? null : maTu.Trim();
            var latestTu = QueryRows(@"
                SELECT TOP (1)
                    RTRIM(t.maTu) AS maTu, t.tenTu, ISNULL(RTRIM(t.maThietBi), '') AS maThietBi,
                    t.trangThaiNguon, CAST(t.trangThaiKetNoi AS INT) AS trangThaiKetNoi,
                    dl.dienApPha1, dl.dienApPha2, dl.dienApPha3,
                    dl.dongDienPha1, dl.dongDienPha2, dl.dongDienPha3,
                    dl.congSuat, dl.dienNang, dl.thoiGianDo
                FROM dbo.TuChieuSang t
                OUTER APPLY (
                    SELECT TOP (1) * FROM dbo.DuLieuGiamSatTu WHERE maTu = t.maTu ORDER BY maDuLieu DESC
                ) dl
                WHERE t.daXoa = 0
                  AND (@maTu IS NULL OR RTRIM(t.maTu) = @maTu)
                ORDER BY t.lanKetNoiCuoi DESC, RTRIM(t.maTu) ASC;",
                c => c.Parameters.AddWithValue("@maTu", (object)filterTu ?? DBNull.Value));

            var contactors = new List<Dictionary<string, object>>();
            if (latestTu.Count > 0)
            {
                var targetTu = Convert.ToString(latestTu[0]["maTu"]);
                contactors = QueryRows(@"
                    SELECT RTRIM(maTuyen) AS maTuyen, tenTuyen, trangThaiHoatDong, mucSangHienTai
                    FROM dbo.TuyenChieuSang
                    WHERE daXoa = 0 AND RTRIM(maTu) = @maTu
                    ORDER BY RTRIM(maTuyen) ASC;",
                    c => c.Parameters.AddWithValue("@maTu", targetTu));
            }

            return new
            {
                hesOnline = hesFrames != null,
                snapshot = hesFrames != null ? hesFrames["snapshot"] : null,
                frames = hesFrames != null ? hesFrames["frames"] : new JArray(),
                sessions = hesStatus != null ? hesStatus["sessions"] : new JArray(),
                selectedCabinet = latestTu.Count > 0 ? latestTu[0] : null,
                contactors,
                systemStatus = GetSystemStatus()
            };
        }

        public object ClearCommFrames()
        {
            var resp = RequestHesJson("POST", "/hes/frames/clear", new { });
            return new { cleared = resp != null };
        }

        public object GetAlertsData(int? mucDo, int? trangThai, string keyword, int page = 1, int pageSize = 15)
        {
            page = Math.Max(1, page);
            pageSize = Math.Min(50, Math.Max(5, pageSize));
            var offset = (page - 1) * pageSize;

            var kpi = QueryRows(@"
                SELECT
                    COUNT(CASE WHEN mucDo = 3 AND trangThaiXuLy IN (0, 1) THEN 1 END) AS criticalOpen,
                    COUNT(CASE WHEN mucDo IN (1, 2) AND trangThaiXuLy IN (0, 1) THEN 1 END) AS warnInfoOpen,
                    COUNT(CASE WHEN trangThaiXuLy = 2 AND CAST(ISNULL(thoiGianXuLy, thoiGianPhatSinh) AS DATE) = CAST(GETDATE() AS DATE) THEN 1 END) AS resolvedToday,
                    COUNT(*) AS totalAll,
                    COUNT(CASE WHEN mucDo = 3 THEN 1 END) AS totalCritical,
                    COUNT(CASE WHEN mucDo = 2 THEN 1 END) AS totalWarn,
                    COUNT(CASE WHEN mucDo = 1 THEN 1 END) AS totalInfo
                FROM dbo.CanhBao;")[0];

            var totalFiltered = Convert.ToInt32(QueryRows(@"
                SELECT COUNT(*) AS cnt
                FROM dbo.CanhBao c
                WHERE (@mucDo IS NULL OR c.mucDo = @mucDo)
                  AND (@tt IS NULL OR c.trangThaiXuLy = @tt)
                  AND (@kw IS NULL
                       OR c.noiDung LIKE '%' + @kw + '%'
                       OR RTRIM(ISNULL(c.maTu, '')) LIKE '%' + @kw + '%'
                       OR RTRIM(ISNULL(c.maTuyen, '')) LIKE '%' + @kw + '%'
                       OR RTRIM(ISNULL(c.maDen, '')) LIKE '%' + @kw + '%');",
                c =>
                {
                    c.Parameters.AddWithValue("@mucDo", mucDo.HasValue ? (object)mucDo.Value : DBNull.Value);
                    c.Parameters.AddWithValue("@tt", trangThai.HasValue ? (object)trangThai.Value : DBNull.Value);
                    c.Parameters.AddWithValue("@kw", string.IsNullOrWhiteSpace(keyword) ? (object)DBNull.Value : keyword.Trim());
                })[0]["cnt"]);

            var alerts = QueryRows(@"
                SELECT
                    c.maCanhBao,
                    c.maCauHinh,
                    ISNULL(RTRIM(c.maTu), '') AS maTu,
                    ISNULL(RTRIM(c.maTuyen), '') AS maTuyen,
                    ISNULL(RTRIM(c.maDen), '') AS maDen,
                    c.noiDung,
                    c.mucDo,
                    c.trangThaiXuLy,
                    c.thoiGianPhatSinh,
                    c.thoiGianXuLy,
                    ISNULL(c.ghiChuXuLy, '') AS ghiChuXuLy,
                    COALESCE(tu1.tenTu, tu2.tenTu, tu3.tenTu, '') AS tenTu,
                    COALESCE(tu1.diaChi, tu2.diaChi, tu3.diaChi, '') AS diaChiTu,
                    COALESCE(d.tenDen, ty.tenTuyen, tu1.tenTu, 'Hệ thống') AS targetDisplay,
                    COALESCE(d.viDo, tu1.viDo, tu2.viDo, tu3.viDo) AS viDo,
                    COALESCE(d.kinhDo, tu1.kinhDo, tu2.kinhDo, tu3.kinhDo) AS kinhDo,
                    dl.dienApPha1,
                    dl.dienApPha2,
                    dl.dienApPha3,
                    dl.congSuat,
                    d.nhietDoLed
                FROM dbo.CanhBao c
                LEFT JOIN dbo.TuChieuSang tu1 ON c.maTu = tu1.maTu
                LEFT JOIN dbo.TuyenChieuSang ty ON c.maTuyen = ty.maTuyen
                LEFT JOIN dbo.TuChieuSang tu2 ON ty.maTu = tu2.maTu
                LEFT JOIN dbo.DiemDen d ON c.maDen = d.maDen
                LEFT JOIN dbo.TuyenChieuSang ty3 ON d.maTuyen = ty3.maTuyen
                LEFT JOIN dbo.TuChieuSang tu3 ON ty3.maTu = tu3.maTu
                OUTER APPLY (
                    SELECT TOP (1) dienApPha1, dienApPha2, dienApPha3, congSuat
                    FROM dbo.DuLieuGiamSatTu
                    WHERE maTu = COALESCE(c.maTu, ty.maTu, ty3.maTu)
                    ORDER BY maDuLieu DESC
                ) dl
                WHERE (@mucDo IS NULL OR c.mucDo = @mucDo)
                  AND (@tt IS NULL OR c.trangThaiXuLy = @tt)
                  AND (@kw IS NULL
                       OR c.noiDung LIKE '%' + @kw + '%'
                       OR RTRIM(ISNULL(c.maTu, '')) LIKE '%' + @kw + '%'
                       OR RTRIM(ISNULL(c.maTuyen, '')) LIKE '%' + @kw + '%'
                       OR RTRIM(ISNULL(c.maDen, '')) LIKE '%' + @kw + '%')
                ORDER BY c.thoiGianPhatSinh DESC, c.maCanhBao DESC
                OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY;",
                c =>
                {
                    c.Parameters.AddWithValue("@mucDo", mucDo.HasValue ? (object)mucDo.Value : DBNull.Value);
                    c.Parameters.AddWithValue("@tt", trangThai.HasValue ? (object)trangThai.Value : DBNull.Value);
                    c.Parameters.AddWithValue("@kw", string.IsNullOrWhiteSpace(keyword) ? (object)DBNull.Value : keyword.Trim());
                    c.Parameters.AddWithValue("@off", offset);
                    c.Parameters.AddWithValue("@ps", pageSize);
                });

            return new
            {
                kpi,
                totalFiltered,
                page,
                pageSize,
                alerts,
                systemStatus = GetSystemStatus()
            };
        }

        public object UpdateAlertStatus(long maCanhBao, byte trangThaiXuLy, string ghiChu)
        {
            using (var conn = CreateOpenConnection())
            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = @"
                    DECLARE @user CHAR(10);
                    SELECT TOP (1) @user = maNguoiDung FROM dbo.NguoiDung WHERE daXoa = 0 ORDER BY maNguoiDung ASC;

                    UPDATE dbo.CanhBao
                    SET trangThaiXuLy = @tt,
                        thoiGianXuLy = CASE WHEN @tt = 2 THEN GETDATE() WHEN @tt = 0 THEN NULL ELSE thoiGianXuLy END,
                        ghiChuXuLy = CASE WHEN @note IS NOT NULL AND LTRIM(RTRIM(@note)) <> '' THEN @note ELSE ghiChuXuLy END,
                        maNguoiXuLy = @user
                    WHERE maCanhBao = @id;";
                cmd.Parameters.AddWithValue("@tt", trangThaiXuLy);
                cmd.Parameters.AddWithValue("@note", string.IsNullOrWhiteSpace(ghiChu) ? (object)DBNull.Value : ghiChu.Trim());
                cmd.Parameters.AddWithValue("@id", maCanhBao);
                var updated = cmd.ExecuteNonQuery();
                return new { updated };
            }
        }

        public object AckAllOpenAlerts()
        {
            using (var conn = CreateOpenConnection())
            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = @"
                    DECLARE @user CHAR(10);
                    SELECT TOP (1) @user = maNguoiDung FROM dbo.NguoiDung WHERE daXoa = 0 ORDER BY maNguoiDung ASC;

                    UPDATE dbo.CanhBao
                    SET trangThaiXuLy = 2,
                        thoiGianXuLy = GETDATE(),
                        ghiChuXuLy = ISNULL(ghiChuXuLy, N'Đã xác nhận hàng loạt từ HES SCADA'),
                        maNguoiXuLy = @user
                    WHERE trangThaiXuLy IN (0, 1);";
                var updated = cmd.ExecuteNonQuery();
                return new { updated };
            }
        }

        public object GetConfigState()
        {
            var builder = new SqlConnectionStringBuilder(_connectionString);
            var status = GetSystemStatus();
            var cfg = RequestHesJson("GET", "/hes/config");

            return new
            {
                sql = new
                {
                    server = builder.DataSource,
                    database = builder.InitialCatalog,
                    integratedSecurity = builder.IntegratedSecurity,
                    username = builder.UserID
                },
                hesConfig = cfg,
                systemStatus = status
            };
        }

        public object SaveRuntimeConfig(JObject payload)
        {
            var resp = RequestHesJson("POST", "/hes/config", payload);
            return new
            {
                saved = resp != null,
                hesResponse = resp,
                systemStatus = GetSystemStatus()
            };
        }
    }
}

