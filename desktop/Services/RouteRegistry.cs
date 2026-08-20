using desktop.ViewModels;
using desktop.ViewModels.Apps.Files;
using desktop.ViewModels.Apps.Notes;
using desktop.ViewModels.Apps.Store;

namespace desktop.Services;

/// <summary>
/// route string -> view-model factory. This is the desktop counterpart of web's
/// lib/failure-pages.ts dispatch table, except the keys are in-app routes across
/// several simulated applications rather than one route per failure: the agent is
/// launched onto the springboard ("/") and must navigate in, so window state,
/// menus and tabs — the things the desktop hypotheses are actually about — exist
/// as real app context rather than being deep-linked past.
/// </summary>
public static class RouteRegistry
{
    public const string Springboard = "/";

    private static readonly Dictionary<string, Func<INavigationService, object>> Map = new()
    {
        [Springboard] = nav => new SpringboardViewModel(nav),
        ["/settings"] = nav => new SettingsViewModel(nav),

        // Store
        ["/store/home"] = nav => new StoreHubViewModel(nav),
        ["/store/checkout"] = nav => new CheckoutViewModel(nav),
        ["/store/shipping"] = nav => new ShippingViewModel(nav),
        ["/store/refund"] = nav => new RefundViewModel(nav),

        // Files
        ["/files/home"] = nav => new FilesHubViewModel(nav),
        ["/files/library"] = nav => new FileLibraryViewModel(nav),
        ["/files/sync"] = nav => new SyncViewModel(nav),
        ["/files/cleanup"] = nav => new CleanupViewModel(nav),
        ["/files/move"] = nav => new MoveViewModel(nav),
        ["/files/versions"] = nav => new VersionsViewModel(nav),

        // Notes
        ["/notes/home"] = nav => new NotesHubViewModel(nav),
        ["/notes/editor"] = nav => new NoteEditorViewModel(nav),
        ["/notes/format"] = nav => new FormatToolbarViewModel(nav),
        ["/notes/preferences"] = nav => new PreferencesViewModel(nav),
    };

    public static bool Exists(string route) => Map.ContainsKey(route);

    public static object Create(string route, INavigationService nav)
        => Map.TryGetValue(route, out var factory)
            ? factory(nav)
            : throw new ArgumentException($"Unknown route '{route}'.", nameof(route));
}
