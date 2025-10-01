using MediatR;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Layers.Commands;

/// <summary>
/// Split a layer by element type into new child layers
/// </summary>
public class SplitLayerCommand : IRequest<List<LayerDto>>
{
    public Guid SourceLayerId { get; set; }
    public List<LayerElementType> SplitByElementTypes { get; set; } = new();
    public bool KeepSourceLayer { get; set; } = false;
    public string CreatedBy { get; set; } = string.Empty;
}
