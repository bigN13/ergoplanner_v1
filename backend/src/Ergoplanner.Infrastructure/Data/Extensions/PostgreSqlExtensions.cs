using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;
using Ergoplanner.Application.Common.Specifications;

namespace Ergoplanner.Infrastructure.Data.Extensions;

/// <summary>
/// Extension methods for configuring PostgreSQL-specific features
/// </summary>
public static class PostgreSqlExtensions
{
    /// <summary>
    /// Configure PostgreSQL extensions for fuzzy search and full-text search
    /// </summary>
    /// <param name="optionsBuilder">PostgreSQL options builder</param>
    /// <returns>Configured options builder</returns>
    public static NpgsqlDbContextOptionsBuilder UsePostgreSqlExtensions(this NpgsqlDbContextOptionsBuilder optionsBuilder)
    {
        return optionsBuilder
            .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
            .EnableRetryOnFailure(maxRetryCount: 3)
            .CommandTimeout(30);
    }

    /// <summary>
    /// Configure PostgreSQL model with extensions and functions
    /// </summary>
    /// <param name="modelBuilder">Model builder</param>
    public static void ConfigurePostgreSqlExtensions(this ModelBuilder modelBuilder)
    {
        // Enable PostgreSQL extensions
        modelBuilder.HasPostgresExtension("pg_trgm");  // Trigram matching for fuzzy search
        modelBuilder.HasPostgresExtension("unaccent"); // Text normalization
        modelBuilder.HasPostgresExtension("btree_gin"); // Better indexing for arrays
        modelBuilder.HasPostgresExtension("uuid-ossp"); // UUID generation

        // Configure custom functions for fuzzy search
        modelBuilder.HasDbFunction(
            typeof(PostgreSqlExtensions).GetMethod(nameof(Similarity))!)
            .HasName("similarity")
            .HasSchema("");

        modelBuilder.HasDbFunction(
            typeof(PostgreSqlExtensions).GetMethod(nameof(WordSimilarity))!)
            .HasName("word_similarity")
            .HasSchema("");

        modelBuilder.HasDbFunction(
            typeof(PostgreSqlExtensions).GetMethod(nameof(StrictWordSimilarity))!)
            .HasName("strict_word_similarity")
            .HasSchema("");
    }

    /// <summary>
    /// Calculate similarity between two strings using pg_trgm
    /// </summary>
    /// <param name="text1">First text</param>
    /// <param name="text2">Second text</param>
    /// <returns>Similarity score between 0 and 1</returns>
    public static double Similarity(string text1, string text2)
        => throw new InvalidOperationException("This method should only be used in EF Core queries");

    /// <summary>
    /// Calculate word similarity between two strings using pg_trgm
    /// </summary>
    /// <param name="text1">First text</param>
    /// <param name="text2">Second text</param>
    /// <returns>Word similarity score between 0 and 1</returns>
    public static double WordSimilarity(string text1, string text2)
        => throw new InvalidOperationException("This method should only be used in EF Core queries");

    /// <summary>
    /// Calculate strict word similarity between two strings using pg_trgm
    /// </summary>
    /// <param name="text1">First text</param>
    /// <param name="text2">Second text</param>
    /// <returns>Strict word similarity score between 0 and 1</returns>
    public static double StrictWordSimilarity(string text1, string text2)
        => throw new InvalidOperationException("This method should only be used in EF Core queries");
}

/// <summary>
/// Enhanced search specification using PostgreSQL fuzzy search capabilities
/// </summary>
public class FuzzySymbolSearchSpecification : BaseSpecification<Ergoplanner.Domain.Entities.Symbol>
{
    public FuzzySymbolSearchSpecification(string searchText, double threshold = 0.3) : base(s =>
        PostgreSqlExtensions.Similarity(s.Name, searchText) > threshold ||
        PostgreSqlExtensions.Similarity(s.Description, searchText) > threshold ||
        PostgreSqlExtensions.Similarity(s.Code, searchText) > threshold ||
        s.Tags.Any(tag => PostgreSqlExtensions.Similarity(tag, searchText) > threshold))
    {
        AddInclude(s => s.Category!);

        // Order by highest similarity first
        AddOrderByDescending(s =>
            Math.Max(
                Math.Max(PostgreSqlExtensions.Similarity(s.Name, searchText),
                        PostgreSqlExtensions.Similarity(s.Description, searchText)),
                PostgreSqlExtensions.Similarity(s.Code, searchText)));

        ApplyNoTracking();
    }
}