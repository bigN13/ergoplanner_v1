using Microsoft.EntityFrameworkCore;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Infrastructure.Data.Extensions;

namespace Ergoplanner.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets for all entities
    public DbSet<Symbol> Symbols => Set<Symbol>();
    public DbSet<SymbolCategory> SymbolCategories => Set<SymbolCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure PostgreSQL extensions
        modelBuilder.ConfigurePostgreSqlExtensions();

        // Apply all configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}