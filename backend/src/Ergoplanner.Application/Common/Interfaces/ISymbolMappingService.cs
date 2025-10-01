using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Service for mapping external CAD symbols to internal ReactFlow components
/// </summary>
public interface ISymbolMappingService
{
    /// <summary>
    /// Find exact match for a symbol by code
    /// </summary>
    Task<SymbolMapping?> FindExactMatchAsync(
        string symbolCode,
        SymbolLibraryType libraryType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Find fuzzy matches using Levenshtein distance
    /// </summary>
    Task<List<SymbolMappingResult>> FindFuzzyMatchesAsync(
        string symbolName,
        SymbolLibraryType? libraryType = null,
        double minimumConfidence = 0.7,
        int maxResults = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Find matches using ML-based recognition
    /// </summary>
    Task<List<SymbolMappingResult>> FindMLBasedMatchesAsync(
        string symbolDescription,
        byte[]? imageData = null,
        SymbolLibraryType? libraryType = null,
        double minimumConfidence = 0.7,
        int maxResults = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Create or update a symbol mapping
    /// </summary>
    Task<SymbolMapping> CreateMappingAsync(
        string externalSymbolId,
        string externalSymbolName,
        string internalComponentId,
        string internalComponentName,
        SymbolLibraryType libraryType,
        double confidenceScore,
        SymbolMappingMethod mappingMethod,
        string? metadata = null,
        Guid? symbolCategoryId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Manually verify a mapping
    /// </summary>
    Task<bool> VerifyMappingAsync(
        Guid mappingId,
        string verifiedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bulk map symbols from a CAD file
    /// </summary>
    Task<BulkMappingResult> BulkMapSymbolsAsync(
        List<ExternalSymbolInfo> externalSymbols,
        SymbolLibraryType libraryType,
        bool autoVerifyExactMatches = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all mappings for a library
    /// </summary>
    Task<List<SymbolMapping>> GetMappingsByLibraryAsync(
        SymbolLibraryType libraryType,
        bool activeOnly = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Clear cache for frequently mapped symbols
    /// </summary>
    void ClearCache();
}

/// <summary>
/// Result of a symbol mapping search
/// </summary>
public class SymbolMappingResult
{
    public string ExternalSymbolId { get; set; } = string.Empty;
    public string ExternalSymbolName { get; set; } = string.Empty;
    public string InternalComponentId { get; set; } = string.Empty;
    public string InternalComponentName { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; }
    public SymbolMappingMethod Method { get; set; }
    public bool IsExistingMapping { get; set; }
    public Guid? ExistingMappingId { get; set; }
}

/// <summary>
/// Information about an external symbol to be mapped
/// </summary>
public class ExternalSymbolInfo
{
    public string SymbolId { get; set; } = string.Empty;
    public string SymbolName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public byte[]? ImageData { get; set; }
}

/// <summary>
/// Result of bulk mapping operation
/// </summary>
public class BulkMappingResult
{
    public int TotalSymbols { get; set; }
    public int MappedSymbols { get; set; }
    public int UnmappedSymbols { get; set; }
    public int ExactMatches { get; set; }
    public int FuzzyMatches { get; set; }
    public int MLMatches { get; set; }
    public List<SymbolMappingResult> Mappings { get; set; } = new();
    public List<string> UnmappedSymbolIds { get; set; } = new();
    public TimeSpan ProcessingTime { get; set; }
}
