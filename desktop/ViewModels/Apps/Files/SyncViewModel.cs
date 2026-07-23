using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Files;

/// <summary>
/// Desktop C2 — a handler that blocks the Dispatcher thread. WPF serves the
/// rendered frame *and* every UI Automation callback from that one thread, so the
/// block freezes both channels for the same span: a screenshot returns a stale
/// frame and an a11y query hangs until the handler returns.
/// </summary>
public partial class SyncViewModel : FailureScreenViewModel
{
    public const string Defect = "B_UI_THREAD_BLOCKS_RENDER_AND_UIA";

    private const int WorkMilliseconds = 8000;

    [ObservableProperty]
    private string _statusMessage = "Last synced 3 hours ago.";

    [ObservableProperty]
    private bool _isSyncing;

    public SyncViewModel(INavigationService nav) : base(nav, Defect) { }

    [RelayCommand]
    private async Task SyncNow()
    {
        IsSyncing = true;
        StatusMessage = "Syncing…";

        if (FaultActive)
        {
            // FAULT: the long operation runs directly on the Dispatcher thread. No
            // await point is ever reached, so the message pump stops — rendering and
            // UI Automation both stall for the full duration.
            Thread.Sleep(WorkMilliseconds);
        }
        else
        {
            // Correct: the work is offloaded, the Dispatcher keeps pumping, and only
            // the final UI update is marshalled back.
            await Task.Run(() => Thread.Sleep(WorkMilliseconds));
        }

        IsSyncing = false;
        StatusMessage = "All files are up to date.";
    }
}
