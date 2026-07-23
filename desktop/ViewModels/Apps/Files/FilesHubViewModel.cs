using desktop.Services;

namespace desktop.ViewModels.Apps.Files;

public sealed class FilesHubViewModel : AppHubViewModel
{
    public FilesHubViewModel(INavigationService nav) : base(nav, "Files",
    [
        new HubEntry("Documents", "/files/library", "All files in your Documents folder"),
        new HubEntry("Sync", "/files/sync", "Cloud sync status and manual sync"),
    ])
    { }
}
