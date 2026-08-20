using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Models;
using desktop.Services;

namespace desktop.ViewModels.Apps.Files;

/// <summary>
/// Desktop A2 — a long virtualized list whose recycled containers report a stale
/// accessible name. The list is deliberately long enough that container recycling
/// is unavoidable before the target row is reached.
/// </summary>
public partial class FileLibraryViewModel : FailureScreenViewModel
{
    public const string Defect = "M_RECYCLED_CONTAINER_STALE_AUTOMATION_NAME";

    private static readonly string[] Kinds = ["Spreadsheet", "Document", "Presentation", "PDF", "Image"];

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    [ObservableProperty]
    private FileRow? _selectedFile;

    public FileLibraryViewModel(INavigationService nav) : base(nav, Defect)
    {
        Files = BuildFiles();
    }

    public IReadOnlyList<FileRow> Files { get; }

    [RelayCommand]
    private void Open(FileRow? row)
    {
        if (row is null) return;
        StatusMessage = $"Opened {row.Name}";
    }

    private static List<FileRow> BuildFiles()
    {
        var rows = new List<FileRow>(120);
        var rng = new Random(20260722);

        for (var i = 1; i <= 120; i++)
        {
            var kind = Kinds[i % Kinds.Length];
            var ext = kind switch
            {
                "Spreadsheet" => "xlsx",
                "Document" => "docx",
                "Presentation" => "pptx",
                "PDF" => "pdf",
                _ => "png",
            };

            rows.Add(new FileRow(
                $"report-{i:D3}.{ext}",
                kind,
                $"{rng.Next(12, 980)} KB",
                $"2026-{rng.Next(1, 8):D2}-{rng.Next(1, 29):D2}"));
        }

        // The task target, far enough down that the list must be scrolled — and
        // therefore its containers recycled — before it can be reached. About 18
        // rows fit the viewport, so reaching row 85 costs roughly four screenfuls
        // and every container in the pool has been rebound several times over.
        rows[84] = new FileRow("Q3-forecast.xlsx", "Spreadsheet", "412 KB", "2026-07-14");

        return rows;
    }
}
