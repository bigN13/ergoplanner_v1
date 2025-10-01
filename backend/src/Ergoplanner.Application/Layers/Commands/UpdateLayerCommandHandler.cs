using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Application.Layers.Commands;

public class UpdateLayerCommandHandler : IRequestHandler<UpdateLayerCommand, LayerDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateLayerCommandHandler> _logger;

    public UpdateLayerCommandHandler(
        IApplicationDbContext context,
        ILogger<UpdateLayerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LayerDto> Handle(UpdateLayerCommand request, CancellationToken cancellationToken)
    {
        var layer = await _context.Layers
            .Include(l => l.LayerElements)
            .Include(l => l.ChildLayers)
            .FirstOrDefaultAsync(l => l.Id == request.Id && !l.IsDeleted, cancellationToken);

        if (layer == null)
        {
            throw new ArgumentException($"Layer with ID {request.Id} not found");
        }

        // Update layer properties
        layer.UpdateLayer(
            request.Name,
            request.Description,
            request.Color,
            request.Opacity,
            request.Properties ?? LayerProperties.Default(),
            request.ModifiedBy);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Updated layer {LayerId} with code {LayerCode}",
            layer.Id, layer.Code);

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
