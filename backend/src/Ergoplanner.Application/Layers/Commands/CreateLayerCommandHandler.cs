using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Application.Layers.Commands;

public class CreateLayerCommandHandler : IRequestHandler<CreateLayerCommand, LayerDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateLayerCommandHandler> _logger;

    public CreateLayerCommandHandler(
        IApplicationDbContext context,
        ILogger<CreateLayerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LayerDto> Handle(CreateLayerCommand request, CancellationToken cancellationToken)
    {
        // Verify drawing exists
        var drawingExists = await _context.Drawings
            .AnyAsync(d => d.Id == request.DrawingId && !d.IsDeleted, cancellationToken);

        if (!drawingExists)
        {
            throw new ArgumentException($"Drawing with ID {request.DrawingId} not found");
        }

        // Verify layer code is unique within the drawing
        var codeExists = await _context.Layers
            .AnyAsync(l => l.DrawingId == request.DrawingId &&
                          l.Code == request.Code &&
                          !l.IsDeleted, cancellationToken);

        if (codeExists)
        {
            throw new InvalidOperationException($"Layer with code '{request.Code}' already exists in this drawing");
        }

        // If parent layer specified, verify it exists and belongs to same drawing
        if (request.ParentLayerId.HasValue)
        {
            var parentLayer = await _context.Layers
                .FirstOrDefaultAsync(l => l.Id == request.ParentLayerId.Value && !l.IsDeleted, cancellationToken);

            if (parentLayer == null)
            {
                throw new ArgumentException($"Parent layer with ID {request.ParentLayerId} not found");
            }

            if (parentLayer.DrawingId != request.DrawingId)
            {
                throw new InvalidOperationException("Parent layer must belong to the same drawing");
            }
        }

        // Create the layer
        var layer = new Layer(
            request.Code,
            request.Name,
            request.Description,
            request.DrawingId,
            request.Color,
            request.Opacity,
            request.Type,
            request.Properties ?? LayerProperties.Default(),
            request.Metadata ?? LayerMetadata.Empty(),
            request.ParentLayerId);

        // Set visibility properties
        layer.UpdateVisibility(
            request.IsVisible,
            request.IsSelectable,
            request.IsLocked,
            request.IsPrintable,
            request.CreatedBy);

        // Set display order
        if (request.DisplayOrder > 0)
        {
            layer.SetDisplayOrder(request.DisplayOrder, request.CreatedBy);
        }

        _context.Layers.Add(layer);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created layer {LayerId} with code {LayerCode} for drawing {DrawingId}",
            layer.Id, layer.Code, layer.DrawingId);

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
            ElementCount = 0,
            ChildLayerCount = 0,
            CreatedAt = layer.CreatedAt,
            CreatedBy = layer.CreatedBy,
            ModifiedAt = layer.ModifiedAt,
            ModifiedBy = layer.ModifiedBy
        };
    }
}
