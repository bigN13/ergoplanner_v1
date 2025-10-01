using MediatR;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Queries;

public class GetLayerByIdQuery : IRequest<LayerDto?>
{
    public Guid Id { get; set; }
}
