using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.ValueObjects;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a drawing layer in the P&ID diagram system with hierarchical support
/// </summary>
public class Layer : BaseEntity
{
    /// <summary>
    /// Unique layer code/identifier (e.g., "PIPING", "INSTRUMENTS", "BACKGROUND")
    /// </summary>
    public string Code { get; private set; }

    /// <summary>
    /// Display name of the layer
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// Detailed description of the layer's purpose
    /// </summary>
    public string Description { get; private set; }

    /// <summary>
    /// Layer color for visual representation (hex format)
    /// </summary>
    public string Color { get; private set; }

    /// <summary>
    /// Layer opacity (0.0 to 1.0)
    /// </summary>
    public double Opacity { get; private set; }

    /// <summary>
    /// Whether the layer is currently visible
    /// </summary>
    public bool IsVisible { get; private set; }

    /// <summary>
    /// Whether elements on this layer can be selected
    /// </summary>
    public bool IsSelectable { get; private set; }

    /// <summary>
    /// Whether this layer is locked for editing
    /// </summary>
    public bool IsLocked { get; private set; }

    /// <summary>
    /// Whether this layer should be included when printing
    /// </summary>
    public bool IsPrintable { get; private set; }

    /// <summary>
    /// Display order for layer stack (higher = on top)
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Layer properties containing detailed configuration
    /// </summary>
    public LayerProperties Properties { get; private set; }

    /// <summary>
    /// Flexible metadata storage for additional properties (JSONB)
    /// </summary>
    public LayerMetadata Metadata { get; private set; }

    /// <summary>
    /// Drawing ID this layer belongs to
    /// </summary>
    public Guid DrawingId { get; private set; }

    /// <summary>
    /// Navigation property to the drawing
    /// </summary>
    public virtual Drawing? Drawing { get; set; }

    /// <summary>
    /// Parent layer ID for hierarchical structure (null for root layers)
    /// </summary>
    public Guid? ParentLayerId { get; private set; }

    /// <summary>
    /// Navigation property to parent layer
    /// </summary>
    public virtual Layer? ParentLayer { get; set; }

    /// <summary>
    /// Navigation property to child layers
    /// </summary>
    public virtual ICollection<Layer> ChildLayers { get; set; }

    /// <summary>
    /// Navigation property to elements (nodes/symbols) on this layer
    /// </summary>
    public virtual ICollection<LayerElement> LayerElements { get; set; }

    /// <summary>
    /// Materialized path for efficient hierarchical queries (ltree format: root.child1.child2)
    /// </summary>
    public string HierarchyPath { get; private set; }

    /// <summary>
    /// Depth level in the hierarchy (0 = root, 1 = first level child, etc.)
    /// </summary>
    public int HierarchyLevel { get; private set; }

    /// <summary>
    /// Type of layer (e.g., Standard, Template, System)
    /// </summary>
    public LayerType Type { get; private set; }

    // Private constructor for EF Core
    private Layer()
    {
        Code = string.Empty;
        Name = string.Empty;
        Description = string.Empty;
        Color = "#000000";
        Opacity = 1.0;
        IsVisible = true;
        IsSelectable = true;
        IsLocked = false;
        IsPrintable = true;
        DisplayOrder = 0;
        Properties = LayerProperties.Default();
        Metadata = LayerMetadata.Empty();
        HierarchyPath = string.Empty;
        HierarchyLevel = 0;
        Type = LayerType.Standard;
        ChildLayers = new List<Layer>();
        LayerElements = new List<LayerElement>();
    }

    /// <summary>
    /// Creates a new Layer instance
    /// </summary>
    public Layer(
        string code,
        string name,
        string description,
        Guid drawingId,
        string color = "#000000",
        double opacity = 1.0,
        LayerType type = LayerType.Standard,
        LayerProperties? properties = null,
        LayerMetadata? metadata = null,
        Guid? parentLayerId = null) : base()
    {
        ValidateParameters(code, name, color, opacity);

        Code = code;
        Name = name;
        Description = description;
        DrawingId = drawingId;
        Color = color;
        Opacity = opacity;
        Type = type;
        ParentLayerId = parentLayerId;
        IsVisible = true;
        IsSelectable = true;
        IsLocked = false;
        IsPrintable = true;
        DisplayOrder = 0;
        Properties = properties ?? LayerProperties.Default();
        Metadata = metadata ?? LayerMetadata.Empty();
        ChildLayers = new List<Layer>();
        LayerElements = new List<LayerElement>();

        // Initialize hierarchy (need to call this after all properties are set)
        HierarchyPath = string.Empty; // Temporary value, will be updated
        HierarchyLevel = 0;
        UpdateHierarchy();
    }

    /// <summary>
    /// Update layer properties
    /// </summary>
    public void UpdateLayer(
        string name,
        string description,
        string color,
        double opacity,
        LayerProperties properties,
        string modifiedBy)
    {
        ValidateParameters(Code, name, color, opacity);

        Name = name;
        Description = description;
        Color = color;
        Opacity = opacity;
        Properties = properties;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update layer visibility settings
    /// </summary>
    public void UpdateVisibility(
        bool isVisible,
        bool isSelectable,
        bool isLocked,
        bool isPrintable,
        string modifiedBy)
    {
        IsVisible = isVisible;
        IsSelectable = isSelectable;
        IsLocked = isLocked;
        IsPrintable = isPrintable;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set display order for layer stacking
    /// </summary>
    public void SetDisplayOrder(int displayOrder, string modifiedBy)
    {
        DisplayOrder = displayOrder;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update layer metadata
    /// </summary>
    public void UpdateMetadata(LayerMetadata metadata, string modifiedBy)
    {
        Metadata = metadata ?? throw new ArgumentNullException(nameof(metadata));
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Move layer to a different parent (change hierarchy)
    /// </summary>
    public void MoveToParent(Guid? newParentLayerId, string modifiedBy)
    {
        ParentLayerId = newParentLayerId;
        UpdateHierarchy();
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Add a child layer
    /// </summary>
    public void AddChildLayer(Layer childLayer)
    {
        if (childLayer == null)
            throw new ArgumentNullException(nameof(childLayer));

        if (childLayer.DrawingId != DrawingId)
            throw new InvalidOperationException("Child layer must belong to the same drawing");

        if (childLayer.Id == Id)
            throw new InvalidOperationException("Layer cannot be its own child");

        // Check for circular references
        if (IsDescendantOf(childLayer))
            throw new InvalidOperationException("Cannot create circular hierarchy");

        childLayer.ParentLayerId = Id;
        childLayer.UpdateHierarchy();
        ChildLayers.Add(childLayer);
    }

    /// <summary>
    /// Remove a child layer
    /// </summary>
    public void RemoveChildLayer(Layer childLayer)
    {
        if (childLayer != null && ChildLayers.Contains(childLayer))
        {
            childLayer.ParentLayerId = null;
            childLayer.UpdateHierarchy();
            ChildLayers.Remove(childLayer);
        }
    }

    /// <summary>
    /// Add an element (node/symbol) to this layer
    /// </summary>
    public void AddElement(Guid elementId, LayerElementType elementType, string modifiedBy)
    {
        var layerElement = new LayerElement(Id, elementId, elementType);
        LayerElements.Add(layerElement);
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Remove an element from this layer
    /// </summary>
    public void RemoveElement(Guid elementId, string modifiedBy)
    {
        var element = LayerElements.FirstOrDefault(e => e.ElementId == elementId);
        if (element != null)
        {
            LayerElements.Remove(element);
            UpdateModificationInfo(modifiedBy);
        }
    }

    /// <summary>
    /// Get all child layers (direct children only)
    /// </summary>
    public IReadOnlyList<Layer> GetChildLayers()
    {
        return ChildLayers.Where(l => !l.IsDeleted).ToList().AsReadOnly();
    }

    /// <summary>
    /// Get all descendant layers (recursive)
    /// </summary>
    public IReadOnlyList<Layer> GetDescendantLayers()
    {
        var descendants = new List<Layer>();
        CollectDescendants(this, descendants);
        return descendants.AsReadOnly();
    }

    /// <summary>
    /// Get layer path from root to this layer
    /// </summary>
    public IReadOnlyList<Layer> GetLayerPath()
    {
        var path = new List<Layer>();
        var current = this;

        while (current != null)
        {
            path.Insert(0, current);
            current = current.ParentLayer;
        }

        return path.AsReadOnly();
    }

    /// <summary>
    /// Check if this layer is a descendant of another layer
    /// </summary>
    public bool IsDescendantOf(Layer potentialAncestor)
    {
        if (potentialAncestor == null) return false;

        var current = ParentLayer;
        while (current != null)
        {
            if (current.Id == potentialAncestor.Id)
                return true;
            current = current.ParentLayer;
        }

        return false;
    }

    /// <summary>
    /// Check if this layer is an ancestor of another layer
    /// </summary>
    public bool IsAncestorOf(Layer potentialDescendant)
    {
        return potentialDescendant?.IsDescendantOf(this) ?? false;
    }

    /// <summary>
    /// Get elements on this layer by type
    /// </summary>
    public IReadOnlyList<LayerElement> GetElementsByType(LayerElementType elementType)
    {
        return LayerElements.Where(e => e.ElementType == elementType).ToList().AsReadOnly();
    }

    /// <summary>
    /// Check if layer has elements
    /// </summary>
    public bool HasElements()
    {
        return LayerElements.Any();
    }

    /// <summary>
    /// Check if layer has child layers
    /// </summary>
    public bool HasChildren()
    {
        return ChildLayers.Any(l => !l.IsDeleted);
    }

    /// <summary>
    /// Check if this is a root layer (no parent)
    /// </summary>
    public bool IsRoot()
    {
        return ParentLayerId == null;
    }

    /// <summary>
    /// Calculate effective visibility (considering parent layer visibility)
    /// </summary>
    public bool GetEffectiveVisibility()
    {
        if (!IsVisible) return false;

        var current = ParentLayer;
        while (current != null)
        {
            if (!current.IsVisible) return false;
            current = current.ParentLayer;
        }

        return true;
    }

    /// <summary>
    /// Calculate effective opacity (considering parent layer opacity)
    /// </summary>
    public double GetEffectiveOpacity()
    {
        var effectiveOpacity = Opacity;
        var current = ParentLayer;

        while (current != null)
        {
            effectiveOpacity *= current.Opacity;
            current = current.ParentLayer;
        }

        return Math.Max(0.0, Math.Min(1.0, effectiveOpacity));
    }

    /// <summary>
    /// Create a copy of this layer with a new code and optionally a new parent
    /// </summary>
    public Layer Clone(string newCode, Guid? newParentLayerId = null, string createdBy = "")
    {
        ValidateParameters(newCode, Name, Color, Opacity);

        var cloned = new Layer(
            newCode,
            $"{Name} (Copy)",
            Description,
            DrawingId,
            Color,
            Opacity,
            Type,
            Properties,
            Metadata.Clone(),
            newParentLayerId ?? ParentLayerId)
        {
            IsVisible = IsVisible,
            IsSelectable = IsSelectable,
            IsLocked = IsLocked,
            IsPrintable = IsPrintable,
            DisplayOrder = DisplayOrder,
            CreatedBy = createdBy
        };

        return cloned;
    }

    /// <summary>
    /// Update hierarchy path and level based on parent relationship
    /// </summary>
    private void UpdateHierarchy()
    {
        if (ParentLayer == null)
        {
            // Root layer
            HierarchyPath = Code;
            HierarchyLevel = 0;
        }
        else
        {
            // Child layer
            HierarchyPath = $"{ParentLayer.HierarchyPath}.{Code}";
            HierarchyLevel = ParentLayer.HierarchyLevel + 1;
        }

        // Update all child layers recursively
        foreach (var child in ChildLayers)
        {
            child.UpdateHierarchy();
        }
    }

    /// <summary>
    /// Recursively collect all descendant layers
    /// </summary>
    private void CollectDescendants(Layer layer, List<Layer> descendants)
    {
        foreach (var child in layer.ChildLayers.Where(l => !l.IsDeleted))
        {
            descendants.Add(child);
            CollectDescendants(child, descendants);
        }
    }

    /// <summary>
    /// Validate layer parameters
    /// </summary>
    private static void ValidateParameters(string code, string name, string color, double opacity)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Layer code cannot be null or empty", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Layer name cannot be null or empty", nameof(name));

        if (string.IsNullOrWhiteSpace(color))
            throw new ArgumentException("Layer color cannot be null or empty", nameof(color));

        if (!IsValidHexColor(color))
            throw new ArgumentException("Layer color must be a valid hex color (e.g., #FF0000)", nameof(color));

        if (opacity < 0.0 || opacity > 1.0)
            throw new ArgumentException("Layer opacity must be between 0.0 and 1.0", nameof(opacity));
    }

    /// <summary>
    /// Validate hex color format
    /// </summary>
    private static bool IsValidHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color) || !color.StartsWith("#"))
            return false;

        if (color.Length != 7) // #RRGGBB
            return false;

        return color.Substring(1).All(c =>
            (c >= '0' && c <= '9') ||
            (c >= 'A' && c <= 'F') ||
            (c >= 'a' && c <= 'f'));
    }
}