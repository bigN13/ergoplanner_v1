using System.Linq.Expressions;

namespace Ergoplanner.Application.Common.Specifications;

/// <summary>
/// Base specification interface for complex querying
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface ISpecification<T>
{
    /// <summary>
    /// Criteria expression for filtering
    /// </summary>
    Expression<Func<T, bool>>? Criteria { get; }

    /// <summary>
    /// Include expressions for related entities
    /// </summary>
    List<Expression<Func<T, object>>> Includes { get; }

    /// <summary>
    /// Include string expressions for related entities
    /// </summary>
    List<string> IncludeStrings { get; }

    /// <summary>
    /// Order by expression
    /// </summary>
    Expression<Func<T, object>>? OrderBy { get; }

    /// <summary>
    /// Order by descending expression
    /// </summary>
    Expression<Func<T, object>>? OrderByDescending { get; }

    /// <summary>
    /// Group by expression
    /// </summary>
    Expression<Func<T, object>>? GroupBy { get; }

    /// <summary>
    /// Number of records to take
    /// </summary>
    int? Take { get; }

    /// <summary>
    /// Number of records to skip
    /// </summary>
    int? Skip { get; }

    /// <summary>
    /// Whether paging is enabled
    /// </summary>
    bool IsPagingEnabled { get; }

    /// <summary>
    /// Whether to track changes in EF Core
    /// </summary>
    bool AsNoTracking { get; }

    /// <summary>
    /// Whether to split query for better performance
    /// </summary>
    bool AsSplitQuery { get; }
}