using System;

namespace Ergoplanner.Domain.Common;

/// <summary>
/// Base interface for domain events
/// </summary>
public interface IDomainEvent
{
    /// <summary>
    /// Unique identifier for the event
    /// </summary>
    Guid Id { get; }

    /// <summary>
    /// Date and time when the event occurred
    /// </summary>
    DateTime OccurredAt { get; }
}