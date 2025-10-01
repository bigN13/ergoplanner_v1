using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a mapping between external CAD symbols and internal ReactFlow components
/// </summary>
public class SymbolMapping : BaseEntity
{
    /// <summary>
    /// External symbol identifier from CAD library
    /// </summary>
    public string ExternalSymbolId { get; private set; } = string.Empty;

    /// <summary>
    /// External symbol name or code
    /// </summary>
    public string ExternalSymbolName { get; private set; } = string.Empty;

    /// <summary>
    /// Internal ReactFlow component identifier
    /// </summary>
    public string InternalComponentId { get; private set; } = string.Empty;

    /// <summary>
    /// Internal component name
    /// </summary>
    public string InternalComponentName { get; private set; } = string.Empty;

    /// <summary>
    /// Symbol library source
    /// </summary>
    public SymbolLibraryType LibraryType { get; private set; }

    /// <summary>
    /// Mapping confidence score (0.0 to 1.0)
    /// </summary>
    public double ConfidenceScore { get; private set; }

    /// <summary>
    /// Mapping method used
    /// </summary>
    public SymbolMappingMethod MappingMethod { get; private set; }

    /// <summary>
    /// Whether mapping was manually verified
    /// </summary>
    public bool IsManuallyVerified { get; private set; }

    /// <summary>
    /// Whether mapping is active
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Additional metadata as JSON
    /// </summary>
    public string? Metadata { get; private set; }

    /// <summary>
    /// Symbol category reference
    /// </summary>
    public Guid? SymbolCategoryId { get; private set; }
    public SymbolCategory? SymbolCategory { get; private set; }

    /// <summary>
    /// User who verified the mapping
    /// </summary>
    public string? VerifiedBy { get; private set; }

    /// <summary>
    /// When the mapping was verified
    /// </summary>
    public DateTime? VerifiedAt { get; private set; }

    // Private constructor for EF Core
    private SymbolMapping() { }

    public SymbolMapping(
        string externalSymbolId,
        string externalSymbolName,
        string internalComponentId,
        string internalComponentName,
        SymbolLibraryType libraryType,
        double confidenceScore,
        SymbolMappingMethod mappingMethod,
        string? metadata = null,
        Guid? symbolCategoryId = null)
    {
        if (string.IsNullOrWhiteSpace(externalSymbolId))
            throw new ArgumentException("External symbol ID is required", nameof(externalSymbolId));

        if (string.IsNullOrWhiteSpace(externalSymbolName))
            throw new ArgumentException("External symbol name is required", nameof(externalSymbolName));

        if (string.IsNullOrWhiteSpace(internalComponentId))
            throw new ArgumentException("Internal component ID is required", nameof(internalComponentId));

        if (string.IsNullOrWhiteSpace(internalComponentName))
            throw new ArgumentException("Internal component name is required", nameof(internalComponentName));

        if (confidenceScore < 0.0 || confidenceScore > 1.0)
            throw new ArgumentException("Confidence score must be between 0.0 and 1.0", nameof(confidenceScore));

        ExternalSymbolId = externalSymbolId;
        ExternalSymbolName = externalSymbolName;
        InternalComponentId = internalComponentId;
        InternalComponentName = internalComponentName;
        LibraryType = libraryType;
        ConfidenceScore = confidenceScore;
        MappingMethod = mappingMethod;
        IsActive = true;
        IsManuallyVerified = false;
        Metadata = metadata;
        SymbolCategoryId = symbolCategoryId;
    }

    /// <summary>
    /// Manually verify the mapping
    /// </summary>
    public void Verify(string verifiedBy)
    {
        if (string.IsNullOrWhiteSpace(verifiedBy))
            throw new ArgumentException("Verified by is required", nameof(verifiedBy));

        IsManuallyVerified = true;
        VerifiedBy = verifiedBy;
        VerifiedAt = DateTime.UtcNow;
        ConfidenceScore = 1.0; // Manual verification means 100% confidence
    }

    /// <summary>
    /// Update the confidence score
    /// </summary>
    public void UpdateConfidence(double newScore)
    {
        if (newScore < 0.0 || newScore > 1.0)
            throw new ArgumentException("Confidence score must be between 0.0 and 1.0", nameof(newScore));

        ConfidenceScore = newScore;
    }

    /// <summary>
    /// Update internal component mapping
    /// </summary>
    public void UpdateInternalComponent(string componentId, string componentName, string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(componentId))
            throw new ArgumentException("Component ID is required", nameof(componentId));

        if (string.IsNullOrWhiteSpace(componentName))
            throw new ArgumentException("Component name is required", nameof(componentName));

        InternalComponentId = componentId;
        InternalComponentName = componentName;
        UpdateModificationInfo(modifiedBy);

        // Reset verification if mapping changed
        if (IsManuallyVerified)
        {
            IsManuallyVerified = false;
            VerifiedBy = null;
            VerifiedAt = null;
        }
    }

    /// <summary>
    /// Deactivate the mapping
    /// </summary>
    public void Deactivate(string modifiedBy)
    {
        IsActive = false;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Reactivate the mapping
    /// </summary>
    public void Reactivate(string modifiedBy)
    {
        IsActive = true;
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
}
