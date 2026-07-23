using desktop.Services;
using System.Windows.Automation.Peers;
using System.Windows.Controls;

namespace desktop.Controls;

/// <summary>
/// The root of a custom-drawn dropdown hosted in a <see cref="System.Windows.Controls.Primitives.Popup"/>
/// — i.e. its own transient, borderless top-level window. In the faulty variant it
/// is never registered as an accessible menu: the popup shows up in the tree as an
/// unlabeled node of unknown role with no item children, even though it is drawn
/// on screen with perfectly legible items.
/// </summary>
public sealed class MenuSurface : ContentControl
{
    public string MenuName { get; set; } = "Menu";

    protected override AutomationPeer OnCreateAutomationPeer() => new MenuSurfaceAutomationPeer(this);
}

public sealed class MenuSurfaceAutomationPeer : FrameworkElementAutomationPeer
{
    public MenuSurfaceAutomationPeer(MenuSurface owner) : base(owner) { }

    private static bool Faulty => FaultModeService.Instance.IsFaulty;

    private MenuSurface Surface => (MenuSurface)Owner;

    protected override string GetClassNameCore() => nameof(MenuSurface);

    // Correct: announce the popup as a menu so a client enumerating the newly
    // opened surface recognises what it is. Faulty: no role is ever registered.
    protected override AutomationControlType GetAutomationControlTypeCore()
        => Faulty ? AutomationControlType.Custom : AutomationControlType.Menu;

    protected override string GetNameCore()
        => Faulty ? string.Empty : Surface.MenuName;

    // FAULT: the popup's item children are never linked into the tree, so a
    // text-only client that does discover the node finds it empty and unusable.
    protected override List<AutomationPeer> GetChildrenCore()
        => Faulty ? [] : base.GetChildrenCore();
}
