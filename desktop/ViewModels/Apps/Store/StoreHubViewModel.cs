using desktop.Services;

namespace desktop.ViewModels.Apps.Store;

public sealed class StoreHubViewModel : AppHubViewModel
{
    public StoreHubViewModel(INavigationService nav) : base(nav, "Store",
    [
        new HubEntry("Checkout", "/store/checkout", "Review and place your pending order"),
    ])
    { }
}
