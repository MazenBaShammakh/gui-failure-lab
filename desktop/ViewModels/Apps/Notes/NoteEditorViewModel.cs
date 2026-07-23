using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Notes;

/// <summary>
/// Desktop A4 — the File menu opens as a transient popup window that the faulty
/// variant never registers as an accessible menu (see <see cref="Controls.MenuSurface"/>).
/// </summary>
public partial class NoteEditorViewModel : FailureScreenViewModel
{
    public const string Defect = "M_MENU_POPUP_OUTSIDE_A11Y_TREE";

    [ObservableProperty]
    private bool _isFileMenuOpen;

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    [ObservableProperty]
    private string _noteBody =
        "Q3 planning\n\n" +
        "Headcount is flat through September. The infrastructure migration slips to\n" +
        "October unless the storage budget clears review this week.\n\n" +
        "Open questions:\n" +
        "  · who signs off on the vendor contract\n" +
        "  · whether the London office is in scope for phase two";

    public NoteEditorViewModel(INavigationService nav) : base(nav, Defect) { }

    [RelayCommand]
    private void ToggleFileMenu() => IsFileMenuOpen = !IsFileMenuOpen;

    [RelayCommand]
    private void ExportPdf()
    {
        IsFileMenuOpen = false;
        StatusMessage = "Exported “Q3 planning” to PDF.";
    }

    [RelayCommand]
    private void SaveNote()
    {
        IsFileMenuOpen = false;
        StatusMessage = "Note saved.";
    }

    [RelayCommand]
    private void PrintNote()
    {
        IsFileMenuOpen = false;
        StatusMessage = "Sent “Q3 planning” to the default printer.";
    }
}
