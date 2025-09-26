namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Value object representing the dimensions and spatial properties of an engineering symbol
/// </summary>
public class SymbolDimensions : IEquatable<SymbolDimensions>
{
    /// <summary>
    /// Width of the symbol in drawing units
    /// </summary>
    public double Width { get; }

    /// <summary>
    /// Height of the symbol in drawing units
    /// </summary>
    public double Height { get; }

    /// <summary>
    /// X-coordinate of the symbol's origin point (usually center or bottom-left)
    /// </summary>
    public double OriginX { get; }

    /// <summary>
    /// Y-coordinate of the symbol's origin point (usually center or bottom-left)
    /// </summary>
    public double OriginY { get; }

    /// <summary>
    /// Minimum bounding box X-coordinate
    /// </summary>
    public double BoundingMinX { get; }

    /// <summary>
    /// Minimum bounding box Y-coordinate
    /// </summary>
    public double BoundingMinY { get; }

    /// <summary>
    /// Maximum bounding box X-coordinate
    /// </summary>
    public double BoundingMaxX { get; }

    /// <summary>
    /// Maximum bounding box Y-coordinate
    /// </summary>
    public double BoundingMaxY { get; }

    /// <summary>
    /// Scale factor for display (1.0 = normal size)
    /// </summary>
    public double Scale { get; }

    /// <summary>
    /// Whether the symbol maintains aspect ratio when resized
    /// </summary>
    public bool MaintainAspectRatio { get; }

    /// <summary>
    /// Minimum allowed scale factor
    /// </summary>
    public double MinScale { get; }

    /// <summary>
    /// Maximum allowed scale factor
    /// </summary>
    public double MaxScale { get; }

    /// <summary>
    /// Units for dimensions (mm, inches, drawing units, etc.)
    /// </summary>
    public string Units { get; }

    /// <summary>
    /// Creates a new SymbolDimensions instance
    /// </summary>
    public SymbolDimensions(
        double width,
        double height,
        double originX = 0,
        double originY = 0,
        double scale = 1.0,
        bool maintainAspectRatio = true,
        double minScale = 0.1,
        double maxScale = 10.0,
        string units = "drawing-units")
    {
        ValidateParameters(width, height, scale, minScale, maxScale, units);

        Width = width;
        Height = height;
        OriginX = originX;
        OriginY = originY;
        Scale = scale;
        MaintainAspectRatio = maintainAspectRatio;
        MinScale = minScale;
        MaxScale = maxScale;
        Units = units;

        // Calculate bounding box
        var halfWidth = width / 2;
        var halfHeight = height / 2;
        BoundingMinX = originX - halfWidth;
        BoundingMinY = originY - halfHeight;
        BoundingMaxX = originX + halfWidth;
        BoundingMaxY = originY + halfHeight;
    }

    /// <summary>
    /// Creates SymbolDimensions with explicit bounding box
    /// </summary>
    public SymbolDimensions(
        double width,
        double height,
        double originX,
        double originY,
        double boundingMinX,
        double boundingMinY,
        double boundingMaxX,
        double boundingMaxY,
        double scale = 1.0,
        bool maintainAspectRatio = true,
        double minScale = 0.1,
        double maxScale = 10.0,
        string units = "drawing-units")
    {
        ValidateParameters(width, height, scale, minScale, maxScale, units);
        ValidateBoundingBox(boundingMinX, boundingMinY, boundingMaxX, boundingMaxY);

        Width = width;
        Height = height;
        OriginX = originX;
        OriginY = originY;
        BoundingMinX = boundingMinX;
        BoundingMinY = boundingMinY;
        BoundingMaxX = boundingMaxX;
        BoundingMaxY = boundingMaxY;
        Scale = scale;
        MaintainAspectRatio = maintainAspectRatio;
        MinScale = minScale;
        MaxScale = maxScale;
        Units = units;
    }

    /// <summary>
    /// Get the actual rendered width considering scale
    /// </summary>
    public double ActualWidth => Width * Scale;

    /// <summary>
    /// Get the actual rendered height considering scale
    /// </summary>
    public double ActualHeight => Height * Scale;

    /// <summary>
    /// Get the aspect ratio (width / height)
    /// </summary>
    public double AspectRatio => Height != 0 ? Width / Height : 1.0;

    /// <summary>
    /// Get the diagonal size of the symbol
    /// </summary>
    public double DiagonalSize => Math.Sqrt(Width * Width + Height * Height);

    /// <summary>
    /// Get the area of the symbol
    /// </summary>
    public double Area => Width * Height;

    /// <summary>
    /// Get the perimeter of the symbol
    /// </summary>
    public double Perimeter => 2 * (Width + Height);

    /// <summary>
    /// Get the center point of the symbol
    /// </summary>
    public Point Center => new Point(OriginX, OriginY);

    /// <summary>
    /// Check if a point is within the symbol's bounding box
    /// </summary>
    public bool ContainsPoint(double x, double y)
    {
        return x >= BoundingMinX && x <= BoundingMaxX &&
               y >= BoundingMinY && y <= BoundingMaxY;
    }

    /// <summary>
    /// Check if this symbol overlaps with another symbol's dimensions
    /// </summary>
    public bool OverlapsWith(SymbolDimensions other)
    {
        if (other == null)
            return false;

        return !(BoundingMaxX < other.BoundingMinX ||
                BoundingMinX > other.BoundingMaxX ||
                BoundingMaxY < other.BoundingMinY ||
                BoundingMinY > other.BoundingMaxY);
    }

    /// <summary>
    /// Get the distance from the center of this symbol to another
    /// </summary>
    public double DistanceTo(SymbolDimensions other)
    {
        if (other == null)
            throw new ArgumentNullException(nameof(other));

        var deltaX = other.OriginX - OriginX;
        var deltaY = other.OriginY - OriginY;
        return Math.Sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    /// <summary>
    /// Create a scaled version of these dimensions
    /// </summary>
    public SymbolDimensions WithScale(double newScale)
    {
        if (newScale < MinScale || newScale > MaxScale)
            throw new ArgumentException($"Scale must be between {MinScale} and {MaxScale}", nameof(newScale));

        return new SymbolDimensions(
            Width, Height, OriginX, OriginY,
            BoundingMinX, BoundingMinY, BoundingMaxX, BoundingMaxY,
            newScale, MaintainAspectRatio, MinScale, MaxScale, Units);
    }

    /// <summary>
    /// Create dimensions with new size while maintaining aspect ratio (if enabled)
    /// </summary>
    public SymbolDimensions WithSize(double newWidth, double newHeight)
    {
        var actualWidth = newWidth;
        var actualHeight = newHeight;

        if (MaintainAspectRatio)
        {
            var currentAspectRatio = AspectRatio;
            var newAspectRatio = newWidth / newHeight;

            if (Math.Abs(newAspectRatio - currentAspectRatio) > 0.001)
            {
                // Maintain aspect ratio by adjusting height to match width
                actualHeight = newWidth / currentAspectRatio;
            }
        }

        return new SymbolDimensions(
            actualWidth, actualHeight, OriginX, OriginY,
            Scale, MaintainAspectRatio, MinScale, MaxScale, Units);
    }

    /// <summary>
    /// Create dimensions with new origin
    /// </summary>
    public SymbolDimensions WithOrigin(double newOriginX, double newOriginY)
    {
        return new SymbolDimensions(
            Width, Height, newOriginX, newOriginY,
            Scale, MaintainAspectRatio, MinScale, MaxScale, Units);
    }

    /// <summary>
    /// Get a rectangle representing the bounding box
    /// </summary>
    public Rectangle GetBoundingRectangle()
    {
        return new Rectangle(BoundingMinX, BoundingMinY,
                           BoundingMaxX - BoundingMinX,
                           BoundingMaxY - BoundingMinY);
    }

    /// <summary>
    /// Convert dimensions to different units
    /// </summary>
    public SymbolDimensions ConvertToUnits(string targetUnits, double conversionFactor)
    {
        if (string.IsNullOrWhiteSpace(targetUnits))
            throw new ArgumentException("Target units cannot be null or empty", nameof(targetUnits));

        if (conversionFactor <= 0)
            throw new ArgumentException("Conversion factor must be positive", nameof(conversionFactor));

        return new SymbolDimensions(
            Width * conversionFactor,
            Height * conversionFactor,
            OriginX * conversionFactor,
            OriginY * conversionFactor,
            BoundingMinX * conversionFactor,
            BoundingMinY * conversionFactor,
            BoundingMaxX * conversionFactor,
            BoundingMaxY * conversionFactor,
            Scale, MaintainAspectRatio, MinScale, MaxScale, targetUnits);
    }

    public bool Equals(SymbolDimensions? other)
    {
        if (other == null) return false;
        if (ReferenceEquals(this, other)) return true;

        return Math.Abs(Width - other.Width) < 0.001 &&
               Math.Abs(Height - other.Height) < 0.001 &&
               Math.Abs(OriginX - other.OriginX) < 0.001 &&
               Math.Abs(OriginY - other.OriginY) < 0.001 &&
               Math.Abs(Scale - other.Scale) < 0.001 &&
               MaintainAspectRatio == other.MaintainAspectRatio &&
               Units == other.Units;
    }

    public override bool Equals(object? obj)
    {
        return Equals(obj as SymbolDimensions);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Width, Height, OriginX, OriginY, Scale, MaintainAspectRatio, Units);
    }

    public override string ToString()
    {
        return $"{Width:F2}×{Height:F2} {Units} at ({OriginX:F2}, {OriginY:F2}) scale:{Scale:F2}";
    }

    public static bool operator ==(SymbolDimensions? left, SymbolDimensions? right)
    {
        return EqualityComparer<SymbolDimensions>.Default.Equals(left, right);
    }

    public static bool operator !=(SymbolDimensions? left, SymbolDimensions? right)
    {
        return !(left == right);
    }

    private static void ValidateParameters(
        double width,
        double height,
        double scale,
        double minScale,
        double maxScale,
        string units)
    {
        if (width <= 0)
            throw new ArgumentException("Width must be positive", nameof(width));

        if (height <= 0)
            throw new ArgumentException("Height must be positive", nameof(height));

        if (scale <= 0)
            throw new ArgumentException("Scale must be positive", nameof(scale));

        if (minScale <= 0)
            throw new ArgumentException("MinScale must be positive", nameof(minScale));

        if (maxScale <= minScale)
            throw new ArgumentException("MaxScale must be greater than MinScale", nameof(maxScale));

        if (string.IsNullOrWhiteSpace(units))
            throw new ArgumentException("Units cannot be null or empty", nameof(units));
    }

    private static void ValidateBoundingBox(
        double minX, double minY, double maxX, double maxY)
    {
        if (maxX <= minX)
            throw new ArgumentException("BoundingMaxX must be greater than BoundingMinX");

        if (maxY <= minY)
            throw new ArgumentException("BoundingMaxY must be greater than BoundingMinY");
    }
}

/// <summary>
/// Simple rectangle structure for bounding box calculations
/// </summary>
public record Rectangle(double X, double Y, double Width, double Height);