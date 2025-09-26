using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Common.Specifications;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Infrastructure.Data.Extensions;

namespace Ergoplanner.Infrastructure.Data.Repositories;

/// <summary>
/// Repository implementation for Symbol entity using EF Core 9.0
/// </summary>
public class SymbolRepository : ISymbolRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SymbolRepository> _logger;

    public SymbolRepository(ApplicationDbContext context, ILogger<SymbolRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Symbol?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Symbols
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Symbol?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Symbols
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.Code == code, cancellationToken);
    }

    public async Task<List<Symbol>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsByCategorySpecification(categoryId);
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetByCategoryCodeAsync(string categoryCode, CancellationToken cancellationToken = default)
    {
        return await _context.Symbols
            .Include(s => s.Category)
            .Where(s => s.Category != null && s.Category.Code == categoryCode)
            .OrderBy(s => s.Name)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetByCategoriesAsync(List<Guid> categoryIds, CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsByCategorySpecification(categoryIds);
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetByStandardAsync(string standard, CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsByStandardSpecification(standard);
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetByTagsAsync(List<string> tags, bool matchAll = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Symbols.Include(s => s.Category).AsQueryable();

        if (matchAll)
        {
            // Must match all tags
            foreach (var tag in tags)
            {
                query = query.Where(s => s.Tags.Contains(tag));
            }
        }
        else
        {
            // Match any tag
            query = query.Where(s => s.Tags.Any(tag => tags.Contains(tag)));
        }

        return await query
            .OrderBy(s => s.Name)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> SearchAsync(string searchText, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchText))
        {
            return new List<Symbol>();
        }

        // Use PostgreSQL similarity search if available
        var query = _context.Symbols
            .Include(s => s.Category)
            .Where(s =>
                EF.Functions.ILike(s.Name, $"%{searchText}%") ||
                EF.Functions.ILike(s.Description, $"%{searchText}%") ||
                EF.Functions.ILike(s.Code, $"%{searchText}%") ||
                s.Tags.Any(tag => EF.Functions.ILike(tag, $"%{searchText}%")))
            .OrderBy(s => s.Name)
            .AsNoTracking();

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetFilteredAsync(
        List<Guid>? categoryIds = null,
        List<string>? standards = null,
        List<string>? tags = null,
        bool? isActive = null,
        string? searchText = null,
        int? skip = null,
        int? take = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var specification = new FilteredSymbolsSpecification(
            categoryIds, standards, tags, isActive, searchText, skip, take, sortBy, sortDescending);

        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetCompatibleSymbolsAsync(
        Guid symbolId,
        string connectionPointId,
        CancellationToken cancellationToken = default)
    {
        var sourceSymbol = await GetByIdAsync(symbolId, cancellationToken);
        if (sourceSymbol == null)
        {
            return new List<Symbol>();
        }

        var sourceConnectionPoint = sourceSymbol.ConnectionPoints
            .FirstOrDefault(cp => cp.Id == connectionPointId);
        if (sourceConnectionPoint == null)
        {
            return new List<Symbol>();
        }

        // Find symbols with compatible connection points
        return await _context.Symbols
            .Include(s => s.Category)
            .Where(s => s.Id != symbolId &&
                       s.IsActive &&
                       s.ConnectionPoints.Any(cp => cp.CanConnectTo(sourceConnectionPoint)))
            .OrderBy(s => s.Name)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetByConnectionTypeAsync(
        ConnectionType connectionType,
        CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsByConnectionTypeSpecification(connectionType);
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<List<Symbol>> GetByDimensionRangeAsync(
        double minWidth,
        double maxWidth,
        double minHeight,
        double maxHeight,
        CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsByDimensionRangeSpecification(minWidth, maxWidth, minHeight, maxHeight);
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<(List<Symbol> Items, int TotalCount)> GetPagedAsync(
        int pageNumber = 1,
        int pageSize = 50,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var skip = (pageNumber - 1) * pageSize;
        var specification = new FilteredSymbolsSpecification(
            skip: skip, take: pageSize, sortBy: sortBy, sortDescending: sortDescending);

        var items = await ApplySpecification(specification).ToListAsync(cancellationToken);
        var totalCount = await _context.Symbols.CountAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<List<Symbol>> GetForZoomLevelAsync(double zoomLevel, CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsForZoomLevelSpecification(zoomLevel);
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Symbols.Where(s => s.Code == code);
        if (excludeId.HasValue)
        {
            query = query.Where(s => s.Id != excludeId.Value);
        }

        return !await query.AnyAsync(cancellationToken);
    }

    public async Task<SymbolStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var totalSymbols = await _context.Symbols.CountAsync(cancellationToken);
        var activeSymbols = await _context.Symbols.CountAsync(s => s.IsActive, cancellationToken);
        var inactiveSymbols = totalSymbols - activeSymbols;

        var symbolsByCategory = await _context.Symbols
            .Include(s => s.Category)
            .Where(s => s.Category != null)
            .GroupBy(s => s.Category!.Name)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Category, x => x.Count, cancellationToken);

        var symbolsByStandard = await _context.Symbols
            .Select(s => s.StandardCompliance.PrimaryStandard)
            .GroupBy(standard => standard)
            .Select(g => new { Standard = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Standard, x => x.Count, cancellationToken);

        return new SymbolStatistics
        {
            TotalSymbols = totalSymbols,
            ActiveSymbols = activeSymbols,
            InactiveSymbols = inactiveSymbols,
            SymbolsByCategory = symbolsByCategory,
            SymbolsByStandard = symbolsByStandard,
            LastUpdated = DateTime.UtcNow
        };
    }

    public async Task<Symbol> AddAsync(Symbol symbol, CancellationToken cancellationToken = default)
    {
        var result = await _context.Symbols.AddAsync(symbol, cancellationToken);
        return result.Entity;
    }

    public async Task<List<Symbol>> AddRangeAsync(List<Symbol> symbols, CancellationToken cancellationToken = default)
    {
        await _context.Symbols.AddRangeAsync(symbols, cancellationToken);
        return symbols;
    }

    public Task<Symbol> UpdateAsync(Symbol symbol, CancellationToken cancellationToken = default)
    {
        _context.Symbols.Update(symbol);
        return Task.FromResult(symbol);
    }

    public async Task DeleteAsync(Guid id, string deletedBy, CancellationToken cancellationToken = default)
    {
        var symbol = await GetByIdAsync(id, cancellationToken);
        if (symbol != null)
        {
            symbol.Delete(deletedBy);
            await UpdateAsync(symbol, cancellationToken);
        }
    }

    public async Task DeleteRangeAsync(List<Guid> ids, string deletedBy, CancellationToken cancellationToken = default)
    {
        var symbols = await _context.Symbols
            .Where(s => ids.Contains(s.Id))
            .ToListAsync(cancellationToken);

        foreach (var symbol in symbols)
        {
            symbol.Delete(deletedBy);
        }

        _context.Symbols.UpdateRange(symbols);
    }

    public async Task HardDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var symbol = await _context.Symbols.FindAsync(new object[] { id }, cancellationToken);
        if (symbol != null)
        {
            _context.Symbols.Remove(symbol);
        }
    }

    public async Task RestoreAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var symbol = await _context.Symbols
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (symbol != null && !symbol.IsActive)
        {
            symbol.Restore();
            await UpdateAsync(symbol, cancellationToken);
        }
    }

    public async Task<int> CountAsync(
        List<Guid>? categoryIds = null,
        List<string>? standards = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Symbols.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(s => s.IsActive == isActive.Value);
        }

        if (categoryIds != null && categoryIds.Count > 0)
        {
            query = query.Where(s => categoryIds.Contains(s.CategoryId));
        }

        if (standards != null && standards.Count > 0)
        {
            query = query.Where(s => standards.Contains(s.StandardCompliance.PrimaryStandard) ||
                                   s.StandardCompliance.CompatibleStandards.Any(cs => standards.Contains(cs)));
        }

        return await query.CountAsync(cancellationToken);
    }

    public async Task<bool> AnyInCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.Symbols.AnyAsync(s => s.CategoryId == categoryId, cancellationToken);
    }

    public async Task<List<Symbol>> GetModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsModifiedSinceSpecification(since);
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task BulkUpdateActiveStatusAsync(
        List<Guid> symbolIds,
        bool isActive,
        string modifiedBy,
        CancellationToken cancellationToken = default)
    {
        var symbols = await _context.Symbols
            .Where(s => symbolIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        foreach (var symbol in symbols)
        {
            // Use reflection or direct property access since methods don't exist
            var symbolType = symbol.GetType();
            var isActiveProperty = symbolType.GetProperty("IsActive");
            isActiveProperty?.SetValue(symbol, isActive);
            symbol.UpdateModificationInfo(modifiedBy);
        }

        _context.Symbols.UpdateRange(symbols);
    }

    public async Task BulkUpdateCategoryAsync(
        List<Guid> symbolIds,
        Guid newCategoryId,
        string modifiedBy,
        CancellationToken cancellationToken = default)
    {
        var symbols = await _context.Symbols
            .Where(s => symbolIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        var newCategory = await _context.SymbolCategories.FindAsync(newCategoryId, cancellationToken);
        if (newCategory == null)
        {
            throw new ArgumentException($"Category with ID {newCategoryId} not found");
        }

        foreach (var symbol in symbols)
        {
            // Use reflection or direct property access
            var symbolType = symbol.GetType();
            var categoryIdProperty = symbolType.GetProperty("CategoryId");
            categoryIdProperty?.SetValue(symbol, newCategoryId);
            symbol.UpdateModificationInfo(modifiedBy);
        }

        _context.Symbols.UpdateRange(symbols);
    }

    public async Task<ImportResult> ImportSymbolsAsync(
        List<Symbol> symbols,
        ImportOptions options,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var result = new ImportResult
        {
            TotalProcessed = symbols.Count
        };

        try
        {
            foreach (var symbol in symbols)
            {
                try
                {
                    if (options.ValidateOnImport)
                    {
                        var validation = await ValidateSymbolAsync(symbol, cancellationToken);
                        if (!validation.IsValid)
                        {
                            result.FailedImports++;
                            result.Errors.Add($"Symbol {symbol.Code}: {string.Join(", ", validation.Errors.Select(e => e.Message))}");
                            continue;
                        }
                    }

                    var existingSymbol = await GetByCodeAsync(symbol.Code, cancellationToken);
                    if (existingSymbol != null)
                    {
                        if (options.OverwriteExisting)
                        {
                            await UpdateAsync(symbol, cancellationToken);
                        }
                        else
                        {
                            result.Skipped++;
                            continue;
                        }
                    }
                    else
                    {
                        await AddAsync(symbol, cancellationToken);
                    }

                    result.SuccessfulImports++;
                }
                catch (Exception ex)
                {
                    result.FailedImports++;
                    result.Errors.Add($"Symbol {symbol.Code}: {ex.Message}");
                    _logger.LogError(ex, "Error importing symbol {SymbolCode}", symbol.Code);
                }
            }

            await SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            result.Errors.Add($"Import failed: {ex.Message}");
            _logger.LogError(ex, "Error during symbol import");
        }
        finally
        {
            stopwatch.Stop();
            result.Duration = stopwatch.Elapsed;
        }

        return result;
    }

    public async Task<ExportResult> ExportSymbolsAsync(
        List<Guid> symbolIds,
        ExportOptions options,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var result = new ExportResult();

        try
        {
            var symbols = await _context.Symbols
                .Include(s => s.Category)
                .Where(s => symbolIds.Contains(s.Id))
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            result.TotalExported = symbols.Count;

            // Export implementation would go here - JSON, XML, etc.
            // This is a placeholder for the actual export logic

            stopwatch.Stop();
            result.Duration = stopwatch.Elapsed;
        }
        catch (Exception ex)
        {
            result.Warnings.Add($"Export error: {ex.Message}");
            _logger.LogError(ex, "Error during symbol export");
        }

        return result;
    }

    public async Task<ValidationResult> ValidateSymbolAsync(Symbol symbol, CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // Validate required properties
        if (string.IsNullOrWhiteSpace(symbol.Code))
        {
            result.Errors.Add(new ValidationError { Property = nameof(Symbol.Code), Message = "Code is required" });
            result.IsValid = false;
        }

        if (string.IsNullOrWhiteSpace(symbol.Name))
        {
            result.Errors.Add(new ValidationError { Property = nameof(Symbol.Name), Message = "Name is required" });
            result.IsValid = false;
        }

        if (string.IsNullOrWhiteSpace(symbol.SvgContent))
        {
            result.Errors.Add(new ValidationError { Property = nameof(Symbol.SvgContent), Message = "SVG content is required" });
            result.IsValid = false;
        }

        // Validate code uniqueness
        if (!string.IsNullOrWhiteSpace(symbol.Code))
        {
            var isUnique = await IsCodeUniqueAsync(symbol.Code, symbol.Id, cancellationToken);
            if (!isUnique)
            {
                result.Errors.Add(new ValidationError { Property = nameof(Symbol.Code), Message = "Code must be unique" });
                result.IsValid = false;
            }
        }

        // Validate SVG content
        if (!string.IsNullOrWhiteSpace(symbol.SvgContent) && !symbol.SvgContent.TrimStart().StartsWith("<svg"))
        {
            result.Warnings.Add(new ValidationWarning { Property = nameof(Symbol.SvgContent), Message = "SVG content should start with <svg>" });
        }

        return result;
    }

    public async Task<List<Symbol>> GetSymbolsWithInvalidSvgAsync(CancellationToken cancellationToken = default)
    {
        var specification = new SymbolsWithInvalidSvgSpecification();
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<Symbol> ApplySpecification(ISpecification<Symbol> specification)
    {
        return SpecificationEvaluator.GetQuery(_context.Symbols, specification);
    }
}