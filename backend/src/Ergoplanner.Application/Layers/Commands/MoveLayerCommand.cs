using MediatR;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Commands;

/// <summary>
/// Move layer to a different parent or reorder within same parent
/// </summary>
public class MoveLayerCommand : IRequest<LayerDto>
{
    public Guid Id { get; set; }
    public Guid? NewParentLayerId { get; set; }
    public int? NewDisplayOrder { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
}
