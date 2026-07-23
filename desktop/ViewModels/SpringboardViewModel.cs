using desktop.Services;

namespace desktop.ViewModels;

public sealed record AppTile(string Name, string Glyph, string Route, string Tint, string Summary);

/// <summary>
/// The desktop shell every task starts on: a launcher of simulated applications.
/// Apps whose landing screen is itself a failure surface point at a fault-free
/// "/&lt;app&gt;/home" hub instead, so navigation chrome never has to live on — and
/// pollute the accessibility tree of — the screen under test.
/// </summary>
public partial class SpringboardViewModel : ScreenViewModel
{
    public SpringboardViewModel(INavigationService nav) : base(nav) { }

    public IReadOnlyList<AppTile> Apps { get; } =
    [
        new("Files", "\U0001F4C1", "/files/home", "#E8F1FB", "Browse and sync your documents"),
        new("Notes", "\U0001F4DD", "/notes/home", "#FFF6E5", "Write and format notes"),
        new("Store", "\U0001F6CD", "/store/home", "#EAF7EE", "Orders and checkout"),
    ];
}
