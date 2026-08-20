using desktop.Controls;
using desktop.ViewModels.Apps.Store;
using System.ComponentModel;
using System.Windows.Controls;
using System.Windows.Documents;

namespace desktop.Views.Apps.Store;

/// <summary>
/// Attaches the drawn validation adorner. The adorner is added in both conditions so
/// the red frame is identical; only its <see cref="DrawnErrorAdorner.Message"/> is
/// set, and only when the fault is armed — that message is the part which never
/// becomes an automation node.
/// </summary>
public partial class ShippingView : UserControl
{
    private DrawnErrorAdorner? _adorner;
    private ShippingViewModel? _model;

    public ShippingView()
    {
        InitializeComponent();
        Loaded += OnLoaded;
        Unloaded += OnUnloaded;
    }

    private void OnLoaded(object sender, System.Windows.RoutedEventArgs e)
    {
        if (DataContext is not ShippingViewModel model) return;

        _model = model;
        _model.PropertyChanged += OnModelPropertyChanged;
        Sync();
    }

    private void OnUnloaded(object sender, System.Windows.RoutedEventArgs e)
    {
        if (_model is not null) _model.PropertyChanged -= OnModelPropertyChanged;
        _model = null;
        RemoveAdorner();
    }

    private void OnModelPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (e.PropertyName is nameof(ShippingViewModel.PostcodeError)) Sync();
    }

    private void Sync()
    {
        if (_model is null) return;

        if (!_model.HasError)
        {
            RemoveAdorner();
            return;
        }

        var layer = AdornerLayer.GetAdornerLayer(PostcodeBox);
        if (layer is null) return;

        if (_adorner is null)
        {
            _adorner = new DrawnErrorAdorner(PostcodeBox);
            layer.Add(_adorner);
        }

        // FAULT: the sentence is handed to the renderer instead of to the tree.
        _adorner.Message = _model.HasDrawnError ? _model.PostcodeError : string.Empty;
    }

    private void RemoveAdorner()
    {
        if (_adorner is null) return;

        AdornerLayer.GetAdornerLayer(PostcodeBox)?.Remove(_adorner);
        _adorner = null;
    }
}
