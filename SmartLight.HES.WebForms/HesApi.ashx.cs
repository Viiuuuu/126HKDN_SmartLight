using System;
using System.IO;
using System.Text;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartLight.HES.WebForms.Data;

namespace SmartLight.HES.WebForms
{
    public class HesApi : IHttpHandler
    {
        public bool IsReusable => false;

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentEncoding = Encoding.UTF8;
            var action = (context.Request.QueryString["action"] ?? "status").Trim();
            var repo = new HesWebRepository();

            try
            {
                if (string.Equals(action, "exportTelemetry", StringComparison.OrdinalIgnoreCase))
                {
                    var mode = context.Request.QueryString["mode"] ?? "cabinet";
                    var code = context.Request.QueryString["code"];
                    var csv = repo.BuildTelemetryCsv(mode, code);
                    context.Response.ContentType = "text/csv; charset=utf-8";
                    context.Response.AddHeader("Content-Disposition",
                        "attachment; filename=SmartLight_Telemetry_" + DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".csv");
                    var bom = new byte[] { 0xEF, 0xBB, 0xBF };
                    context.Response.BinaryWrite(bom);
                    context.Response.Write(csv);
                    return;
                }

                context.Response.ContentType = "application/json; charset=utf-8";
                context.Response.Cache.SetCacheability(HttpCacheability.NoCache);

                object result;
                switch (action.ToLowerInvariant())
                {
                    case "status":
                        result = repo.GetSystemStatus();
                        break;

                    case "overview":
                        result = repo.GetOverviewData(context.Request.QueryString["keyword"]);
                        break;

                    case "telemetry":
                        int? tPage = int.TryParse(context.Request.QueryString["page"], out var parsedPage) && parsedPage > 0 ? (int?)parsedPage : null;
                        int.TryParse(context.Request.QueryString["pageSize"], out var tSize);
                        result = repo.GetTelemetryData(
                            context.Request.QueryString["mode"] ?? "cabinet",
                            context.Request.QueryString["code"],
                            tPage,
                            tSize <= 0 ? 10 : tSize);
                        break;

                    case "devicetree":
                        result = repo.GetDeviceTreeAndLogs();
                        break;

                    case "sendcommand":
                        var cmdBody = ReadJsonBody(context);
                        byte? dim = null;
                        if (cmdBody["mucSang"] != null && cmdBody["mucSang"].Type != JTokenType.Null)
                        {
                            dim = cmdBody.Value<byte>("mucSang");
                        }
                        result = repo.EnqueueCommand(
                            cmdBody.Value<string>("targetType"),
                            cmdBody.Value<string>("targetCode"),
                            cmdBody.Value<string>("hanhDong"),
                            dim);
                        break;

                    case "commands":
                        int? st = int.TryParse(context.Request.QueryString["status"], out var parsedSt) ? parsedSt : (int?)null;
                        result = repo.GetCommandsDashboard(
                            context.Request.QueryString["device"],
                            context.Request.QueryString["cmdAction"],
                            st,
                            context.Request.QueryString["fromDate"],
                            context.Request.QueryString["toDate"]);
                        break;

                    case "frames":
                        int.TryParse(context.Request.QueryString["limit"], out var fLimit);
                        result = repo.GetCommStreamData(
                            fLimit <= 0 ? 100 : fLimit,
                            context.Request.QueryString["direction"] ?? "ALL",
                            context.Request.QueryString["type"] ?? "ALL",
                            context.Request.QueryString["maTu"] ?? "");
                        break;

                    case "clearframes":
                        result = repo.ClearCommFrames();
                        break;

                    case "alerts":
                        int? aLevel = int.TryParse(context.Request.QueryString["mucDo"], out var lvl) ? lvl : (int?)null;
                        int? aStatus = int.TryParse(context.Request.QueryString["trangThai"], out var ast) ? ast : (int?)null;
                        int.TryParse(context.Request.QueryString["page"], out var aPage);
                        int.TryParse(context.Request.QueryString["pageSize"], out var aSize);
                        result = repo.GetAlertsData(
                            aLevel,
                            aStatus,
                            context.Request.QueryString["keyword"],
                            aPage <= 0 ? 1 : aPage,
                            aSize <= 0 ? 15 : aSize);
                        break;

                    case "ackalert":
                        var ackBody = ReadJsonBody(context);
                        result = repo.UpdateAlertStatus(
                            ackBody.Value<long>("maCanhBao"),
                            ackBody.Value<byte?>("trangThaiXuLy") ?? (byte)2,
                            ackBody.Value<string>("ghiChu"));
                        break;

                    case "ackallalerts":
                        result = repo.AckAllOpenAlerts();
                        break;

                    case "config":
                        result = repo.GetConfigState();
                        break;

                    case "saveconfig":
                        var cfgBody = ReadJsonBody(context);
                        result = repo.SaveRuntimeConfig(cfgBody);
                        break;

                    default:
                        context.Response.StatusCode = 400;
                        result = new { error = "Action không hợp lệ: " + action };
                        break;
                }

                context.Response.Write(JsonConvert.SerializeObject(result));
            }
            catch (ArgumentException ex)
            {
                context.Response.StatusCode = 400;
                context.Response.Write(JsonConvert.SerializeObject(new { error = ex.Message }));
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 500;
                context.Response.Write(JsonConvert.SerializeObject(new { error = ex.Message }));
            }
        }

        private static JObject ReadJsonBody(HttpContext context)
        {
            using (var reader = new StreamReader(context.Request.InputStream, Encoding.UTF8))
            {
                var raw = reader.ReadToEnd();
                return string.IsNullOrWhiteSpace(raw) ? new JObject() : JObject.Parse(raw);
            }
        }
    }
}

