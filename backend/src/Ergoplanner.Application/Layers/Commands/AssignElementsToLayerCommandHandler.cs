using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Layers.Commands;

public class AssignElementsToLayerCommandHandler : IRequestHandler<AssignElementsToLayerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AssignElementsToLayerCommandHandler> _logger;

    public AssignElementsToLayerCommandHandler(
        IApplicationDbContext context,
        ILogger<AssignElementsToLayerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> Handle(AssignElementsToLayerCommand request, CancellationToken cancellationToken)
    {
        // Begin transaction for atomic operation
        await _context.BeginTransactionAsync(cancellationToken);

        try
        {
            // Verify layer exists
            var layer = await _context.Layers
                .FirstOrDefaultAsync(l => l.Id == request.LayerId && !l.IsDeleted, cancellationToken);

            if (layer == null)
            {
                throw new ArgumentException($"Layer with ID {request.LayerId} not found");
            }

            if (request.Elements == null || !request.Elements.Any())
            {
                throw new ArgumentException("Must specify at least one element to assign");
            }

            int assignedCount = 0;
            int updatedCount = 0;

            foreach (var element in request.Elements)
            {
                // Check if element already assigned to this layer
                var existingAssignment = await _context.LayerElements
                    .FirstOrDefaultAsync(
                        le => le.ElementId == element.ElementId && le.LayerId == request.LayerId,
                        cancellationToken);

                if (existingAssignment != null)
                {
                    // Element already in this layer - check if type needs updating
                    if (existingAssignment.ElementType != element.ElementType)
                    {
                        // Remove old and create new with different type
                        _context.LayerElements.Remove(existingAssignment);
                        var newElement = new LayerElement(
                            request.LayerId,
                            element.ElementId,
                            element.ElementType);
                        _context.LayerElements.Add(newElement);
                        updatedCount++;
                    }
                    continue;
                }

                // Check if element assigned to a different layer
                var otherLayerAssignment = await _context.LayerElements
                    .FirstOrDefaultAsync(le => le.ElementId == element.ElementId, cancellationToken);

                if (otherLayerAssignment != null)
                {
                    // Remove from old layer and add to new layer
                    _context.LayerElements.Remove(otherLayerAssignment);
                    var layerElement = new LayerElement(
                        request.LayerId,
                        element.ElementId,
                        element.ElementType);
                    _context.LayerElements.Add(layerElement);
                    updatedCount++;
                }
                else
                {
                    // Create new assignment
                    var layerElement = new LayerElement(
                        request.LayerId,
                        element.ElementId,
                        element.ElementType);

                    _context.LayerElements.Add(layerElement);
                    assignedCount++;
                }
            }

            // Update layer modification info
            layer.UpdateModificationInfo(request.ModifiedBy);

            await _context.SaveChangesAsync(cancellationToken);
            await _context.CommitTransactionAsync(cancellationToken);

            _logger.LogInformation(
                "Assigned {AssignedCount} new elements and updated {UpdatedCount} existing elements for layer {LayerId}",
                assignedCount, updatedCount, request.LayerId);

            return true;
        }
        catch
        {
            await _context.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
