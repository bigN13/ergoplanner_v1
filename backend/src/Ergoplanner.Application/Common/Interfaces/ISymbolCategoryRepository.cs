using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Symbol Categories
/// </summary>
public interface ISymbolCategoryRepository : IRepository<SymbolCategory>
{
    /// <summary>
    /// Get category by ID
    /// </summary>
    new Task<SymbolCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get multiple categories by IDs
    /// </summary>
    Task<IEnumerable<SymbolCategory>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get category by name
    /// </summary>
    Task<SymbolCategory?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all active categories
    /// </summary>
    Task<IEnumerable<SymbolCategory>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get child categories
    /// </summary>
    Task<IEnumerable<SymbolCategory>> GetChildCategoriesAsync(Guid parentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if category name is unique
    /// </summary>
    Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}