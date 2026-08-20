using desktop.Services;

namespace desktop.ViewModels.Apps.Notes;

public sealed class NotesHubViewModel : AppHubViewModel
{
    public NotesHubViewModel(INavigationService nav) : base(nav, "Notes",
    [
        new HubEntry("Editor", "/notes/editor", "Write and export the current note"),
        new HubEntry("Formatting", "/notes/format", "Paragraph and list formatting tools"),
        new HubEntry("Settings", "/notes/preferences", "Editor preferences, autosave and backup"),
    ])
    { }
}
