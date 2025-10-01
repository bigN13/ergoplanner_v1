using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Layers.DTOs;

public class LayerElementDto
{
    public Guid ElementId { get; set; }
    public LayerElementType ElementType { get; set; }
    public string ElementName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}
