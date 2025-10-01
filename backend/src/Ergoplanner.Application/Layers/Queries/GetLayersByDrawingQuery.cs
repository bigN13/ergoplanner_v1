using MediatR;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Queries;

public class GetLayersByDrawingQuery : IRequest<List<LayerDto>>
{
    public Guid DrawingId { get; set; }
}
