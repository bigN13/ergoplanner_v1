using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;

namespace Ergoplanner.Application.Layers.Commands;

public class DeleteLayerCommandHandler : IRequestHandler<DeleteLayerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteLayerCommandHandler> _logger;

    public DeleteLayerCommandHandler(
        IApplicationDbContext context,
        ILogger<DeleteLayerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteLayerCommand request, CancellationToken cancellationToken)
    {
        var layer = await _context.Layers
            .Include(l => l.LayerElements)
            .Include(l => l.ChildLayers)
            .FirstOrDefaultAsync(l => l.Id == request.Id && !l.IsDeleted, cancellationToken);

        if (layer == null)
        {
            throw new ArgumentException($"Layer with ID {request.Id} not found");
        }

        // Validate: Cannot delete layer if it has elements (unless force delete)
        if (!request.ForceDelete && layer.HasElements())
        {
            throw new InvalidOperationException(
                $"Cannot delete layer '{layer.Name}' because it contains {layer.LayerElements.Count} element(s). " +
                "Use ForceDelete option to delete anyway, or move elements to another layer first.");
        }

        // Validate: Cannot delete layer if it has child layers
        if (layer.HasChildren())
        {
            throw new InvalidOperationException(
                $"Cannot delete layer '{layer.Name}' because it has {layer.ChildLayers.Count(c => !c.IsDeleted)} child layer(s). " +
                "Delete or move child layers first.");
        }

        // Soft delete the layer
        layer.Delete(request.DeletedBy);

        // If force delete, also remove all layer-element associations
        if (request.ForceDelete && layer.LayerElements.Any())
        {
            _logger.LogWarning(
                "Force deleting layer {LayerId} with {ElementCount} elements",
                layer.Id, layer.LayerElements.Count);

            // Remove layer-element associations
            foreach (var layerElement in layer.LayerElements.ToList())
            {
                _context.LayerElements.Remove(layerElement);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Deleted layer {LayerId} with code {LayerCode}",
            layer.Id, layer.Code);

        return true;
    }
}
