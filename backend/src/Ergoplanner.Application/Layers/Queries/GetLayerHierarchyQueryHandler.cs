using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Layers.Queries;

public class GetLayerHierarchyQueryHandler : IRequestHandler<GetLayerHierarchyQuery, List<LayerHierarchyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetLayerHierarchyQueryHandler> _logger;

    public GetLayerHierarchyQueryHandler(
        IApplicationDbContext context,
        ILogger<GetLayerHierarchyQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<LayerHierarchyDto>> Handle(GetLayerHierarchyQuery request, CancellationToken cancellationToken)
    {
        // Get all layers for the drawing
        var allLayers = await _context.Layers
            .Include(l => l.LayerElements)
            .Include(l => l.ChildLayers)
            .Where(l => l.DrawingId == request.DrawingId && !l.IsDeleted)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync(cancellationToken);

        // If parent layer ID is specified, start from that parent
        // Otherwise, start from root layers (no parent)
        var rootLayers = request.ParentLayerId.HasValue
            ? allLayers.Where(l => l.ParentLayerId == request.ParentLayerId.Value).ToList()
            : allLayers.Where(l => l.ParentLayerId == null).ToList();

        // Build hierarchy recursively
        return rootLayers.Select(layer => BuildHierarchyDto(layer, allLayers)).ToList();
    }

    private LayerHierarchyDto BuildHierarchyDto(Layer layer, List<Layer> allLayers)
    {
        var dto = new LayerHierarchyDto
        {
            Id = layer.Id,
            Code = layer.Code,
            Name = layer.Name,
            Color = layer.Color,
            Opacity = layer.Opacity,
            IsVisible = layer.IsVisible,
            IsLocked = layer.IsLocked,
            DisplayOrder = layer.DisplayOrder,
            ParentLayerId = layer.ParentLayerId,
            HierarchyLevel = layer.HierarchyLevel,
            Type = layer.Type,
            ElementCount = layer.LayerElements.Count,
            ChildLayers = new List<LayerHierarchyDto>()
        };

        // Get child layers and build their hierarchy recursively
        var childLayers = allLayers
            .Where(l => l.ParentLayerId == layer.Id && !l.IsDeleted)
            .OrderBy(l => l.DisplayOrder)
            .ToList();

        dto.ChildLayers = childLayers.Select(child => BuildHierarchyDto(child, allLayers)).ToList();

        return dto;
    }
}
