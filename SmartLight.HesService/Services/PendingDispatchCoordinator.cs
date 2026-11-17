using System.Collections.Concurrent;

namespace SmartLight.HesService.Services;

/// <summary>
/// Prevents an ultra-fast loopback ACK from updating LenhDieuKhien before the
/// dispatcher transaction finishes committing trangThaiLenh = 1.
/// </summary>
public sealed class PendingDispatchCoordinator
{
    private readonly ConcurrentDictionary<long, TaskCompletionSource<bool>> _inflight = new();

    public void BeginDispatch(long maLenh)
    {
        _inflight[maLenh] = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    }

    public void CompleteDispatch(long maLenh)
    {
        if (_inflight.TryRemove(maLenh, out var tcs))
        {
            tcs.TrySetResult(true);
        }
    }

    public async Task WaitIfDispatchingAsync(long maLenh, CancellationToken ct)
    {
        if (!_inflight.TryGetValue(maLenh, out var tcs)) return;

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(5));
        await tcs.Task.WaitAsync(timeoutCts.Token);
    }
}

