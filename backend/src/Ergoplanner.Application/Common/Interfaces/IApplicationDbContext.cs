using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Interface for the application database context
/// </summary>
public interface IApplicationDbContext
{
    /// <summary>
    /// Symbols in the system
    /// </summary>
    DbSet<Symbol> Symbols { get; }

    /// <summary>
    /// Symbol metadata entries
    /// </summary>
    DbSet<Domain.Entities.SymbolMetadata> SymbolMetadata { get; }

    /// <summary>
    /// Property templates for equipment
    /// </summary>
    DbSet<PropertyTemplate> PropertyTemplates { get; }

    /// <summary>
    /// Drawings in the system
    /// </summary>
    DbSet<Drawing> Drawings { get; }

    /// <summary>
    /// Layers in drawings
    /// </summary>
    DbSet<Layer> Layers { get; }

    /// <summary>
    /// Layer element associations
    /// </summary>
    DbSet<LayerElement> LayerElements { get; }

    /// <summary>
    /// Save changes to the database
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Begin a database transaction
    /// </summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commit the current transaction
    /// </summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rollback the current transaction
    /// </summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}