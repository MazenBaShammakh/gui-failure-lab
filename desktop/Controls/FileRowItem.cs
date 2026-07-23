using desktop.Models;
using desktop.Services;
using System.Windows.Automation.Peers;
using System.Windows.Controls;

namespace desktop.Controls;

/// <summary>
/// A list row with a custom automation peer. Exists so the faulty variant can
/// reproduce a real WPF bug class: an AutomationPeer that answers from a value
/// captured when the container was first bound, rather than from the container's
/// live DataContext.
/// </summary>
public sealed class FileRowItem : ListBoxItem
{
    protected override AutomationPeer OnCreateAutomationPeer() => new FileRowItemAutomationPeer(this);
}

public sealed class FileRowItemAutomationPeer : ListBoxItemWrapperAutomationPeer
{
    private string? _cachedName;

    public FileRowItemAutomationPeer(FileRowItem owner) : base(owner) { }

    protected override string GetClassNameCore() => nameof(FileRowItem);

    protected override AutomationControlType GetAutomationControlTypeCore() => AutomationControlType.ListItem;

    protected override string GetNameCore()
    {
        var live = (Owner as FileRowItem)?.DataContext as FileRow;

        if (!FaultModeService.Instance.IsFaulty)
        {
            // Correct: read the current DataContext on every call, so a recycled
            // container always announces the row it is currently displaying.
            return live?.Name ?? base.GetNameCore();
        }

        // FAULT: the name is captured once, on the first query after this container
        // was created, and never recomputed. VirtualizingStackPanel recycles a fixed
        // pool of containers as the list scrolls and rebinds each one's DataContext
        // to new data — so once scrolling starts, a container that now *renders*
        // row 300 keeps *announcing* the row it was first bound to. The pixels are
        // right; only the automation name is stale.
        _cachedName ??= live?.Name ?? base.GetNameCore();
        return _cachedName;
    }
}
