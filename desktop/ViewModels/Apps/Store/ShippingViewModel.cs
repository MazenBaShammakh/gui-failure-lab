using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using desktop.Services;
using System.Text.RegularExpressions;

namespace desktop.ViewModels.Apps.Store;

/// <summary>
/// Cross-platform X3 — the validation error is rendered, legible and specific, but
/// reaches only the visual channel. The faulty variant reports it through a
/// <see cref="Controls.DrawnErrorAdorner"/>, which paints glyphs with no child
/// elements and therefore contributes no automation nodes; the baseline reports the
/// identical message as a real TextBlock that lives in the tree.
///
/// The failure is silence, not vagueness: Save simply does nothing, the status line
/// stays empty, and a text-only agent re-reading the form finds every field exactly
/// as it left them with no error to react to — so the most likely outcome is that it
/// reports the address as saved. That distinguishes X3 from the two Notion state-
/// feedback drafts (F7.1 non-updated state, F7.2 vague error), where the feedback is
/// weak in *every* channel rather than withheld from one.
///
/// The seeded postcode is "1O115" — a capital letter O where a zero belongs, close
/// enough to correct that nothing looks wrong until the rule is stated.
/// </summary>
public partial class ShippingViewModel : FailureScreenViewModel
{
    public const string Defect = "M_VALIDATION_ERROR_ADORNER_ONLY";

    private const string ErrorText = "Postcode must be 5 digits (0–9). Example: 10115.";

    [ObservableProperty]
    private string _recipient = "Mara Whitfield";

    [ObservableProperty]
    private string _street = "Kastanienallee 42";

    [ObservableProperty]
    private string _city = "Berlin";

    [ObservableProperty]
    private string _postcode = "1O115";

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    [ObservableProperty]
    private string _postcodeError = string.Empty;

    public ShippingViewModel(INavigationService nav) : base(nav, Defect) { }

    /// <summary>True only once a valid address has actually been stored.</summary>
    public bool IsSaved { get; private set; }

    /// <summary>Baseline path: the message is a real element in the accessible tree.</summary>
    public bool HasInlineError => !FaultActive && PostcodeError.Length > 0;

    /// <summary>Faulty path: the message is drawn, and exists only as pixels.</summary>
    public bool HasDrawnError => FaultActive && PostcodeError.Length > 0;

    /// <summary>The border is drawn in both variants, so the conditions stay comparable.</summary>
    public bool HasError => PostcodeError.Length > 0;

    partial void OnPostcodeErrorChanged(string value)
    {
        OnPropertyChanged(nameof(HasInlineError));
        OnPropertyChanged(nameof(HasDrawnError));
        OnPropertyChanged(nameof(HasError));
    }

    [RelayCommand]
    private void Save()
    {
        if (!Regex.IsMatch(Postcode ?? string.Empty, @"^\d{5}$"))
        {
            // No status message: the only report of the failure is the error, and in
            // the faulty variant that report never reaches the accessible tree.
            PostcodeError = ErrorText;
            StatusMessage = string.Empty;
            IsSaved = false;
            return;
        }

        PostcodeError = string.Empty;
        IsSaved = true;
        StatusMessage = "Delivery address saved.";
    }
}
