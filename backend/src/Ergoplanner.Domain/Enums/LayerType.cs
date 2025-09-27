namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Defines the type of layer in the drawing system
/// </summary>
public enum LayerType
{
    /// <summary>
    /// Standard drawing layer for regular diagram elements
    /// </summary>
    Standard = 0,

    /// <summary>
    /// Template layer used for creating standard layer configurations
    /// </summary>
    Template = 1,

    /// <summary>
    /// System layer managed by the application (not user-editable)
    /// </summary>
    System = 2,

    /// <summary>
    /// Background layer for reference images, grids, etc.
    /// </summary>
    Background = 3,

    /// <summary>
    /// Annotation layer for text notes, dimensions, callouts
    /// </summary>
    Annotation = 4,

    /// <summary>
    /// Reference layer for external drawings or overlays
    /// </summary>
    Reference = 5,

    /// <summary>
    /// Construction layer for temporary elements during editing
    /// </summary>
    Construction = 6,

    /// <summary>
    /// Print layer specifically for printing/plotting elements
    /// </summary>
    Print = 7
}