using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;

namespace desktop.ViewModels;

/// <summary>Base for every routed screen: navigation plus a back affordance.</summary>
public abstract partial class ScreenViewModel : ObservableObject
{
    protected readonly INavigationService Nav;

    protected ScreenViewModel(INavigationService nav) => Nav = nav;

    [RelayCommand]
    protected void Navigate(string route) => Nav.NavigateTo(route);

    [RelayCommand]
    protected void GoBack() => Nav.GoBack();
}

/// <summary>
/// A screen that carries an injected defect. Reads the global fault mode rather
/// than taking a per-navigation variant, so nothing on screen tells the agent
/// which condition it is running under.
/// </summary>
public abstract class FailureScreenViewModel : ScreenViewModel
{
    protected FailureScreenViewModel(INavigationService nav, string defectCode)
        : base(nav) => DefectCode = defectCode;

    public string DefectCode { get; }

    public bool FaultActive => FaultModeService.Instance.IsFaulty;

    /// <summary>Bound to AutomationProperties.AutomationId on the screen root.</summary>
    public string? DefectMarker => FaultModeService.Instance.Marker(DefectCode);
}
