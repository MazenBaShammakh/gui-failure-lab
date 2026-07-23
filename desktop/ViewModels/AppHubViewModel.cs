using desktop.Services;

namespace desktop.ViewModels;

public sealed record HubEntry(string Title, string Route, string Summary);

/// <summary>
/// The desktop counterpart of mobile's AppHub: a plain, fault-free directory
/// screen for one app. It carries no defect and never reads the fault mode, so an
/// app whose real landing screen is the failure under test still has somewhere
/// safe to host its navigation.
/// </summary>
public abstract class AppHubViewModel : ScreenViewModel
{
    protected AppHubViewModel(INavigationService nav, string appName, IReadOnlyList<HubEntry> entries)
        : base(nav)
    {
        AppName = appName;
        Entries = entries;
    }

    public string AppName { get; }

    public IReadOnlyList<HubEntry> Entries { get; }
}
