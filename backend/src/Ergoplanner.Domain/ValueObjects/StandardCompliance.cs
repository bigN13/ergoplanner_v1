namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Value object representing compliance with various engineering standards
/// </summary>
public class StandardCompliance : IEquatable<StandardCompliance>
{
    /// <summary>
    /// Primary standard this symbol complies with (ISA-5.1, PIP, ISO-14617, etc.)
    /// </summary>
    public string PrimaryStandard { get; }

    /// <summary>
    /// Version of the primary standard
    /// </summary>
    public string StandardVersion { get; }

    /// <summary>
    /// Additional standards this symbol is compatible with
    /// </summary>
    public List<string> CompatibleStandards { get; }

    /// <summary>
    /// Specific compliance notes or deviations
    /// </summary>
    public string? ComplianceNotes { get; }

    /// <summary>
    /// Whether this symbol is certified for the standard
    /// </summary>
    public bool IsCertified { get; }

    /// <summary>
    /// Certification body or authority
    /// </summary>
    public string? CertificationBody { get; }

    /// <summary>
    /// Date when compliance was verified
    /// </summary>
    public DateTime? ComplianceDate { get; }

    /// <summary>
    /// Expiration date for compliance (if applicable)
    /// </summary>
    public DateTime? ExpirationDate { get; }

    /// <summary>
    /// Industry sectors this standard applies to
    /// </summary>
    public List<string> ApplicableSectors { get; }

    /// <summary>
    /// Geographic regions where this standard is recognized
    /// </summary>
    public List<string> GeographicScope { get; }

    /// <summary>
    /// Creates a new StandardCompliance instance
    /// </summary>
    public StandardCompliance(
        string primaryStandard,
        string standardVersion,
        List<string>? compatibleStandards = null,
        string? complianceNotes = null,
        bool isCertified = false,
        string? certificationBody = null,
        DateTime? complianceDate = null,
        DateTime? expirationDate = null,
        List<string>? applicableSectors = null,
        List<string>? geographicScope = null)
    {
        ValidateParameters(primaryStandard, standardVersion, complianceDate, expirationDate);

        PrimaryStandard = primaryStandard;
        StandardVersion = standardVersion;
        CompatibleStandards = compatibleStandards ?? new List<string>();
        ComplianceNotes = complianceNotes;
        IsCertified = isCertified;
        CertificationBody = certificationBody;
        ComplianceDate = complianceDate;
        ExpirationDate = expirationDate;
        ApplicableSectors = applicableSectors ?? new List<string>();
        GeographicScope = geographicScope ?? GetDefaultGeographicScope(primaryStandard);
    }

    /// <summary>
    /// Check if the standard compliance is currently valid
    /// </summary>
    public bool IsValid()
    {
        if (!ExpirationDate.HasValue)
            return true;

        return DateTime.UtcNow <= ExpirationDate.Value;
    }

    /// <summary>
    /// Check if compliance expires within the specified number of days
    /// </summary>
    public bool ExpiresWithin(int days)
    {
        if (!ExpirationDate.HasValue)
            return false;

        return DateTime.UtcNow.AddDays(days) >= ExpirationDate.Value;
    }

    /// <summary>
    /// Check if this symbol is compatible with another standard
    /// </summary>
    public bool IsCompatibleWith(string standard)
    {
        if (string.IsNullOrWhiteSpace(standard))
            return false;

        return PrimaryStandard.Equals(standard, StringComparison.OrdinalIgnoreCase) ||
               CompatibleStandards.Any(s => s.Equals(standard, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Check if this symbol applies to a specific industry sector
    /// </summary>
    public bool AppliesTo(string sector)
    {
        if (string.IsNullOrWhiteSpace(sector))
            return false;

        if (!ApplicableSectors.Any())
            return true; // No specific sectors means universal applicability

        return ApplicableSectors.Any(s => s.Equals(sector, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Check if this standard is recognized in a specific geographic region
    /// </summary>
    public bool IsRecognizedIn(string region)
    {
        if (string.IsNullOrWhiteSpace(region))
            return false;

        return GeographicScope.Any(r => r.Equals(region, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Get the number of days until expiration (null if no expiration)
    /// </summary>
    public int? DaysUntilExpiration()
    {
        if (!ExpirationDate.HasValue)
            return null;

        var timeSpan = ExpirationDate.Value - DateTime.UtcNow;
        return Math.Max(0, (int)timeSpan.TotalDays);
    }

    /// <summary>
    /// Create a copy with updated certification status
    /// </summary>
    public StandardCompliance WithCertification(
        bool isCertified,
        string? certificationBody = null,
        DateTime? complianceDate = null,
        DateTime? expirationDate = null)
    {
        return new StandardCompliance(
            PrimaryStandard,
            StandardVersion,
            CompatibleStandards,
            ComplianceNotes,
            isCertified,
            certificationBody,
            complianceDate,
            expirationDate,
            ApplicableSectors,
            GeographicScope);
    }

    /// <summary>
    /// Create a copy with additional compatible standards
    /// </summary>
    public StandardCompliance WithAdditionalStandards(params string[] additionalStandards)
    {
        var allCompatible = new List<string>(CompatibleStandards);
        allCompatible.AddRange(additionalStandards.Where(s => !string.IsNullOrWhiteSpace(s)));

        return new StandardCompliance(
            PrimaryStandard,
            StandardVersion,
            allCompatible,
            ComplianceNotes,
            IsCertified,
            CertificationBody,
            ComplianceDate,
            ExpirationDate,
            ApplicableSectors,
            GeographicScope);
    }

    /// <summary>
    /// Create a copy with updated notes
    /// </summary>
    public StandardCompliance WithNotes(string notes)
    {
        return new StandardCompliance(
            PrimaryStandard,
            StandardVersion,
            CompatibleStandards,
            notes,
            IsCertified,
            CertificationBody,
            ComplianceDate,
            ExpirationDate,
            ApplicableSectors,
            GeographicScope);
    }

    /// <summary>
    /// Get all standards (primary + compatible) this symbol complies with
    /// </summary>
    public List<string> GetAllStandards()
    {
        var allStandards = new List<string> { PrimaryStandard };
        allStandards.AddRange(CompatibleStandards);
        return allStandards.Distinct().ToList();
    }

    /// <summary>
    /// Get standard compliance level description
    /// </summary>
    public string GetComplianceLevel()
    {
        if (!IsValid())
            return "Expired";

        if (IsCertified)
            return "Certified";

        if (ComplianceDate.HasValue)
            return "Verified";

        return "Declared";
    }

    /// <summary>
    /// Create ISA-5.1 compliant standard
    /// </summary>
    public static StandardCompliance CreateISACompliant(string version = "2009")
    {
        return new StandardCompliance(
            "ISA-5.1",
            version,
            compatibleStandards: new List<string> { "ISA-5.4", "ISA-5.5" },
            applicableSectors: new List<string>
            {
                "Chemical Processing",
                "Oil & Gas",
                "Petrochemical",
                "Power Generation",
                "Water Treatment"
            },
            geographicScope: new List<string> { "Global" });
    }

    /// <summary>
    /// Create PIP compliant standard
    /// </summary>
    public static StandardCompliance CreatePIPCompliant(string specification)
    {
        return new StandardCompliance(
            "PIP",
            specification,
            applicableSectors: new List<string>
            {
                "Chemical Processing",
                "Petrochemical",
                "Refining"
            },
            geographicScope: new List<string> { "North America", "Global" });
    }

    /// <summary>
    /// Create ISO 14617 compliant standard
    /// </summary>
    public static StandardCompliance CreateISOCompliant(string part = "Part 6")
    {
        return new StandardCompliance(
            "ISO-14617",
            part,
            compatibleStandards: new List<string> { "ISO-10628", "ISO-5807" },
            geographicScope: new List<string> { "Global" });
    }

    /// <summary>
    /// Create UK water industry compliant standard
    /// </summary>
    public static StandardCompliance CreateUKWaterCompliant(string waterCompany)
    {
        return new StandardCompliance(
            $"UK-Water-{waterCompany}",
            "Current",
            compatibleStandards: new List<string> { "BS-1553", "BS-2917" },
            applicableSectors: new List<string> { "Water Treatment", "Water Distribution" },
            geographicScope: new List<string> { "United Kingdom" });
    }

    public bool Equals(StandardCompliance? other)
    {
        if (other == null) return false;
        if (ReferenceEquals(this, other)) return true;

        return PrimaryStandard == other.PrimaryStandard &&
               StandardVersion == other.StandardVersion &&
               IsCertified == other.IsCertified &&
               ComplianceDate == other.ComplianceDate &&
               ExpirationDate == other.ExpirationDate;
    }

    public override bool Equals(object? obj)
    {
        return Equals(obj as StandardCompliance);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(PrimaryStandard, StandardVersion, IsCertified, ComplianceDate);
    }

    public override string ToString()
    {
        var status = GetComplianceLevel();
        var expiry = ExpirationDate.HasValue ? $" (expires {ExpirationDate.Value:yyyy-MM-dd})" : "";
        return $"{PrimaryStandard} {StandardVersion} - {status}{expiry}";
    }

    public static bool operator ==(StandardCompliance? left, StandardCompliance? right)
    {
        return EqualityComparer<StandardCompliance>.Default.Equals(left, right);
    }

    public static bool operator !=(StandardCompliance? left, StandardCompliance? right)
    {
        return !(left == right);
    }

    private static void ValidateParameters(
        string primaryStandard,
        string standardVersion,
        DateTime? complianceDate,
        DateTime? expirationDate)
    {
        if (string.IsNullOrWhiteSpace(primaryStandard))
            throw new ArgumentException("Primary standard cannot be null or empty", nameof(primaryStandard));

        if (string.IsNullOrWhiteSpace(standardVersion))
            throw new ArgumentException("Standard version cannot be null or empty", nameof(standardVersion));

        if (complianceDate.HasValue && expirationDate.HasValue &&
            complianceDate.Value > expirationDate.Value)
            throw new ArgumentException("Compliance date cannot be after expiration date");
    }

    private static List<string> GetDefaultGeographicScope(string standard)
    {
        return standard.ToUpper() switch
        {
            "ISA-5.1" or "ISA-5.4" or "ISA-5.5" => new List<string> { "Global" },
            "PIP" => new List<string> { "North America", "Global" },
            "ISO-14617" or "ISO-10628" => new List<string> { "Global" },
            "DIN" => new List<string> { "Germany", "Europe" },
            "BS-1553" or "BS-2917" => new List<string> { "United Kingdom" },
            var s when s.StartsWith("UK-WATER") => new List<string> { "United Kingdom" },
            _ => new List<string> { "Global" }
        };
    }
}