using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Commands;

public class UpdateLayerVisibilityCommandHandler : IRequestHandler<UpdateLayerVisibilityCommand, LayerDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateLayerVisibilityCommandHandler> _logger;

    public UpdateLayerVisibilityCommandHandler(
        IApplicationDbContext context,
        ILogger<UpdateLayerVisibilityCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LayerDto> Handle(UpdateLayerVisibilityCommand request, CancellationToken cancellationToken)
    {
        var layer = await _context.Layers
            .Include(l => l.LayerElements)
            .Include(l => l.ChildLayers)
            .FirstOrDefaultAsync(l => l.Id == request.Id && !l.IsDeleted, cancellationToken);

        if (layer == null)
        {
            throw new ArgumentException($"Layer with ID {request.Id} not found");
        }

        // Update visibility settings
        layer.UpdateVisibility(
            request.IsVisible,
            request.IsSelectable,
            request.IsLocked,
            request.IsPrintable,
            request.ModifiedBy);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Updated visibility for layer {LayerId}: Visible={IsVisible}, Selectable={IsSelectable}, Locked={IsLocked}, Printable={IsPrintable}",
            layer.Id, request.IsVisible, request.IsSelectable, request.IsLocked, request.IsPrintable);

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
