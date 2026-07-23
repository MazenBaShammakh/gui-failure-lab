using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Notes;

/// <summary>
/// Desktop B5 — a dense icon-only toolbar whose buttons are disambiguated only by
/// their hover tooltip. The accessible name is present and correct in both
/// variants, so the textual channel is unaffected; the faulty variant strips the
/// visible captions and leaves a row of near-identical glyphs, which is all a
/// screenshot has to go on.
/// </summary>
public partial class FormatToolbarViewModel : FailureScreenViewModel
{
    public const string Defect = "V_ICON_ONLY_TOOLBAR_TOOLTIP_ONLY";

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public FormatToolbarViewModel(INavigationService nav) : base(nav, Defect) { }

    /// <summary>Visible captions are dropped in the faulty variant only.</summary>
    public bool ShowCaptions => !FaultActive;

    [RelayCommand]
    private void Apply(string? action) => StatusMessage = $"Applied: {action}";
}
