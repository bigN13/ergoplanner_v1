using Microsoft.EntityFrameworkCore;
using Ergoplanner.Application.Common.Specifications;

namespace Ergoplanner.Infrastructure.Data.Extensions;

/// <summary>
/// Evaluates specifications and applies them to EF Core queries
/// </summary>
public static class SpecificationEvaluator
{
    /// <summary>
    /// Apply specification to a queryable and return the modified query
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    /// <param name="inputQuery">Base queryable</param>
    /// <param name="specification">Specification to apply</param>
    /// <returns>Modified queryable with specification applied</returns>
    public static IQueryable<T> GetQuery<T>(IQueryable<T> inputQuery, ISpecification<T> specification) where T : class
    {
        var query = inputQuery;

        // Apply criteria filter
        if (specification.Criteria != null)
        {
            query = query.Where(specification.Criteria);
        }

        // Apply includes for related entities
        query = specification.Includes.Aggregate(query, (current, include) => current.Include(include));

        // Apply string includes for related entities
        query = specification.IncludeStrings.Aggregate(query, (current, include) => current.Include(include));

        // Apply ordering
        if (specification.OrderBy != null)
        {
            query = query.OrderBy(specification.OrderBy);
        }
        else if (specification.OrderByDescending != null)
        {
            query = query.OrderByDescending(specification.OrderByDescending);
        }

        // Apply grouping
        if (specification.GroupBy != null)
        {
            query = query.GroupBy(specification.GroupBy).SelectMany(x => x);
        }

        // Apply no tracking if specified
        if (specification.AsNoTracking)
        {
            query = query.AsNoTracking();
        }

        // Apply split query if specified
        if (specification.AsSplitQuery)
        {
            query = query.AsSplitQuery();
        }

        // Apply paging if enabled
        if (specification.IsPagingEnabled)
        {
            if (specification.Skip.HasValue)
            {
                query = query.Skip(specification.Skip.Value);
            }

            if (specification.Take.HasValue)
            {
                query = query.Take(specification.Take.Value);
            }
        }

        return query;
    }
}