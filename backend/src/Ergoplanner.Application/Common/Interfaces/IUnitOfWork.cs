using Ergoplanner.Domain.Common;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Unit of Work pattern interface for managing transactions and repository coordination
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Symbol repository
    /// </summary>
    ISymbolRepository Symbols { get; }

    /// <summary>
    /// Save all changes made in this unit of work
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of affected records</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Save changes with domain events publishing
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of affected records</returns>
    Task<int> SaveChangesWithEventsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Begin a database transaction
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commit the current transaction
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rollback the current transaction
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if there is an active transaction
    /// </summary>
    bool HasActiveTransaction { get; }

    /// <summary>
    /// Get the current transaction ID
    /// </summary>
    Guid? CurrentTransactionId { get; }
}