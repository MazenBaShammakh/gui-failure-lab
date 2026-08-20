using desktop.ViewModels.Apps.Notes;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;

namespace desktop.Views.Apps.Notes;

/// <summary>
/// Opens the preferences card either as an in-window overlay (baseline, handled
/// entirely in XAML) or as a separate top-level window (faulty, here).
/// </summary>
public partial class PreferencesView : UserControl
{
    private PreferencesWindow? _window;
    private PreferencesViewModel? _model;

    public PreferencesView()
    {
        InitializeComponent();
        Loaded += OnLoaded;
        Unloaded += OnUnloaded;
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        if (DataContext is not PreferencesViewModel model) return;

        _model = model;
        _model.PropertyChanged += OnModelPropertyChanged;
        Sync();
    }

    private void OnUnloaded(object sender, RoutedEventArgs e)
    {
        if (_model is not null) _model.PropertyChanged -= OnModelPropertyChanged;
        _model = null;
        CloseWindow();
    }

    private void OnModelPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (e.PropertyName is nameof(PreferencesViewModel.IsPanelOpen)) Sync();
    }

    private void Sync()
    {
        if (_model is null) return;

        if (!_model.IsPanelOpen || !_model.FaultActive)
        {
            CloseWindow();
            return;
        }

        if (_window is not null) return;

        _window = new PreferencesWindow { DataContext = _model };

        // Cover the main window exactly, so the rendered frame matches the baseline
        // overlay and only the window structure differs.
        if (Window.GetWindow(this) is { } owner)
        {
            _window.Left = owner.Left;
            _window.Top = owner.Top;
            _window.Width = owner.ActualWidth;
            _window.Height = owner.ActualHeight;
        }

        // FAULT: Show(), with Owner left unset — a plain top-level window parented to
        // the desktop root. Nothing links it to the window the agent is reading, and
        // ShowDialog/Owner would not change that: an owned window is still a separate
        // top-level element, not a node in the opener's subtree.
        _window.Show();
    }

    private void CloseWindow()
    {
        if (_window is null) return;

        _window.Close();
        _window = null;
    }
}
