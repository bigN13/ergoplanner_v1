using MediatR;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Commands;

/// <summary>
/// Merge multiple source layers into a target layer
/// </summary>
public class MergeLayersCommand : IRequest<LayerDto>
{
    public Guid TargetLayerId { get; set; }
    public List<Guid> SourceLayerIds { get; set; } = new();
    public bool DeleteSourceLayers { get; set; } = true;
    public string ModifiedBy { get; set; } = string.Empty;
}
