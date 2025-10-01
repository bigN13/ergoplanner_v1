using MediatR;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Layers.Queries;

public class GetLayerElementsQuery : IRequest<List<LayerElementDto>>
{
    public Guid LayerId { get; set; }
    public LayerElementType? ElementType { get; set; } // null = get all types
}
