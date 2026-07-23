namespace desktop.Services;

/// <summary>
/// Navigation by route string rather than by view-model instance, so every screen
/// has a stable logical address that tasks.yaml can name in `target_screen`.
/// </summary>
public interface INavigationService
{
    string CurrentRoute { get; }

    bool CanGoBack { get; }

    void NavigateTo(string route);

    void GoBack();
}
