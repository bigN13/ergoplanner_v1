using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a standard symbol library (ISA-5.1, ISO 14617, UK water companies)
/// </summary>
public class SymbolLibrary : BaseEntity
{
    /// <summary>
    /// Library name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Library type/standard
    /// </summary>
    public SymbolLibraryType Type { get; private set; }

    /// <summary>
    /// Library version
    /// </summary>
    public string Version { get; private set; } = string.Empty;

    /// <summary>
    /// Library description
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Whether library is active and available
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Number of symbols in library
    /// </summary>
    public int SymbolCount { get; private set; }

    /// <summary>
    /// Library metadata as JSON
    /// </summary>
    public string? Metadata { get; private set; }

    /// <summary>
    /// Symbols defined in this library
    /// </summary>
    public ICollection<StandardSymbolDefinition> Symbols { get; private set; } = new List<StandardSymbolDefinition>();

    // Private constructor for EF Core
    private SymbolLibrary() { }

    public SymbolLibrary(
        string name,
        SymbolLibraryType type,
        string version,
        string description,
        string? metadata = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Library name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(version))
            throw new ArgumentException("Library version is required", nameof(version));

        Name = name;
        Type = type;
        Version = version;
        Description = description;
        IsActive = true;
        SymbolCount = 0;
        Metadata = metadata;
    }

    /// <summary>
    /// Update symbol count
    /// </summary>
    public void UpdateSymbolCount(int count)
    {
        if (count < 0)
            throw new ArgumentException("Symbol count cannot be negative", nameof(count));

        SymbolCount = count;
    }

    /// <summary>
    /// Deactivate library
    /// </summary>
    public void Deactivate(string modifiedBy)
    {
        IsActive = false;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Reactivate library
    /// </summary>
    public void Reactivate(string modifiedBy)
    {
        IsActive = true;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update library details
    /// </summary>
    public void Update(string name, string version, string description, string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Library name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(version))
            throw new ArgumentException("Library version is required", nameof(version));

        Name = name;
        Version = version;
        Description = description;
        UpdateModificationInfo(modifiedBy);
    }
}
