using System;
using System.Collections.Generic;
using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Interfaces;

namespace Ergoplanner.Domain.Entities;

public class SymbolMetadata : BaseEntity, ISymbolMetadata
{
    public SymbolMetadata()
    {
        CustomProperties = new Dictionary<string, object>();
        Version = 1;
    }

    // Identification Properties
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
    public decimal? OperatingPressure { get; set; }
    public string? OperatingPressureUnit { get; set; }
    public decimal? OperatingTemperature { get; set; }
    public string? OperatingTemperatureUnit { get; set; }

    // Standards Compliance
    public string? ISAStandard { get; set; }
    public string? PIPStandard { get; set; }
    public string? ISOStandard { get; set; }
    public string? DINStandard { get; set; }
    public string? BSStandard { get; set; }

    // Additional Properties (stored as JSON)
    public Dictionary<string, object> CustomProperties { get; set; }

    // Relationships
    public Guid SymbolId { get; set; }
    public virtual Symbol? Symbol { get; set; }

    public Guid? ParentMetadataId { get; set; }
    public virtual SymbolMetadata? ParentMetadata { get; set; }

    public string? TemplateId { get; set; }
    public virtual ICollection<SymbolMetadata>? ChildMetadata { get; set; }

    // Audit Properties
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
    public int Version { get; set; }

    // Methods for property inheritance
    public void InheritFrom(SymbolMetadata parent)
    {
        if (parent == null) return;

        // Inherit technical specs if not set
        Size ??= parent.Size;
        Rating ??= parent.Rating;
        Material ??= parent.Material;
        Type ??= parent.Type;

        // Inherit process data if not set
        Service ??= parent.Service;
        DesignPressure ??= parent.DesignPressure;
        DesignPressureUnit ??= parent.DesignPressureUnit;
        DesignTemperature ??= parent.DesignTemperature;
        DesignTemperatureUnit ??= parent.DesignTemperatureUnit;

        // Inherit custom properties that don't exist in child
        foreach (var prop in parent.CustomProperties)
        {
            if (!CustomProperties.ContainsKey(prop.Key))
            {
                CustomProperties[prop.Key] = prop.Value;
            }
        }
    }

    public SymbolMetadata Clone()
    {
        return new SymbolMetadata
        {
            TagNumber = TagNumber,
            Name = Name,
            Description = Description,
            Category = Category,
            SubCategory = SubCategory,
            Size = Size,
            Rating = Rating,
            Material = Material,
            Type = Type,
            Model = Model,
            Manufacturer = Manufacturer,
            Service = Service,
            DesignPressure = DesignPressure,
            DesignPressureUnit = DesignPressureUnit,
            DesignTemperature = DesignTemperature,
            DesignTemperatureUnit = DesignTemperatureUnit,
            FlowRate = FlowRate,
            FlowRateUnit = FlowRateUnit,
            OperatingPressure = OperatingPressure,
            OperatingPressureUnit = OperatingPressureUnit,
            OperatingTemperature = OperatingTemperature,
            OperatingTemperatureUnit = OperatingTemperatureUnit,
            ISAStandard = ISAStandard,
            PIPStandard = PIPStandard,
            ISOStandard = ISOStandard,
            DINStandard = DINStandard,
            BSStandard = BSStandard,
            CustomProperties = new Dictionary<string, object>(CustomProperties),
            TemplateId = TemplateId,
            Version = 1
        };
    }
}