using MediatR;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Queries;

public class GetLayerHierarchyQuery : IRequest<List<LayerHierarchyDto>>
{
    public Guid DrawingId { get; set; }
    public Guid? ParentLayerId { get; set; } // null = get all root layers
}
