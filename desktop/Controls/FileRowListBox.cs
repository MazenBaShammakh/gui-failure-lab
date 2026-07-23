using System.Windows;
using System.Windows.Controls;

namespace desktop.Controls;

/// <summary>A ListBox that hands out <see cref="FileRowItem"/> containers.</summary>
public sealed class FileRowListBox : ListBox
{
    protected override DependencyObject GetContainerForItemOverride() => new FileRowItem();

    protected override bool IsItemItsOwnContainerOverride(object item) => item is FileRowItem;
}
