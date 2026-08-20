using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Notes;

/// <summary>
/// Desktop A11 — the step the task needs happens in a second top-level window.
///
/// A new <c>Window</c> parents to the desktop root, never to the window that opened
/// it, so a harness that roots its query at the application's main window simply
/// does not contain it. The faulty variant opens the preferences card that way; the
/// baseline hosts the identical card as an in-window overlay, inside the same tree
/// the agent is already reading.
///
/// The faulty window is sized and positioned to cover the main window exactly and
/// carries the same scrim, so the two conditions are pixel-comparable and a
/// vision-only agent completes both. Note the remediation is "host the step in the
/// same window", not "set Window.Owner": an owned window is still a separate
/// top-level element under the desktop root, so ownership does not put it in the
/// main window's subtree.
///
/// Web files this same taxonomy type (F-NAV-02) as a both-channels failure, because
/// a background browser tab is not on screen either. On desktop the second window is
/// rendered in plain sight, so only the textual channel fails — the same type, a
/// different differential, driven purely by platform.
/// </summary>
public partial class PreferencesViewModel : FailureScreenViewModel
{
    public const string Defect = "M_UNOWNED_WINDOW_OUTSIDE_TREE";

    [ObservableProperty]
    private bool _autosaveEnabled;

    [ObservableProperty]
    private bool _isPanelOpen;

    [ObservableProperty]
    private string _statusMessage = "Autosave is off.";

    public PreferencesViewModel(INavigationService nav) : base(nav, Defect) { }

    /// <summary>Baseline only: the card lives in this window's own visual tree.</summary>
    public bool ShowInlinePanel => IsPanelOpen && !FaultActive;

    partial void OnIsPanelOpenChanged(bool value) => OnPropertyChanged(nameof(ShowInlinePanel));

    partial void OnAutosaveEnabledChanged(bool value)
        => StatusMessage = value ? "Autosave is on." : "Autosave is off.";

    [RelayCommand]
    private void OpenPreferences() => IsPanelOpen = true;

    [RelayCommand]
    private void ClosePreferences() => IsPanelOpen = false;
}
