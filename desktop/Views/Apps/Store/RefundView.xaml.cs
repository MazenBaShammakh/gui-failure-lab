using desktop.ViewModels.Apps.Store;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;

namespace desktop.Views.Apps.Store;

/// <summary>
/// Raises the verification dialog when the screen opens, and again whenever the
/// Verify identity prompt asks for it. The dialog itself is identical in both
/// conditions — what differs is whether the owner's content is disabled for its
/// lifetime, and therefore whether UI Automation reports the blocked controls as
/// blocked.
/// </summary>
public partial class RefundView : UserControl
{
    private RefundViewModel? _model;
    private bool _openedOnce;

    public RefundView()
    {
        InitializeComponent();
        Loaded += OnLoaded;
        Unloaded += OnUnloaded;
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        if (DataContext is not RefundViewModel model || _openedOnce) return;

        _openedOnce = true;
        _model = model;
        _model.VerificationRequested += ShowVerifyDialog;

        // Deferred so the screen finishes its first layout pass before the nested
        // message loop of ShowDialog starts.
        Dispatcher.BeginInvoke(ShowVerifyDialog, DispatcherPriority.Loaded);
    }

    private void OnUnloaded(object sender, RoutedEventArgs e)
    {
        if (_model is not null) _model.VerificationRequested -= ShowVerifyDialog;
        _model = null;
    }

    private void ShowVerifyDialog()
    {
        if (_model is null) return;

        // Correct: mirror the Win32 input block into the property UI Automation
        // actually reads. FAULT: skip it, and the tree keeps advertising every
        // control on the blocked window as enabled and invocable.
        if (!_model.FaultActive) _model.ContentEnabled = false;

        // Keeps the refund action on screen for exactly the dialog's lifetime, so
        // the bypass has something to reach and dismissing has something to withdraw.
        _model.IsDialogOpen = true;

        try
        {
            new RefundVerifyWindow
            {
                DataContext = _model,
                Owner = Window.GetWindow(this),
            }.ShowDialog();
        }
        finally
        {
            _model.IsDialogOpen = false;
            _model.ContentEnabled = true;
        }
    }
}
