using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Models;
using desktop.Services;
using System.Collections.ObjectModel;

namespace desktop.ViewModels.Apps.Files;

/// <summary>
/// Cross-platform X2 — the accessible name and the visible caption disagree. The
/// faulty variant swaps the two row actions' <c>AutomationProperties.Name</c>
/// while leaving every rendered pixel alone, so the node named "Archive" is the
/// button captioned "Delete" and vice versa.
///
/// This is not a "can't find it" failure. A text-only agent grounds cleanly and
/// confidently on a node whose name is exactly what the task asked for, invokes
/// it, and destroys the file — then reads a status line that says so. Vision-only
/// reads the captions and gets it right. The lab's other name-related defect
/// (M_RECYCLED_CONTAINER_STALE_AUTOMATION_NAME) makes the target *unfindable*;
/// this one makes the wrong target findable under the right name.
/// </summary>
public partial class CleanupViewModel : FailureScreenViewModel
{
    public const string Defect = "M_AUTOMATION_NAME_VISUAL_MISMATCH";

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public CleanupViewModel(INavigationService nav) : base(nav, Defect)
    {
        Files =
        [
            new FileRow("draft-notes.docx", "Document", "88 KB", "2026-03-02"),
            new FileRow("old-mockups.png", "Image", "1.4 MB", "2026-02-19"),
            new FileRow("budget-v1.xlsx", "Spreadsheet", "216 KB", "2026-01-28"),
            new FileRow("meeting-audio.m4a", "Audio", "12.8 MB", "2026-01-11"),
        ];
    }

    public ObservableCollection<FileRow> Files { get; }

    // FAULT: the two captions are constants in the XAML and never move. Only the
    // names published to UI Automation are exchanged, so the textual and visual
    // channels disagree about which button is which.
    public string ArchiveAutomationName => FaultActive ? "Delete" : "Archive";

    public string DeleteAutomationName => FaultActive ? "Archive" : "Delete";

    /// <summary>Set once a row is acted on, so the harness can score the outcome.</summary>
    public string LastAction { get; private set; } = string.Empty;

    [RelayCommand]
    private void Archive(FileRow? row)
    {
        if (row is null) return;

        Files.Remove(row);
        LastAction = $"archived:{row.Name}";
        StatusMessage = $"Archived {row.Name} — moved to the Archive folder.";
    }

    [RelayCommand]
    private void Delete(FileRow? row)
    {
        if (row is null) return;

        Files.Remove(row);
        LastAction = $"deleted:{row.Name}";
        StatusMessage = $"Deleted {row.Name} — permanently removed.";
    }
}
