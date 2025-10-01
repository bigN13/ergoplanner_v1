using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Infrastructure.Data.Extensions;
using System.Threading;
using System.Threading.Tasks;

namespace Ergoplanner.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private IDbContextTransaction? _currentTransaction;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets for all entities
    public DbSet<Symbol> Symbols => Set<Symbol>();
    public DbSet<SymbolCategory> SymbolCategories => Set<SymbolCategory>();
    public DbSet<SymbolMetadata> SymbolMetadata => Set<SymbolMetadata>();
    public DbSet<PropertyTemplate> PropertyTemplates => Set<PropertyTemplate>();
    public DbSet<Drawing> Drawings => Set<Drawing>();
    public DbSet<Layer> Layers => Set<Layer>();
    public DbSet<LayerElement> LayerElements => Set<LayerElement>();
    public DbSet<SymbolMapping> SymbolMappings => Set<SymbolMapping>();
    public DbSet<SymbolLibrary> SymbolLibraries => Set<SymbolLibrary>();
    public DbSet<StandardSymbolDefinition> StandardSymbolDefinitions => Set<StandardSymbolDefinition>();
    public DbSet<ValidationRule> ValidationRules => Set<ValidationRule>();
    public DbSet<ValidationViolation> ValidationViolations => Set<ValidationViolation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure PostgreSQL extensions
        modelBuilder.ConfigurePostgreSqlExtensions();

        // Apply all configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction != null)
            return;

        _currentTransaction = await Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await SaveChangesAsync(cancellationToken);
            if (_currentTransaction != null)
            {
                await _currentTransaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_currentTransaction != null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.RollbackAsync(cancellationToken);
            }
        }
        finally
        {
            if (_currentTransaction != null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }
}