using System;
using System.Collections.Generic;
using Ergoplanner.Domain.Common;

namespace Ergoplanner.Domain.Entities;

public class PropertyTemplate : BaseEntity
{
    public PropertyTemplate()
    {
        RequiredProperties = new List<string>();
        OptionalProperties = new List<string>();
        DefaultValues = new Dictionary<string, object>();
        ValidationRules = new Dictionary<string, string>();
    }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string EquipmentType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    // Property definitions
    public List<string> RequiredProperties { get; set; }
    public List<string> OptionalProperties { get; set; }
    public Dictionary<string, object> DefaultValues { get; set; }
    public Dictionary<string, string> ValidationRules { get; set; }

    // Relationships
    public virtual ICollection<SymbolMetadata>? SymbolMetadata { get; set; }

    // Audit
    public bool IsActive { get; set; } = true;

    // Predefined templates for common equipment
    public static class CommonTemplates
    {
        public static PropertyTemplate Pump => new()
        {
            Name = "Pump",
            Description = "Standard pump properties template",
            EquipmentType = "Pump",
            Category = "Process Equipment",
            RequiredProperties = new List<string>
            {
                "TagNumber", "Name", "Type", "Service",
                "DesignPressure", "DesignTemperature", "FlowRate"
            },
            OptionalProperties = new List<string>
            {
                "Model", "Manufacturer", "Material", "Size",
                "SuctionPressure", "DischargePressure", "NPSH",
                "Efficiency", "Power", "Speed"
            },
            DefaultValues = new Dictionary<string, object>
            {
                ["DesignPressureUnit"] = "bar",
                ["DesignTemperatureUnit"] = "°C",
                ["FlowRateUnit"] = "m³/h"
            }
        };

        public static PropertyTemplate Valve => new()
        {
            Name = "Valve",
            Description = "Standard valve properties template",
            EquipmentType = "Valve",
            Category = "Piping Components",
            RequiredProperties = new List<string>
            {
                "TagNumber", "Name", "Type", "Size", "Rating"
            },
            OptionalProperties = new List<string>
            {
                "Material", "EndConnection", "Actuator",
                "FailPosition", "Cv", "LeakageClass"
            },
            DefaultValues = new Dictionary<string, object>
            {
                ["Rating"] = "150#",
                ["Material"] = "CS"
            }
        };

        public static PropertyTemplate Tank => new()
        {
            Name = "Tank",
            Description = "Standard tank/vessel properties template",
            EquipmentType = "Tank",
            Category = "Process Equipment",
            RequiredProperties = new List<string>
            {
                "TagNumber", "Name", "Type", "Service",
                "DesignPressure", "DesignTemperature", "Volume"
            },
            OptionalProperties = new List<string>
            {
                "Material", "Diameter", "Height", "Orientation",
                "OperatingPressure", "OperatingTemperature",
                "MaxLevel", "MinLevel"
            },
            DefaultValues = new Dictionary<string, object>
            {
                ["Orientation"] = "Vertical",
                ["DesignPressureUnit"] = "bar",
                ["DesignTemperatureUnit"] = "°C",
                ["VolumeUnit"] = "m³"
            }
        };

        public static PropertyTemplate HeatExchanger => new()
        {
            Name = "Heat Exchanger",
            Description = "Standard heat exchanger properties template",
            EquipmentType = "HeatExchanger",
            Category = "Process Equipment",
            RequiredProperties = new List<string>
            {
                "TagNumber", "Name", "Type", "Service",
                "HeatDuty", "Area"
            },
            OptionalProperties = new List<string>
            {
                "ShellSidePressure", "ShellSideTemperature",
                "TubeSidePressure", "TubeSideTemperature",
                "NumberOfPasses", "Material", "TEMA"
            },
            DefaultValues = new Dictionary<string, object>
            {
                ["Type"] = "Shell & Tube",
                ["HeatDutyUnit"] = "kW",
                ["AreaUnit"] = "m²"
            }
        };

        public static PropertyTemplate Instrument => new()
        {
            Name = "Instrument",
            Description = "Standard instrument properties template",
            EquipmentType = "Instrument",
            Category = "Instrumentation",
            RequiredProperties = new List<string>
            {
                "TagNumber", "Name", "Type", "Service",
                "Range", "Units"
            },
            OptionalProperties = new List<string>
            {
                "Manufacturer", "Model", "SignalType",
                "Accuracy", "CalibrationInterval",
                "Location", "LoopNumber"
            },
            DefaultValues = new Dictionary<string, object>
            {
                ["SignalType"] = "4-20mA"
            }
        };
    }
}