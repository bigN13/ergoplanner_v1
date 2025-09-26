using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Infrastructure.Data;
using Ergoplanner.Infrastructure.Data.Extensions;
using Ergoplanner.Infrastructure.Data.Repositories;
using Ergoplanner.Infrastructure.Services;

namespace Ergoplanner.Infrastructure;

/// <summary>
/// Infrastructure layer dependency injection configuration
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Add infrastructure services to the dependency injection container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <param name="configuration">Configuration</param>
    /// <returns>Configured service collection</returns>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database configuration
        services.AddDatabase(configuration);

        // Redis configuration
        services.AddRedis(configuration);

        // Repository configuration
        services.AddRepositories();

        // Other infrastructure services
        services.AddOtherServices();

        return services;
    }

    /// <summary>
    /// Configure database services
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <param name="configuration">Configuration</param>
    /// <returns>Configured service collection</returns>
    private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.UsePostgreSqlExtensions();
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            })
            .EnableSensitiveDataLogging(false)
            .EnableServiceProviderCaching()
            .EnableDetailedErrors();

            // Configure for development/production
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            if (isDevelopment)
            {
                options.LogTo(Console.WriteLine, LogLevel.Information);
            }
        });

        return services;
    }

    /// <summary>
    /// Configure Redis caching services
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <param name="configuration">Configuration</param>
    /// <returns>Configured service collection</returns>
    private static IServiceCollection AddRedis(this IServiceCollection services, IConfiguration configuration)
    {
        var redisConnectionString = configuration.GetConnectionString("Redis");

        // Fallback to in-memory caching for now
        services.AddMemoryCache();
        services.AddDistributedMemoryCache();

        // Add a no-op Redis service implementation
        services.AddScoped<IRedisCacheService, NoOpRedisCacheService>();

        return services;
    }

    /// <summary>
    /// Configure repository services with caching decorators
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Configured service collection</returns>
    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Symbol repository with caching
        services.AddScoped<SymbolRepository>();
        services.AddScoped<ISymbolRepository>(provider =>
        {
            var baseRepository = provider.GetRequiredService<SymbolRepository>();
            var cache = provider.GetRequiredService<Microsoft.Extensions.Caching.Distributed.IDistributedCache>();
            var logger = provider.GetRequiredService<ILogger<CachedSymbolRepository>>();

            return new CachedSymbolRepository(baseRepository, cache, logger);
        });

        // Symbol Category repository (if needed)
        // services.AddScoped<ISymbolCategoryRepository, SymbolCategoryRepository>();

        return services;
    }

    /// <summary>
    /// Configure other infrastructure services
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Configured service collection</returns>
    private static IServiceCollection AddOtherServices(this IServiceCollection services)
    {
        // Unit of Work pattern
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}

/// <summary>
/// No-operation Redis cache service for when Redis is not available
/// </summary>
public class NoOpRedisCacheService : IRedisCacheService
{
    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        return Task.FromResult<T?>(default);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(false);
    }
}