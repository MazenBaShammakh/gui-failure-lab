using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels.Apps.Store;

/// <summary>
/// The cross-platform non-clickable CTA, carried over from the app's first
/// iteration. The button is visually identical in both variants but ignores all
/// pointer input when the fault is armed.
/// </summary>
public partial class CheckoutViewModel : FailureScreenViewModel
{
    public const string Defect = "B_NON_CLICKABLE_NORMAL_CTA";

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public CheckoutViewModel(INavigationService nav) : base(nav, Defect) { }

    [RelayCommand]
    private void Submit() => StatusMessage = "Order placed successfully!";
}
