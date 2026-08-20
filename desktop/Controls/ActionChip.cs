using desktop.Services;
using System.Windows;
using System.Windows.Automation.Peers;
using System.Windows.Automation.Provider;
using System.Windows.Controls;
using System.Windows.Input;

namespace desktop.Controls;

/// <summary>
/// A small custom action control, used to reproduce desktop A8: an element that is
/// simultaneously present and absent depending on which UI Automation view the
/// client walks.
///
/// UI Automation exposes three views of the same tree — Raw, Control and Content.
/// <c>IsControlElementCore() =&gt; false</c> is a normal decluttering idiom for
/// genuinely decorative visuals, and it removes the node from the Control view that
/// <c>TreeWalker.ControlViewWalker</c> and <c>FindFirst</c>/<c>FindAll</c> use by
/// default, while leaving it fully intact in the Raw view and fully painted on
/// screen. Applied to something interactive, an agent enumerating "the controls on
/// this screen" concludes no restore action exists. There is no web or mobile
/// analogue: neither the DOM nor a native mobile a11y tree is partitioned into
/// views this way.
/// </summary>
public sealed class ActionChip : ContentControl
{
    public static readonly DependencyProperty LabelProperty =
        DependencyProperty.Register(nameof(Label), typeof(string), typeof(ActionChip),
            new PropertyMetadata(string.Empty));

    public static readonly DependencyProperty CommandProperty =
        DependencyProperty.Register(nameof(Command), typeof(ICommand), typeof(ActionChip),
            new PropertyMetadata(null));

    public static readonly DependencyProperty CommandParameterProperty =
        DependencyProperty.Register(nameof(CommandParameter), typeof(object), typeof(ActionChip),
            new PropertyMetadata(null));

    public ActionChip()
    {
        Cursor = Cursors.Hand;
        Focusable = true;
    }

    /// <summary>The accessible name, and the visible caption. Correct in both variants.</summary>
    public string Label
    {
        get => (string)GetValue(LabelProperty);
        set => SetValue(LabelProperty, value);
    }

    public ICommand? Command
    {
        get => (ICommand?)GetValue(CommandProperty);
        set => SetValue(CommandProperty, value);
    }

    public object? CommandParameter
    {
        get => GetValue(CommandParameterProperty);
        set => SetValue(CommandParameterProperty, value);
    }

    /// <summary>Pointer input is untouched by the fault, so vision-only always works.</summary>
    protected override void OnMouseLeftButtonUp(MouseButtonEventArgs e)
    {
        base.OnMouseLeftButtonUp(e);
        Execute();
    }

    internal void Execute()
    {
        if (Command?.CanExecute(CommandParameter) == true)
            Command.Execute(CommandParameter);
    }

    protected override AutomationPeer OnCreateAutomationPeer() => new ActionChipAutomationPeer(this);
}

public sealed class ActionChipAutomationPeer : FrameworkElementAutomationPeer, IInvokeProvider
{
    public ActionChipAutomationPeer(ActionChip owner) : base(owner) { }

    private static bool Faulty => FaultModeService.Instance.IsFaulty;

    private ActionChip Chip => (ActionChip)Owner;

    protected override string GetClassNameCore() => nameof(ActionChip);

    // Name, role and the Invoke pattern are correct and identical in both variants:
    // nothing is missing from this node, and it is reachable and invocable through
    // the Raw view either way.
    protected override string GetNameCore() => Chip.Label;

    protected override AutomationControlType GetAutomationControlTypeCore() => AutomationControlType.Button;

    // Suppressed in BOTH variants, so the template's internal TextBlock can never
    // leak the caption back into the tree. This keeps control-view membership the
    // single difference between the two conditions.
    protected override List<AutomationPeer> GetChildrenCore() => [];

    // FAULT: the node drops out of the Control view. A client walking the Control
    // view (the default for FindFirst/FindAll) never sees it; a client walking the
    // Raw view sees it complete, named and invocable.
    protected override bool IsControlElementCore() => !Faulty;

    public override object? GetPattern(PatternInterface patternInterface)
        => patternInterface == PatternInterface.Invoke ? this : base.GetPattern(patternInterface);

    public void Invoke() => Chip.Execute();
}
