namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Defines the type of element that can be placed on a layer
/// </summary>
public enum LayerElementType
{
    /// <summary>
    /// Node element (symbols, equipment, instruments)
    /// </summary>
    Node = 0,

    /// <summary>
    /// Edge element (pipes, connections, lines)
    /// </summary>
    Edge = 1,

    /// <summary>
    /// Text annotation element
    /// </summary>
    Text = 2,

    /// <summary>
    /// Dimension or measurement annotation
    /// </summary>
    Dimension = 3,

    /// <summary>
    /// Callout or label element
    /// </summary>
    Callout = 4,

    /// <summary>
    /// Shape element (rectangles, circles, polygons)
    /// </summary>
    Shape = 5,

    /// <summary>
    /// Image or raster graphic element
    /// </summary>
    Image = 6,

    /// <summary>
    /// Reference or external drawing element
    /// </summary>
    Reference = 7,

    /// <summary>
    /// Grid or background pattern element
    /// </summary>
    Grid = 8,

    /// <summary>
    /// Group of multiple elements
    /// </summary>
    Group = 9,

    /// <summary>
    /// Symbol or equipment from symbol library
    /// </summary>
    Symbol = 10,

    /// <summary>
    /// Instrument symbol with specific properties
    /// </summary>
    Instrument = 11,

    /// <summary>
    /// Valve symbol with specific properties
    /// </summary>
    Valve = 12,

    /// <summary>
    /// Pump symbol with specific properties
    /// </summary>
    Pump = 13,

    /// <summary>
    /// Tank or vessel symbol
    /// </summary>
    Vessel = 14,

    /// <summary>
    /// Pipe or line element
    /// </summary>
    Pipe = 15,

    /// <summary>
    /// Control system element
    /// </summary>
    Control = 16,

    /// <summary>
    /// Safety system element
    /// </summary>
    Safety = 17,

    /// <summary>
    /// Electrical element
    /// </summary>
    Electrical = 18,

    /// <summary>
    /// Structural element
    /// </summary>
    Structural = 19,

    /// <summary>
    /// Other or custom element type
    /// </summary>
    Other = 99
}