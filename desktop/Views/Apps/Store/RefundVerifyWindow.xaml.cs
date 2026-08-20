using desktop.ViewModels.Apps.Store;
using System.Windows;

namespace desktop.Views.Apps.Store;

public partial class RefundVerifyWindow : Window
{
    public RefundVerifyWindow() => InitializeComponent();

    private void OnVerifyClick(object sender, RoutedEventArgs e)
    {
        if (DataContext is not RefundViewModel model) return;

        model.VerifyCommand.Execute(null);

        if (model.IdentityVerified) DialogResult = true;
    }

    // Cancel and the title-bar X behave identically: the dialog simply closes
    // unverified, and the screen behind withdraws the refund action.
    private void OnCancelClick(object sender, RoutedEventArgs e) => Close();
}
