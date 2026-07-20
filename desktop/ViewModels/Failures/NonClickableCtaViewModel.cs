using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace desktop.ViewModels.Failures;

public partial class NonClickableCtaViewModel : ObservableObject
{
    private readonly Action<object> _navigate;

    public bool FaultActive { get; }
    public string DefectCode => "B_NON_CLICKABLE_NORMAL_CTA";
    public string Variant => FaultActive ? "Faulty" : "Baseline";

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public NonClickableCtaViewModel(bool faultActive, Action<object> navigate)
    {
        FaultActive = faultActive;
        _navigate = navigate;
    }

    [RelayCommand]
    private void Submit() => StatusMessage = "Order placed successfully!";

    [RelayCommand]
    private void GoBack() => _navigate(new HomeViewModel(_navigate));
}
