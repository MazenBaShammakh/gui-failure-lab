using CommunityToolkit.Mvvm.ComponentModel;

namespace desktop.ViewModels;

public partial class MainViewModel : ObservableObject
{
    [ObservableProperty]
    private object _currentPage = null!;

    public MainViewModel()
    {
        CurrentPage = new HomeViewModel(Navigate);
    }

    public void Navigate(object viewModel) => CurrentPage = viewModel;
}
