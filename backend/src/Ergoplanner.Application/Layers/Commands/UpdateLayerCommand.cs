using MediatR;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Application.Layers.Commands;

public class UpdateLayerCommand : IRequest<LayerDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public double Opacity { get; set; }
    public LayerProperties? Properties { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
}
