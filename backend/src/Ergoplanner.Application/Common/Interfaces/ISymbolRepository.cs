using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Symbol aggregate
/// </summary>
public interface ISymbolRepository
{
    /// <summary>
    /// Get a symbol by its unique identifier
    /// </summary>
    Task<Symbol?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a symbol by its code
    /// </summary>
    Task<Symbol?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols by category
    /// </summary>
    Task<List<Symbol>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols by category code
    /// </summary>
    Task<List<Symbol>> GetByCategoryCodeAsync(string categoryCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols by multiple category IDs
    /// </summary>
    Task<List<Symbol>> GetByCategoriesAsync(List<Guid> categoryIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols that comply with a specific standard
    /// </summary>
    Task<List<Symbol>> GetByStandardAsync(string standard, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols by tag(s)
    /// </summary>
    Task<List<Symbol>> GetByTagsAsync(List<string> tags, bool matchAll = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Search symbols by text (name, description, tags, metadata)
    /// </summary>
    Task<List<Symbol>> SearchAsync(string searchText, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols with advanced filtering
    /// </summary>
    Task<List<Symbol>> GetFilteredAsync(
        List<Guid>? categoryIds = null,
        List<string>? standards = null,
        List<string>? tags = null,
        bool? isActive = null,
        string? searchText = null,
        int? skip = null,
        int? take = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols that can connect to another symbol
    /// </summary>
    Task<List<Symbol>> GetCompatibleSymbolsAsync(
        Guid symbolId,
        string connectionPointId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols by connection type
    /// </summary>
    Task<List<Symbol>> GetByConnectionTypeAsync(
        Ergoplanner.Domain.Enums.ConnectionType connectionType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols within a specific dimension range
    /// </summary>
    Task<List<Symbol>> GetByDimensionRangeAsync(
        double minWidth,
        double maxWidth,
        double minHeight,
        double maxHeight,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated list of symbols
    /// </summary>
    Task<(List<Symbol> Items, int TotalCount)> GetPagedAsync(
        int pageNumber = 1,
        int pageSize = 50,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols for display at specific zoom level
    /// </summary>
    Task<List<Symbol>> GetForZoomLevelAsync(double zoomLevel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a symbol code is unique
    /// </summary>
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbol statistics (counts by category, standard, etc.)
    /// </summary>
    Task<SymbolStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a new symbol
    /// </summary>
    Task<Symbol> AddAsync(Symbol symbol, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add multiple symbols
    /// </summary>
    Task<List<Symbol>> AddRangeAsync(List<Symbol> symbols, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing symbol
    /// </summary>
    Task<Symbol> UpdateAsync(Symbol symbol, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a symbol (soft delete)
    /// </summary>
    Task DeleteAsync(Guid id, string deletedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete multiple symbols (soft delete)
    /// </summary>
    Task DeleteRangeAsync(List<Guid> ids, string deletedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Permanently delete a symbol (hard delete)
    /// </summary>
    Task HardDeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Restore a soft-deleted symbol
    /// </summary>
    Task RestoreAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get count of symbols matching criteria
    /// </summary>
    Task<int> CountAsync(
        List<Guid>? categoryIds = null,
        List<string>? standards = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if any symbols exist in a category
    /// </summary>
    Task<bool> AnyInCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols that were modified after a specific date
    /// </summary>
    Task<List<Symbol>> GetModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default);

    /// <summary>
    /// Bulk update symbol active status
    /// </summary>
    Task BulkUpdateActiveStatusAsync(
        List<Guid> symbolIds,
        bool isActive,
        string modifiedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bulk update symbol category
    /// </summary>
    Task BulkUpdateCategoryAsync(
        List<Guid> symbolIds,
        Guid newCategoryId,
        string modifiedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Import symbols from external source
    /// </summary>
    Task<ImportResult> ImportSymbolsAsync(
        List<Symbol> symbols,
        ImportOptions options,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Export symbols to external format
    /// </summary>
    Task<ExportResult> ExportSymbolsAsync(
        List<Guid> symbolIds,
        ExportOptions options,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate symbol data integrity
    /// </summary>
    Task<ValidationResult> ValidateSymbolAsync(Symbol symbol, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get symbols with missing or invalid SVG content
    /// </summary>
    Task<List<Symbol>> GetSymbolsWithInvalidSvgAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Save changes to the repository
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Symbol statistics data
/// </summary>
public class SymbolStatistics
{
    public int TotalSymbols { get; set; }
    public int ActiveSymbols { get; set; }
    public int InactiveSymbols { get; set; }
    public Dictionary<string, int> SymbolsByCategory { get; set; } = new();
    public Dictionary<string, int> SymbolsByStandard { get; set; } = new();
    public Dictionary<string, int> SymbolsByTag { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Import options for symbol data
/// </summary>
public class ImportOptions
{
    public bool OverwriteExisting { get; set; } = false;
    public bool ValidateOnImport { get; set; } = true;
    public bool CreateMissingCategories { get; set; } = true;
    public string ImportSource { get; set; } = string.Empty;
    public string ImportedBy { get; set; } = string.Empty;
}

/// <summary>
/// Import result data
/// </summary>
public class ImportResult
{
    public int TotalProcessed { get; set; }
    public int SuccessfulImports { get; set; }
    public int FailedImports { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public TimeSpan Duration { get; set; }
}

/// <summary>
/// Export options for symbol data
/// </summary>
public class ExportOptions
{
    public string Format { get; set; } = "JSON";
    public bool IncludeMetadata { get; set; } = true;
    public bool IncludeSvgContent { get; set; } = true;
    public bool IncludeConnectionPoints { get; set; } = true;
    public bool CompressOutput { get; set; } = false;
    public string ExportedBy { get; set; } = string.Empty;
}

/// <summary>
/// Export result data
/// </summary>
public class ExportResult
{
    public int TotalExported { get; set; }
    public string OutputPath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public TimeSpan Duration { get; set; }
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// Validation result for symbol data
/// </summary>
public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<ValidationError> Errors { get; set; } = new();
    public List<ValidationWarning> Warnings { get; set; } = new();
}

/// <summary>
/// Validation error details
/// </summary>
public class ValidationError
{
    public string Property { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// Validation warning details
/// </summary>
public class ValidationWarning
{
    public string Property { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}