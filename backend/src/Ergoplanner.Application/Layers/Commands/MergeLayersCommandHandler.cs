using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Layers.Commands;

public class MergeLayersCommandHandler : IRequestHandler<MergeLayersCommand, LayerDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<MergeLayersCommandHandler> _logger;

    public MergeLayersCommandHandler(
        IApplicationDbContext context,
        ILogger<MergeLayersCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LayerDto> Handle(MergeLayersCommand request, CancellationToken cancellationToken)
    {
        // Begin transaction for atomic operation
        await _context.BeginTransactionAsync(cancellationToken);

        try
        {
            // Get target layer
            var targetLayer = await _context.Layers
                .Include(l => l.LayerElements)
                .Include(l => l.ChildLayers)
                .FirstOrDefaultAsync(l => l.Id == request.TargetLayerId && !l.IsDeleted, cancellationToken);

            if (targetLayer == null)
            {
                throw new ArgumentException($"Target layer with ID {request.TargetLayerId} not found");
            }

            // Get source layers
            var sourceLayers = await _context.Layers
                .Include(l => l.LayerElements)
                .Where(l => request.SourceLayerIds.Contains(l.Id) && !l.IsDeleted)
                .ToListAsync(cancellationToken);

            if (sourceLayers.Count != request.SourceLayerIds.Count)
            {
                throw new ArgumentException("One or more source layers not found");
            }

            // Validate all layers belong to same drawing
            if (sourceLayers.Any(l => l.DrawingId != targetLayer.DrawingId))
            {
                throw new InvalidOperationException("All layers must belong to the same drawing");
            }

            // Cannot merge layer with itself
            if (request.SourceLayerIds.Contains(request.TargetLayerId))
            {
                throw new InvalidOperationException("Cannot merge layer with itself");
            }

            // Merge elements from source layers to target layer
            int movedElementCount = 0;
            foreach (var sourceLayer in sourceLayers)
            {
                foreach (var element in sourceLayer.LayerElements.ToList())
                {
                    // Check if element already exists in target layer
                    var existingElement = targetLayer.LayerElements
                        .FirstOrDefault(e => e.ElementId == element.ElementId);

                    if (existingElement == null)
                    {
                        // Move element to target layer (remove old, create new)
                        _context.LayerElements.Remove(element);
                        var newElement = new LayerElement(
                            targetLayer.Id,
                            element.ElementId,
                            element.ElementType);
                        _context.LayerElements.Add(newElement);
                        movedElementCount++;
                    }
                    else
                    {
                        // Element already in target, just remove from source
                        _context.LayerElements.Remove(element);
                    }
                }

                // Delete source layer if requested
                if (request.DeleteSourceLayers)
                {
                    sourceLayer.Delete(request.ModifiedBy);
                }
            }

            // Update target layer modification info
            targetLayer.UpdateModificationInfo(request.ModifiedBy);

            await _context.SaveChangesAsync(cancellationToken);
            await _context.CommitTransactionAsync(cancellationToken);

            _logger.LogInformation(
                "Merged {SourceCount} layers into layer {TargetLayerId}, moved {ElementCount} elements, deleted source layers: {DeletedLayers}",
                sourceLayers.Count, targetLayer.Id, movedElementCount, request.DeleteSourceLayers);

            // Reload layer with updated counts
            var updatedLayer = await _context.Layers
                .Include(l => l.LayerElements)
                .Include(l => l.ChildLayers)
                .FirstAsync(l => l.Id == targetLayer.Id, cancellationToken);

            // Map to DTO
            return new LayerDto
            {
                Id = updatedLayer.Id,
                Code = updatedLayer.Code,
                Name = updatedLayer.Name,
                Description = updatedLayer.Description,
                Color = updatedLayer.Color,
                Opacity = updatedLayer.Opacity,
                IsVisible = updatedLayer.IsVisible,
                IsSelectable = updatedLayer.IsSelectable,
                IsLocked = updatedLayer.IsLocked,
                IsPrintable = updatedLayer.IsPrintable,
                DisplayOrder = updatedLayer.DisplayOrder,
                DrawingId = updatedLayer.DrawingId,
                ParentLayerId = updatedLayer.ParentLayerId,
                HierarchyPath = updatedLayer.HierarchyPath,
                HierarchyLevel = updatedLayer.HierarchyLevel,
                Type = updatedLayer.Type,
                ElementCount = updatedLayer.LayerElements.Count,
                ChildLayerCount = updatedLayer.ChildLayers.Count(c => !c.IsDeleted),
                CreatedAt = updatedLayer.CreatedAt,
                CreatedBy = updatedLayer.CreatedBy,
                ModifiedAt = updatedLayer.ModifiedAt,
                ModifiedBy = updatedLayer.ModifiedBy
            };
        }
        catch
        {
            await _context.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
