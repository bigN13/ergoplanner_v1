using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Junction entity representing the association between layers and diagram elements (nodes/edges)
/// </summary>
public class LayerElement : BaseEntity
{
    /// <summary>
    /// ID of the layer this element belongs to
    /// </summary>
    public Guid LayerId { get; private set; }

    /// <summary>
    /// Navigation property to the layer
    /// </summary>
    public virtual Layer? Layer { get; set; }

    /// <summary>
    /// ID of the diagram element (node, edge, annotation, etc.)
    /// </summary>
    public Guid ElementId { get; private set; }

    /// <summary>
    /// Type of the diagram element
    /// </summary>
    public LayerElementType ElementType { get; private set; }

    /// <summary>
    /// Display order within the layer (for element stacking)
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Whether this element is currently visible on the layer
    /// </summary>
    public bool IsVisible { get; private set; }

    /// <summary>
    /// Whether this element is locked for editing
    /// </summary>
    public bool IsLocked { get; private set; }

    /// <summary>
    /// Element-specific metadata (e.g., styling overrides, behavior settings)
    /// </summary>
    public Dictionary<string, object> ElementMetadata { get; private set; }

    // Private constructor for EF Core
    private LayerElement()
    {
        ElementMetadata = new Dictionary<string, object>();
        IsVisible = true;
        IsLocked = false;
        DisplayOrder = 0;
    }

    /// <summary>
    /// Creates a new LayerElement instance
    /// </summary>
    public LayerElement(
        Guid layerId,
        Guid elementId,
        LayerElementType elementType,
        int displayOrder = 0,
        bool isVisible = true,
        bool isLocked = false,
        Dictionary<string, object>? elementMetadata = null) : base()
    {
        LayerId = layerId;
        ElementId = elementId;
        ElementType = elementType;
        DisplayOrder = displayOrder;
        IsVisible = isVisible;
        IsLocked = isLocked;
        ElementMetadata = elementMetadata ?? new Dictionary<string, object>();
    }

    /// <summary>
    /// Update element visibility and lock state
    /// </summary>
    public void UpdateElementState(bool isVisible, bool isLocked, string modifiedBy)
    {
        IsVisible = isVisible;
        IsLocked = isLocked;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set display order for element stacking within layer
    /// </summary>
    public void SetDisplayOrder(int displayOrder, string modifiedBy)
    {
        DisplayOrder = displayOrder;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Add or update element metadata
    /// </summary>
    public void SetMetadata(string key, object value, string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Metadata key cannot be null or empty", nameof(key));

        ElementMetadata[key] = value;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Remove element metadata
    /// </summary>
    public void RemoveMetadata(string key, string modifiedBy)
    {
        if (ElementMetadata.ContainsKey(key))
        {
            ElementMetadata.Remove(key);
            UpdateModificationInfo(modifiedBy);
        }
    }

    /// <summary>
    /// Get metadata value by key
    /// </summary>
    public T? GetMetadata<T>(string key) where T : class
    {
        return ElementMetadata.TryGetValue(key, out var value) ? value as T : null;
    }

    /// <summary>
    /// Check if element has specific metadata
    /// </summary>
    public bool HasMetadata(string key)
    {
        return ElementMetadata.ContainsKey(key);
    }

    /// <summary>
    /// Create a copy of this layer element for another layer
    /// </summary>
    public LayerElement Clone(Guid newLayerId, string createdBy)
    {
        return new LayerElement(
            newLayerId,
            ElementId,
            ElementType,
            DisplayOrder,
            IsVisible,
            IsLocked,
            new Dictionary<string, object>(ElementMetadata))
        {
            CreatedBy = createdBy
        };
    }
}