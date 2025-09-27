using Ergoplanner.Domain.Common;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a category for organizing symbols
/// </summary>
public class SymbolCategory : BaseEntity
{
    /// <summary>
    /// Category name
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// Category description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Parent category ID for hierarchical organization
    /// </summary>
    public Guid? ParentId { get; private set; }

    /// <summary>
    /// Display order within the same parent level
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Icon for the category (could be SVG or icon class)
    /// </summary>
    public string? Icon { get; private set; }

    /// <summary>
    /// Color for visual identification (hex code)
    /// </summary>
    public string? Color { get; private set; }

    /// <summary>
    /// Standard this category belongs to
    /// </summary>
    public string? Standard { get; private set; }

    /// <summary>
    /// Whether this category is active
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Metadata for additional properties
    /// </summary>
    public Dictionary<string, object> Metadata { get; private set; }

    /// <summary>
    /// Navigation property for parent category
    /// </summary>
    public virtual SymbolCategory? Parent { get; private set; }

    /// <summary>
    /// Navigation property for child categories
    /// </summary>
    public virtual ICollection<SymbolCategory> Children { get; private set; }

    /// <summary>
    /// Navigation property for symbols in this category
    /// </summary>
    public virtual ICollection<Symbol> Symbols { get; private set; }

    /// <summary>
    /// Creates a new symbol category
    /// </summary>
    public SymbolCategory(string name, string? description = null, Guid? parentId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty", nameof(name));

        Name = name;
        Description = description;
        ParentId = parentId;
        DisplayOrder = 0;
        IsActive = true;
        Metadata = new Dictionary<string, object>();
        Children = new HashSet<SymbolCategory>();
        Symbols = new HashSet<Symbol>();
    }

    /// <summary>
    /// Update category name
    /// </summary>
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty", nameof(name));

        Name = name;
    }

    /// <summary>
    /// Update category description
    /// </summary>
    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    /// <summary>
    /// Set parent category
    /// </summary>
    public void SetParent(Guid? parentId)
    {
        if (parentId == Id)
            throw new InvalidOperationException("Category cannot be its own parent");

        ParentId = parentId;
    }

    /// <summary>
    /// Set display order
    /// </summary>
    public void SetDisplayOrder(int order)
    {
        if (order < 0)
            throw new ArgumentException("Display order cannot be negative", nameof(order));

        DisplayOrder = order;
    }

    /// <summary>
    /// Set category icon
    /// </summary>
    public void SetIcon(string? icon)
    {
        Icon = icon;
    }

    /// <summary>
    /// Set category color
    /// </summary>
    public void SetColor(string? color)
    {
        // Validate hex color format if provided
        if (color != null && !System.Text.RegularExpressions.Regex.IsMatch(color, "^#(?:[0-9a-fA-F]{3}){1,2}$"))
            throw new ArgumentException("Color must be a valid hex color code", nameof(color));

        Color = color;
    }

    /// <summary>
    /// Set the standard for this category
    /// </summary>
    public void SetStandard(string? standard)
    {
        Standard = standard;
    }

    /// <summary>
    /// Activate the category
    /// </summary>
    public void Activate()
    {
        IsActive = true;
    }

    /// <summary>
    /// Deactivate the category
    /// </summary>
    public void Deactivate()
    {
        IsActive = false;
    }

    /// <summary>
    /// Add or update metadata
    /// </summary>
    public void SetMetadata(string key, object value)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Metadata key cannot be empty", nameof(key));

        Metadata[key] = value;
    }

    /// <summary>
    /// Remove metadata
    /// </summary>
    public void RemoveMetadata(string key)
    {
        Metadata.Remove(key);
    }

    /// <summary>
    /// Check if this is a root category (no parent)
    /// </summary>
    public bool IsRoot => ParentId == null;

    /// <summary>
    /// Check if this category has children
    /// </summary>
    public bool HasChildren => Children?.Any() ?? false;

    /// <summary>
    /// Get the full path of this category (for hierarchical display)
    /// </summary>
    public string GetFullPath()
    {
        if (Parent == null)
            return Name;

        return $"{Parent.GetFullPath()} / {Name}";
    }
}