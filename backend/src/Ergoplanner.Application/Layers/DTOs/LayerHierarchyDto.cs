using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Layers.DTOs;

public class LayerHierarchyDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public double Opacity { get; set; }
    public bool IsVisible { get; set; }
    public bool IsLocked { get; set; }
    public int DisplayOrder { get; set; }
    public Guid? ParentLayerId { get; set; }
    public int HierarchyLevel { get; set; }
    public LayerType Type { get; set; }
    public int ElementCount { get; set; }
    public List<LayerHierarchyDto> ChildLayers { get; set; } = new();
}
