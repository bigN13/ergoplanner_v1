using System.Linq.Expressions;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Common.Specifications;

/// <summary>
/// Specification for getting active symbols
/// </summary>
public class ActiveSymbolsSpecification : BaseSpecification<Symbol>
{
    public ActiveSymbolsSpecification() : base(s => s.IsActive)
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for getting symbols by category
/// </summary>
public class SymbolsByCategorySpecification : BaseSpecification<Symbol>
{
    public SymbolsByCategorySpecification(Guid categoryId) : base(s => s.CategoryId == categoryId)
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }

    public SymbolsByCategorySpecification(List<Guid> categoryIds) : base(s => categoryIds.Contains(s.CategoryId))
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for getting symbols by standard
/// </summary>
public class SymbolsByStandardSpecification : BaseSpecification<Symbol>
{
    public SymbolsByStandardSpecification(string standard)
        : base(s => s.StandardCompliance.PrimaryStandard == standard ||
                   s.StandardCompliance.CompatibleStandards.Contains(standard))
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }

    public SymbolsByStandardSpecification(List<string> standards)
        : base(s => standards.Contains(s.StandardCompliance.PrimaryStandard) ||
                   s.StandardCompliance.CompatibleStandards.Any(cs => standards.Contains(cs)))
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for searching symbols by text
/// </summary>
public class SymbolSearchSpecification : BaseSpecification<Symbol>
{
    public SymbolSearchSpecification(string searchText) : base(s =>
        s.Name.ToLower().Contains(searchText.ToLower()) ||
        s.Description.ToLower().Contains(searchText.ToLower()) ||
        s.Code.ToLower().Contains(searchText.ToLower()) ||
        s.Tags.Any(tag => tag.ToLower().Contains(searchText.ToLower())))
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for getting symbols by connection type
/// </summary>
public class SymbolsByConnectionTypeSpecification : BaseSpecification<Symbol>
{
    public SymbolsByConnectionTypeSpecification(ConnectionType connectionType)
        : base(s => s.ConnectionPoints.Any(cp => cp.Type == connectionType))
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for getting symbols within dimension range
/// </summary>
public class SymbolsByDimensionRangeSpecification : BaseSpecification<Symbol>
{
    public SymbolsByDimensionRangeSpecification(double minWidth, double maxWidth, double minHeight, double maxHeight)
        : base(s => s.Dimensions.Width >= minWidth &&
                   s.Dimensions.Width <= maxWidth &&
                   s.Dimensions.Height >= minHeight &&
                   s.Dimensions.Height <= maxHeight)
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for getting symbols for specific zoom level
/// </summary>
public class SymbolsForZoomLevelSpecification : BaseSpecification<Symbol>
{
    public SymbolsForZoomLevelSpecification(double zoomLevel) : base(s =>
        zoomLevel >= s.MinZoomLevel && zoomLevel <= s.MaxDetailZoom)
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for getting symbols modified since a date
/// </summary>
public class SymbolsModifiedSinceSpecification : BaseSpecification<Symbol>
{
    public SymbolsModifiedSinceSpecification(DateTime since) : base(s => s.ModifiedAt > since)
    {
        AddInclude(s => s.Category!);
        AddOrderByDescending(s => s.ModifiedAt!);
        ApplyNoTracking();
    }
}

/// <summary>
/// Specification for getting symbols with invalid SVG content
/// </summary>
public class SymbolsWithInvalidSvgSpecification : BaseSpecification<Symbol>
{
    public SymbolsWithInvalidSvgSpecification() : base(s =>
        string.IsNullOrWhiteSpace(s.SvgContent) ||
        !s.SvgContent.TrimStart().StartsWith("<svg"))
    {
        AddInclude(s => s.Category!);
        AddOrderBy(s => s.Name);
        ApplyNoTracking();
    }
}

/// <summary>
/// Advanced specification for filtered symbol queries with multiple criteria
/// </summary>
public class FilteredSymbolsSpecification : BaseSpecification<Symbol>
{
    public FilteredSymbolsSpecification(
        List<Guid>? categoryIds = null,
        List<string>? standards = null,
        List<string>? tags = null,
        bool? isActive = null,
        string? searchText = null,
        int? skip = null,
        int? take = null,
        string? sortBy = null,
        bool sortDescending = false)
    {
        // Build dynamic criteria
        Expression<Func<Symbol, bool>>? criteria = null;

        // Active filter
        if (isActive.HasValue)
        {
            criteria = s => s.IsActive == isActive.Value;
        }

        // Category filter
        if (categoryIds != null && categoryIds.Count > 0)
        {
            var categoryFilter = (Expression<Func<Symbol, bool>>)(s => categoryIds.Contains(s.CategoryId));
            criteria = criteria == null ? categoryFilter : CombineAnd(criteria, categoryFilter);
        }

        // Standards filter
        if (standards != null && standards.Count > 0)
        {
            var standardsFilter = (Expression<Func<Symbol, bool>>)(s =>
                standards.Contains(s.StandardCompliance.PrimaryStandard) ||
                s.StandardCompliance.CompatibleStandards.Any(cs => standards.Contains(cs)));
            criteria = criteria == null ? standardsFilter : CombineAnd(criteria, standardsFilter);
        }

        // Tags filter
        if (tags != null && tags.Count > 0)
        {
            var tagsFilter = (Expression<Func<Symbol, bool>>)(s =>
                s.Tags.Any(tag => tags.Contains(tag)));
            criteria = criteria == null ? tagsFilter : CombineAnd(criteria, tagsFilter);
        }

        // Search text filter
        if (!string.IsNullOrWhiteSpace(searchText))
        {
            var searchFilter = (Expression<Func<Symbol, bool>>)(s =>
                s.Name.ToLower().Contains(searchText.ToLower()) ||
                s.Description.ToLower().Contains(searchText.ToLower()) ||
                s.Code.ToLower().Contains(searchText.ToLower()) ||
                s.Tags.Any(tag => tag.ToLower().Contains(searchText.ToLower())));
            criteria = criteria == null ? searchFilter : CombineAnd(criteria, searchFilter);
        }

        if (criteria != null)
        {
            AddCriteria(criteria);
        }

        // Add includes
        AddInclude(s => s.Category!);

        // Sorting
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
            switch (sortBy.ToLower())
            {
                case "name":
                    if (sortDescending) AddOrderByDescending(s => s.Name);
                    else AddOrderBy(s => s.Name);
                    break;
                case "code":
                    if (sortDescending) AddOrderByDescending(s => s.Code);
                    else AddOrderBy(s => s.Code);
                    break;
                case "created":
                    if (sortDescending) AddOrderByDescending(s => s.CreatedAt);
                    else AddOrderBy(s => s.CreatedAt);
                    break;
                case "modified":
                    if (sortDescending) AddOrderByDescending(s => s.ModifiedAt!);
                    else AddOrderBy(s => s.ModifiedAt!);
                    break;
                default:
                    AddOrderBy(s => s.Name);
                    break;
            }
        }
        else
        {
            AddOrderBy(s => s.Name);
        }

        // Paging
        if (skip.HasValue && take.HasValue)
        {
            ApplyPaging(skip.Value, take.Value);
        }

        ApplyNoTracking();
    }

    private static Expression<Func<T, bool>> CombineAnd<T>(
        Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right)
    {
        var parameter = Expression.Parameter(typeof(T));
        var leftVisitor = new ReplaceExpressionVisitor(left.Parameters[0], parameter);
        var left1 = leftVisitor.Visit(left.Body);
        var rightVisitor = new ReplaceExpressionVisitor(right.Parameters[0], parameter);
        var right1 = rightVisitor.Visit(right.Body);
        return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(left1!, right1!), parameter);
    }

    private class ReplaceExpressionVisitor : ExpressionVisitor
    {
        private readonly Expression _oldValue;
        private readonly Expression _newValue;

        public ReplaceExpressionVisitor(Expression oldValue, Expression newValue)
        {
            _oldValue = oldValue;
            _newValue = newValue;
        }

        public override Expression? Visit(Expression? node)
        {
            return node == _oldValue ? _newValue : base.Visit(node);
        }
    }
}