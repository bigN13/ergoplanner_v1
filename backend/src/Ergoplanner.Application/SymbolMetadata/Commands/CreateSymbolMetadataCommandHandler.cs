using MediatR;
using Microsoft.EntityFrameworkCore;
using Ergoplanner.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Ergoplanner.Application.SymbolMetadata.Commands;

public class CreateSymbolMetadataCommandHandler : IRequestHandler<CreateSymbolMetadataCommand, SymbolMetadataDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateSymbolMetadataCommandHandler> _logger;

    public CreateSymbolMetadataCommandHandler(
        IApplicationDbContext context,
        ILogger<CreateSymbolMetadataCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SymbolMetadataDto> Handle(CreateSymbolMetadataCommand request, CancellationToken cancellationToken)
    {
        // Check if symbol exists
        var symbolExists = await _context.Symbols
            .AnyAsync(s => s.Id == request.SymbolId, cancellationToken);

        if (!symbolExists)
        {
            throw new ArgumentException($"Symbol with ID {request.SymbolId} not found");
        }

        var metadata = new Domain.Entities.SymbolMetadata
        {
            SymbolId = request.SymbolId,
            TagNumber = request.TagNumber,
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            SubCategory = request.SubCategory,
            Size = request.Size,
            Rating = request.Rating,
            Material = request.Material,
            Type = request.Type,
            Model = request.Model,
            Manufacturer = request.Manufacturer,
            Service = request.Service,
            DesignPressure = request.DesignPressure,
            DesignPressureUnit = request.DesignPressureUnit,
            DesignTemperature = request.DesignTemperature,
            DesignTemperatureUnit = request.DesignTemperatureUnit,
            FlowRate = request.FlowRate,
            FlowRateUnit = request.FlowRateUnit,
            ISAStandard = request.ISAStandard,
            PIPStandard = request.PIPStandard,
            ISOStandard = request.ISOStandard,
            CustomProperties = request.CustomProperties ?? new Dictionary<string, object>(),
            ParentMetadataId = request.ParentMetadataId,
            TemplateId = request.TemplateId
        };

        // Handle property inheritance if parent is specified
        if (request.ParentMetadataId.HasValue)
        {
            var parentMetadata = await _context.SymbolMetadata
                .FirstOrDefaultAsync(m => m.Id == request.ParentMetadataId.Value, cancellationToken);

            if (parentMetadata != null)
            {
                metadata.InheritFrom(parentMetadata);
            }
        }

        _context.SymbolMetadata.Add(metadata);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created symbol metadata {MetadataId} for symbol {SymbolId}",
            metadata.Id, metadata.SymbolId);

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
    }
}