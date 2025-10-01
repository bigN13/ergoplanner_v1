using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Layers.DTOs;

public class LayerDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public double Opacity { get; set; }
    public bool IsVisible { get; set; }
    public bool IsSelectable { get; set; }
    public bool IsLocked { get; set; }
    public bool IsPrintable { get; set; }
    public int DisplayOrder { get; set; }
    public Guid DrawingId { get; set; }
    public Guid? ParentLayerId { get; set; }
    public string HierarchyPath { get; set; } = string.Empty;
    public int HierarchyLevel { get; set; }
    public LayerType Type { get; set; }
    public int ElementCount { get; set; }
    public int ChildLayerCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? ModifiedAt { get; set; }
    public string? ModifiedBy { get; set; }
}
