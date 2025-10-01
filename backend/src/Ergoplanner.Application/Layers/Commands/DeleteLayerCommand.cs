using MediatR;

namespace Ergoplanner.Application.Layers.Commands;

public class DeleteLayerCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string DeletedBy { get; set; } = string.Empty;
    public bool ForceDelete { get; set; } = false; // Force delete even if layer has elements
}
