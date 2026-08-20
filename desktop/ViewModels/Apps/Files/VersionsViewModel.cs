using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Files;

public sealed record FileVersion(string ShortDate, string Timestamp, string Author, string Size)
{
    /// <summary>Distinct per row, so baseline has no name ambiguity to fall back on.</summary>
    public string RestoreLabel => $"Restore {ShortDate}";
}

/// <summary>
/// Desktop A8 — every Restore control is present, named, correctly typed and
/// invocable, and drawn plainly on screen; the faulty variant only drops them out
/// of UI Automation's Control view (see <see cref="Controls.ActionChip"/>).
///
/// A text-only agent enumerating the screen finds a version history it cannot act
/// on and concludes restoring is not offered here. A vision-only agent sees four
/// ordinary buttons. The give-away, visible to nobody but an inspector who walks
/// both views, is that the Raw view still holds all four nodes intact — which is
/// also what separates this from A1 (owner-drawn control with no provider at all)
/// and from the F-PRC-05 catch-all it currently maps onto.
///
/// Measured with a UI Automation client against a live window, searching for
/// "Restore 12 July":
///
///   baseline   FindAll=1  ControlViewWalk=1  RawViewWalk=1
///   faulty     FindAll=0  ControlViewWalk=0  RawViewWalk=1
///
/// Note the first column: AutomationElement.FindAll resolves against the Control
/// view, so the ordinary "find the element by name" call a harness makes returns
/// nothing while the node is sitting in the Raw view, named and invocable.
/// </summary>
public partial class VersionsViewModel : FailureScreenViewModel
{
    public const string Defect = "M_ELEMENT_ABSENT_FROM_CONTROL_VIEW";

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public VersionsViewModel(INavigationService nav) : base(nav, Defect) { }

    public string FileName => "Q3-forecast.xlsx";

    public IReadOnlyList<FileVersion> Versions { get; } =
    [
        new FileVersion("14 July", "2026-07-14 · 16:02", "Mara Whitfield", "412 KB"),
        new FileVersion("12 July", "2026-07-12 · 14:20", "Tomás Reyes", "408 KB"),
        new FileVersion("28 June", "2026-06-28 · 17:41", "Mara Whitfield", "396 KB"),
        new FileVersion("15 June", "2026-06-15 · 11:12", "Priya Nair", "381 KB"),
    ];

    /// <summary>Which version was restored, for scoring.</summary>
    public string RestoredVersion { get; private set; } = string.Empty;

    [RelayCommand]
    private void Restore(FileVersion? version)
    {
        if (version is null) return;

        RestoredVersion = version.ShortDate;
        StatusMessage = $"Restored the version from {version.ShortDate} ({version.Timestamp}).";
    }
}
