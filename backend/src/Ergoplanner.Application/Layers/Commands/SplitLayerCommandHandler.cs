using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Application.Layers.Commands;

public class SplitLayerCommandHandler : IRequestHandler<SplitLayerCommand, List<LayerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SplitLayerCommandHandler> _logger;

    public SplitLayerCommandHandler(
        IApplicationDbContext context,
        ILogger<SplitLayerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<LayerDto>> Handle(SplitLayerCommand request, CancellationToken cancellationToken)
    {
        // Begin transaction for atomic operation
        await _context.BeginTransactionAsync(cancellationToken);

        try
        {
            // Get source layer with elements
            var sourceLayer = await _context.Layers
                .Include(l => l.LayerElements)
                .FirstOrDefaultAsync(l => l.Id == request.SourceLayerId && !l.IsDeleted, cancellationToken);

            if (sourceLayer == null)
            {
                throw new ArgumentException($"Source layer with ID {request.SourceLayerId} not found");
            }

            if (!sourceLayer.HasElements())
            {
                throw new InvalidOperationException("Cannot split an empty layer");
            }

            if (request.SplitByElementTypes == null || !request.SplitByElementTypes.Any())
            {
                throw new ArgumentException("Must specify at least one element type to split by");
            }

            var createdLayers = new List<Layer>();

            // Create a child layer for each element type
            foreach (var elementType in request.SplitByElementTypes)
            {
                // Get elements of this type
                var elementsOfType = sourceLayer.LayerElements
                    .Where(e => e.ElementType == elementType)
                    .ToList();

                if (!elementsOfType.Any())
                {
                    _logger.LogWarning(
                        "No elements of type {ElementType} found in layer {LayerId}, skipping",
                        elementType, sourceLayer.Id);
                    continue;
                }

                // Generate unique code for new layer
                var newLayerCode = $"{sourceLayer.Code}_{elementType}";
                int suffix = 1;
                while (await _context.Layers.AnyAsync(
                    l => l.DrawingId == sourceLayer.DrawingId &&
                         l.Code == newLayerCode &&
                         !l.IsDeleted,
                    cancellationToken))
                {
                    newLayerCode = $"{sourceLayer.Code}_{elementType}_{suffix++}";
                }

                // Create new child layer
                var newLayer = new Layer(
                    newLayerCode,
                    $"{sourceLayer.Name} - {elementType}",
                    $"Split from {sourceLayer.Name} containing {elementType} elements",
                    sourceLayer.DrawingId,
                    sourceLayer.Color,
                    sourceLayer.Opacity,
                    sourceLayer.Type,
                    sourceLayer.Properties,
                    LayerMetadata.Empty(),
                    sourceLayer.Id); // Set source layer as parent

                // Copy visibility settings
                newLayer.UpdateVisibility(
                    sourceLayer.IsVisible,
                    sourceLayer.IsSelectable,
                    sourceLayer.IsLocked,
                    sourceLayer.IsPrintable,
                    request.CreatedBy);

                _context.Layers.Add(newLayer);
                await _context.SaveChangesAsync(cancellationToken); // Save to get ID

                // Move elements to new layer (remove from source and create new in target)
                foreach (var element in elementsOfType)
                {
                    _context.LayerElements.Remove(element);
                    var newElement = new LayerElement(
                        newLayer.Id,
                        element.ElementId,
                        element.ElementType);
                    _context.LayerElements.Add(newElement);
                }

                createdLayers.Add(newLayer);

                _logger.LogInformation(
                    "Created split layer {LayerId} with code {LayerCode} containing {ElementCount} elements of type {ElementType}",
                    newLayer.Id, newLayer.Code, elementsOfType.Count, elementType);
            }

            // Delete source layer if requested
            if (!request.KeepSourceLayer)
            {
                // Check if source layer still has elements (types not in split list)
                var remainingElements = await _context.LayerElements
                    .CountAsync(e => e.LayerId == sourceLayer.Id, cancellationToken);

                if (remainingElements == 0)
                {
                    sourceLayer.Delete(request.CreatedBy);
                    _logger.LogInformation("Deleted source layer {LayerId} after split", sourceLayer.Id);
                }
                else
                {
                    _logger.LogWarning(
                        "Source layer {LayerId} still has {ElementCount} elements, not deleting",
                        sourceLayer.Id, remainingElements);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            await _context.CommitTransactionAsync(cancellationToken);

            _logger.LogInformation(
                "Split layer {SourceLayerId} into {LayerCount} new layers",
                sourceLayer.Id, createdLayers.Count);

            // Map to DTOs
            return createdLayers.Select(l => new LayerDto
            {
                Id = l.Id,
                Code = l.Code,
                Name = l.Name,
                Description = l.Description,
                Color = l.Color,
                Opacity = l.Opacity,
                IsVisible = l.IsVisible,
                IsSelectable = l.IsSelectable,
                IsLocked = l.IsLocked,
                IsPrintable = l.IsPrintable,
                DisplayOrder = l.DisplayOrder,
                DrawingId = l.DrawingId,
                ParentLayerId = l.ParentLayerId,
                HierarchyPath = l.HierarchyPath,
                HierarchyLevel = l.HierarchyLevel,
                Type = l.Type,
                ElementCount = l.LayerElements.Count,
                ChildLayerCount = 0,
                CreatedAt = l.CreatedAt,
                CreatedBy = l.CreatedBy,
                ModifiedAt = l.ModifiedAt,
                ModifiedBy = l.ModifiedBy
            }).ToList();
        }
        catch
        {
            await _context.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
