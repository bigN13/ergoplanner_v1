using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Value object representing a connection point on an engineering symbol
/// </summary>
public class ConnectionPoint : IEquatable<ConnectionPoint>
{
    /// <summary>
    /// Unique identifier for this connection point within the symbol
    /// </summary>
    public string Id { get; }

    /// <summary>
    /// Type of connection (process, instrument, utility, etc.)
    /// </summary>
    public ConnectionType Type { get; }

    /// <summary>
    /// X-coordinate position relative to symbol origin (0,0)
    /// </summary>
    public double X { get; }

    /// <summary>
    /// Y-coordinate position relative to symbol origin (0,0)
    /// </summary>
    public double Y { get; }

    /// <summary>
    /// Direction angle in degrees (0 = right, 90 = up, 180 = left, 270 = down)
    /// </summary>
    public double Direction { get; }

    /// <summary>
    /// Nominal pipe size or connection size
    /// </summary>
    public string Size { get; }

    /// <summary>
    /// Pressure rating class (150, 300, 600, etc.)
    /// </summary>
    public string? PressureRating { get; }

    /// <summary>
    /// Service type (steam, water, air, signal, etc.)
    /// </summary>
    public string? ServiceType { get; }

    /// <summary>
    /// Optional description or label for the connection
    /// </summary>
    public string? Description { get; }

    /// <summary>
    /// Whether this connection point is required (true) or optional (false)
    /// </summary>
    public bool IsRequired { get; }

    /// <summary>
    /// Whether this connection can accept multiple connections
    /// </summary>
    public bool AllowsMultipleConnections { get; }

    /// <summary>
    /// Minimum required line size for connection
    /// </summary>
    public double? MinLineSize { get; }

    /// <summary>
    /// Maximum allowed line size for connection
    /// </summary>
    public double? MaxLineSize { get; }

    /// <summary>
    /// Compatible connection types that can connect to this point
    /// </summary>
    public List<ConnectionType> CompatibleTypes { get; }

    /// <summary>
    /// Creates a new ConnectionPoint instance
    /// </summary>
    public ConnectionPoint(
        string id,
        ConnectionType type,
        double x,
        double y,
        double direction,
        string size,
        string? pressureRating = null,
        string? serviceType = null,
        string? description = null,
        bool isRequired = true,
        bool allowsMultipleConnections = false,
        double? minLineSize = null,
        double? maxLineSize = null,
        List<ConnectionType>? compatibleTypes = null)
    {
        ValidateParameters(id, size, direction, minLineSize, maxLineSize);

        Id = id;
        Type = type;
        X = x;
        Y = y;
        Direction = NormalizeDirection(direction);
        Size = size;
        PressureRating = pressureRating;
        ServiceType = serviceType;
        Description = description;
        IsRequired = isRequired;
        AllowsMultipleConnections = allowsMultipleConnections;
        MinLineSize = minLineSize;
        MaxLineSize = maxLineSize;
        CompatibleTypes = compatibleTypes ?? GetDefaultCompatibleTypes(type);
    }

    /// <summary>
    /// Check if this connection point can connect to another connection point
    /// </summary>
    public bool CanConnectTo(ConnectionPoint other)
    {
        if (other == null)
            return false;

        // Check type compatibility
        if (!CompatibleTypes.Contains(other.Type) && !other.CompatibleTypes.Contains(Type))
            return false;

        // Check service type compatibility (if specified)
        if (!string.IsNullOrEmpty(ServiceType) && !string.IsNullOrEmpty(other.ServiceType))
        {
            if (!ServiceType.Equals(other.ServiceType, StringComparison.OrdinalIgnoreCase))
                return false;
        }

        // Check pressure rating compatibility (if specified)
        if (!string.IsNullOrEmpty(PressureRating) && !string.IsNullOrEmpty(other.PressureRating))
        {
            // Basic pressure rating check - could be expanded with proper rating hierarchy
            if (!PressureRating.Equals(other.PressureRating, StringComparison.OrdinalIgnoreCase))
                return false;
        }

        // Check size compatibility
        if (!AreSizesCompatible(Size, other.Size))
            return false;

        return true;
    }

    /// <summary>
    /// Get the connection point at the specified distance along the direction vector
    /// </summary>
    public Point GetConnectionEndPoint(double distance)
    {
        var radians = Direction * Math.PI / 180.0;
        var endX = X + distance * Math.Cos(radians);
        var endY = Y + distance * Math.Sin(radians);
        return new Point(endX, endY);
    }

    /// <summary>
    /// Check if another connection point is within connection range
    /// </summary>
    public bool IsWithinConnectionRange(ConnectionPoint other, double maxDistance)
    {
        if (other == null)
            return false;

        var distance = Math.Sqrt(Math.Pow(other.X - X, 2) + Math.Pow(other.Y - Y, 2));
        return distance <= maxDistance;
    }

    /// <summary>
    /// Get the angle between this connection point and another
    /// </summary>
    public double GetAngleTo(ConnectionPoint other)
    {
        if (other == null)
            throw new ArgumentNullException(nameof(other));

        var deltaX = other.X - X;
        var deltaY = other.Y - Y;
        var angle = Math.Atan2(deltaY, deltaX) * 180.0 / Math.PI;

        return NormalizeDirection(angle);
    }

    /// <summary>
    /// Create a copy of this connection point with modified position
    /// </summary>
    public ConnectionPoint WithPosition(double newX, double newY)
    {
        return new ConnectionPoint(
            Id, Type, newX, newY, Direction, Size,
            PressureRating, ServiceType, Description,
            IsRequired, AllowsMultipleConnections,
            MinLineSize, MaxLineSize, CompatibleTypes);
    }

    /// <summary>
    /// Create a copy of this connection point with modified direction
    /// </summary>
    public ConnectionPoint WithDirection(double newDirection)
    {
        return new ConnectionPoint(
            Id, Type, X, Y, newDirection, Size,
            PressureRating, ServiceType, Description,
            IsRequired, AllowsMultipleConnections,
            MinLineSize, MaxLineSize, CompatibleTypes);
    }

    /// <summary>
    /// Create a copy of this connection point with modified size
    /// </summary>
    public ConnectionPoint WithSize(string newSize)
    {
        return new ConnectionPoint(
            Id, Type, X, Y, Direction, newSize,
            PressureRating, ServiceType, Description,
            IsRequired, AllowsMultipleConnections,
            MinLineSize, MaxLineSize, CompatibleTypes);
    }

    public bool Equals(ConnectionPoint? other)
    {
        if (other == null) return false;
        if (ReferenceEquals(this, other)) return true;

        return Id == other.Id &&
               Type == other.Type &&
               Math.Abs(X - other.X) < 0.001 &&
               Math.Abs(Y - other.Y) < 0.001 &&
               Math.Abs(Direction - other.Direction) < 0.001 &&
               Size == other.Size &&
               PressureRating == other.PressureRating &&
               ServiceType == other.ServiceType;
    }

    public override bool Equals(object? obj)
    {
        return Equals(obj as ConnectionPoint);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Id, Type, X, Y, Direction, Size, PressureRating, ServiceType);
    }

    public override string ToString()
    {
        return $"{Id} ({Type}) at ({X:F2}, {Y:F2}) dir:{Direction}° size:{Size}";
    }

    public static bool operator ==(ConnectionPoint? left, ConnectionPoint? right)
    {
        return EqualityComparer<ConnectionPoint>.Default.Equals(left, right);
    }

    public static bool operator !=(ConnectionPoint? left, ConnectionPoint? right)
    {
        return !(left == right);
    }

    private static void ValidateParameters(
        string id,
        string size,
        double direction,
        double? minLineSize,
        double? maxLineSize)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Connection point ID cannot be null or empty", nameof(id));

        if (string.IsNullOrWhiteSpace(size))
            throw new ArgumentException("Size cannot be null or empty", nameof(size));

        if (direction < 0 || direction >= 360)
            throw new ArgumentException("Direction must be between 0 and 359.999 degrees", nameof(direction));

        if (minLineSize.HasValue && minLineSize.Value < 0)
            throw new ArgumentException("MinLineSize cannot be negative", nameof(minLineSize));

        if (maxLineSize.HasValue && maxLineSize.Value < 0)
            throw new ArgumentException("MaxLineSize cannot be negative", nameof(maxLineSize));

        if (minLineSize.HasValue && maxLineSize.HasValue && minLineSize.Value > maxLineSize.Value)
            throw new ArgumentException("MinLineSize cannot be greater than MaxLineSize");
    }

    private static double NormalizeDirection(double direction)
    {
        while (direction < 0)
            direction += 360;
        while (direction >= 360)
            direction -= 360;
        return direction;
    }

    private static List<ConnectionType> GetDefaultCompatibleTypes(ConnectionType type)
    {
        return type switch
        {
            ConnectionType.ProcessInlet => new List<ConnectionType> { ConnectionType.ProcessOutlet, ConnectionType.Generic },
            ConnectionType.ProcessOutlet => new List<ConnectionType> { ConnectionType.ProcessInlet, ConnectionType.Generic },
            ConnectionType.Instrument => new List<ConnectionType> { ConnectionType.Instrument, ConnectionType.Signal },
            ConnectionType.Utility => new List<ConnectionType> { ConnectionType.Utility, ConnectionType.ProcessInlet, ConnectionType.ProcessOutlet },
            ConnectionType.Electrical => new List<ConnectionType> { ConnectionType.Electrical },
            ConnectionType.Signal => new List<ConnectionType> { ConnectionType.Signal, ConnectionType.Instrument },
            ConnectionType.Mechanical => new List<ConnectionType> { ConnectionType.Mechanical },
            ConnectionType.Vent => new List<ConnectionType> { ConnectionType.Vent, ConnectionType.Generic },
            ConnectionType.Drain => new List<ConnectionType> { ConnectionType.Drain, ConnectionType.Generic },
            ConnectionType.Generic => Enum.GetValues<ConnectionType>().ToList(),
            _ => new List<ConnectionType> { type }
        };
    }

    private static bool AreSizesCompatible(string size1, string size2)
    {
        // Basic size compatibility - could be expanded with proper sizing logic
        // For now, exact match or "Generic" sizes are compatible
        return size1.Equals(size2, StringComparison.OrdinalIgnoreCase) ||
               size1.Equals("Generic", StringComparison.OrdinalIgnoreCase) ||
               size2.Equals("Generic", StringComparison.OrdinalIgnoreCase);
    }
}

/// <summary>
/// Simple point structure for coordinate calculations
/// </summary>
public record Point(double X, double Y);