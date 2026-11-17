using SmartLight.HesService.Options;

namespace SmartLight.HesService.Services;

public sealed record HesFrameEntry(
    long Seq,
    DateTime TimestampUtc,
    string TimestampLocalText,
    string Direction,
    string FrameType,
    string MaTu,
    string MaThietBi,
    string RemoteEndPoint,
    string Summary,
    string RawJson,
    int Bytes);

public sealed record HesTrafficSnapshot(
    long LatestSeq,
    int Capacity,
    int BufferedCount,
    long TotalTxFrames,
    long TotalRxFrames,
    long TotalDroppedFrames,
    long TotalCommandSent,
    long TotalCommandSuccess,
    long TotalCommandFailed,
    long TotalCommandTimeout,
    double RxPerSec,
    double TxPerSec,
    double BytesPerSec);

/// <summary>
/// Thread-safe fixed-capacity RAM ring buffer for raw TX/RX HES protocol frames.
/// Avoids bloating SQL Server while powering live SCADA packet inspection.
/// </summary>
public sealed class RuntimeFrameBuffer
{
    private readonly object _sync = new();
    private readonly HesServiceOptions _options;
    private readonly Queue<HesFrameEntry> _ring = new();
    private readonly Queue<(DateTime AtUtc, bool IsTx, int Bytes)> _rateWindow = new();

    private long _nextSeq;
    private long _totalTxFrames;
    private long _totalRxFrames;
    private long _totalDroppedFrames;
    private long _totalCommandSent;
    private long _totalCommandSuccess;
    private long _totalCommandFailed;
    private long _totalCommandTimeout;

    public RuntimeFrameBuffer(HesServiceOptions options)
    {
        _options = options;
    }

    public HesFrameEntry Record(
        string direction,
        string frameType,
        string maTu,
        string maThietBi,
        string remoteEndPoint,
        string summary,
        string rawJson)
    {
        var nowUtc = DateTime.UtcNow;
        var nowLocal = nowUtc.ToLocalTime();
        var bytes = System.Text.Encoding.UTF8.GetByteCount(rawJson) + 1;
        var isTx = string.Equals(direction, "TX", StringComparison.OrdinalIgnoreCase);

        lock (_sync)
        {
            var seq = ++_nextSeq;
            var entry = new HesFrameEntry(
                seq,
                nowUtc,
                nowLocal.ToString("HH:mm:ss.fff"),
                isTx ? "TX" : "RX",
                frameType,
                maTu,
                maThietBi,
                remoteEndPoint,
                summary,
                rawJson,
                bytes);

            var capacity = _options.RingBufferCapacity;
            while (_ring.Count >= capacity)
            {
                _ring.Dequeue();
                _totalDroppedFrames++;
            }

            _ring.Enqueue(entry);
            if (isTx) _totalTxFrames++;
            else _totalRxFrames++;

            _rateWindow.Enqueue((nowUtc, isTx, bytes));
            PruneRateWindowLocked(nowUtc);

            return entry;
        }
    }

    public void IncrementCommandSent() => Interlocked.Increment(ref _totalCommandSent);
    public void IncrementCommandSuccess() => Interlocked.Increment(ref _totalCommandSuccess);
    public void IncrementCommandFailed() => Interlocked.Increment(ref _totalCommandFailed);
    public void IncrementCommandTimeout(int count = 1)
    {
        if (count > 0) Interlocked.Add(ref _totalCommandTimeout, count);
    }

    public IReadOnlyList<HesFrameEntry> Query(
        int limit = 200,
        string? direction = null,
        string? frameType = null,
        string? maTu = null,
        long? afterSeq = null)
    {
        limit = Math.Clamp(limit, 1, 2000);
        var dirFilter = NormalizeFilter(direction);
        var typeFilter = NormalizeFilter(frameType);
        var tuFilter = string.IsNullOrWhiteSpace(maTu) ? null : maTu.Trim();

        lock (_sync)
        {
            IEnumerable<HesFrameEntry> query = _ring;

            if (afterSeq is > 0)
            {
                query = query.Where(f => f.Seq > afterSeq.Value);
            }

            if (dirFilter is not null)
            {
                query = query.Where(f => string.Equals(f.Direction, dirFilter, StringComparison.OrdinalIgnoreCase));
            }

            if (typeFilter is not null)
            {
                query = query.Where(f => string.Equals(f.FrameType, typeFilter, StringComparison.OrdinalIgnoreCase));
            }

            if (tuFilter is not null)
            {
                query = query.Where(f =>
                    string.Equals(f.MaTu, tuFilter, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(f.MaThietBi, tuFilter, StringComparison.OrdinalIgnoreCase));
            }

            return query.TakeLast(limit).Reverse().ToList();
        }
    }

    public void Clear()
    {
        lock (_sync)
        {
            _ring.Clear();
            _rateWindow.Clear();
        }
    }

    public HesTrafficSnapshot GetSnapshot()
    {
        var nowUtc = DateTime.UtcNow;
        lock (_sync)
        {
            PruneRateWindowLocked(nowUtc);

            var rxCount = 0;
            var txCount = 0;
            long byteSum = 0;
            foreach (var sample in _rateWindow)
            {
                if (sample.IsTx) txCount++;
                else rxCount++;
                byteSum += sample.Bytes;
            }

            const double windowSec = 10.0;
            return new HesTrafficSnapshot(
                _nextSeq,
                _options.RingBufferCapacity,
                _ring.Count,
                _totalTxFrames,
                _totalRxFrames,
                _totalDroppedFrames,
                Interlocked.Read(ref _totalCommandSent),
                Interlocked.Read(ref _totalCommandSuccess),
                Interlocked.Read(ref _totalCommandFailed),
                Interlocked.Read(ref _totalCommandTimeout),
                Math.Round(rxCount / windowSec, 2),
                Math.Round(txCount / windowSec, 2),
                Math.Round(byteSum / windowSec, 1));
        }
    }

    private void PruneRateWindowLocked(DateTime nowUtc)
    {
        var cutoff = nowUtc.AddSeconds(-10);
        while (_rateWindow.Count > 0 && _rateWindow.Peek().AtUtc < cutoff)
        {
            _rateWindow.Dequeue();
        }
    }

    private static string? NormalizeFilter(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        return string.Equals(trimmed, "ALL", StringComparison.OrdinalIgnoreCase) ? null : trimmed;
    }
}

