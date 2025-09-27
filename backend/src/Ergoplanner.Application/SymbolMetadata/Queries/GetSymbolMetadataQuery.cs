using MediatR;
using Microsoft.EntityFrameworkCore;
using Ergoplanner.Application.SymbolMetadata.Commands;
using Ergoplanner.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ergoplanner.Application.SymbolMetadata.Queries;

public class GetSymbolMetadataQuery : IRequest<SymbolMetadataDto?>
{
    public Guid Id { get; set; }
}

public class GetSymbolMetadataBySymbolIdQuery : IRequest<SymbolMetadataDto?>
{
    public Guid SymbolId { get; set; }
}

public class GetSymbolMetadataQueryHandler : IRequestHandler<GetSymbolMetadataQuery, SymbolMetadataDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public GetSymbolMetadataQueryHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<SymbolMetadataDto?> Handle(GetSymbolMetadataQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"metadata:id:{request.Id}";

        return await _cacheService.GetOrCreateAsync<SymbolMetadataDto>(
            cacheKey,
            async () =>
            {
                var metadata = await _context.SymbolMetadata
                    .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

                if (metadata == null)
                    return null;

                return new SymbolMetadataDto
                {
                    Id = metadata.Id,
                    SymbolId = metadata.SymbolId,
                    TagNumber = metadata.TagNumber,
                    Name = metadata.Name,
                    Description = metadata.Description,
                    Category = metadata.Category,
                    SubCategory = metadata.SubCategory,
                    Size = metadata.Size,
                    Rating = metadata.Rating,
                    Material = metadata.Material,
                    Type = metadata.Type,
                    Service = metadata.Service,
                    DesignPressure = metadata.DesignPressure,
                    DesignPressureUnit = metadata.DesignPressureUnit,
                    DesignTemperature = metadata.DesignTemperature,
                    DesignTemperatureUnit = metadata.DesignTemperatureUnit,
                    CustomProperties = metadata.CustomProperties,
                    CreatedAt = metadata.CreatedAt,
                    CreatedBy = metadata.CreatedBy
                };
            },
            TimeSpan.FromMinutes(15),
            cancellationToken);
    }
}

public class GetSymbolMetadataBySymbolIdQueryHandler : IRequestHandler<GetSymbolMetadataBySymbolIdQuery, SymbolMetadataDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public GetSymbolMetadataBySymbolIdQueryHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<SymbolMetadataDto?> Handle(GetSymbolMetadataBySymbolIdQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"metadata:symbol:{request.SymbolId}";

        return await _cacheService.GetOrCreateAsync<SymbolMetadataDto>(
            cacheKey,
            async () =>
            {
                var metadata = await _context.SymbolMetadata
                    .FirstOrDefaultAsync(m => m.SymbolId == request.SymbolId, cancellationToken);

                if (metadata == null)
                    return null;

                return new SymbolMetadataDto
                {
                    Id = metadata.Id,
                    SymbolId = metadata.SymbolId,
                    TagNumber = metadata.TagNumber,
                    Name = metadata.Name,
                    Description = metadata.Description,
                    Category = metadata.Category,
                    SubCategory = metadata.SubCategory,
                    Size = metadata.Size,
                    Rating = metadata.Rating,
                    Material = metadata.Material,
                    Type = metadata.Type,
                    Service = metadata.Service,
                    DesignPressure = metadata.DesignPressure,
                    DesignPressureUnit = metadata.DesignPressureUnit,
                    DesignTemperature = metadata.DesignTemperature,
                    DesignTemperatureUnit = metadata.DesignTemperatureUnit,
                    CustomProperties = metadata.CustomProperties,
                    CreatedAt = metadata.CreatedAt,
                    CreatedBy = metadata.CreatedBy
                };
            },
            TimeSpan.FromMinutes(15),
            cancellationToken);
    }
}