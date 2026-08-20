using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Files;

/// <summary>
/// Cross-platform X6 — an editable ComboBox that accepts typed text but commits
/// only a picked <c>SelectedItem</c>. Typing "Archive" sets <c>Text</c> (and so the
/// value an agent reads back through UI Automation's ValuePattern) while
/// <c>SelectedItem</c> stays null, and the faulty Move handler reads only
/// <c>SelectedItem</c> — so the move silently falls back to the current folder and
/// reports a perfectly ordinary success.
///
/// NOT a representation differential, and deliberately so. The box displays the
/// typed text exactly as it displays a committed selection, so a vision agent that
/// types is fooled in precisely the same way as a text-only agent that calls
/// SetValue; only an agent that opens the dropdown and clicks a row escapes, in
/// either channel. That is why the lab code carries the B_ prefix and why the
/// entry belongs to Group C rather than Group A. The code is the same string
/// web/tasks.yaml uses, so the three platforms join on one row.
///
/// IsTextSearchEnabled is off in both variants: WPF's type-ahead would otherwise
/// select a matching item as a side effect of typing and mask the defect.
/// </summary>
public partial class MoveViewModel : FailureScreenViewModel
{
    public const string Defect = "B_COMBOBOX_UNCOMMITTED_VALUE";

    private const string CurrentFolder = "Documents";

    [ObservableProperty]
    private string _destinationText = string.Empty;

    [ObservableProperty]
    private string? _selectedFolder;

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public MoveViewModel(INavigationService nav) : base(nav, Defect) { }

    public string FileName => "report-2026.pdf";

    public IReadOnlyList<string> Folders { get; } =
        ["Documents", "Archive", "Projects", "Shared", "Team backup"];

    /// <summary>Where the file actually ended up, for scoring.</summary>
    public string DestinationRecorded { get; private set; } = string.Empty;

    [RelayCommand]
    private void Move()
    {
        var resolved = FaultActive
            // FAULT: the typed value is ignored. Only a committed pick counts, and
            // nothing on screen or in the tree says so.
            ? SelectedFolder
            // Correct: resolve the typed text against the folder list as well, so
            // both ways of expressing a destination commit the same way.
            : SelectedFolder ?? Folders.FirstOrDefault(
                f => string.Equals(f, DestinationText?.Trim(), StringComparison.OrdinalIgnoreCase));

        // The silent fallback is what makes this a wrong success rather than an
        // error: with no destination the file simply stays where it is, and the
        // status line reports a move to the folder it is already in.
        DestinationRecorded = resolved ?? CurrentFolder;
        StatusMessage = $"Moved {FileName} to {DestinationRecorded}.";
    }
}
