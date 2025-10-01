using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Infrastructure.Services;

/// <summary>
/// Service for mapping external CAD symbols to internal ReactFlow components
/// </summary>
public class SymbolMappingService : ISymbolMappingService
{
    private readonly IApplicationDbContext _context;
    private readonly IFuzzyMatcher _fuzzyMatcher;
    private readonly IMemoryCache _cache;
    private readonly ILogger<SymbolMappingService> _logger;
    private const string CacheKeyPrefix = "SymbolMapping_";
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromHours(1);

    public SymbolMappingService(
        IApplicationDbContext context,
        IFuzzyMatcher fuzzyMatcher,
        IMemoryCache cache,
        ILogger<SymbolMappingService> logger)
    {
        _context = context;
        _fuzzyMatcher = fuzzyMatcher;
        _cache = cache;
        _logger = logger;
    }

    public async Task<SymbolMapping?> FindExactMatchAsync(
        string symbolCode,
        SymbolLibraryType libraryType,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(symbolCode))
            return null;

        // Check cache first
        var cacheKey = $"{CacheKeyPrefix}Exact_{libraryType}_{symbolCode}";
        if (_cache.TryGetValue<SymbolMapping>(cacheKey, out var cachedMapping))
        {
            _logger.LogDebug("Cache hit for exact match: {SymbolCode}", symbolCode);
            return cachedMapping;
        }

        // Query database
        var mapping = await _context.SymbolMappings
            .FirstOrDefaultAsync(
                m => m.ExternalSymbolId == symbolCode &&
                     m.LibraryType == libraryType &&
                     m.IsActive,
                cancellationToken);

        if (mapping != null)
        {
            _cache.Set(cacheKey, mapping, CacheExpiration);
        }

        return mapping;
    }

    public async Task<List<SymbolMappingResult>> FindFuzzyMatchesAsync(
        string symbolName,
        SymbolLibraryType? libraryType = null,
        double minimumConfidence = 0.7,
        int maxResults = 10,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(symbolName))
            return new List<SymbolMappingResult>();

        _logger.LogInformation(
            "Finding fuzzy matches for '{SymbolName}' with min confidence {MinConfidence}",
            symbolName, minimumConfidence);

        // Get all standard symbols from the specified library
        var query = _context.StandardSymbolDefinitions
            .Include(s => s.Library)
            .Where(s => s.IsActive);

        if (libraryType.HasValue)
        {
            query = query.Where(s => s.Library.Type == libraryType.Value);
        }

        var symbols = await query.ToListAsync(cancellationToken);

        _logger.LogDebug("Retrieved {Count} standard symbols for fuzzy matching", symbols.Count);

        // Create candidates list with symbol names
        var candidates = symbols.Select(s => s.Name).ToList();

        // Perform fuzzy matching
        var fuzzyMatches = _fuzzyMatcher.FindBestMatches(
            symbolName,
            candidates,
            minimumConfidence,
            maxResults);

        _logger.LogDebug("Found {Count} fuzzy matches", fuzzyMatches.Count);

        // Map to results
        var results = new List<SymbolMappingResult>();

        foreach (var match in fuzzyMatches)
        {
            var symbol = symbols.FirstOrDefault(s => s.Name == match.Candidate);
            if (symbol == null)
                continue;

            // Check if existing mapping exists
            var existingMapping = await _context.SymbolMappings
                .FirstOrDefaultAsync(
                    m => m.ExternalSymbolId == symbol.SymbolCode &&
                         m.LibraryType == symbol.Library.Type &&
                         m.IsActive,
                    cancellationToken);

            results.Add(new SymbolMappingResult
            {
                ExternalSymbolId = symbol.SymbolCode,
                ExternalSymbolName = symbol.Name,
                InternalComponentId = existingMapping?.InternalComponentId ?? string.Empty,
                InternalComponentName = existingMapping?.InternalComponentName ?? string.Empty,
                ConfidenceScore = match.SimilarityScore,
                Method = SymbolMappingMethod.FuzzyMatch,
                IsExistingMapping = existingMapping != null,
                ExistingMappingId = existingMapping?.Id
            });
        }

        return results;
    }

    public async Task<List<SymbolMappingResult>> FindMLBasedMatchesAsync(
        string symbolDescription,
        byte[]? imageData = null,
        SymbolLibraryType? libraryType = null,
        double minimumConfidence = 0.7,
        int maxResults = 10,
        CancellationToken cancellationToken = default)
    {
        // TODO: Implement ML-based matching using ML.NET when model is trained
        // For now, fall back to fuzzy matching with description
        _logger.LogWarning("ML-based matching not yet implemented, falling back to fuzzy matching");

        if (!string.IsNullOrWhiteSpace(symbolDescription))
        {
            return await FindFuzzyMatchesAsync(
                symbolDescription,
                libraryType,
                minimumConfidence,
                maxResults,
                cancellationToken);
        }

        return new List<SymbolMappingResult>();
    }

    public async Task<SymbolMapping> CreateMappingAsync(
        string externalSymbolId,
        string externalSymbolName,
        string internalComponentId,
        string internalComponentName,
        SymbolLibraryType libraryType,
        double confidenceScore,
        SymbolMappingMethod mappingMethod,
        string? metadata = null,
        Guid? symbolCategoryId = null,
        CancellationToken cancellationToken = default)
    {
        // Check if mapping already exists
        var existingMapping = await _context.SymbolMappings
            .FirstOrDefaultAsync(
                m => m.ExternalSymbolId == externalSymbolId &&
                     m.LibraryType == libraryType,
                cancellationToken);

        if (existingMapping != null)
        {
            _logger.LogInformation(
                "Updating existing mapping for {SymbolId} -> {ComponentId}",
                externalSymbolId, internalComponentId);

            existingMapping.UpdateInternalComponent(
                internalComponentId,
                internalComponentName,
                "System");

            existingMapping.UpdateConfidence(confidenceScore);
            existingMapping.Reactivate("System");
        }
        else
        {
            _logger.LogInformation(
                "Creating new mapping for {SymbolId} -> {ComponentId}",
                externalSymbolId, internalComponentId);

            existingMapping = new SymbolMapping(
                externalSymbolId,
                externalSymbolName,
                internalComponentId,
                internalComponentName,
                libraryType,
                confidenceScore,
                mappingMethod,
                metadata,
                symbolCategoryId);

            _context.SymbolMappings.Add(existingMapping);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate cache
        var cacheKey = $"{CacheKeyPrefix}Exact_{libraryType}_{externalSymbolId}";
        _cache.Remove(cacheKey);

        return existingMapping;
    }

    public async Task<bool> VerifyMappingAsync(
        Guid mappingId,
        string verifiedBy,
        CancellationToken cancellationToken = default)
    {
        var mapping = await _context.SymbolMappings
            .FirstOrDefaultAsync(m => m.Id == mappingId, cancellationToken);

        if (mapping == null)
        {
            _logger.LogWarning("Mapping {MappingId} not found for verification", mappingId);
            return false;
        }

        mapping.Verify(verifiedBy);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Mapping {MappingId} verified by {VerifiedBy}",
            mappingId, verifiedBy);

        return true;
    }

    public async Task<BulkMappingResult> BulkMapSymbolsAsync(
        List<ExternalSymbolInfo> externalSymbols,
        SymbolLibraryType libraryType,
        bool autoVerifyExactMatches = true,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        var result = new BulkMappingResult
        {
            TotalSymbols = externalSymbols.Count
        };

        _logger.LogInformation(
            "Starting bulk mapping for {Count} symbols from {LibraryType}",
            externalSymbols.Count, libraryType);

        foreach (var symbolInfo in externalSymbols)
        {
            // Try exact match first
            var exactMatch = await FindExactMatchAsync(
                symbolInfo.SymbolId,
                libraryType,
                cancellationToken);

            if (exactMatch != null)
            {
                result.MappedSymbols++;
                result.ExactMatches++;
                result.Mappings.Add(new SymbolMappingResult
                {
                    ExternalSymbolId = symbolInfo.SymbolId,
                    ExternalSymbolName = symbolInfo.SymbolName,
                    InternalComponentId = exactMatch.InternalComponentId,
                    InternalComponentName = exactMatch.InternalComponentName,
                    ConfidenceScore = exactMatch.ConfidenceScore,
                    Method = SymbolMappingMethod.ExactMatch,
                    IsExistingMapping = true,
                    ExistingMappingId = exactMatch.Id
                });

                if (autoVerifyExactMatches && !exactMatch.IsManuallyVerified)
                {
                    await VerifyMappingAsync(exactMatch.Id, "AutoVerify", cancellationToken);
                }

                continue;
            }

            // Try fuzzy matching
            var fuzzyMatches = await FindFuzzyMatchesAsync(
                symbolInfo.SymbolName,
                libraryType,
                0.8, // Higher threshold for bulk operations
                1,   // Only best match
                cancellationToken);

            if (fuzzyMatches.Any())
            {
                var bestMatch = fuzzyMatches.First();
                result.MappedSymbols++;
                result.FuzzyMatches++;
                result.Mappings.Add(bestMatch);
                continue;
            }

            // Try ML-based matching if description available
            if (!string.IsNullOrWhiteSpace(symbolInfo.Description))
            {
                var mlMatches = await FindMLBasedMatchesAsync(
                    symbolInfo.Description,
                    symbolInfo.ImageData,
                    libraryType,
                    0.8,
                    1,
                    cancellationToken);

                if (mlMatches.Any())
                {
                    var bestMatch = mlMatches.First();
                    result.MappedSymbols++;
                    result.MLMatches++;
                    result.Mappings.Add(bestMatch);
                    continue;
                }
            }

            // No match found
            result.UnmappedSymbols++;
            result.UnmappedSymbolIds.Add(symbolInfo.SymbolId);
        }

        stopwatch.Stop();
        result.ProcessingTime = stopwatch.Elapsed;

        _logger.LogInformation(
            "Bulk mapping completed: {Mapped}/{Total} mapped ({Exact} exact, {Fuzzy} fuzzy, {ML} ML) in {Duration}ms",
            result.MappedSymbols, result.TotalSymbols,
            result.ExactMatches, result.FuzzyMatches, result.MLMatches,
            result.ProcessingTime.TotalMilliseconds);

        return result;
    }

    public async Task<List<SymbolMapping>> GetMappingsByLibraryAsync(
        SymbolLibraryType libraryType,
        bool activeOnly = true,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SymbolMappings
            .Where(m => m.LibraryType == libraryType);

        if (activeOnly)
        {
            query = query.Where(m => m.IsActive);
        }

        return await query
            .OrderBy(m => m.ExternalSymbolName)
            .ToListAsync(cancellationToken);
    }

    public void ClearCache()
    {
        _logger.LogInformation("Clearing symbol mapping cache");
        // MemoryCache doesn't have a clear all method, so we rely on expiration
        // In production, consider using a distributed cache like Redis
    }
}
