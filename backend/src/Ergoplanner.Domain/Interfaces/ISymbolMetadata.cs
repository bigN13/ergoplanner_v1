using System;
using System.Collections.Generic;

namespace Ergoplanner.Domain.Interfaces;

public interface ISymbolMetadata
{
    // Identification Properties
    string TagNumber { get; set; }
    string Name { get; set; }
    string Description { get; set; }
    string Category { get; set; }
    string SubCategory { get; set; }

    // Technical Specifications
    string? Size { get; set; }
    string? Rating { get; set; }
    string? Material { get; set; }
    string? Type { get; set; }
    string? Model { get; set; }
    string? Manufacturer { get; set; }

    // Process Data
    string? Service { get; set; }
    decimal? DesignPressure { get; set; }
    string? DesignPressureUnit { get; set; }
    decimal? DesignTemperature { get; set; }
    string? DesignTemperatureUnit { get; set; }
    decimal? FlowRate { get; set; }
    string? FlowRateUnit { get; set; }
    decimal? OperatingPressure { get; set; }
    string? OperatingPressureUnit { get; set; }
    decimal? OperatingTemperature { get; set; }
    string? OperatingTemperatureUnit { get; set; }

    // Standards Compliance
    string? ISAStandard { get; set; }
    string? PIPStandard { get; set; }
    string? ISOStandard { get; set; }
    string? DINStandard { get; set; }
    string? BSStandard { get; set; }

    // Additional Properties (stored as JSON)
    Dictionary<string, object> CustomProperties { get; set; }

    // Relationships
    Guid SymbolId { get; set; }
    Guid? ParentMetadataId { get; set; }
    string? TemplateId { get; set; }

    // Audit Properties
    DateTime? LastModifiedAt { get; set; }
    string? LastModifiedBy { get; set; }
    int Version { get; set; }
}