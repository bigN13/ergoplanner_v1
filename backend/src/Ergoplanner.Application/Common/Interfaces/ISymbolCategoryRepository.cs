using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Repository interface for SymbolCategory aggregate
/// </summary>
public interface ISymbolCategoryRepository
{
    /// <summary>
    /// Get a category by its unique identifier
    /// </summary>
    Task<SymbolCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a category by its code
    /// </summary>
    Task<SymbolCategory?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a category by its name
    /// </summary>
    Task<SymbolCategory?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all root categories (categories with no parent)
    /// </summary>
    Task<List<SymbolCategory>> GetRootCategoriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all child categories of a parent category
    /// </summary>
    Task<List<SymbolCategory>> GetChildCategoriesAsync(Guid parentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all descendant categories (children, grandchildren, etc.) of a category
    /// </summary>
    Task<List<SymbolCategory>> GetDescendantCategoriesAsync(Guid parentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all ancestor categories (parent, grandparent, etc.) of a category
    /// </summary>
    Task<List<SymbolCategory>> GetAncestorCategoriesAsync(Guid categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories by hierarchy level
    /// </summary>
    Task<List<SymbolCategory>> GetByLevelAsync(int level, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories by standard type
    /// </summary>
    Task<List<SymbolCategory>> GetByStandardAsync(string standardType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active categories only
    /// </summary>
    Task<List<SymbolCategory>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories with their symbol count
    /// </summary>
    Task<List<CategoryWithCount>> GetWithSymbolCountAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Search categories by name or description
    /// </summary>
    Task<List<SymbolCategory>> SearchAsync(string searchText, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories ordered by display order
    /// </summary>
    Task<List<SymbolCategory>> GetOrderedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories in hierarchical tree structure
    /// </summary>
    Task<List<CategoryTree>> GetHierarchyTreeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories that contain symbols matching criteria
    /// </summary>
    Task<List<SymbolCategory>> GetCategoriesWithSymbolsAsync(
        List<string>? standards = null,
        List<string>? tags = null,
        bool activeSymbolsOnly = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated list of categories
    /// </summary>
    Task<(List<SymbolCategory> Items, int TotalCount)> GetPagedAsync(
        int pageNumber = 1,
        int pageSize = 50,
        string? sortBy = null,
        bool sortDescending = false,
        Guid? parentId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a category code is unique
    /// </summary>
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a category name is unique within its parent
    /// </summary>
    Task<bool> IsNameUniqueAsync(
        string name,
        Guid? parentId = null,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a category has any child categories
    /// </summary>
    Task<bool> HasChildrenAsync(Guid categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a category has any symbols
    /// </summary>
    Task<bool> HasSymbolsAsync(Guid categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the path from root to a specific category
    /// </summary>
    Task<List<SymbolCategory>> GetPathToRootAsync(Guid categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate that moving a category won't create circular references
    /// </summary>
    Task<bool> ValidateParentChangeAsync(
        Guid categoryId,
        Guid? newParentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories that would be affected by moving a category
    /// </summary>
    Task<List<SymbolCategory>> GetAffectedCategoriesAsync(
        Guid categoryId,
        Guid? newParentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a new category
    /// </summary>
    Task<SymbolCategory> AddAsync(SymbolCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add multiple categories
    /// </summary>
    Task<List<SymbolCategory>> AddRangeAsync(List<SymbolCategory> categories, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing category
    /// </summary>
    Task<SymbolCategory> UpdateAsync(SymbolCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a category (soft delete) - only if it has no children or symbols
    /// </summary>
    Task DeleteAsync(Guid id, string deletedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a category and all its descendants (soft delete)
    /// </summary>
    Task DeleteWithDescendantsAsync(
        Guid id,
        string deletedBy,
        bool moveSymbolsToParent = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Permanently delete a category (hard delete)
    /// </summary>
    Task HardDeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Restore a soft-deleted category
    /// </summary>
    Task RestoreAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Move a category to a new parent
    /// </summary>
    Task MoveCategoryAsync(
        Guid categoryId,
        Guid? newParentId,
        string modifiedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bulk update display order for categories
    /// </summary>
    Task BulkUpdateDisplayOrderAsync(
        List<CategoryDisplayOrder> orders,
        string modifiedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bulk update active status for categories
    /// </summary>
    Task BulkUpdateActiveStatusAsync(
        List<Guid> categoryIds,
        bool isActive,
        string modifiedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get category statistics
    /// </summary>
    Task<CategoryStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rebuild category hierarchy paths and levels
    /// </summary>
    Task RebuildHierarchyAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Import categories from external source
    /// </summary>
    Task<CategoryImportResult> ImportCategoriesAsync(
        List<SymbolCategory> categories,
        CategoryImportOptions options,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get categories modified since a specific date
    /// </summary>
    Task<List<SymbolCategory>> GetModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate category hierarchy integrity
    /// </summary>
    Task<HierarchyValidationResult> ValidateHierarchyAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get count of categories matching criteria
    /// </summary>
    Task<int> CountAsync(
        string? standardType = null,
        bool? isActive = null,
        int? level = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Save changes to the repository
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Category with symbol count information
/// </summary>
public class CategoryWithCount
{
    public SymbolCategory Category { get; set; } = null!;
    public int DirectSymbolCount { get; set; }
    public int TotalSymbolCount { get; set; }
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Category tree structure for hierarchical display
/// </summary>
public class CategoryTree
{
    public SymbolCategory Category { get; set; } = null!;
    public List<CategoryTree> Children { get; set; } = new();
    public int TotalSymbols { get; set; }
}

/// <summary>
/// Display order update data
/// </summary>
public class CategoryDisplayOrder
{
    public Guid CategoryId { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// Category statistics
/// </summary>
public class CategoryStatistics
{
    public int TotalCategories { get; set; }
    public int RootCategories { get; set; }
    public int ActiveCategories { get; set; }
    public int MaxDepth { get; set; }
    public Dictionary<int, int> CategoriesByLevel { get; set; } = new();
    public Dictionary<string, int> CategoriesByStandard { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Category import options
/// </summary>
public class CategoryImportOptions
{
    public bool PreserveHierarchy { get; set; } = true;
    public bool OverwriteExisting { get; set; } = false;
    public bool CreateMissingParents { get; set; } = true;
    public string ImportSource { get; set; } = string.Empty;
    public string ImportedBy { get; set; } = string.Empty;
}

/// <summary>
/// Category import result
/// </summary>
public class CategoryImportResult
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
/// Hierarchy validation result
/// </summary>
public class HierarchyValidationResult
{
    public bool IsValid { get; set; }
    public List<HierarchyError> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public int OrphanedCategories { get; set; }
    public int CircularReferences { get; set; }
}

/// <summary>
/// Hierarchy validation error
/// </summary>
public class HierarchyError
{
    public Guid CategoryId { get; set; }
    public string ErrorType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}