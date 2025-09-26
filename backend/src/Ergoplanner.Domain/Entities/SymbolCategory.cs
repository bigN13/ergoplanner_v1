using Ergoplanner.Domain.Common;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a hierarchical category for organizing engineering symbols
/// </summary>
public class SymbolCategory : BaseEntity
{
    /// <summary>
    /// Category code/identifier (e.g., "PUMPS", "VALVES-CONTROL", "INSTRUMENTS-FLOW")
    /// </summary>
    public string Code { get; private set; }

    /// <summary>
    /// Display name of the category
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// Detailed description of what symbols belong in this category
    /// </summary>
    public string Description { get; private set; }

    /// <summary>
    /// Parent category for hierarchical organization (null for root categories)
    /// </summary>
    public Guid? ParentCategoryId { get; private set; }

    /// <summary>
    /// Navigation property to parent category
    /// </summary>
    public SymbolCategory? ParentCategory { get; private set; }

    /// <summary>
    /// Child categories
    /// </summary>
    public List<SymbolCategory> ChildCategories { get; private set; }

    /// <summary>
    /// Symbols in this category
    /// </summary>
    public List<Symbol> Symbols { get; private set; }

    /// <summary>
    /// Icon or visual identifier for the category
    /// </summary>
    public string? IconPath { get; private set; }

    /// <summary>
    /// Color code for visual organization (hex color)
    /// </summary>
    public string? ColorCode { get; private set; }

    /// <summary>
    /// Display order for sorting categories
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Whether this category is currently active/visible
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Industry standard this category follows (ISA, PIP, ISO, etc.)
    /// </summary>
    public string? StandardType { get; private set; }

    /// <summary>
    /// Hierarchical path for efficient querying (e.g., "Equipment/Pumps/Centrifugal")
    /// </summary>
    public string Path { get; private set; }

    /// <summary>
    /// Depth level in the hierarchy (0 for root, 1 for first level, etc.)
    /// </summary>
    public int Level { get; private set; }

    // Private constructor for EF Core
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor
    private SymbolCategory()
#pragma warning restore CS8618
    {
        Code = string.Empty;
        Name = string.Empty;
        Description = string.Empty;
        Path = string.Empty;
        ChildCategories = new List<SymbolCategory>();
        Symbols = new List<Symbol>();
        Level = 0;
    }

    /// <summary>
    /// Creates a new SymbolCategory instance
    /// </summary>
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor
    public SymbolCategory(
        string code,
        string name,
        string description,
        Guid? parentCategoryId = null,
        string? iconPath = null,
        string? colorCode = null,
        string? standardType = null) : base()
    {
        ValidateParameters(code, name);

        Code = code;
        Name = name;
        Description = description;
        ParentCategoryId = parentCategoryId;
        IconPath = iconPath;
        ColorCode = colorCode;
        StandardType = standardType;
        IsActive = true;
        DisplayOrder = 0;
        ChildCategories = new List<SymbolCategory>();
        Symbols = new List<Symbol>();

        // Path and Level will be set when parent is established
        UpdateHierarchyInfo();
    }
#pragma warning restore CS8618

    /// <summary>
    /// Update category properties
    /// </summary>
    public void UpdateCategory(
        string name,
        string description,
        string? iconPath,
        string? colorCode,
        string? standardType,
        string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be null or empty", nameof(name));

        Name = name;
        Description = description;
        IconPath = iconPath;
        ColorCode = colorCode;
        StandardType = standardType;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set parent category
    /// </summary>
    public void SetParent(SymbolCategory? parent, string modifiedBy)
    {
        // Prevent circular references
        if (parent != null && IsAncestorOf(parent))
            throw new InvalidOperationException("Cannot set parent category that would create a circular reference");

        ParentCategory = parent;
        ParentCategoryId = parent?.Id;

        UpdateHierarchyInfo();
        UpdateModificationInfo(modifiedBy);

        // Update all child categories' hierarchy info
        UpdateChildrenHierarchy();
    }

    /// <summary>
    /// Add child category
    /// </summary>
    public void AddChildCategory(SymbolCategory childCategory, string modifiedBy)
    {
        if (childCategory == null)
            throw new ArgumentNullException(nameof(childCategory));

        if (childCategory.Id == Id)
            throw new InvalidOperationException("Cannot add category as child of itself");

        if (childCategory.IsAncestorOf(this))
            throw new InvalidOperationException("Cannot add ancestor category as child");

        childCategory.SetParent(this, modifiedBy);
        if (!ChildCategories.Contains(childCategory))
        {
            ChildCategories.Add(childCategory);
        }

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Remove child category
    /// </summary>
    public void RemoveChildCategory(SymbolCategory childCategory, string modifiedBy)
    {
        if (childCategory != null && ChildCategories.Contains(childCategory))
        {
            childCategory.SetParent(null, modifiedBy);
            ChildCategories.Remove(childCategory);
            UpdateModificationInfo(modifiedBy);
        }
    }

    /// <summary>
    /// Set display order
    /// </summary>
    public void SetDisplayOrder(int displayOrder, string modifiedBy)
    {
        DisplayOrder = displayOrder;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set active status
    /// </summary>
    public void SetActiveStatus(bool isActive, string modifiedBy)
    {
        IsActive = isActive;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Get all ancestor categories (parent, grandparent, etc.)
    /// </summary>
    public List<SymbolCategory> GetAncestors()
    {
        var ancestors = new List<SymbolCategory>();
        var current = ParentCategory;

        while (current != null)
        {
            ancestors.Add(current);
            current = current.ParentCategory;
        }

        return ancestors;
    }

    /// <summary>
    /// Get all descendant categories (children, grandchildren, etc.)
    /// </summary>
    public List<SymbolCategory> GetDescendants()
    {
        var descendants = new List<SymbolCategory>();

        foreach (var child in ChildCategories)
        {
            descendants.Add(child);
            descendants.AddRange(child.GetDescendants());
        }

        return descendants;
    }

    /// <summary>
    /// Get total count of symbols in this category and all subcategories
    /// </summary>
    public int GetTotalSymbolCount()
    {
        int count = Symbols.Count;

        foreach (var child in ChildCategories)
        {
            count += child.GetTotalSymbolCount();
        }

        return count;
    }

    /// <summary>
    /// Check if this category is root (has no parent)
    /// </summary>
    public bool IsRoot() => ParentCategoryId == null;

    /// <summary>
    /// Check if this category is leaf (has no children)
    /// </summary>
    public bool IsLeaf() => !ChildCategories.Any();

    /// <summary>
    /// Check if this category is an ancestor of the given category
    /// </summary>
    public bool IsAncestorOf(SymbolCategory category)
    {
        if (category == null)
            return false;

        var current = category.ParentCategory;
        while (current != null)
        {
            if (current.Id == Id)
                return true;
            current = current.ParentCategory;
        }

        return false;
    }

    /// <summary>
    /// Check if this category is a descendant of the given category
    /// </summary>
    public bool IsDescendantOf(SymbolCategory category)
    {
        if (category == null)
            return false;

        return category.IsAncestorOf(this);
    }

    /// <summary>
    /// Get the root category of this category's hierarchy
    /// </summary>
    public SymbolCategory GetRoot()
    {
        var current = this;
        while (current.ParentCategory != null)
        {
            current = current.ParentCategory;
        }
        return current;
    }

    private void UpdateHierarchyInfo()
    {
        if (ParentCategory == null)
        {
            Level = 0;
            Path = Name;
        }
        else
        {
            Level = ParentCategory.Level + 1;
            Path = $"{ParentCategory.Path}/{Name}";
        }
    }

    private void UpdateChildrenHierarchy()
    {
        foreach (var child in ChildCategories)
        {
            child.UpdateHierarchyInfo();
            child.UpdateChildrenHierarchy();
        }
    }

    private static void ValidateParameters(string code, string name)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Category code cannot be null or empty", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be null or empty", nameof(name));
    }
}