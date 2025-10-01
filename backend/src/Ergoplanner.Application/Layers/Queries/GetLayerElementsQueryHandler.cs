using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.Application.Layers.Queries;

public class GetLayerElementsQueryHandler : IRequestHandler<GetLayerElementsQuery, List<LayerElementDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetLayerElementsQueryHandler> _logger;

    public GetLayerElementsQueryHandler(
        IApplicationDbContext context,
        ILogger<GetLayerElementsQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<LayerElementDto>> Handle(GetLayerElementsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.LayerElements
            .Where(le => le.LayerId == request.LayerId);

        // Filter by element type if specified
        if (request.ElementType.HasValue)
        {
            query = query.Where(le => le.ElementType == request.ElementType.Value);
        }

        var elements = await query
            .OrderBy(le => le.CreatedAt)
            .ToListAsync(cancellationToken);

        return elements.Select(element => new LayerElementDto
        {
            ElementId = element.ElementId,
            ElementType = element.ElementType,
            ElementName = string.Empty, // TODO: Join with actual element entity if needed
            AssignedAt = element.CreatedAt
        }).ToList();
    }
}
