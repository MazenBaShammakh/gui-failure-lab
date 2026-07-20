using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.ViewModels.Failures;

namespace desktop.ViewModels;

public partial class HomeViewModel : ObservableObject
{
    private readonly Action<object> _navigate;

    public HomeViewModel(Action<object> navigate) => _navigate = navigate;

    [RelayCommand]
    private void OpenBaseline() => _navigate(new NonClickableCtaViewModel(false, _navigate));

    [RelayCommand]
    private void OpenFaulty() => _navigate(new NonClickableCtaViewModel(true, _navigate));
}
