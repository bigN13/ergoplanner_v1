using Ergoplanner.Domain.Common;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a P&ID drawing in the system
/// This is a minimal implementation to support Layer relationships
/// Will be expanded in future tasks
/// </summary>
public class Drawing : BaseEntity
{
    /// <summary>
    /// Drawing name/title
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// Drawing description
    /// </summary>
    public string Description { get; private set; }

    /// <summary>
    /// Navigation property to layers in this drawing
    /// </summary>
    public virtual ICollection<Layer> Layers { get; set; }

    // Private constructor for EF Core
    private Drawing()
    {
        Name = string.Empty;
        Description = string.Empty;
        Layers = new List<Layer>();
    }

    /// <summary>
    /// Creates a new Drawing instance
    /// </summary>
    public Drawing(string name, string description) : base()
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Drawing name cannot be null or empty", nameof(name));

        Name = name;
        Description = description ?? string.Empty;
        Layers = new List<Layer>();
    }

    /// <summary>
    /// Update drawing information
    /// </summary>
    public void UpdateDrawing(string name, string description, string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Drawing name cannot be null or empty", nameof(name));

        Name = name;
        Description = description ?? string.Empty;
        UpdateModificationInfo(modifiedBy);
    }
}