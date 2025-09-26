using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Infrastructure.Data.Repositories;

/// <summary>
/// Redis caching decorator for Symbol repository
/// </summary>
public class CachedSymbolRepository : ISymbolRepository
{
    private readonly ISymbolRepository _repository;
    private readonly IDistributedCache _cache;
    private readonly ILogger<CachedSymbolRepository> _logger;

    // Cache configuration
    private static readonly DistributedCacheEntryOptions DefaultCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
        SlidingExpiration = TimeSpan.FromHours(1)
    };

    private static readonly DistributedCacheEntryOptions ShortCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
        SlidingExpiration = TimeSpan.FromMinutes(5)
    };

    // Cache key patterns
    private const string SYMBOL_BY_ID_KEY = "symbol:id:{0}";
    private const string SYMBOL_BY_CODE_KEY = "symbol:code:{0}";
    private const string SYMBOLS_BY_CATEGORY_KEY = "symbols:category:{0}";
    private const string SYMBOLS_BY_STANDARD_KEY = "symbols:standard:{0}";
    private const string SYMBOL_STATISTICS_KEY = "symbols:statistics";
    private const string SYMBOL_COUNT_KEY = "symbols:count:{0}:{1}:{2}";

    public CachedSymbolRepository(
        ISymbolRepository repository,
        IDistributedCache cache,
        ILogger<CachedSymbolRepository> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Symbol?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(SYMBOL_BY_ID_KEY, id);
        return await GetOrSetAsync(cacheKey, () => _repository.GetByIdAsync(id, cancellationToken), DefaultCacheOptions, cancellationToken);
    }

    public async Task<Symbol?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(SYMBOL_BY_CODE_KEY, code);
        return await GetOrSetAsync(cacheKey, () => _repository.GetByCodeAsync(code, cancellationToken), DefaultCacheOptions, cancellationToken);
    }

    public async Task<List<Symbol>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(SYMBOLS_BY_CATEGORY_KEY, categoryId);
        return await GetOrSetNonNullableAsync(cacheKey, () => _repository.GetByCategoryAsync(categoryId, cancellationToken), DefaultCacheOptions, cancellationToken);
    }

    public async Task<List<Symbol>> GetByCategoryCodeAsync(string categoryCode, CancellationToken cancellationToken = default)
    {
        // This method involves a join, so we don't cache it for simplicity
        return await _repository.GetByCategoryCodeAsync(categoryCode, cancellationToken);
    }

    public async Task<List<Symbol>> GetByCategoriesAsync(List<Guid> categoryIds, CancellationToken cancellationToken = default)
    {
        // Complex query with multiple categories - skip caching
        return await _repository.GetByCategoriesAsync(categoryIds, cancellationToken);
    }

    public async Task<List<Symbol>> GetByStandardAsync(string standard, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(SYMBOLS_BY_STANDARD_KEY, standard);
        return await GetOrSetNonNullableAsync(cacheKey, () => _repository.GetByStandardAsync(standard, cancellationToken), DefaultCacheOptions, cancellationToken);
    }

    public async Task<List<Symbol>> GetByTagsAsync(List<string> tags, bool matchAll = false, CancellationToken cancellationToken = default)
    {
        // Complex query with tag matching - skip caching
        return await _repository.GetByTagsAsync(tags, matchAll, cancellationToken);
    }

    public async Task<List<Symbol>> SearchAsync(string searchText, CancellationToken cancellationToken = default)
    {
        // Search queries are dynamic and shouldn't be cached
        return await _repository.SearchAsync(searchText, cancellationToken);
    }

    public async Task<List<Symbol>> GetFilteredAsync(List<Guid>? categoryIds = null, List<string>? standards = null, List<string>? tags = null, bool? isActive = null, string? searchText = null, int? skip = null, int? take = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        // Complex filtered queries - skip caching
        return await _repository.GetFilteredAsync(categoryIds, standards, tags, isActive, searchText, skip, take, sortBy, sortDescending, cancellationToken);
    }

    public async Task<List<Symbol>> GetCompatibleSymbolsAsync(Guid symbolId, string connectionPointId, CancellationToken cancellationToken = default)
    {
        // Compatibility queries are complex - skip caching
        return await _repository.GetCompatibleSymbolsAsync(symbolId, connectionPointId, cancellationToken);
    }

    public async Task<List<Symbol>> GetByConnectionTypeAsync(ConnectionType connectionType, CancellationToken cancellationToken = default)
    {
        return await _repository.GetByConnectionTypeAsync(connectionType, cancellationToken);
    }

    public async Task<List<Symbol>> GetByDimensionRangeAsync(double minWidth, double maxWidth, double minHeight, double maxHeight, CancellationToken cancellationToken = default)
    {
        return await _repository.GetByDimensionRangeAsync(minWidth, maxWidth, minHeight, maxHeight, cancellationToken);
    }

    public async Task<(List<Symbol> Items, int TotalCount)> GetPagedAsync(int pageNumber = 1, int pageSize = 50, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        // Paginated queries are dynamic - skip caching
        return await _repository.GetPagedAsync(pageNumber, pageSize, sortBy, sortDescending, cancellationToken);
    }

    public async Task<List<Symbol>> GetForZoomLevelAsync(double zoomLevel, CancellationToken cancellationToken = default)
    {
        return await _repository.GetForZoomLevelAsync(zoomLevel, cancellationToken);
    }

    public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        // Uniqueness checks are critical and shouldn't be cached
        return await _repository.IsCodeUniqueAsync(code, excludeId, cancellationToken);
    }

    public async Task<SymbolStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        return await GetOrSetNonNullableAsync(SYMBOL_STATISTICS_KEY, () => _repository.GetStatisticsAsync(cancellationToken), ShortCacheOptions, cancellationToken);
    }

    public async Task<Symbol> AddAsync(Symbol symbol, CancellationToken cancellationToken = default)
    {
        var result = await _repository.AddAsync(symbol, cancellationToken);
        await InvalidateCacheForSymbol(symbol);
        return result;
    }

    public async Task<List<Symbol>> AddRangeAsync(List<Symbol> symbols, CancellationToken cancellationToken = default)
    {
        var result = await _repository.AddRangeAsync(symbols, cancellationToken);
        await InvalidateGeneralCaches();
        return result;
    }

    public async Task<Symbol> UpdateAsync(Symbol symbol, CancellationToken cancellationToken = default)
    {
        var result = await _repository.UpdateAsync(symbol, cancellationToken);
        await InvalidateCacheForSymbol(symbol);
        return result;
    }

    public async Task DeleteAsync(Guid id, string deletedBy, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, deletedBy, cancellationToken);
        await InvalidateCacheForSymbolId(id);
    }

    public async Task DeleteRangeAsync(List<Guid> ids, string deletedBy, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteRangeAsync(ids, deletedBy, cancellationToken);
        await InvalidateGeneralCaches();
    }

    public async Task HardDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.HardDeleteAsync(id, cancellationToken);
        await InvalidateCacheForSymbolId(id);
    }

    public async Task RestoreAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.RestoreAsync(id, cancellationToken);
        await InvalidateCacheForSymbolId(id);
    }

    public async Task<int> CountAsync(List<Guid>? categoryIds = null, List<string>? standards = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(SYMBOL_COUNT_KEY,
            categoryIds?.Count ?? 0,
            standards?.Count ?? 0,
            isActive?.ToString() ?? "null");

        return await GetOrSetStructAsync(cacheKey, () => _repository.CountAsync(categoryIds, standards, isActive, cancellationToken), ShortCacheOptions, cancellationToken);
    }

    public async Task<bool> AnyInCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _repository.AnyInCategoryAsync(categoryId, cancellationToken);
    }

    public async Task<List<Symbol>> GetModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default)
    {
        return await _repository.GetModifiedSinceAsync(since, cancellationToken);
    }

    public async Task BulkUpdateActiveStatusAsync(List<Guid> symbolIds, bool isActive, string modifiedBy, CancellationToken cancellationToken = default)
    {
        await _repository.BulkUpdateActiveStatusAsync(symbolIds, isActive, modifiedBy, cancellationToken);
        await InvalidateGeneralCaches();
    }

    public async Task BulkUpdateCategoryAsync(List<Guid> symbolIds, Guid newCategoryId, string modifiedBy, CancellationToken cancellationToken = default)
    {
        await _repository.BulkUpdateCategoryAsync(symbolIds, newCategoryId, modifiedBy, cancellationToken);
        await InvalidateGeneralCaches();
    }

    public async Task<ImportResult> ImportSymbolsAsync(List<Symbol> symbols, ImportOptions options, CancellationToken cancellationToken = default)
    {
        var result = await _repository.ImportSymbolsAsync(symbols, options, cancellationToken);
        await InvalidateAllCaches();
        return result;
    }

    public async Task<ExportResult> ExportSymbolsAsync(List<Guid> symbolIds, ExportOptions options, CancellationToken cancellationToken = default)
    {
        return await _repository.ExportSymbolsAsync(symbolIds, options, cancellationToken);
    }

    public async Task<ValidationResult> ValidateSymbolAsync(Symbol symbol, CancellationToken cancellationToken = default)
    {
        return await _repository.ValidateSymbolAsync(symbol, cancellationToken);
    }

    public async Task<List<Symbol>> GetSymbolsWithInvalidSvgAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.GetSymbolsWithInvalidSvgAsync(cancellationToken);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await _repository.SaveChangesAsync(cancellationToken);
        if (result > 0)
        {
            await InvalidateGeneralCaches();
        }
        return result;
    }

    // Cache helper methods
    private async Task<T?> GetOrSetAsync<T>(string key, Func<Task<T?>> getItem, DistributedCacheEntryOptions options, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var cachedValue = await _cache.GetStringAsync(key, cancellationToken);
            if (cachedValue != null)
            {
                _logger.LogDebug("Cache hit for key: {Key}", key);
                return JsonSerializer.Deserialize<T>(cachedValue);
            }

            _logger.LogDebug("Cache miss for key: {Key}", key);
            var item = await getItem();
            if (item != null)
            {
                var serializedItem = JsonSerializer.Serialize(item);
                await _cache.SetStringAsync(key, serializedItem, options, cancellationToken);
            }

            return item;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accessing cache for key: {Key}", key);
            return await getItem();
        }
    }

    private async Task<T> GetOrSetNonNullableAsync<T>(string key, Func<Task<T>> getItem, DistributedCacheEntryOptions options, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var cachedValue = await _cache.GetStringAsync(key, cancellationToken);
            if (cachedValue != null)
            {
                _logger.LogDebug("Cache hit for key: {Key}", key);
                var deserialized = JsonSerializer.Deserialize<T>(cachedValue);
                if (deserialized != null)
                    return deserialized;
            }

            _logger.LogDebug("Cache miss for key: {Key}", key);
            var item = await getItem();
            var serializedItem = JsonSerializer.Serialize(item);
            await _cache.SetStringAsync(key, serializedItem, options, cancellationToken);

            return item;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accessing cache for key: {Key}", key);
            return await getItem();
        }
    }

    private async Task<T> GetOrSetStructAsync<T>(string key, Func<Task<T>> getItem, DistributedCacheEntryOptions options, CancellationToken cancellationToken = default) where T : struct
    {
        try
        {
            var cachedValue = await _cache.GetStringAsync(key, cancellationToken);
            if (cachedValue != null)
            {
                _logger.LogDebug("Cache hit for key: {Key}", key);
                return JsonSerializer.Deserialize<T>(cachedValue);
            }

            _logger.LogDebug("Cache miss for key: {Key}", key);
            var item = await getItem();
            var serializedItem = JsonSerializer.Serialize(item);
            await _cache.SetStringAsync(key, serializedItem, options, cancellationToken);

            return item;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accessing cache for key: {Key}", key);
            return await getItem();
        }
    }

    private async Task InvalidateCacheForSymbol(Symbol symbol)
    {
        try
        {
            var tasks = new List<Task>
            {
                _cache.RemoveAsync(string.Format(SYMBOL_BY_ID_KEY, symbol.Id)),
                _cache.RemoveAsync(string.Format(SYMBOL_BY_CODE_KEY, symbol.Code)),
                _cache.RemoveAsync(string.Format(SYMBOLS_BY_CATEGORY_KEY, symbol.CategoryId))
            };

            // Invalidate standards cache for all standards this symbol supports
            tasks.Add(_cache.RemoveAsync(string.Format(SYMBOLS_BY_STANDARD_KEY, symbol.StandardCompliance.PrimaryStandard)));
            foreach (var standard in symbol.StandardCompliance.CompatibleStandards)
            {
                tasks.Add(_cache.RemoveAsync(string.Format(SYMBOLS_BY_STANDARD_KEY, standard)));
            }

            await Task.WhenAll(tasks);
            await InvalidateGeneralCaches();

            _logger.LogDebug("Invalidated cache for symbol: {SymbolCode} ({SymbolId})", symbol.Code, symbol.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating cache for symbol: {SymbolCode} ({SymbolId})", symbol.Code, symbol.Id);
        }
    }

    private async Task InvalidateCacheForSymbolId(Guid symbolId)
    {
        try
        {
            await _cache.RemoveAsync(string.Format(SYMBOL_BY_ID_KEY, symbolId));
            await InvalidateGeneralCaches();

            _logger.LogDebug("Invalidated cache for symbol ID: {SymbolId}", symbolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating cache for symbol ID: {SymbolId}", symbolId);
        }
    }

    private async Task InvalidateGeneralCaches()
    {
        try
        {
            await _cache.RemoveAsync(SYMBOL_STATISTICS_KEY);
            _logger.LogDebug("Invalidated general symbol caches");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating general caches");
        }
    }

    private async Task InvalidateAllCaches()
    {
        try
        {
            // In a real implementation, you might want to use Redis pattern matching
            // For now, we'll just invalidate the commonly used cached items
            await InvalidateGeneralCaches();
            _logger.LogDebug("Invalidated all symbol caches");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating all caches");
        }
    }
}