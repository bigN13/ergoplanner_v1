using Ergoplanner.Domain.Common;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a standard symbol definition from a symbol library
/// </summary>
public class StandardSymbolDefinition : BaseEntity
{
    /// <summary>
    /// Symbol library reference
    /// </summary>
    public Guid LibraryId { get; private set; }
    public SymbolLibrary Library { get; private set; } = null!;

    /// <summary>
    /// Symbol code/identifier in the standard
    /// </summary>
    public string SymbolCode { get; private set; } = string.Empty;

    /// <summary>
    /// Symbol name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Symbol description
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Symbol category (e.g., "Pumps", "Valves", "Instruments")
    /// </summary>
    public string Category { get; private set; } = string.Empty;

    /// <summary>
    /// Symbol subcategory
    /// </summary>
    public string? Subcategory { get; private set; }

    /// <summary>
    /// SVG path data for the symbol
    /// </summary>
    public string? SvgPath { get; private set; }

    /// <summary>
    /// Image URL or base64 data
    /// </summary>
    public string? ImageData { get; private set; }

    /// <summary>
    /// Symbol tags for searching
    /// </summary>
    public string Tags { get; private set; } = string.Empty;

    /// <summary>
    /// Symbol metadata as JSON (properties, dimensions, etc.)
    /// </summary>
    public string? Metadata { get; private set; }

    /// <summary>
    /// Whether symbol is active
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Symbol category reference
    /// </summary>
    public Guid? SymbolCategoryId { get; private set; }
    public SymbolCategory? SymbolCategory { get; private set; }

    // Private constructor for EF Core
    private StandardSymbolDefinition() { }

    public StandardSymbolDefinition(
        Guid libraryId,
        string symbolCode,
        string name,
        string description,
        string category,
        string? subcategory = null,
        string? svgPath = null,
        string? imageData = null,
        string tags = "",
        string? metadata = null,
        Guid? symbolCategoryId = null)
    {
        if (libraryId == Guid.Empty)
            throw new ArgumentException("Library ID is required", nameof(libraryId));

        if (string.IsNullOrWhiteSpace(symbolCode))
            throw new ArgumentException("Symbol code is required", nameof(symbolCode));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Symbol name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(category))
            throw new ArgumentException("Symbol category is required", nameof(category));

        LibraryId = libraryId;
        SymbolCode = symbolCode;
        Name = name;
        Description = description;
        Category = category;
        Subcategory = subcategory;
        SvgPath = svgPath;
        ImageData = imageData;
        Tags = tags;
        Metadata = metadata;
        IsActive = true;
        SymbolCategoryId = symbolCategoryId;
    }

    /// <summary>
    /// Update symbol details
    /// </summary>
    public void Update(
        string name,
        string description,
        string category,
        string? subcategory,
        string tags,
        string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Symbol name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(category))
            throw new ArgumentException("Symbol category is required", nameof(category));

        Name = name;
        Description = description;
        Category = category;
        Subcategory = subcategory;
        Tags = tags;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update visual representation
    /// </summary>
    public void UpdateVisual(string? svgPath, string? imageData, string modifiedBy)
    {
        SvgPath = svgPath;
        ImageData = imageData;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update metadata
    /// </summary>
    public void UpdateMetadata(string? metadata, string modifiedBy)
    {
        Metadata = metadata;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Deactivate symbol
    /// </summary>
    public void Deactivate(string modifiedBy)
    {
        IsActive = false;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Reactivate symbol
    /// </summary>
    public void Reactivate(string modifiedBy)
    {
        IsActive = true;
        UpdateModificationInfo(modifiedBy);
    }
}
