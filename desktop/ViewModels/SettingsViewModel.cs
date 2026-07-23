using CommunityToolkit.Mvvm.ComponentModel;
using desktop.Services;

namespace desktop.ViewModels;

public partial class SettingsViewModel : ScreenViewModel
{
    public SettingsViewModel(INavigationService nav) : base(nav) { }

    public bool IsFaulty
    {
        get => FaultModeService.Instance.IsFaulty;
        set
        {
            if (FaultModeService.Instance.IsFaulty == value) return;
            FaultModeService.Instance.IsFaulty = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(ModeLabel));
        }
    }

    public string ModeLabel => IsFaulty ? "Faulty" : "Baseline";

    public string StatePath => FaultModeService.StatePath;
}
