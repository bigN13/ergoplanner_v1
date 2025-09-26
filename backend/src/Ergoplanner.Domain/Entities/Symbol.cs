using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents an engineering symbol used in P&ID diagrams
/// </summary>
public class Symbol : BaseEntity
{
    /// <summary>
    /// Unique symbol code/identifier (e.g., "PUMP-001", "VALVE-GATE-001")
    /// </summary>
    public string Code { get; private set; }

    /// <summary>
    /// Display name of the symbol
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// Detailed description of the symbol's purpose and usage
    /// </summary>
    public string Description { get; private set; }

    /// <summary>
    /// Category this symbol belongs to
    /// </summary>
    public SymbolCategory? Category { get; private set; }

    /// <summary>
    /// SVG path data for rendering the symbol
    /// </summary>
    public string SvgContent { get; private set; }

    /// <summary>
    /// Dimensions of the symbol (width, height, bounding box)
    /// </summary>
    public SymbolDimensions Dimensions { get; private set; }

    /// <summary>
    /// Standards compliance information (ISA-5.1, PIP, ISO, etc.)
    /// </summary>
    public StandardCompliance StandardCompliance { get; private set; }

    /// <summary>
    /// Connection points where pipes or instruments can attach
    /// </summary>
    public List<ConnectionPoint> ConnectionPoints { get; private set; }

    /// <summary>
    /// Flexible metadata storage for additional properties (JSON)
    /// </summary>
    public Dictionary<string, object> Metadata { get; private set; }

    /// <summary>
    /// Tags for searching and filtering
    /// </summary>
    public List<string> Tags { get; private set; }

    /// <summary>
    /// Version number for symbol updates
    /// </summary>
    public int Version { get; private set; }

    /// <summary>
    /// Whether this symbol is currently active/available for use
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Priority for display order (higher = more prominent)
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Minimum zoom level at which this symbol becomes visible
    /// </summary>
    public double MinZoomLevel { get; private set; }

    /// <summary>
    /// Maximum zoom level at which this symbol shows full detail
    /// </summary>
    public double MaxDetailZoom { get; private set; }

    /// <summary>
    /// Navigation property to symbol category
    /// </summary>
    public Guid CategoryId { get; private set; }

    // Private constructor for EF Core
    private Symbol()
    {
        Code = string.Empty;
        Name = string.Empty;
        Description = string.Empty;
        SvgContent = string.Empty;
        ConnectionPoints = new List<ConnectionPoint>();
        Metadata = new Dictionary<string, object>();
        Tags = new List<string>();
        Dimensions = new SymbolDimensions(1, 1);
        StandardCompliance = StandardCompliance.CreateISACompliant();
        Category = null; // Will be set by EF Core
    }

    /// <summary>
    /// Creates a new Symbol instance
    /// </summary>
    public Symbol(
        string code,
        string name,
        string description,
        Guid categoryId,
        string svgContent,
        SymbolDimensions dimensions,
        StandardCompliance standardCompliance,
        List<ConnectionPoint>? connectionPoints = null,
        Dictionary<string, object>? metadata = null,
        List<string>? tags = null) : base()
    {
        ValidateParameters(code, name, svgContent);

        Code = code;
        Name = name;
        Description = description;
        CategoryId = categoryId;
        SvgContent = svgContent;
        Dimensions = dimensions;
        StandardCompliance = standardCompliance;
        ConnectionPoints = connectionPoints ?? new List<ConnectionPoint>();
        Metadata = metadata ?? new Dictionary<string, object>();
        Tags = tags ?? new List<string>();
        Version = 1;
        IsActive = true;
        DisplayOrder = 0;
        MinZoomLevel = 0.1;
        MaxDetailZoom = 2.0;
    }

    /// <summary>
    /// Update symbol properties
    /// </summary>
    public void UpdateSymbol(
        string name,
        string description,
        string svgContent,
        SymbolDimensions dimensions,
        StandardCompliance standardCompliance,
        string modifiedBy)
    {
        ValidateParameters(Code, name, svgContent);

        Name = name;
        Description = description;
        SvgContent = svgContent;
        Dimensions = dimensions;
        StandardCompliance = standardCompliance;
        Version++;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Add a connection point to the symbol
    /// </summary>
    public void AddConnectionPoint(ConnectionPoint connectionPoint)
    {
        if (connectionPoint == null)
            throw new ArgumentNullException(nameof(connectionPoint));

        // Validate connection point ID is unique
        if (ConnectionPoints.Any(cp => cp.Id == connectionPoint.Id))
            throw new InvalidOperationException($"Connection point with ID '{connectionPoint.Id}' already exists");

        ConnectionPoints.Add(connectionPoint);
        Version++;
    }

    /// <summary>
    /// Remove a connection point from the symbol
    /// </summary>
    public void RemoveConnectionPoint(string connectionPointId)
    {
        var connectionPoint = ConnectionPoints.FirstOrDefault(cp => cp.Id == connectionPointId);
        if (connectionPoint != null)
        {
            ConnectionPoints.Remove(connectionPoint);
            Version++;
        }
    }

    /// <summary>
    /// Update connection point
    /// </summary>
    public void UpdateConnectionPoint(ConnectionPoint updatedConnectionPoint)
    {
        if (updatedConnectionPoint == null)
            throw new ArgumentNullException(nameof(updatedConnectionPoint));

        var existingIndex = ConnectionPoints.FindIndex(cp => cp.Id == updatedConnectionPoint.Id);
        if (existingIndex == -1)
            throw new InvalidOperationException($"Connection point with ID '{updatedConnectionPoint.Id}' not found");

        ConnectionPoints[existingIndex] = updatedConnectionPoint;
        Version++;
    }

    /// <summary>
    /// Set symbol category
    /// </summary>
    public void SetCategory(SymbolCategory category, string modifiedBy)
    {
        if (category == null)
            throw new ArgumentNullException(nameof(category));

        Category = category;
        CategoryId = category.Id;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Add metadata property
    /// </summary>
    public void AddMetadata(string key, object value)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Metadata key cannot be null or empty", nameof(key));

        Metadata[key] = value;
        Version++;
    }

    /// <summary>
    /// Remove metadata property
    /// </summary>
    public void RemoveMetadata(string key)
    {
        if (Metadata.ContainsKey(key))
        {
            Metadata.Remove(key);
            Version++;
        }
    }

    /// <summary>
    /// Add tag for search/filtering
    /// </summary>
    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
            throw new ArgumentException("Tag cannot be null or empty", nameof(tag));

        var normalizedTag = tag.ToLowerInvariant().Trim();
        if (!Tags.Contains(normalizedTag))
        {
            Tags.Add(normalizedTag);
            Version++;
        }
    }

    /// <summary>
    /// Remove tag
    /// </summary>
    public void RemoveTag(string tag)
    {
        var normalizedTag = tag?.ToLowerInvariant().Trim();
        if (normalizedTag != null && Tags.Contains(normalizedTag))
        {
            Tags.Remove(normalizedTag);
            Version++;
        }
    }

    /// <summary>
    /// Set symbol active/inactive status
    /// </summary>
    public void SetActiveStatus(bool isActive, string modifiedBy)
    {
        IsActive = isActive;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set display properties
    /// </summary>
    public void SetDisplayProperties(
        int displayOrder,
        double minZoomLevel,
        double maxDetailZoom,
        string modifiedBy)
    {
        if (minZoomLevel < 0 || minZoomLevel > 10)
            throw new ArgumentException("MinZoomLevel must be between 0 and 10", nameof(minZoomLevel));

        if (maxDetailZoom < minZoomLevel)
            throw new ArgumentException("MaxDetailZoom must be greater than or equal to MinZoomLevel", nameof(maxDetailZoom));

        DisplayOrder = displayOrder;
        MinZoomLevel = minZoomLevel;
        MaxDetailZoom = maxDetailZoom;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Validate connection compatibility with another symbol
    /// </summary>
    public bool CanConnectTo(Symbol otherSymbol, string thisConnectionId, string otherConnectionId)
    {
        if (otherSymbol == null)
            return false;

        var thisConnection = ConnectionPoints.FirstOrDefault(cp => cp.Id == thisConnectionId);
        var otherConnection = otherSymbol.ConnectionPoints.FirstOrDefault(cp => cp.Id == otherConnectionId);

        if (thisConnection == null || otherConnection == null)
            return false;

        // Basic compatibility rules - can be expanded based on domain requirements
        return thisConnection.CanConnectTo(otherConnection);
    }

    /// <summary>
    /// Get connection points by type
    /// </summary>
    public List<ConnectionPoint> GetConnectionPointsByType(ConnectionType type)
    {
        return ConnectionPoints.Where(cp => cp.Type == type).ToList();
    }

    /// <summary>
    /// Create a copy of this symbol with a new code
    /// </summary>
    public Symbol Clone(string newCode, string createdBy)
    {
        ValidateParameters(newCode, Name, SvgContent);

        var cloned = new Symbol(
            newCode,
            Name,
            Description,
            CategoryId,
            SvgContent,
            Dimensions,
            StandardCompliance,
            new List<ConnectionPoint>(ConnectionPoints),
            new Dictionary<string, object>(Metadata),
            new List<string>(Tags))
        {
            DisplayOrder = DisplayOrder,
            MinZoomLevel = MinZoomLevel,
            MaxDetailZoom = MaxDetailZoom
        };

        cloned.CreatedBy = createdBy;
        return cloned;
    }

    private static void ValidateParameters(string code, string name, string svgContent)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Symbol code cannot be null or empty", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Symbol name cannot be null or empty", nameof(name));

        if (string.IsNullOrWhiteSpace(svgContent))
            throw new ArgumentException("SVG content cannot be null or empty", nameof(svgContent));
    }
}