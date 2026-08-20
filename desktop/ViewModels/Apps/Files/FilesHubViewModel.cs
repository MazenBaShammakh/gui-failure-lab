using desktop.Services;

namespace desktop.ViewModels.Apps.Files;

public sealed class FilesHubViewModel : AppHubViewModel
{
    public FilesHubViewModel(INavigationService nav) : base(nav, "Files",
    [
        new HubEntry("Documents", "/files/library", "All files in your Documents folder"),
        new HubEntry("Sync", "/files/sync", "Cloud sync status and manual sync"),
        new HubEntry("Cleanup", "/files/cleanup", "Archive or delete files you no longer use"),
        new HubEntry("Move", "/files/move", "Move a file to another folder"),
        new HubEntry("Versions", "/files/versions", "Restore an earlier version of a file"),
    ])
    { }
}
