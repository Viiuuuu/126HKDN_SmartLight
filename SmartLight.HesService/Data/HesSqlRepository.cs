using System.Data;
using Microsoft.Data.SqlClient;
using SmartLight.HesService.Options;
using SmartLight.HesService.Protocol;

namespace SmartLight.HesService.Data;

public sealed record ResolvedCabinetIdentity(string MaTu, string MaThietBi);

public sealed record ClaimedCommand(
    long MaLenh,
    string TargetType,
    string TargetCode,
    string OwnerMaTu,
    string OwnerMaThietBi,
    string HanhDong,
    byte? MucSang,
    bool TargetValid);

public sealed record CommandDispatchOutcome(
    bool Sent,
    DateTime TimestampLocal,
    string? ErrorMessage);

public sealed record ExecutedCommandInfo(
    long MaLenh,
    string? MaTu,
    string? MaTuyen,
    string? MaDen,
    string HanhDong,
    byte? MucSang);

public interface IHesRepository
{
    Task<ResolvedCabinetIdentity?> ResolveCabinetAsync(string? maThietBi, string? maTu, CancellationToken ct);
    Task ResetAllCabinetsOfflineAsync(CancellationToken ct);
    Task SetCabinetConnectionStateAsync(string maTu, bool isOnline, DateTime timestampLocal, CancellationToken ct);
    Task SaveTelemetryAsync(string maTu, TelemetryMessage telemetry, DateTime measuredAtLocal, CancellationToken ct);
    Task<IReadOnlyList<(ClaimedCommand Command, CommandDispatchOutcome Outcome)>> DispatchPendingCommandsAsync(
        Func<ClaimedCommand, CancellationToken, Task<CommandDispatchOutcome>> sendAsync,
        CancellationToken ct);
    Task<bool> ApplyCommandAckAsync(long maLenh, bool success, string? responseMessage, DateTime responseAtLocal, CancellationToken ct);
    Task<int> TimeoutExpiredCommandsAsync(int timeoutSeconds, DateTime nowLocal, CancellationToken ct);
    Task<long?> EnqueueCommandAsync(string? maTu, string? maTuyen, string? maDen, string hanhDong, byte? mucSang, byte nguonLenh, string? maNguoiDung, CancellationToken ct);
}

public sealed class HesSqlRepository : IHesRepository
{
    private readonly HesServiceOptions _options;
    private readonly ILogger<HesSqlRepository> _logger;

    public HesSqlRepository(HesServiceOptions options, ILogger<HesSqlRepository> logger)
    {
        _options = options;
        _logger = logger;
    }

    private async Task<SqlConnection> OpenConnectionAsync(CancellationToken ct)
    {
        var conn = new SqlConnection(_options.ConnectionString);
        await conn.OpenAsync(ct);
        return conn;
    }

    public async Task<ResolvedCabinetIdentity?> ResolveCabinetAsync(string? maThietBi, string? maTu, CancellationToken ct)
    {
        var cleanDev = maThietBi?.Trim();
        var cleanTu = maTu?.Trim();
        if (string.IsNullOrEmpty(cleanDev) && string.IsNullOrEmpty(cleanTu)) return null;

        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT TOP (1) RTRIM(maTu) AS maTu, RTRIM(ISNULL(maThietBi, '')) AS maThietBi
            FROM dbo.TuChieuSang
            WHERE daXoa = 0
              AND (
                    (@maThietBi IS NOT NULL AND RTRIM(maThietBi) = @maThietBi)
                 OR (@maTu IS NOT NULL AND RTRIM(maTu) = @maTu)
              )
            ORDER BY CASE WHEN @maThietBi IS NOT NULL AND RTRIM(maThietBi) = @maThietBi THEN 0 ELSE 1 END;
            """;
        cmd.Parameters.AddWithValue("@maThietBi", (object?)cleanDev ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@maTu", (object?)cleanTu ?? DBNull.Value);

        await using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return null;

        return new ResolvedCabinetIdentity(reader.GetString(0), reader.GetString(1));
    }

    public async Task ResetAllCabinetsOfflineAsync(CancellationToken ct)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE dbo.TuChieuSang SET trangThaiKetNoi = 0 WHERE daXoa = 0 AND trangThaiKetNoi = 1;";
        var affected = await cmd.ExecuteNonQueryAsync(ct);
        if (affected > 0)
        {
            _logger.LogInformation("Reset {Count} cabinet(s) to offline state on HES startup.", affected);
        }
    }

    public async Task SetCabinetConnectionStateAsync(string maTu, bool isOnline, DateTime timestampLocal, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(maTu)) return;

        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = isOnline
            ? "UPDATE dbo.TuChieuSang SET trangThaiKetNoi = 1, lanKetNoiCuoi = @ts WHERE RTRIM(maTu) = @maTu AND daXoa = 0;"
            : "UPDATE dbo.TuChieuSang SET trangThaiKetNoi = 0 WHERE RTRIM(maTu) = @maTu AND daXoa = 0;";
        cmd.Parameters.AddWithValue("@maTu", maTu.Trim());
        if (isOnline)
        {
            cmd.Parameters.AddWithValue("@ts", timestampLocal);
        }

        await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task SaveTelemetryAsync(string maTu, TelemetryMessage telemetry, DateTime measuredAtLocal, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(maTu)) return;
        var cleanTu = maTu.Trim();

        await using var conn = await OpenConnectionAsync(ct);
        await using var tx = (SqlTransaction)await conn.BeginTransactionAsync(ct);

        if (telemetry.Tu is not null)
        {
            var nguon = NormalizePowerState(telemetry.Tu.TrangThaiNguon);
            var u1 = ClampDecimal(telemetry.Tu.DienApPha1, 0m, 9999.99m, 2);
            var u2 = ClampDecimal(telemetry.Tu.DienApPha2, 0m, 9999.99m, 2);
            var u3 = ClampDecimal(telemetry.Tu.DienApPha3, 0m, 9999.99m, 2);
            var i1 = ClampDecimal(telemetry.Tu.DongDienPha1, 0m, 99999.99m, 2);
            var i2 = ClampDecimal(telemetry.Tu.DongDienPha2, 0m, 99999.99m, 2);
            var i3 = ClampDecimal(telemetry.Tu.DongDienPha3, 0m, 99999.99m, 2);
            var p = ClampDecimal(telemetry.Tu.CongSuat, 0m, 9999999.999m, 3);
            var e = ClampDecimal(telemetry.Tu.DienNang, 0m, 999999999999.999m, 3);

            await using var cmdTuState = conn.CreateCommand();
            cmdTuState.Transaction = tx;
            cmdTuState.CommandText = """
                UPDATE dbo.TuChieuSang
                SET trangThaiKetNoi = 1,
                    lanKetNoiCuoi = @ts,
                    trangThaiNguon = @nguon
                WHERE RTRIM(maTu) = @maTu AND daXoa = 0;
                """;
            cmdTuState.Parameters.AddWithValue("@ts", measuredAtLocal);
            cmdTuState.Parameters.AddWithValue("@nguon", nguon);
            cmdTuState.Parameters.AddWithValue("@maTu", cleanTu);
            await cmdTuState.ExecuteNonQueryAsync(ct);

            await using var cmdInsertTu = conn.CreateCommand();
            cmdInsertTu.Transaction = tx;
            cmdInsertTu.CommandText = """
                IF EXISTS (SELECT 1 FROM dbo.TuChieuSang WHERE RTRIM(maTu) = @maTu AND daXoa = 0)
                BEGIN
                    INSERT INTO dbo.DuLieuGiamSatTu
                        (maTu, dienApPha1, dienApPha2, dienApPha3, dongDienPha1, dongDienPha2, dongDienPha3, congSuat, dienNang, thoiGianDo)
                    SELECT TOP (1) maTu, @u1, @u2, @u3, @i1, @i2, @i3, @p, @e, @ts
                    FROM dbo.TuChieuSang
                    WHERE RTRIM(maTu) = @maTu AND daXoa = 0;
                END
                """;
            cmdInsertTu.Parameters.AddWithValue("@maTu", cleanTu);
            AddDecimalParam(cmdInsertTu, "@u1", u1, 6, 2);
            AddDecimalParam(cmdInsertTu, "@u2", u2, 6, 2);
            AddDecimalParam(cmdInsertTu, "@u3", u3, 6, 2);
            AddDecimalParam(cmdInsertTu, "@i1", i1, 7, 2);
            AddDecimalParam(cmdInsertTu, "@i2", i2, 7, 2);
            AddDecimalParam(cmdInsertTu, "@i3", i3, 7, 2);
            AddDecimalParam(cmdInsertTu, "@p", p, 10, 3);
            AddDecimalParam(cmdInsertTu, "@e", e, 15, 3);
            cmdInsertTu.Parameters.AddWithValue("@ts", measuredAtLocal);
            await cmdInsertTu.ExecuteNonQueryAsync(ct);
        }

        foreach (var tuyen in telemetry.Tuyen)
        {
            if (string.IsNullOrWhiteSpace(tuyen.MaTuyen)) continue;

            await using var cmdTuyen = conn.CreateCommand();
            cmdTuyen.Transaction = tx;
            cmdTuyen.CommandText = """
                UPDATE dbo.TuyenChieuSang
                SET trangThaiHoatDong = @tt,
                    mucSangHienTai = @muc
                WHERE RTRIM(maTuyen) = @maTuyen AND RTRIM(maTu) = @maTu AND daXoa = 0;
                """;
            cmdTuyen.Parameters.AddWithValue("@tt", Math.Clamp(tuyen.TrangThaiHoatDong, (byte)0, (byte)3));
            cmdTuyen.Parameters.AddWithValue("@muc", Math.Clamp(tuyen.MucSangHienTai, (byte)0, (byte)100));
            cmdTuyen.Parameters.AddWithValue("@maTuyen", tuyen.MaTuyen.Trim());
            cmdTuyen.Parameters.AddWithValue("@maTu", cleanTu);
            await cmdTuyen.ExecuteNonQueryAsync(ct);
        }

        foreach (var den in telemetry.Den)
        {
            if (string.IsNullOrWhiteSpace(den.MaDen)) continue;

            var cleanDen = den.MaDen.Trim();
            var u = ClampDecimal(den.DienAp, 0m, 9999.99m, 2);
            var i = ClampDecimal(den.DongDien, 0m, 9999.999m, 3);
            var p = ClampDecimal(den.CongSuatThucTe, 0m, 999999.99m, 2);
            var temp = ClampDecimal(den.NhietDoLed, -40m, 150m, 2);
            var doSang = Math.Clamp(den.DoSang, (byte)0, (byte)100);
            var active = Math.Clamp(den.TrangThaiHoatDong, (byte)0, (byte)3);

            await using var cmdDen = conn.CreateCommand();
            cmdDen.Transaction = tx;
            cmdDen.CommandText = """
                DECLARE @exactMaDen CHAR(10);
                SELECT TOP (1) @exactMaDen = d.maDen
                FROM dbo.DiemDen d
                INNER JOIN dbo.TuyenChieuSang ty ON d.maTuyen = ty.maTuyen
                WHERE RTRIM(d.maDen) = @maDen AND RTRIM(ty.maTu) = @maTu AND d.daXoa = 0 AND ty.daXoa = 0;

                IF @exactMaDen IS NOT NULL
                BEGIN
                    UPDATE dbo.DiemDen
                    SET dienAp = @u,
                        dongDien = @i,
                        congSuatThucTe = @p,
                        nhietDoLed = @temp,
                        lanDoCuoi = @ts,
                        doSang = @doSang,
                        trangThaiHoatDong = @tt
                    WHERE maDen = @exactMaDen;

                    INSERT INTO dbo.DuLieuGiamSatDen
                        (maDen, dienAp, dongDien, congSuatThucTe, nhietDoLed, doSang, thoiGianDo)
                    VALUES
                        (@exactMaDen, @u, @i, @p, @temp, @doSang, @ts);
                END
                """;
            cmdDen.Parameters.AddWithValue("@maDen", cleanDen);
            cmdDen.Parameters.AddWithValue("@maTu", cleanTu);
            AddDecimalParam(cmdDen, "@u", u, 6, 2);
            AddDecimalParam(cmdDen, "@i", i, 7, 3);
            AddDecimalParam(cmdDen, "@p", p, 8, 2);
            AddDecimalParam(cmdDen, "@temp", temp, 5, 2);
            cmdDen.Parameters.AddWithValue("@doSang", doSang);
            cmdDen.Parameters.AddWithValue("@tt", active);
            cmdDen.Parameters.AddWithValue("@ts", measuredAtLocal);
            await cmdDen.ExecuteNonQueryAsync(ct);
        }

        await EvaluateTelemetryAlertsAsync(conn, tx, cleanTu, telemetry, measuredAtLocal, ct);

        await tx.CommitAsync(ct);
    }

    public async Task<IReadOnlyList<(ClaimedCommand Command, CommandDispatchOutcome Outcome)>> DispatchPendingCommandsAsync(
        Func<ClaimedCommand, CancellationToken, Task<CommandDispatchOutcome>> sendAsync,
        CancellationToken ct)
    {
        var results = new List<(ClaimedCommand, CommandDispatchOutcome)>();

        await using var conn = await OpenConnectionAsync(ct);
        await using var tx = (SqlTransaction)await conn.BeginTransactionAsync(ct);

        var claimed = new List<ClaimedCommand>();
        await using (var selectCmd = conn.CreateCommand())
        {
            selectCmd.Transaction = tx;
            selectCmd.CommandText = """
                SELECT TOP (20)
                    l.maLenh,
                    RTRIM(ISNULL(l.maTu, '')),
                    RTRIM(ISNULL(l.maTuyen, '')),
                    RTRIM(ISNULL(l.maDen, '')),
                    UPPER(RTRIM(l.hanhDong)),
                    l.mucSang,
                    RTRIM(COALESCE(tuDirect.maTu, tuViaTuyen.maTu, tuViaDen.maTu, '')),
                    RTRIM(COALESCE(tuDirect.maThietBi, tuViaTuyen.maThietBi, tuViaDen.maThietBi, '')),
                    CASE
                        WHEN l.maTu IS NOT NULL THEN CASE WHEN tuDirect.maTu IS NOT NULL AND tuDirect.daXoa = 0 THEN 1 ELSE 0 END
                        WHEN l.maTuyen IS NOT NULL THEN CASE WHEN ty.maTuyen IS NOT NULL AND ty.daXoa = 0 AND tuViaTuyen.maTu IS NOT NULL AND tuViaTuyen.daXoa = 0 THEN 1 ELSE 0 END
                        WHEN l.maDen IS NOT NULL THEN CASE WHEN d.maDen IS NOT NULL AND d.daXoa = 0 AND tyViaDen.maTuyen IS NOT NULL AND tyViaDen.daXoa = 0 AND tuViaDen.maTu IS NOT NULL AND tuViaDen.daXoa = 0 THEN 1 ELSE 0 END
                        ELSE 0
                    END
                FROM dbo.LenhDieuKhien l WITH (UPDLOCK, READPAST, ROWLOCK)
                LEFT JOIN dbo.TuChieuSang tuDirect ON l.maTu IS NOT NULL AND tuDirect.maTu = l.maTu
                LEFT JOIN dbo.TuyenChieuSang ty ON l.maTuyen IS NOT NULL AND ty.maTuyen = l.maTuyen
                LEFT JOIN dbo.TuChieuSang tuViaTuyen ON ty.maTu = tuViaTuyen.maTu
                LEFT JOIN dbo.DiemDen d ON l.maDen IS NOT NULL AND d.maDen = l.maDen
                LEFT JOIN dbo.TuyenChieuSang tyViaDen ON d.maTuyen = tyViaDen.maTuyen
                LEFT JOIN dbo.TuChieuSang tuViaDen ON tyViaDen.maTu = tuViaDen.maTu
                WHERE l.trangThaiLenh = 0
                ORDER BY l.maLenh ASC;
                """;

            await using var reader = await selectCmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var maLenh = reader.GetInt64(0);
                var maTu = reader.GetString(1);
                var maTuyen = reader.GetString(2);
                var maDen = reader.GetString(3);
                var hanhDong = reader.GetString(4);
                byte? mucSang = await reader.IsDBNullAsync(5, ct) ? null : reader.GetByte(5);
                var ownerMaTu = reader.GetString(6);
                var ownerMaThietBi = reader.GetString(7);
                var valid = reader.GetInt32(8) == 1;

                var (targetType, targetCode) = !string.IsNullOrEmpty(maTu)
                    ? ("TU", maTu)
                    : !string.IsNullOrEmpty(maTuyen)
                        ? ("TUYEN", maTuyen)
                        : ("DEN", maDen);

                claimed.Add(new ClaimedCommand(maLenh, targetType, targetCode, ownerMaTu, ownerMaThietBi, hanhDong, mucSang, valid));
            }
        }

        if (claimed.Count == 0)
        {
            await tx.CommitAsync(ct);
            return results;
        }

        foreach (var cmdInfo in claimed)
        {
            CommandDispatchOutcome outcome;
            if (!cmdInfo.TargetValid || string.IsNullOrEmpty(cmdInfo.OwnerMaTu))
            {
                outcome = new CommandDispatchOutcome(false, DateTime.Now,
                    $"Không tìm thấy thiết bị đích ({cmdInfo.TargetType}: {cmdInfo.TargetCode}) hoặc thiết bị đã bị xóa.");
            }
            else
            {
                outcome = await sendAsync(cmdInfo, ct);
            }

            await using var updateCmd = conn.CreateCommand();
            updateCmd.Transaction = tx;
            if (outcome.Sent)
            {
                updateCmd.CommandText = """
                    UPDATE dbo.LenhDieuKhien
                    SET trangThaiLenh = 1,
                        thoiGianGui = @ts,
                        noiDungPhanHoi = @msg
                    WHERE maLenh = @maLenh AND trangThaiLenh = 0;
                    """;
                updateCmd.Parameters.AddWithValue("@ts", outcome.TimestampLocal);
                updateCmd.Parameters.AddWithValue("@msg", TruncateText($"Đã gửi xuống tủ {cmdInfo.OwnerMaTu}, đang chờ ACK...", 250));
            }
            else
            {
                updateCmd.CommandText = """
                    UPDATE dbo.LenhDieuKhien
                    SET trangThaiLenh = 3,
                        thoiGianGui = ISNULL(thoiGianGui, @ts),
                        thoiGianPhanHoi = @ts,
                        noiDungPhanHoi = @msg
                    WHERE maLenh = @maLenh AND trangThaiLenh = 0;
                    """;
                updateCmd.Parameters.AddWithValue("@ts", outcome.TimestampLocal);
                updateCmd.Parameters.AddWithValue("@msg", TruncateText(outcome.ErrorMessage ?? "Gửi lệnh thất bại.", 250));
            }

            updateCmd.Parameters.AddWithValue("@maLenh", cmdInfo.MaLenh);
            await updateCmd.ExecuteNonQueryAsync(ct);

            results.Add((cmdInfo, outcome));
        }

        await tx.CommitAsync(ct);
        return results;
    }

    public async Task<bool> ApplyCommandAckAsync(long maLenh, bool success, string? responseMessage, DateTime responseAtLocal, CancellationToken ct)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var tx = (SqlTransaction)await conn.BeginTransactionAsync(ct);

        ExecutedCommandInfo? cmdInfo = null;
        await using (var updateCmd = conn.CreateCommand())
        {
            updateCmd.Transaction = tx;
            updateCmd.CommandText = """
                UPDATE dbo.LenhDieuKhien
                SET trangThaiLenh = @newStatus,
                    thoiGianPhanHoi = @ts,
                    noiDungPhanHoi = @msg
                OUTPUT RTRIM(deleted.maTu), RTRIM(deleted.maTuyen), RTRIM(deleted.maDen), UPPER(RTRIM(deleted.hanhDong)), deleted.mucSang
                WHERE maLenh = @maLenh AND trangThaiLenh = 1;
                """;
            updateCmd.Parameters.AddWithValue("@newStatus", success ? (byte)2 : (byte)3);
            updateCmd.Parameters.AddWithValue("@ts", responseAtLocal);
            updateCmd.Parameters.AddWithValue("@msg", TruncateText(
                string.IsNullOrWhiteSpace(responseMessage)
                    ? (success ? "Thiết bị xác nhận thực thi thành công." : "Thiết bị báo lỗi thực thi.")
                    : responseMessage,
                250));
            updateCmd.Parameters.AddWithValue("@maLenh", maLenh);

            await using var reader = await updateCmd.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
            {
                cmdInfo = new ExecutedCommandInfo(
                    maLenh,
                    await reader.IsDBNullAsync(0, ct) ? null : reader.GetString(0),
                    await reader.IsDBNullAsync(1, ct) ? null : reader.GetString(1),
                    await reader.IsDBNullAsync(2, ct) ? null : reader.GetString(2),
                    reader.GetString(3),
                    await reader.IsDBNullAsync(4, ct) ? null : reader.GetByte(4));
            }
        }

        if (cmdInfo is null)
        {
            await tx.RollbackAsync(ct);
            return false;
        }

        if (success)
        {
            await SyncExecutedDeviceStateAsync(conn, tx, cmdInfo, ct);
        }

        await tx.CommitAsync(ct);
        return true;
    }

    public async Task<int> TimeoutExpiredCommandsAsync(int timeoutSeconds, DateTime nowLocal, CancellationToken ct)
    {
        var cutoff = nowLocal.AddSeconds(-Math.Max(3, timeoutSeconds));

        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            UPDATE dbo.LenhDieuKhien
            SET trangThaiLenh = 4,
                thoiGianPhanHoi = @now,
                noiDungPhanHoi = @msg
            WHERE trangThaiLenh = 1
              AND thoiGianGui IS NOT NULL
              AND thoiGianGui <= @cutoff;
            """;
        cmd.Parameters.AddWithValue("@now", nowLocal);
        cmd.Parameters.AddWithValue("@cutoff", cutoff);
        cmd.Parameters.AddWithValue("@msg", $"Quá hạn phản hồi ACK từ thiết bị (>{timeoutSeconds}s).");
        return await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<long?> EnqueueCommandAsync(
        string? maTu,
        string? maTuyen,
        string? maDen,
        string hanhDong,
        byte? mucSang,
        byte nguonLenh,
        string? maNguoiDung,
        CancellationToken ct)
    {
        var normalizedAction = hanhDong.Trim().ToUpperInvariant();
        byte? effectiveDim = normalizedAction == "DIM"
            ? Math.Clamp(mucSang ?? (byte)100, (byte)0, (byte)100)
            : null; // Bắt buộc là NULL với lệnh BAT và TAT theo ràng buộc CK_Lenh_MucSang

        string? targetTu = null;
        string? targetTuyen = null;
        string? targetDen = null;

        if (!string.IsNullOrWhiteSpace(maDen))
        {
            targetDen = maDen.Trim();
        }
        else if (!string.IsNullOrWhiteSpace(maTuyen))
        {
            targetTuyen = maTuyen.Trim();
        }
        else if (!string.IsNullOrWhiteSpace(maTu))
        {
            targetTu = maTu.Trim();
        }

        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            DECLARE @resolvedUser CHAR(10) = @maNguoiDung;
            IF @nguonLenh = 1 AND (@resolvedUser IS NULL OR LTRIM(RTRIM(@resolvedUser)) = '')
            BEGIN
                SELECT TOP (1) @resolvedUser = maNguoiDung
                FROM dbo.NguoiDung
                WHERE daXoa = 0
                ORDER BY CASE WHEN maVaiTro = 1 THEN 0 ELSE 1 END, maNguoiDung ASC;
            END

            INSERT INTO dbo.LenhDieuKhien
                (maTu, maTuyen, maDen, hanhDong, mucSang, nguonLenh, trangThaiLenh, thoiGianTao, maNguoiDung)
            OUTPUT INSERTED.maLenh
            VALUES
                (@maTu, @maTuyen, @maDen, @hanhDong, @mucSang, @nguonLenh, 0, @now, @resolvedUser);
            """;
        cmd.Parameters.AddWithValue("@maTu", string.IsNullOrWhiteSpace(targetTu) ? DBNull.Value : targetTu);
        cmd.Parameters.AddWithValue("@maTuyen", string.IsNullOrWhiteSpace(targetTuyen) ? DBNull.Value : targetTuyen);
        cmd.Parameters.AddWithValue("@maDen", string.IsNullOrWhiteSpace(targetDen) ? DBNull.Value : targetDen);
        cmd.Parameters.AddWithValue("@hanhDong", normalizedAction);
        cmd.Parameters.AddWithValue("@mucSang", effectiveDim.HasValue ? effectiveDim.Value : DBNull.Value);
        cmd.Parameters.AddWithValue("@nguonLenh", nguonLenh);
        cmd.Parameters.AddWithValue("@now", DateTime.Now);
        cmd.Parameters.AddWithValue("@maNguoiDung", string.IsNullOrWhiteSpace(maNguoiDung) ? DBNull.Value : maNguoiDung.Trim());

        var obj = await cmd.ExecuteScalarAsync(ct);
        return obj is long id ? id : Convert.ToInt64(obj);
    }

    private static async Task SyncExecutedDeviceStateAsync(
        SqlConnection conn,
        SqlTransaction tx,
        ExecutedCommandInfo info,
        CancellationToken ct)
    {
        var dimValue = info.MucSang.HasValue ? Math.Clamp(info.MucSang.Value, (byte)0, (byte)100) : (byte)100;
        var turnOn = info.HanhDong == "BAT" || (info.HanhDong == "DIM" && dimValue > 0);
        var activeFlag = turnOn ? (byte)1 : (byte)2; // SQL Standard: 1 = Bat/Hoat dong, 2 = Tat/Dung

        if (!string.IsNullOrEmpty(info.MaTu))
        {
            await using var cmd = conn.CreateCommand();
            cmd.Transaction = tx;
            if (info.HanhDong == "BAT" || info.HanhDong == "TAT")
            {
                cmd.CommandText = """
                    UPDATE dbo.TuChieuSang
                    SET trangThaiNguon = @power
                    WHERE RTRIM(maTu) = @maTu AND daXoa = 0;

                    UPDATE dbo.TuyenChieuSang
                    SET trangThaiHoatDong = @active,
                        mucSangHienTai = CASE
                            WHEN @active = 2 THEN 0
                            WHEN ISNULL(mucSangHienTai, 0) = 0 THEN @dim
                            ELSE mucSangHienTai
                        END
                    WHERE RTRIM(maTu) = @maTu AND daXoa = 0;

                    UPDATE d
                    SET d.trangThaiHoatDong = @active,
                        d.doSang = CASE
                            WHEN @active = 2 THEN 0
                            WHEN ISNULL(d.doSang, 0) = 0 THEN @dim
                            ELSE d.doSang
                        END
                    FROM dbo.DiemDen d
                    INNER JOIN dbo.TuyenChieuSang ty ON d.maTuyen = ty.maTuyen
                    WHERE RTRIM(ty.maTu) = @maTu AND d.daXoa = 0 AND ty.daXoa = 0;
                    """;
                cmd.Parameters.AddWithValue("@power", info.HanhDong == "BAT" ? "ON" : "OFF");
                cmd.Parameters.AddWithValue("@active", activeFlag);
                cmd.Parameters.AddWithValue("@dim", dimValue);
                cmd.Parameters.AddWithValue("@maTu", info.MaTu);
            }
            else
            {
                cmd.CommandText = """
                    UPDATE dbo.TuyenChieuSang
                    SET trangThaiHoatDong = @active,
                        mucSangHienTai = @dim
                    WHERE RTRIM(maTu) = @maTu AND daXoa = 0;

                    UPDATE d
                    SET d.trangThaiHoatDong = @active,
                        d.doSang = @dim
                    FROM dbo.DiemDen d
                    INNER JOIN dbo.TuyenChieuSang ty ON d.maTuyen = ty.maTuyen
                    WHERE RTRIM(ty.maTu) = @maTu AND d.daXoa = 0 AND ty.daXoa = 0;
                    """;
                cmd.Parameters.AddWithValue("@active", activeFlag);
                cmd.Parameters.AddWithValue("@dim", dimValue);
                cmd.Parameters.AddWithValue("@maTu", info.MaTu);
            }

            await cmd.ExecuteNonQueryAsync(ct);
        }
        else if (!string.IsNullOrEmpty(info.MaTuyen))
        {
            await using var cmd = conn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = """
                UPDATE dbo.TuyenChieuSang
                SET trangThaiHoatDong = @active,
                    mucSangHienTai = @dim
                WHERE RTRIM(maTuyen) = @maTuyen AND daXoa = 0;

                UPDATE d
                SET d.trangThaiHoatDong = @active,
                    d.doSang = @dim
                FROM dbo.DiemDen d
                INNER JOIN dbo.TuyenChieuSang ty ON d.maTuyen = ty.maTuyen
                WHERE RTRIM(ty.maTuyen) = @maTuyen AND d.daXoa = 0 AND ty.daXoa = 0;
                """;
            cmd.Parameters.AddWithValue("@active", activeFlag);
            cmd.Parameters.AddWithValue("@dim", turnOn ? dimValue : (byte)0);
            cmd.Parameters.AddWithValue("@maTuyen", info.MaTuyen);
            await cmd.ExecuteNonQueryAsync(ct);
        }
        else if (!string.IsNullOrEmpty(info.MaDen))
        {
            await using var cmd = conn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = """
                UPDATE dbo.DiemDen
                SET trangThaiHoatDong = @active,
                    doSang = @dim
                WHERE RTRIM(maDen) = @maDen AND daXoa = 0;
                """;
            cmd.Parameters.AddWithValue("@active", activeFlag);
            cmd.Parameters.AddWithValue("@dim", turnOn ? dimValue : (byte)0);
            cmd.Parameters.AddWithValue("@maDen", info.MaDen);
            await cmd.ExecuteNonQueryAsync(ct);
        }
    }

    private static async Task EvaluateTelemetryAlertsAsync(
        SqlConnection conn,
        SqlTransaction tx,
        string cleanTu,
        TelemetryMessage telemetry,
        DateTime measuredAtLocal,
        CancellationToken ct)
    {
        if (telemetry.Tu is not null &&
            NormalizePowerState(telemetry.Tu.TrangThaiNguon) == "ON" &&
            (telemetry.Tu.DienApPha1 < 185m || telemetry.Tu.DienApPha2 < 185m || telemetry.Tu.DienApPha3 < 185m))
        {
            int? underVoltConfigId = null;
            await using (var cfgCmd = conn.CreateCommand())
            {
                cfgCmd.Transaction = tx;
                cfgCmd.CommandText = "SELECT TOP (1) maCauHinh FROM dbo.CauHinhCanhBao WHERE loaiCanhBao IN ('SUT_AP', 'DIEN_AP', 'CANH_BAO_DIEN') AND dangBat = 1 ORDER BY maCauHinh ASC;";
                var obj = await cfgCmd.ExecuteScalarAsync(ct);
                if (obj != null && obj != DBNull.Value) underVoltConfigId = Convert.ToInt32(obj);
            }

            await RaiseOpenAlertIfAbsentAsync(
                conn,
                tx,
                underVoltConfigId,
                2,
                cleanTu,
                null,
                null,
                $"Tủ {cleanTu} sụt áp bất thường (U={telemetry.Tu.DienApPha1:0.0}/{telemetry.Tu.DienApPha2:0.0}/{telemetry.Tu.DienApPha3:0.0}V)",
                measuredAtLocal,
                ct);
        }

        if (telemetry.Den.Count == 0) return;

        int? heatConfigId = null;
        decimal heatThreshold = 75m;
        byte heatSeverity = 3;

        await using (var cfgCmd = conn.CreateCommand())
        {
            cfgCmd.Transaction = tx;
            cfgCmd.CommandText = """
                SELECT TOP (1) maCauHinh, nguongGiaTri, mucDo
                FROM dbo.CauHinhCanhBao
                WHERE loaiCanhBao = 'QUA_NHIET' AND dangBat = 1
                ORDER BY maCauHinh ASC;
                """;
            await using var r = await cfgCmd.ExecuteReaderAsync(ct);
            if (!await r.ReadAsync(ct)) return;
            heatConfigId = r.GetInt32(0);
            heatThreshold = r.GetDecimal(1);
            heatSeverity = r.GetByte(2);
        }

        foreach (var den in telemetry.Den)
        {
            if (string.IsNullOrWhiteSpace(den.MaDen)) continue;
            if (den.NhietDoLed >= heatThreshold)
            {
                var cleanDen = den.MaDen.Trim();
                await RaiseOpenAlertIfAbsentAsync(
                    conn,
                    tx,
                    heatConfigId,
                    heatSeverity,
                    null,
                    null,
                    cleanDen,
                    $"Điểm đèn {cleanDen} quá nhiệt LED ({den.NhietDoLed:0.1}°C / Ngưỡng {heatThreshold:0.1}°C)",
                    measuredAtLocal,
                    ct);
            }
        }
    }

    private static async Task RaiseOpenAlertIfAbsentAsync(
        SqlConnection conn,
        SqlTransaction tx,
        int? maCauHinh,
        byte mucDo,
        string? maTu,
        string? maTuyen,
        string? maDen,
        string noiDung,
        DateTime occurredAtLocal,
        CancellationToken ct)
    {
        await using var cmd = conn.CreateCommand();
        cmd.Transaction = tx;
        cmd.CommandText = """
            IF NOT EXISTS (
                SELECT 1
                FROM dbo.CanhBao
                WHERE trangThaiXuLy IN (0, 1)
                  AND ((@maTu IS NOT NULL AND RTRIM(maTu) = @maTu)
                    OR (@maTuyen IS NOT NULL AND RTRIM(maTuyen) = @maTuyen)
                    OR (@maDen IS NOT NULL AND RTRIM(maDen) = @maDen))
                  AND ((@maCauHinh IS NOT NULL AND maCauHinh = @maCauHinh)
                    OR (@maCauHinh IS NULL AND maCauHinh IS NULL AND LEFT(noiDung, 20) = LEFT(@noiDung, 20)))
            )
            BEGIN
                DECLARE @exactTu CHAR(10) = NULL;
                DECLARE @exactTuyen CHAR(10) = NULL;
                DECLARE @exactDen CHAR(10) = NULL;

                IF @maDen IS NOT NULL
                    SELECT TOP (1) @exactDen = maDen FROM dbo.DiemDen WHERE RTRIM(maDen) = @maDen AND daXoa = 0;
                ELSE IF @maTuyen IS NOT NULL
                    SELECT TOP (1) @exactTuyen = maTuyen FROM dbo.TuyenChieuSang WHERE RTRIM(maTuyen) = @maTuyen AND daXoa = 0;
                ELSE IF @maTu IS NOT NULL
                    SELECT TOP (1) @exactTu = maTu FROM dbo.TuChieuSang WHERE RTRIM(maTu) = @maTu AND daXoa = 0;

                IF @exactTu IS NOT NULL OR @exactTuyen IS NOT NULL OR @exactDen IS NOT NULL
                BEGIN
                    INSERT INTO dbo.CanhBao (maCauHinh, maTu, maTuyen, maDen, noiDung, mucDo, trangThaiXuLy, thoiGianPhatSinh)
                    VALUES (@maCauHinh, @exactTu, @exactTuyen, @exactDen, @noiDung, @mucDo, 0, @ts);
                END
            END
            """;
        cmd.Parameters.AddWithValue("@maCauHinh", maCauHinh.HasValue ? maCauHinh.Value : DBNull.Value);
        cmd.Parameters.AddWithValue("@mucDo", Math.Clamp(mucDo, (byte)1, (byte)3));
        cmd.Parameters.AddWithValue("@maTu", string.IsNullOrWhiteSpace(maTu) ? DBNull.Value : maTu.Trim());
        cmd.Parameters.AddWithValue("@maTuyen", string.IsNullOrWhiteSpace(maTuyen) ? DBNull.Value : maTuyen.Trim());
        cmd.Parameters.AddWithValue("@maDen", string.IsNullOrWhiteSpace(maDen) ? DBNull.Value : maDen.Trim());
        cmd.Parameters.AddWithValue("@noiDung", TruncateText(noiDung, 250));
        cmd.Parameters.AddWithValue("@ts", occurredAtLocal);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    private static string NormalizePowerState(string? raw)
    {
        var upper = (raw ?? string.Empty).Trim().ToUpperInvariant();
        return upper is "ON" or "OFF" ? upper : "UNKNOWN";
    }

    private static decimal ClampDecimal(decimal value, decimal min, decimal max, int scale)
        => Math.Round(Math.Clamp(value, min, max), scale, MidpointRounding.AwayFromZero);

    private static void AddDecimalParam(SqlCommand cmd, string name, decimal value, byte precision, byte scale)
    {
        var p = cmd.Parameters.Add(name, SqlDbType.Decimal);
        p.Precision = precision;
        p.Scale = scale;
        p.Value = value;
    }

    private static string TruncateText(string value, int maxLength)
        => value.Length <= maxLength ? value : value[..maxLength];
}
