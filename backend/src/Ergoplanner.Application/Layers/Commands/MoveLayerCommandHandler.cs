using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Commands;

public class MoveLayerCommandHandler : IRequestHandler<MoveLayerCommand, LayerDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<MoveLayerCommandHandler> _logger;

    public MoveLayerCommandHandler(
        IApplicationDbContext context,
        ILogger<MoveLayerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LayerDto> Handle(MoveLayerCommand request, CancellationToken cancellationToken)
    {
        var layer = await _context.Layers
            .Include(l => l.ParentLayer)
            .Include(l => l.ChildLayers)
            .Include(l => l.LayerElements)
            .FirstOrDefaultAsync(l => l.Id == request.Id && !l.IsDeleted, cancellationToken);

        if (layer == null)
        {
            throw new ArgumentException($"Layer with ID {request.Id} not found");
        }

        // If moving to a new parent
        if (request.NewParentLayerId != layer.ParentLayerId)
        {
            // Verify new parent exists if specified
            if (request.NewParentLayerId.HasValue)
            {
                var newParent = await _context.Layers
                    .FirstOrDefaultAsync(l => l.Id == request.NewParentLayerId.Value && !l.IsDeleted, cancellationToken);

                if (newParent == null)
                {
                    throw new ArgumentException($"New parent layer with ID {request.NewParentLayerId} not found");
                }

                // Verify new parent is in the same drawing
                if (newParent.DrawingId != layer.DrawingId)
                {
                    throw new InvalidOperationException("New parent layer must belong to the same drawing");
                }

                // Verify no circular reference
                if (newParent.IsDescendantOf(layer))
                {
                    throw new InvalidOperationException("Cannot move layer: would create circular hierarchy");
                }
            }

            // Move to new parent
            layer.MoveToParent(request.NewParentLayerId, request.ModifiedBy);
        }

        // If updating display order
        if (request.NewDisplayOrder.HasValue)
        {
            layer.SetDisplayOrder(request.NewDisplayOrder.Value, request.ModifiedBy);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Moved layer {LayerId} to parent {ParentLayerId} with display order {DisplayOrder}",
            layer.Id, layer.ParentLayerId, layer.DisplayOrder);

        // Map to DTO
        return new LayerDto
        {
            Id = layer.Id,
            Code = layer.Code,
            Name = layer.Name,
            Description = layer.Description,
            Color = layer.Color,
            Opacity = layer.Opacity,
            IsVisible = layer.IsVisible,
            IsSelectable = layer.IsSelectable,
            IsLocked = layer.IsLocked,
            IsPrintable = layer.IsPrintable,
            DisplayOrder = layer.DisplayOrder,
            DrawingId = layer.DrawingId,
            ParentLayerId = layer.ParentLayerId,
            HierarchyPath = layer.HierarchyPath,
            HierarchyLevel = layer.HierarchyLevel,
            Type = layer.Type,
            ElementCount = layer.LayerElements.Count,
            ChildLayerCount = layer.ChildLayers.Count(c => !c.IsDeleted),
            CreatedAt = layer.CreatedAt,
            CreatedBy = layer.CreatedBy,
            ModifiedAt = layer.ModifiedAt,
            ModifiedBy = layer.ModifiedBy
        };
    }
}
