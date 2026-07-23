using CommunityToolkit.Mvvm.ComponentModel;
using desktop.Services;

namespace desktop.ViewModels;

public partial class MainViewModel : ObservableObject, INavigationService
{
    private readonly Stack<string> _history = new();

    [ObservableProperty]
    private object _currentPage = null!;

    [ObservableProperty]
    private string _currentRoute = RouteRegistry.Springboard;

    public MainViewModel()
    {
        CurrentPage = RouteRegistry.Create(RouteRegistry.Springboard, this);
    }

    public bool CanGoBack => _history.Count > 0;

    public void NavigateTo(string route)
    {
        if (route == CurrentRoute) return;

        _history.Push(CurrentRoute);
        CurrentRoute = route;
        CurrentPage = RouteRegistry.Create(route, this);
        OnPropertyChanged(nameof(CanGoBack));
    }

    public void GoBack()
    {
        if (_history.Count == 0) return;

        var route = _history.Pop();
        CurrentRoute = route;
        CurrentPage = RouteRegistry.Create(route, this);
        OnPropertyChanged(nameof(CanGoBack));
    }
}
