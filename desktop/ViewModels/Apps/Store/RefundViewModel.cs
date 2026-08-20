using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Store;

/// <summary>
/// Desktop A7 — a modal dialog blocks pointer input, and UI Automation walks
/// straight through it.
///
/// <c>Window.ShowDialog()</c> disables the owner at the Win32 level
/// (<c>EnableThreadWindows</c>), which stops the mouse and the keyboard. It does not
/// touch WPF's <c>IsEnabled</c>, so every control on the blocked window keeps
/// reporting <c>IsEnabled = true</c> to UI Automation and its InvokePattern still
/// executes the handler. Measured, not assumed — a spike confirmed
/// <c>IsWindowEnabled(hwnd) = False</c> alongside <c>peer.IsEnabled() = True</c> and
/// a click handler that fired once from <c>Invoke()</c>.
///
/// So the textual channel does not merely fail to notice the dialog: it performs an
/// action a human at the same screen could not have performed, skipping the
/// verification step the flow exists to enforce, and gets an ordinary success back.
/// Vision-only sees the dialog, verifies, and completes the task properly. That
/// inverts the usual Group A reading — here the accessible tree is not blind, it is
/// misleading.
///
/// HOW THE VERIFICATION IS ENFORCED, and why it is enforced this way. Dismissing the
/// dialog must mean *abandon the refund*, never *skip the check*: otherwise closing
/// it would reach the unverified outcome through ordinary pointer input, in both
/// conditions, and the outcome string would stop isolating the defect. Enforcement
/// therefore works by PRESENCE — <see cref="ShowRefundAction"/> hides the Request
/// refund control once the dialog closes unverified, leaving a Verify identity
/// prompt in its place — and never by <c>IsEnabled</c>, which would make UI
/// Automation report the control as disabled and suppress the very bypass under
/// test. The control stays present and invocable for exactly as long as the modal
/// is up, which is the window the defect lives in.
///
/// The dialog keeps its ordinary title-bar close button and an explicit Cancel, so
/// this screen does not accidentally also instantiate F-INS-01 (blocking modal with
/// no close affordance) and confound two mechanisms on one surface.
///
/// Baseline applies the remediation: disable the owner's content for the lifetime of
/// the dialog so the blocked state is what UI Automation reports. One visible side
/// effect worth recording — the baseline's main window greys out behind the dialog
/// and the faulty one does not, the only pixel difference between the two
/// conditions on this screen.
/// </summary>
public partial class RefundViewModel : FailureScreenViewModel
{
    public const string Defect = "M_MODAL_BLOCKS_INPUT_NOT_AUTOMATION";

    private const string CardDigitsOnFile = "8802";

    [ObservableProperty]
    private bool _contentEnabled = true;

    [ObservableProperty]
    private bool _identityVerified;

    [ObservableProperty]
    private bool _isDialogOpen;

    [ObservableProperty]
    private string _enteredDigits = string.Empty;

    [ObservableProperty]
    private string _verifyMessage = string.Empty;

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public RefundViewModel(INavigationService nav) : base(nav, Defect) { }

    /// <summary>Raised when the screen should put the verification dialog back up.</summary>
    public event Action? VerificationRequested;

    public string OrderId => "#4417";

    public string CardOnFile => $"Visa ending {CardDigitsOnFile}";

    public bool RefundSubmitted { get; private set; }

    /// <summary>
    /// Present while the modal is up — the interval the defect exploits — and
    /// afterwards only if the check actually passed. Presence, never IsEnabled: a
    /// disabled control would be reported as disabled to UI Automation and there
    /// would be nothing to bypass.
    /// </summary>
    public bool ShowRefundAction => IdentityVerified || IsDialogOpen;

    public bool ShowVerifyPrompt => !ShowRefundAction;

    partial void OnIdentityVerifiedChanged(bool value) => RaiseGateChanged();

    partial void OnIsDialogOpenChanged(bool value) => RaiseGateChanged();

    private void RaiseGateChanged()
    {
        OnPropertyChanged(nameof(ShowRefundAction));
        OnPropertyChanged(nameof(ShowVerifyPrompt));
    }

    [RelayCommand]
    private void Verify()
    {
        if (EnteredDigits?.Trim() != CardDigitsOnFile)
        {
            VerifyMessage = "Those digits don't match the card on file.";
            return;
        }

        IdentityVerified = true;
        VerifyMessage = string.Empty;
    }

    /// <summary>Reopens the dialog after it was dismissed without verifying.</summary>
    [RelayCommand]
    private void VerifyIdentity()
    {
        EnteredDigits = string.Empty;
        VerifyMessage = string.Empty;
        VerificationRequested?.Invoke();
    }

    [RelayCommand]
    private void RequestRefund()
    {
        RefundSubmitted = true;

        // The handler does not re-check verification: it cannot, because in a
        // correctly built dialog flow it is unreachable until the dialog closes.
        // That assumption is exactly what the automation channel breaks.
        StatusMessage = IdentityVerified
            ? $"Refund requested for order {OrderId}. You'll see it in 3–5 days."
            : $"Refund requested for order {OrderId} (identity not verified).";
    }
}
