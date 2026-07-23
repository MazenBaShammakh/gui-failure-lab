using CommunityToolkit.Mvvm.ComponentModel;
using System.IO;

namespace desktop.Services;

/// <summary>
/// The global baseline/faulty switch, mirroring mobile's FaultModeProvider.
/// One condition per app session, flipped from the Settings screen so an agent
/// navigates the app like a real user and never has to know the mode exists.
///
/// The value is persisted to disk so the harness can pre-seed a condition before
/// launch instead of driving the Settings screen through the UI — the desktop
/// equivalent of pre-seeding localStorage['gui-lab:mode'] on mobile.
/// </summary>
public sealed partial class FaultModeService : ObservableObject
{
    // A computed property rather than a static field: a static field would be
    // initialised after Instance (declaration order), leaving the constructor to
    // probe a null path and silently fall back to baseline.
    public static string StatePath { get; } = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "gui-failure-lab",
        "mode.txt");

    public static FaultModeService Instance { get; } = new();

    [ObservableProperty]
    private bool _isFaulty;

    private FaultModeService()
    {
        try
        {
            if (File.Exists(StatePath))
                _isFaulty = File.ReadAllText(StatePath).Trim() == "faulty";
        }
        catch (IOException)
        {
            // Unreadable state file just means the default (baseline) applies.
        }
    }

    partial void OnIsFaultyChanged(bool value)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(StatePath)!);
            File.WriteAllText(StatePath, value ? "faulty" : "baseline");
        }
        catch (IOException)
        {
        }
    }

    /// <summary>
    /// The ground-truth tag the harness scrapes, exposed as an AutomationId on the
    /// defective screen's root — the WPF counterpart of web's hidden DefectMarker
    /// comment and mobile's testID="defect:&lt;CODE&gt;". Null in baseline, so the
    /// marker never appears in the fault-free variant.
    /// </summary>
    public string? Marker(string defectCode) => IsFaulty ? $"defect:{defectCode}" : null;
}
