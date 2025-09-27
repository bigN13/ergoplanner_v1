using MediatR;
using Microsoft.EntityFrameworkCore;
using Ergoplanner.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ergoplanner.Application.SymbolMetadata.Commands;

public class UpdateSymbolMetadataCommand : IRequest<SymbolMetadataDto?>
{
    public Guid Id { get; set; }
    public string TagNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Size { get; set; }
    public string? Rating { get; set; }
    public string? Material { get; set; }
    public string? Type { get; set; }
    public string? Service { get; set; }
    public decimal? DesignPressure { get; set; }
    public string? DesignPressureUnit { get; set; }
    public decimal? DesignTemperature { get; set; }
    public string? DesignTemperatureUnit { get; set; }
    public Dictionary<string, object>? CustomProperties { get; set; }
}

public class DeleteSymbolMetadataCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class ApplyTemplateCommand : IRequest<SymbolMetadataDto?>
{
    public Guid MetadataId { get; set; }
    public string TemplateId { get; set; } = string.Empty;
}

public class UpdateSymbolMetadataCommandHandler : IRequestHandler<UpdateSymbolMetadataCommand, SymbolMetadataDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public UpdateSymbolMetadataCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<SymbolMetadataDto?> Handle(UpdateSymbolMetadataCommand request, CancellationToken cancellationToken)
    {
        var metadata = await _context.SymbolMetadata
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (metadata == null)
            return null;

        // Update properties
        metadata.TagNumber = request.TagNumber;
        metadata.Name = request.Name;
        metadata.Description = request.Description;
        metadata.Size = request.Size;
        metadata.Rating = request.Rating;
        metadata.Material = request.Material;
        metadata.Type = request.Type;
        metadata.Service = request.Service;
        metadata.DesignPressure = request.DesignPressure;
        metadata.DesignPressureUnit = request.DesignPressureUnit;
        metadata.DesignTemperature = request.DesignTemperature;
        metadata.DesignTemperatureUnit = request.DesignTemperatureUnit;

        if (request.CustomProperties != null)
        {
            metadata.CustomProperties = request.CustomProperties;
        }

        metadata.LastModifiedAt = DateTime.UtcNow;
        metadata.Version++;

        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate cache
        await _cacheService.RemoveAsync($"metadata:id:{metadata.Id}", cancellationToken);
        await _cacheService.RemoveAsync($"metadata:symbol:{metadata.SymbolId}", cancellationToken);

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

public class DeleteSymbolMetadataCommandHandler : IRequestHandler<DeleteSymbolMetadataCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public DeleteSymbolMetadataCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<bool> Handle(DeleteSymbolMetadataCommand request, CancellationToken cancellationToken)
    {
        var metadata = await _context.SymbolMetadata
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (metadata == null)
            return false;

        _context.SymbolMetadata.Remove(metadata);
        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate cache
        await _cacheService.RemoveAsync($"metadata:id:{metadata.Id}", cancellationToken);
        await _cacheService.RemoveAsync($"metadata:symbol:{metadata.SymbolId}", cancellationToken);

        return true;
    }
}

public class ApplyTemplateCommandHandler : IRequestHandler<ApplyTemplateCommand, SymbolMetadataDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public ApplyTemplateCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<SymbolMetadataDto?> Handle(ApplyTemplateCommand request, CancellationToken cancellationToken)
    {
        var metadata = await _context.SymbolMetadata
            .FirstOrDefaultAsync(m => m.Id == request.MetadataId, cancellationToken);

        if (metadata == null)
            return null;

        // Get template
        var template = await _context.PropertyTemplates
            .FirstOrDefaultAsync(t => t.Name == request.TemplateId && t.IsActive, cancellationToken);

        if (template == null)
        {
            throw new ArgumentException($"Template '{request.TemplateId}' not found");
        }

        // Apply default values from template
        foreach (var defaultValue in template.DefaultValues)
        {
            if (!metadata.CustomProperties.ContainsKey(defaultValue.Key))
            {
                metadata.CustomProperties[defaultValue.Key] = defaultValue.Value;
            }
        }

        metadata.TemplateId = request.TemplateId;
        metadata.LastModifiedAt = DateTime.UtcNow;
        metadata.Version++;

        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate cache
        await _cacheService.RemoveAsync($"metadata:id:{metadata.Id}", cancellationToken);
        await _cacheService.RemoveAsync($"metadata:symbol:{metadata.SymbolId}", cancellationToken);

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