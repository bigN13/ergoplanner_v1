using MediatR;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Commands;

public class UpdateLayerVisibilityCommand : IRequest<LayerDto>
{
    public Guid Id { get; set; }
    public bool IsVisible { get; set; }
    public bool IsSelectable { get; set; }
    public bool IsLocked { get; set; }
    public bool IsPrintable { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
}
