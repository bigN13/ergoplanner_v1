using System;

namespace Ergoplanner.Domain.Common;

/// <summary>
/// Base entity class for all domain entities
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Unique identifier for the entity
    /// </summary>
    public Guid Id { get; protected set; }

    /// <summary>
    /// Date and time when the entity was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// User ID who created the entity
    /// </summary>
    public string CreatedBy { get; set; } = string.Empty;

    /// <summary>
    /// Date and time when the entity was last modified
    /// </summary>
    public DateTime? ModifiedAt { get; protected set; }

    /// <summary>
    /// User ID who last modified the entity
    /// </summary>
    public string? ModifiedBy { get; protected set; }

    /// <summary>
    /// Indicates whether the entity is soft deleted
    /// </summary>
    public bool IsDeleted { get; protected set; }

    /// <summary>
    /// Date and time when the entity was deleted
    /// </summary>
    public DateTime? DeletedAt { get; protected set; }

    /// <summary>
    /// User ID who deleted the entity
    /// </summary>
    public string? DeletedBy { get; protected set; }

    /// <summary>
    /// Row version for optimistic concurrency control
    /// </summary>
    public byte[] RowVersion { get; protected set; } = Array.Empty<byte>();

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Mark entity as deleted (soft delete)
    /// </summary>
    public virtual void Delete(string deletedBy)
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        DeletedBy = deletedBy;
    }

    /// <summary>
    /// Restore a soft-deleted entity
    /// </summary>
    public virtual void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
        DeletedBy = null;
    }

    /// <summary>
    /// Update modification tracking fields
    /// </summary>
    public virtual void UpdateModificationInfo(string modifiedBy)
    {
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
}