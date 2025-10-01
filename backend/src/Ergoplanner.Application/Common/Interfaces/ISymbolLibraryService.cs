using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.ValueObjects;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Service interface for Symbol Library operations
/// </summary>
public interface ISymbolLibraryService
{
    // Query Operations

    /// <summary>
    /// Get symbol by ID
    /// </summary>
    Task<Symbol?> GetSymbolByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Search symbols with fuzzy matching
    /// </summary>
    Task<IEnumerable<Symbol>> SearchSymbolsAsync(
        string searchTerm,
        int maxResults = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols by category
    /// </summary>
    Task<IEnumerable<Symbol>> GetSymbolsByCategoryAsync(
        Guid categoryId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols by standard (ISA-5.1, PIP, ISO-14617, UK Water)
    /// </summary>
    Task<IEnumerable<Symbol>> GetSymbolsByStandardAsync(
        string standard,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get compatible symbols for connection
    /// </summary>
    Task<IEnumerable<Symbol>> GetCompatibleSymbolsAsync(
        Guid symbolId,
        string connectionPointId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated symbols
    /// </summary>
    Task<(IEnumerable<Symbol> Items, int TotalCount)> GetPagedSymbolsAsync(
        int pageNumber = 1,
        int pageSize = 50,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default);

    // Command Operations

    /// <summary>
    /// Create a new symbol
    /// </summary>
    Task<Symbol> CreateSymbolAsync(
        Symbol symbol,
        string createdBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing symbol
    /// </summary>
    Task<Symbol> UpdateSymbolAsync(
        Symbol symbol,
        string modifiedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a symbol (soft delete)
    /// </summary>
    Task DeleteSymbolAsync(
        Guid id,
        string deletedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Import symbols from external source
    /// </summary>
    Task<ImportResult> ImportSymbolsAsync(
        IEnumerable<Symbol> symbols,
        ImportOptions options,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Export symbols to external format
    /// </summary>
    Task<ExportResult> ExportSymbolsAsync(
        IEnumerable<Guid> symbolIds,
        ExportOptions options,
        CancellationToken cancellationToken = default);

    // Standard Conversion Operations

    /// <summary>
    /// Convert symbol between standards
    /// </summary>
    Task<Symbol> ConvertSymbolStandardAsync(
        Guid symbolId,
        string fromStandard,
        string toStandard,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get equivalent symbols in different standards
    /// </summary>
    Task<IDictionary<string, Symbol>> GetStandardEquivalentsAsync(
        Guid symbolId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Map symbols between standards
    /// </summary>
    Task<IEnumerable<StandardEquivalenceMapping>> GetStandardMappingsAsync(
        string fromStandard,
        string toStandard,
        CancellationToken cancellationToken = default);

    // Validation Operations

    /// <summary>
    /// Validate symbol data
    /// </summary>
    Task<ValidationResult> ValidateSymbolAsync(
        Symbol symbol,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if symbol code is unique
    /// </summary>
    Task<bool> IsSymbolCodeUniqueAsync(
        string code,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate symbol connections
    /// </summary>
    Task<bool> ValidateConnectionsAsync(
        Symbol symbol,
        CancellationToken cancellationToken = default);

    // Cache Operations

    /// <summary>
    /// Refresh symbol cache
    /// </summary>
    Task RefreshSymbolCacheAsync(Guid symbolId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clear symbol cache
    /// </summary>
    Task ClearSymbolCacheAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Preload frequently used symbols into cache
    /// </summary>
    Task PreloadFrequentSymbolsAsync(CancellationToken cancellationToken = default);

    // Statistics and Analytics

    /// <summary>
    /// Get symbol usage statistics
    /// </summary>
    Task<SymbolStatistics> GetSymbolStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get most used symbols
    /// </summary>
    Task<IEnumerable<(Symbol Symbol, int UsageCount)>> GetMostUsedSymbolsAsync(
        int top = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbol version history
    /// </summary>
    Task<IEnumerable<SymbolVersion>> GetSymbolVersionHistoryAsync(
        Guid symbolId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Symbol mapping between standards for equivalence conversions
/// </summary>
public class StandardEquivalenceMapping
{
    public string SourceStandard { get; set; } = string.Empty;
    public string SourceCode { get; set; } = string.Empty;
    public string TargetStandard { get; set; } = string.Empty;
    public string TargetCode { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; }
    public string Notes { get; set; } = string.Empty;
}

/// <summary>
/// Symbol version information
/// </summary>
public class SymbolVersion
{
    public Guid Id { get; set; }
    public Guid SymbolId { get; set; }
    public int VersionNumber { get; set; }
    public DateTime CreatedDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string ChangeDescription { get; set; } = string.Empty;
    public string SvgContent { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
}