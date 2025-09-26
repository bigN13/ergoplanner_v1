using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Value object representing properties specific to UK water company symbols
/// Contains metadata and rendering information for water industry standards
/// </summary>
public class WaterCompanySymbolProperties : IEquatable<WaterCompanySymbolProperties>
{
    /// <summary>
    /// Water company standard this symbol conforms to
    /// </summary>
    public WaterCompanyStandard Standard { get; }

    /// <summary>
    /// Symbol category within water industry context
    /// </summary>
    public WaterSymbolCategory Category { get; }

    /// <summary>
    /// Company-specific symbol code (e.g., "TW-P-001" for Thames Water Pump 001)
    /// </summary>
    public string CompanyCode { get; }

    /// <summary>
    /// Symbol revision/version according to company standard
    /// </summary>
    public string StandardRevision { get; }

    /// <summary>
    /// Typical process application (e.g., "Raw Water Intake", "Final Effluent")
    /// </summary>
    public string? ProcessApplication { get; }

    /// <summary>
    /// Design flow range (m³/h) if applicable
    /// </summary>
    public double? MinFlowRate { get; }
    public double? MaxFlowRate { get; }

    /// <summary>
    /// Pressure rating (bar) if applicable
    /// </summary>
    public double? PressureRating { get; }

    /// <summary>
    /// Material specification commonly used
    /// </summary>
    public string? MaterialSpecification { get; }

    /// <summary>
    /// Compliance notes specific to water company requirements
    /// </summary>
    public string? ComplianceNotes { get; }

    /// <summary>
    /// Whether this symbol is approved for potable water applications
    /// </summary>
    public bool IsPotableWaterApproved { get; }

    /// <summary>
    /// Whether this symbol requires WRAS approval
    /// </summary>
    public bool RequiresWRASApproval { get; }

    /// <summary>
    /// Typical installation location (e.g., "Underground", "Kiosk", "Building")
    /// </summary>
    public string? InstallationLocation { get; }

    /// <summary>
    /// Associated telemetry/SCADA tags pattern
    /// </summary>
    public string? TelemetryTagPattern { get; }

    /// <summary>
    /// Creates a new WaterCompanySymbolProperties instance
    /// </summary>
    public WaterCompanySymbolProperties(
        WaterCompanyStandard standard,
        WaterSymbolCategory category,
        string companyCode,
        string standardRevision,
        string? processApplication = null,
        double? minFlowRate = null,
        double? maxFlowRate = null,
        double? pressureRating = null,
        string? materialSpecification = null,
        string? complianceNotes = null,
        bool isPotableWaterApproved = false,
        bool requiresWRASApproval = false,
        string? installationLocation = null,
        string? telemetryTagPattern = null)
    {
        if (string.IsNullOrWhiteSpace(companyCode))
            throw new ArgumentException("Company code is required", nameof(companyCode));

        if (string.IsNullOrWhiteSpace(standardRevision))
            throw new ArgumentException("Standard revision is required", nameof(standardRevision));

        if (minFlowRate.HasValue && maxFlowRate.HasValue && minFlowRate > maxFlowRate)
            throw new ArgumentException("Minimum flow rate cannot be greater than maximum flow rate");

        Standard = standard;
        Category = category;
        CompanyCode = companyCode;
        StandardRevision = standardRevision;
        ProcessApplication = processApplication;
        MinFlowRate = minFlowRate;
        MaxFlowRate = maxFlowRate;
        PressureRating = pressureRating;
        MaterialSpecification = materialSpecification;
        ComplianceNotes = complianceNotes;
        IsPotableWaterApproved = isPotableWaterApproved;
        RequiresWRASApproval = requiresWRASApproval;
        InstallationLocation = installationLocation;
        TelemetryTagPattern = telemetryTagPattern;
    }

    /// <summary>
    /// Factory method for Thames Water symbols
    /// </summary>
    public static WaterCompanySymbolProperties CreateThamesWaterSymbol(
        WaterSymbolCategory category,
        string companyCode,
        string? processApplication = null)
    {
        return new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            category,
            $"TW-{companyCode}",
            "TW-2024-R1",
            processApplication);
    }

    /// <summary>
    /// Factory method for Severn Trent symbols
    /// </summary>
    public static WaterCompanySymbolProperties CreateSevernTrentSymbol(
        WaterSymbolCategory category,
        string companyCode,
        string? processApplication = null)
    {
        return new WaterCompanySymbolProperties(
            WaterCompanyStandard.SevernTrent,
            category,
            $"ST-{companyCode}",
            "STW-2024-V2",
            processApplication);
    }

    /// <summary>
    /// Factory method for Welsh Water symbols
    /// </summary>
    public static WaterCompanySymbolProperties CreateWelshWaterSymbol(
        WaterSymbolCategory category,
        string companyCode,
        string? processApplication = null)
    {
        return new WaterCompanySymbolProperties(
            WaterCompanyStandard.WelshWater,
            category,
            $"DCWW-{companyCode}",
            "DCWW-2024",
            processApplication);
    }

    /// <summary>
    /// Factory method for United Utilities symbols
    /// </summary>
    public static WaterCompanySymbolProperties CreateUnitedUtilitiesSymbol(
        WaterSymbolCategory category,
        string companyCode,
        string? processApplication = null)
    {
        return new WaterCompanySymbolProperties(
            WaterCompanyStandard.UnitedUtilities,
            category,
            $"UU-{companyCode}",
            "UU-STD-2024",
            processApplication);
    }

    /// <summary>
    /// Factory method for Northumbrian Water symbols
    /// </summary>
    public static WaterCompanySymbolProperties CreateNorthumbrianWaterSymbol(
        WaterSymbolCategory category,
        string companyCode,
        string? processApplication = null)
    {
        return new WaterCompanySymbolProperties(
            WaterCompanyStandard.NorthumbrianWater,
            category,
            $"NW-{companyCode}",
            "NWL-2024",
            processApplication);
    }

    /// <summary>
    /// Check if this symbol is compatible with another water company standard
    /// </summary>
    public bool IsCompatibleWith(WaterCompanyStandard targetStandard)
    {
        // Generic symbols are compatible with all standards
        if (Standard == WaterCompanyStandard.Generic || targetStandard == WaterCompanyStandard.Generic)
            return true;

        // Same standard is always compatible
        if (Standard == targetStandard)
            return true;

        // Define compatibility groups (companies that share similar standards)
        var compatibilityGroups = new List<List<WaterCompanyStandard>>
        {
            new() { WaterCompanyStandard.ThamesWater, WaterCompanyStandard.SouthernWater },
            new() { WaterCompanyStandard.SevernTrent, WaterCompanyStandard.UnitedUtilities },
            new() { WaterCompanyStandard.WelshWater, WaterCompanyStandard.ScottishWater }
        };

        return compatibilityGroups.Any(group => group.Contains(Standard) && group.Contains(targetStandard));
    }

    /// <summary>
    /// Get display name for the water company standard
    /// </summary>
    public string GetStandardDisplayName()
    {
        return Standard switch
        {
            WaterCompanyStandard.ThamesWater => "Thames Water",
            WaterCompanyStandard.SevernTrent => "Severn Trent Water",
            WaterCompanyStandard.WelshWater => "Dŵr Cymru Welsh Water",
            WaterCompanyStandard.UnitedUtilities => "United Utilities",
            WaterCompanyStandard.NorthumbrianWater => "Northumbrian Water",
            WaterCompanyStandard.AnglianWater => "Anglian Water",
            WaterCompanyStandard.YorkshireWater => "Yorkshire Water",
            WaterCompanyStandard.SouthWestWater => "South West Water",
            WaterCompanyStandard.SouthernWater => "Southern Water",
            WaterCompanyStandard.WessexWater => "Wessex Water",
            WaterCompanyStandard.ScottishWater => "Scottish Water",
            WaterCompanyStandard.NorthernIrelandWater => "Northern Ireland Water",
            _ => "Generic"
        };
    }

    public bool Equals(WaterCompanySymbolProperties? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;

        return Standard == other.Standard &&
               Category == other.Category &&
               CompanyCode == other.CompanyCode &&
               StandardRevision == other.StandardRevision;
    }

    public override bool Equals(object? obj) => Equals(obj as WaterCompanySymbolProperties);

    public override int GetHashCode() => HashCode.Combine(Standard, Category, CompanyCode, StandardRevision);
}