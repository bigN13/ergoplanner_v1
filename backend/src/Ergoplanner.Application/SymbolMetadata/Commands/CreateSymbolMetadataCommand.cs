using MediatR;
using Ergoplanner.Domain.Entities;
using System;
using System.Collections.Generic;

namespace Ergoplanner.Application.SymbolMetadata.Commands;

public class CreateSymbolMetadataCommand : IRequest<SymbolMetadataDto>
{
    public Guid SymbolId { get; set; }
    public string TagNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;

    // Technical Specifications
    public string? Size { get; set; }
    public string? Rating { get; set; }
    public string? Material { get; set; }
    public string? Type { get; set; }
    public string? Model { get; set; }
    public string? Manufacturer { get; set; }

    // Process Data
    public string? Service { get; set; }
    public decimal? DesignPressure { get; set; }
    public string? DesignPressureUnit { get; set; }
    public decimal? DesignTemperature { get; set; }
    public string? DesignTemperatureUnit { get; set; }
    public decimal? FlowRate { get; set; }
    public string? FlowRateUnit { get; set; }

    // Standards
    public string? ISAStandard { get; set; }
    public string? PIPStandard { get; set; }
    public string? ISOStandard { get; set; }

    // Additional Properties
    public Dictionary<string, object>? CustomProperties { get; set; }
    public Guid? ParentMetadataId { get; set; }
    public string? TemplateId { get; set; }
}

public class SymbolMetadataDto
{
    public Guid Id { get; set; }
    public Guid SymbolId { get; set; }
    public string TagNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public string? Size { get; set; }
    public string? Rating { get; set; }
    public string? Material { get; set; }
    public string? Type { get; set; }
    public string? Service { get; set; }
    public decimal? DesignPressure { get; set; }
    public string? DesignPressureUnit { get; set; }
    public decimal? DesignTemperature { get; set; }
    public string? DesignTemperatureUnit { get; set; }
    public Dictionary<string, object> CustomProperties { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}