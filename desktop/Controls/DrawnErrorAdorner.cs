using System.Globalization;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Media;

namespace desktop.Controls;

/// <summary>
/// A validation adorner that paints its message with <see cref="DrawingContext.DrawText"/>
/// instead of composing child elements — the ordinary way WPF validation adorners
/// are written, and the reason the text is invisible to UI Automation.
///
/// Nothing here is a child <c>UIElement</c>, so nothing here produces an automation
/// peer: the message exists only as glyphs in the rendered frame. A vision agent
/// reads it as easily as any other label; a text-only agent walking the tree finds
/// the form completely unchanged and no error anywhere.
///
/// The border is drawn in both variants so the two conditions are pixel-comparable;
/// only <see cref="Message"/> is withheld from the accessible channel, and only when
/// the fault is armed (see <see cref="Views.Apps.Store.ShippingView"/>).
/// </summary>
public sealed class DrawnErrorAdorner : Adorner
{
    private static readonly SolidColorBrush ErrorBrush = Frozen(Color.FromRgb(0xC0, 0x2B, 0x2B));
    private static readonly Pen ErrorPen = FrozenPen(ErrorBrush);
    private static readonly Typeface Face = new(new FontFamily("Segoe UI"),
        FontStyles.Normal, FontWeights.Normal, FontStretches.Normal);

    private string _message = string.Empty;

    public DrawnErrorAdorner(UIElement adornedElement) : base(adornedElement)
        => IsHitTestVisible = false;

    /// <summary>Drawn beneath the adorned element. Empty draws the border only.</summary>
    public string Message
    {
        get => _message;
        set
        {
            if (_message == value) return;
            _message = value;
            InvalidateVisual();
        }
    }

    protected override void OnRender(DrawingContext drawingContext)
    {
        var size = AdornedElement.RenderSize;
        drawingContext.DrawRoundedRectangle(null, ErrorPen,
            new Rect(-1, -1, size.Width + 2, size.Height + 2), 4, 4);

        if (string.IsNullOrEmpty(Message)) return;

        var text = new FormattedText(
            Message,
            CultureInfo.CurrentCulture,
            FlowDirection.LeftToRight,
            Face,
            12,
            ErrorBrush,
            VisualTreeHelper.GetDpi(this).PixelsPerDip);

        drawingContext.DrawText(text, new Point(0, size.Height + 5));
    }

    private static SolidColorBrush Frozen(Color color)
    {
        var brush = new SolidColorBrush(color);
        brush.Freeze();
        return brush;
    }

    private static Pen FrozenPen(Brush brush)
    {
        var pen = new Pen(brush, 1.4);
        pen.Freeze();
        return pen;
    }
}
