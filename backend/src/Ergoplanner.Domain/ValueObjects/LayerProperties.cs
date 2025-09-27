using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Value object containing detailed configuration properties for a layer
/// </summary>
public class LayerProperties
{
    /// <summary>
    /// Line style properties for elements on this layer
    /// </summary>
    public LayerLineStyle LineStyle { get; }

    /// <summary>
    /// Text style properties for text elements on this layer
    /// </summary>
    public TextStyle TextStyle { get; }

    /// <summary>
    /// Fill style properties for shape elements on this layer
    /// </summary>
    public FillStyle FillStyle { get; }

    /// <summary>
    /// Snap settings for elements on this layer
    /// </summary>
    public SnapSettings SnapSettings { get; }

    /// <summary>
    /// Minimum zoom level at which this layer becomes visible
    /// </summary>
    public double MinZoomLevel { get; }

    /// <summary>
    /// Maximum zoom level at which this layer shows full detail
    /// </summary>
    public double MaxZoomLevel { get; }

    /// <summary>
    /// Whether elements on this layer cast shadows
    /// </summary>
    public bool CastShadows { get; }

    /// <summary>
    /// Whether this layer should participate in auto-arrangement operations
    /// </summary>
    public bool AutoArrangeable { get; }

    /// <summary>
    /// Whether elements on this layer can be auto-connected
    /// </summary>
    public bool AutoConnectable { get; }

    /// <summary>
    /// Layer blend mode for visual effects
    /// </summary>
    public LayerBlendMode BlendMode { get; }

    public LayerProperties(
        LayerLineStyle lineStyle,
        TextStyle textStyle,
        FillStyle fillStyle,
        SnapSettings snapSettings,
        double minZoomLevel = 0.1,
        double maxZoomLevel = 10.0,
        bool castShadows = false,
        bool autoArrangeable = true,
        bool autoConnectable = true,
        LayerBlendMode blendMode = LayerBlendMode.Normal)
    {
        ValidateZoomLevels(minZoomLevel, maxZoomLevel);

        LineStyle = lineStyle ?? throw new ArgumentNullException(nameof(lineStyle));
        TextStyle = textStyle ?? throw new ArgumentNullException(nameof(textStyle));
        FillStyle = fillStyle ?? throw new ArgumentNullException(nameof(fillStyle));
        SnapSettings = snapSettings ?? throw new ArgumentNullException(nameof(snapSettings));
        MinZoomLevel = minZoomLevel;
        MaxZoomLevel = maxZoomLevel;
        CastShadows = castShadows;
        AutoArrangeable = autoArrangeable;
        AutoConnectable = autoConnectable;
        BlendMode = blendMode;
    }

    /// <summary>
    /// Create default layer properties
    /// </summary>
    public static LayerProperties Default()
    {
        return new LayerProperties(
            LayerLineStyle.Default(),
            TextStyle.Default(),
            FillStyle.Default(),
            SnapSettings.Default());
    }

    /// <summary>
    /// Create properties for a piping layer
    /// </summary>
    public static LayerProperties ForPiping()
    {
        return new LayerProperties(
            LayerLineStyle.ForPipes(),
            TextStyle.Default(),
            FillStyle.Transparent(),
            SnapSettings.ForPipes(),
            autoConnectable: true);
    }

    /// <summary>
    /// Create properties for an instrumentation layer
    /// </summary>
    public static LayerProperties ForInstrumentation()
    {
        return new LayerProperties(
            LayerLineStyle.ForInstruments(),
            TextStyle.ForInstruments(),
            FillStyle.ForInstruments(),
            SnapSettings.ForInstruments());
    }

    /// <summary>
    /// Create properties for an annotation layer
    /// </summary>
    public static LayerProperties ForAnnotation()
    {
        return new LayerProperties(
            LayerLineStyle.Thin(),
            TextStyle.ForAnnotations(),
            FillStyle.Transparent(),
            SnapSettings.Disabled(),
            autoArrangeable: false,
            autoConnectable: false);
    }

    /// <summary>
    /// Create properties for a background layer
    /// </summary>
    public static LayerProperties ForBackground()
    {
        return new LayerProperties(
            LayerLineStyle.VeryThin(),
            TextStyle.Small(),
            FillStyle.SemiTransparent(),
            SnapSettings.Disabled(),
            minZoomLevel: 0.01,
            autoArrangeable: false,
            autoConnectable: false,
            blendMode: LayerBlendMode.Multiply);
    }

    /// <summary>
    /// Create a copy with modified line style
    /// </summary>
    public LayerProperties WithLineStyle(LayerLineStyle lineStyle)
    {
        return new LayerProperties(
            lineStyle,
            TextStyle,
            FillStyle,
            SnapSettings,
            MinZoomLevel,
            MaxZoomLevel,
            CastShadows,
            AutoArrangeable,
            AutoConnectable,
            BlendMode);
    }

    /// <summary>
    /// Create a copy with modified text style
    /// </summary>
    public LayerProperties WithTextStyle(TextStyle textStyle)
    {
        return new LayerProperties(
            LineStyle,
            textStyle,
            FillStyle,
            SnapSettings,
            MinZoomLevel,
            MaxZoomLevel,
            CastShadows,
            AutoArrangeable,
            AutoConnectable,
            BlendMode);
    }

    /// <summary>
    /// Create a copy with modified zoom levels
    /// </summary>
    public LayerProperties WithZoomLevels(double minZoomLevel, double maxZoomLevel)
    {
        return new LayerProperties(
            LineStyle,
            TextStyle,
            FillStyle,
            SnapSettings,
            minZoomLevel,
            maxZoomLevel,
            CastShadows,
            AutoArrangeable,
            AutoConnectable,
            BlendMode);
    }

    private static void ValidateZoomLevels(double minZoomLevel, double maxZoomLevel)
    {
        if (minZoomLevel < 0.01 || minZoomLevel > 100)
            throw new ArgumentException("MinZoomLevel must be between 0.01 and 100", nameof(minZoomLevel));

        if (maxZoomLevel < 0.01 || maxZoomLevel > 100)
            throw new ArgumentException("MaxZoomLevel must be between 0.01 and 100", nameof(maxZoomLevel));

        if (maxZoomLevel < minZoomLevel)
            throw new ArgumentException("MaxZoomLevel must be greater than or equal to MinZoomLevel", nameof(maxZoomLevel));
    }

    public override bool Equals(object? obj)
    {
        return obj is LayerProperties other &&
               LineStyle.Equals(other.LineStyle) &&
               TextStyle.Equals(other.TextStyle) &&
               FillStyle.Equals(other.FillStyle) &&
               SnapSettings.Equals(other.SnapSettings) &&
               MinZoomLevel.Equals(other.MinZoomLevel) &&
               MaxZoomLevel.Equals(other.MaxZoomLevel) &&
               CastShadows == other.CastShadows &&
               AutoArrangeable == other.AutoArrangeable &&
               AutoConnectable == other.AutoConnectable &&
               BlendMode == other.BlendMode;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(
            LineStyle,
            TextStyle,
            FillStyle,
            SnapSettings,
            MinZoomLevel,
            MaxZoomLevel,
            CastShadows,
            HashCode.Combine(AutoArrangeable, AutoConnectable, BlendMode));
    }
}

/// <summary>
/// Line style configuration for layer elements
/// </summary>
public class LayerLineStyle
{
    public double Width { get; }
    public string Color { get; }
    public LineDashPattern DashPattern { get; }
    public LineCapStyle CapStyle { get; }
    public LineJoinStyle JoinStyle { get; }

    public LayerLineStyle(
        double width,
        string color,
        LineDashPattern dashPattern = LineDashPattern.Solid,
        LineCapStyle capStyle = LineCapStyle.Round,
        LineJoinStyle joinStyle = LineJoinStyle.Round)
    {
        if (width < 0) throw new ArgumentException("Line width cannot be negative", nameof(width));
        if (string.IsNullOrWhiteSpace(color)) throw new ArgumentException("Color cannot be null or empty", nameof(color));

        Width = width;
        Color = color;
        DashPattern = dashPattern;
        CapStyle = capStyle;
        JoinStyle = joinStyle;
    }

    public static LayerLineStyle Default() => new(1.0, "#000000");
    public static LayerLineStyle Thin() => new(0.5, "#000000");
    public static LayerLineStyle VeryThin() => new(0.25, "#000000");
    public static LayerLineStyle Thick() => new(2.0, "#000000");
    public static LayerLineStyle ForPipes() => new(2.0, "#0066CC", LineDashPattern.Solid, LineCapStyle.Round);
    public static LayerLineStyle ForInstruments() => new(1.0, "#FF6600", LineDashPattern.Solid);

    public override bool Equals(object? obj) =>
        obj is LayerLineStyle other &&
        Width == other.Width &&
        Color == other.Color &&
        DashPattern == other.DashPattern &&
        CapStyle == other.CapStyle &&
        JoinStyle == other.JoinStyle;

    public override int GetHashCode() =>
        HashCode.Combine(Width, Color, DashPattern, CapStyle, JoinStyle);
}

/// <summary>
/// Text style configuration for layer text elements
/// </summary>
public class TextStyle
{
    public string FontFamily { get; }
    public double FontSize { get; }
    public string Color { get; }
    public bool IsBold { get; }
    public bool IsItalic { get; }
    public TextAlignment Alignment { get; }

    public TextStyle(
        string fontFamily,
        double fontSize,
        string color,
        bool isBold = false,
        bool isItalic = false,
        TextAlignment alignment = TextAlignment.Left)
    {
        if (string.IsNullOrWhiteSpace(fontFamily)) throw new ArgumentException("Font family cannot be null or empty", nameof(fontFamily));
        if (fontSize <= 0) throw new ArgumentException("Font size must be positive", nameof(fontSize));
        if (string.IsNullOrWhiteSpace(color)) throw new ArgumentException("Color cannot be null or empty", nameof(color));

        FontFamily = fontFamily;
        FontSize = fontSize;
        Color = color;
        IsBold = isBold;
        IsItalic = isItalic;
        Alignment = alignment;
    }

    public static TextStyle Default() => new("Arial", 12, "#000000");
    public static TextStyle Small() => new("Arial", 8, "#666666");
    public static TextStyle Large() => new("Arial", 16, "#000000", isBold: true);
    public static TextStyle ForInstruments() => new("Arial", 10, "#FF6600");
    public static TextStyle ForAnnotations() => new("Arial", 10, "#006600");

    public override bool Equals(object? obj) =>
        obj is TextStyle other &&
        FontFamily == other.FontFamily &&
        FontSize == other.FontSize &&
        Color == other.Color &&
        IsBold == other.IsBold &&
        IsItalic == other.IsItalic &&
        Alignment == other.Alignment;

    public override int GetHashCode() =>
        HashCode.Combine(FontFamily, FontSize, Color, IsBold, IsItalic, Alignment);
}

/// <summary>
/// Fill style configuration for layer shape elements
/// </summary>
public class FillStyle
{
    public string Color { get; }
    public double Opacity { get; }
    public FillPattern Pattern { get; }

    public FillStyle(string color, double opacity = 1.0, FillPattern pattern = FillPattern.Solid)
    {
        if (string.IsNullOrWhiteSpace(color)) throw new ArgumentException("Color cannot be null or empty", nameof(color));
        if (opacity < 0 || opacity > 1) throw new ArgumentException("Opacity must be between 0 and 1", nameof(opacity));

        Color = color;
        Opacity = opacity;
        Pattern = pattern;
    }

    public static FillStyle Default() => new("#FFFFFF", 1.0);
    public static FillStyle Transparent() => new("#FFFFFF", 0.0);
    public static FillStyle SemiTransparent() => new("#FFFFFF", 0.5);
    public static FillStyle ForInstruments() => new("#FFF2E6", 0.8);

    public override bool Equals(object? obj) =>
        obj is FillStyle other &&
        Color == other.Color &&
        Opacity == other.Opacity &&
        Pattern == other.Pattern;

    public override int GetHashCode() =>
        HashCode.Combine(Color, Opacity, Pattern);
}

/// <summary>
/// Snap settings configuration for layer elements
/// </summary>
public class SnapSettings
{
    public bool SnapToGrid { get; }
    public bool SnapToObjects { get; }
    public bool SnapToGuides { get; }
    public double SnapTolerance { get; }

    public SnapSettings(
        bool snapToGrid = true,
        bool snapToObjects = true,
        bool snapToGuides = true,
        double snapTolerance = 5.0)
    {
        if (snapTolerance < 0) throw new ArgumentException("Snap tolerance cannot be negative", nameof(snapTolerance));

        SnapToGrid = snapToGrid;
        SnapToObjects = snapToObjects;
        SnapToGuides = snapToGuides;
        SnapTolerance = snapTolerance;
    }

    public static SnapSettings Default() => new();
    public static SnapSettings Disabled() => new(false, false, false);
    public static SnapSettings ForPipes() => new(true, true, true, 10.0);
    public static SnapSettings ForInstruments() => new(true, true, false, 5.0);

    public override bool Equals(object? obj) =>
        obj is SnapSettings other &&
        SnapToGrid == other.SnapToGrid &&
        SnapToObjects == other.SnapToObjects &&
        SnapToGuides == other.SnapToGuides &&
        SnapTolerance == other.SnapTolerance;

    public override int GetHashCode() =>
        HashCode.Combine(SnapToGrid, SnapToObjects, SnapToGuides, SnapTolerance);
}

// Supporting enums for the value objects
public enum LineDashPattern
{
    Solid = 0,
    Dashed = 1,
    Dotted = 2,
    DashDot = 3,
    DashDotDot = 4
}

public enum LineCapStyle
{
    Butt = 0,
    Round = 1,
    Square = 2
}

public enum LineJoinStyle
{
    Miter = 0,
    Round = 1,
    Bevel = 2
}

public enum TextAlignment
{
    Left = 0,
    Center = 1,
    Right = 2,
    Justify = 3
}

public enum FillPattern
{
    Solid = 0,
    None = 1,
    Diagonal = 2,
    Cross = 3,
    Dots = 4
}

public enum LayerBlendMode
{
    Normal = 0,
    Multiply = 1,
    Screen = 2,
    Overlay = 3,
    Darken = 4,
    Lighten = 5,
    ColorDodge = 6,
    ColorBurn = 7,
    HardLight = 8,
    SoftLight = 9,
    Difference = 10,
    Exclusion = 11
}