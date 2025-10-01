using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Queries;

public class GetLayersByDrawingQueryHandler : IRequestHandler<GetLayersByDrawingQuery, List<LayerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetLayersByDrawingQueryHandler> _logger;

    public GetLayersByDrawingQueryHandler(
        IApplicationDbContext context,
        ILogger<GetLayersByDrawingQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<LayerDto>> Handle(GetLayersByDrawingQuery request, CancellationToken cancellationToken)
    {
        var layers = await _context.Layers
            .Include(l => l.LayerElements)
            .Include(l => l.ChildLayers)
            .Where(l => l.DrawingId == request.DrawingId && !l.IsDeleted)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync(cancellationToken);

        return layers.Select(layer => new LayerDto
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
        }).ToList();
    }
}
