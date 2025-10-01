using MediatR;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Layers.Commands;

/// <summary>
/// Assign multiple elements to a layer
/// </summary>
public class AssignElementsToLayerCommand : IRequest<bool>
{
    public Guid LayerId { get; set; }
    public List<ElementAssignment> Elements { get; set; } = new();
    public string ModifiedBy { get; set; } = string.Empty;
}

public class ElementAssignment
{
    public Guid ElementId { get; set; }
    public LayerElementType ElementType { get; set; }
}
