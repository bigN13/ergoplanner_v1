using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a water industry specific symbol conforming to UK water company standards
/// Extends the base Symbol class with water industry specific properties
/// </summary>
public class WaterCompanySymbol : BaseEntity
{
    /// <summary>
    /// Base symbol this water company symbol is based on
    /// </summary>
    public Symbol? BaseSymbol { get; private set; }

    /// <summary>
    /// Foreign key to the base symbol
    /// </summary>
    public Guid BaseSymbolId { get; private set; }

    /// <summary>
    /// Water company specific properties
    /// </summary>
    public WaterCompanySymbolProperties Properties { get; private set; }

    /// <summary>
    /// Alternative symbol mappings for conversion between standards
    /// Key: Target WaterCompanyStandard, Value: Alternative symbol ID
    /// </summary>
    public Dictionary<WaterCompanyStandard, Guid> StandardMappings { get; private set; }

    /// <summary>
    /// Compliance certifications for this symbol
    /// </summary>
    public List<WaterComplianceCertification> Certifications { get; private set; }

    /// <summary>
    /// Associated documentation references (drawings, specs, etc.)
    /// </summary>
    public List<string> DocumentationReferences { get; private set; }

    /// <summary>
    /// Typical equipment specifications for this symbol type
    /// </summary>
    public EquipmentSpecification? TypicalSpecification { get; private set; }

    /// <summary>
    /// Symbol usage restrictions or special requirements
    /// </summary>
    public string? UsageRestrictions { get; private set; }

    /// <summary>
    /// Date this symbol standard was last validated
    /// </summary>
    public DateTime? LastValidatedDate { get; private set; }

    /// <summary>
    /// Person/team who validated the symbol
    /// </summary>
    public string? ValidatedBy { get; private set; }

    /// <summary>
    /// Whether this symbol is currently active in the standard
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Whether this symbol has been superseded by a newer version
    /// </summary>
    public bool IsSuperseded { get; private set; }

    /// <summary>
    /// ID of the symbol that supersedes this one (if applicable)
    /// </summary>
    public Guid? SupersededById { get; private set; }

    /// <summary>
    /// Notes about changes from previous versions
    /// </summary>
    public string? ChangeNotes { get; private set; }

    // Private constructor for EF Core
    private WaterCompanySymbol()
    {
        BaseSymbol = null!; // Will be set by EF Core
        Properties = null!; // Will be set by EF Core
        StandardMappings = new Dictionary<WaterCompanyStandard, Guid>();
        Certifications = new List<WaterComplianceCertification>();
        DocumentationReferences = new List<string>();
        IsActive = true;
    }

    /// <summary>
    /// Creates a new WaterCompanySymbol instance
    /// </summary>
    public WaterCompanySymbol(
        Guid baseSymbolId,
        WaterCompanySymbolProperties properties,
        string? usageRestrictions = null) : base()
    {
        if (baseSymbolId == Guid.Empty)
            throw new ArgumentException("Base symbol ID cannot be empty", nameof(baseSymbolId));

        BaseSymbolId = baseSymbolId;
        Properties = properties ?? throw new ArgumentNullException(nameof(properties));
        StandardMappings = new Dictionary<WaterCompanyStandard, Guid>();
        Certifications = new List<WaterComplianceCertification>();
        DocumentationReferences = new List<string>();
        UsageRestrictions = usageRestrictions;
        IsActive = true;
        IsSuperseded = false;
    }

    /// <summary>
    /// Add a mapping to an equivalent symbol in another water company standard
    /// </summary>
    public void AddStandardMapping(WaterCompanyStandard targetStandard, Guid targetSymbolId, string modifiedBy)
    {
        if (targetStandard == Properties.Standard)
            throw new ArgumentException("Cannot map to the same standard");

        if (targetSymbolId == Guid.Empty)
            throw new ArgumentException("Target symbol ID cannot be empty");

        StandardMappings[targetStandard] = targetSymbolId;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Add a compliance certification
    /// </summary>
    public void AddCertification(WaterComplianceCertification certification, string modifiedBy)
    {
        if (certification == null)
            throw new ArgumentNullException(nameof(certification));

        if (Certifications.Any(c => c.CertificationType == certification.CertificationType))
            throw new InvalidOperationException($"Certification of type {certification.CertificationType} already exists");

        Certifications.Add(certification);
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update equipment specification
    /// </summary>
    public void UpdateTypicalSpecification(EquipmentSpecification specification, string modifiedBy)
    {
        TypicalSpecification = specification ?? throw new ArgumentNullException(nameof(specification));
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Validate the symbol against water company standards
    /// </summary>
    public void ValidateSymbol(string validatedBy, string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(validatedBy))
            throw new ArgumentException("Validator information is required", nameof(validatedBy));

        LastValidatedDate = DateTime.UtcNow;
        ValidatedBy = validatedBy;

        if (!string.IsNullOrWhiteSpace(notes))
        {
            ChangeNotes = notes;
        }

        UpdateModificationInfo(validatedBy);
    }

    /// <summary>
    /// Mark this symbol as superseded by another
    /// </summary>
    public void MarkAsSuperseded(Guid newSymbolId, string changeNotes, string modifiedBy)
    {
        if (newSymbolId == Guid.Empty)
            throw new ArgumentException("New symbol ID cannot be empty", nameof(newSymbolId));

        if (newSymbolId == Id)
            throw new ArgumentException("Symbol cannot supersede itself");

        if (string.IsNullOrWhiteSpace(changeNotes))
            throw new ArgumentException("Change notes are required when superseding a symbol", nameof(changeNotes));

        IsSuperseded = true;
        SupersededById = newSymbolId;
        ChangeNotes = changeNotes;
        IsActive = false;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Deactivate the symbol
    /// </summary>
    public void Deactivate(string reason, string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason for deactivation is required", nameof(reason));

        IsActive = false;
        UsageRestrictions = $"DEACTIVATED: {reason}";
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Reactivate the symbol
    /// </summary>
    public void Reactivate(string modifiedBy)
    {
        IsActive = true;

        if (UsageRestrictions?.StartsWith("DEACTIVATED:") == true)
        {
            UsageRestrictions = null;
        }

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Add documentation reference
    /// </summary>
    public void AddDocumentationReference(string reference, string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(reference))
            throw new ArgumentException("Documentation reference cannot be empty", nameof(reference));

        if (DocumentationReferences.Contains(reference))
            return;

        DocumentationReferences.Add(reference);
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Check if this symbol can be converted to another standard
    /// </summary>
    public bool CanConvertToStandard(WaterCompanyStandard targetStandard)
    {
        // Can't convert to the same standard
        if (Properties.Standard == targetStandard)
            return false;

        // Check if direct mapping exists
        if (StandardMappings.ContainsKey(targetStandard))
            return true;

        // Check compatibility
        return Properties.IsCompatibleWith(targetStandard);
    }

    /// <summary>
    /// Get the mapped symbol ID for a target standard
    /// </summary>
    public Guid? GetMappedSymbolId(WaterCompanyStandard targetStandard)
    {
        return StandardMappings.TryGetValue(targetStandard, out var symbolId) ? symbolId : null;
    }

    /// <summary>
    /// Check if the symbol has valid certifications
    /// </summary>
    public bool HasValidCertifications()
    {
        if (!Certifications.Any())
            return false;

        return Certifications.All(c => c.IsValid());
    }

    /// <summary>
    /// Get active certifications
    /// </summary>
    public IEnumerable<WaterComplianceCertification> GetActiveCertifications()
    {
        return Certifications.Where(c => c.IsValid());
    }

    /// <summary>
    /// Check if symbol requires WRAS approval based on properties
    /// </summary>
    public bool RequiresWRASApproval()
    {
        return Properties.RequiresWRASApproval || Properties.IsPotableWaterApproved;
    }

    /// <summary>
    /// Check if symbol has WRAS certification
    /// </summary>
    public bool HasWRASCertification()
    {
        return Certifications.Any(c =>
            c.CertificationType == "WRAS" &&
            c.IsValid());
    }
}

/// <summary>
/// Represents compliance certification for water industry equipment
/// </summary>
public class WaterComplianceCertification : IEquatable<WaterComplianceCertification>
{
    /// <summary>
    /// Type of certification (e.g., "WRAS", "DWI", "ISO9001")
    /// </summary>
    public string CertificationType { get; }

    /// <summary>
    /// Certification number/reference
    /// </summary>
    public string CertificationNumber { get; }

    /// <summary>
    /// Date certification was issued
    /// </summary>
    public DateTime IssueDate { get; }

    /// <summary>
    /// Date certification expires
    /// </summary>
    public DateTime? ExpiryDate { get; }

    /// <summary>
    /// Certifying body
    /// </summary>
    public string CertifyingBody { get; }

    /// <summary>
    /// Additional certification notes
    /// </summary>
    public string? Notes { get; }

    public WaterComplianceCertification(
        string certificationType,
        string certificationNumber,
        DateTime issueDate,
        DateTime? expiryDate,
        string certifyingBody,
        string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(certificationType))
            throw new ArgumentException("Certification type is required", nameof(certificationType));

        if (string.IsNullOrWhiteSpace(certificationNumber))
            throw new ArgumentException("Certification number is required", nameof(certificationNumber));

        if (string.IsNullOrWhiteSpace(certifyingBody))
            throw new ArgumentException("Certifying body is required", nameof(certifyingBody));

        if (expiryDate.HasValue && expiryDate <= issueDate)
            throw new ArgumentException("Expiry date must be after issue date");

        CertificationType = certificationType;
        CertificationNumber = certificationNumber;
        IssueDate = issueDate;
        ExpiryDate = expiryDate;
        CertifyingBody = certifyingBody;
        Notes = notes;
    }

    /// <summary>
    /// Check if certification is currently valid
    /// </summary>
    public bool IsValid()
    {
        if (!ExpiryDate.HasValue)
            return true;

        return DateTime.UtcNow <= ExpiryDate.Value;
    }

    /// <summary>
    /// Check if certification will expire soon (within 30 days)
    /// </summary>
    public bool IsExpiringSoon()
    {
        if (!ExpiryDate.HasValue)
            return false;

        var daysUntilExpiry = (ExpiryDate.Value - DateTime.UtcNow).TotalDays;
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }

    public bool Equals(WaterComplianceCertification? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;

        return CertificationType == other.CertificationType &&
               CertificationNumber == other.CertificationNumber;
    }

    public override bool Equals(object? obj) => Equals(obj as WaterComplianceCertification);

    public override int GetHashCode() => HashCode.Combine(CertificationType, CertificationNumber);
}

/// <summary>
/// Represents typical equipment specification for water industry equipment
/// </summary>
public class EquipmentSpecification
{
    /// <summary>
    /// Equipment type/model
    /// </summary>
    public string EquipmentType { get; }

    /// <summary>
    /// Typical capacity or size
    /// </summary>
    public string? Capacity { get; }

    /// <summary>
    /// Power requirement (kW)
    /// </summary>
    public double? PowerRequirement { get; }

    /// <summary>
    /// Typical efficiency (%)
    /// </summary>
    public double? Efficiency { get; }

    /// <summary>
    /// Noise level (dB)
    /// </summary>
    public double? NoiseLevel { get; }

    /// <summary>
    /// Weight (kg)
    /// </summary>
    public double? Weight { get; }

    /// <summary>
    /// Typical service life (years)
    /// </summary>
    public int? ServiceLife { get; }

    /// <summary>
    /// Maintenance frequency (hours)
    /// </summary>
    public int? MaintenanceInterval { get; }

    public EquipmentSpecification(
        string equipmentType,
        string? capacity = null,
        double? powerRequirement = null,
        double? efficiency = null,
        double? noiseLevel = null,
        double? weight = null,
        int? serviceLife = null,
        int? maintenanceInterval = null)
    {
        if (string.IsNullOrWhiteSpace(equipmentType))
            throw new ArgumentException("Equipment type is required", nameof(equipmentType));

        EquipmentType = equipmentType;
        Capacity = capacity;
        PowerRequirement = powerRequirement;
        Efficiency = efficiency;
        NoiseLevel = noiseLevel;
        Weight = weight;
        ServiceLife = serviceLife;
        MaintenanceInterval = maintenanceInterval;
    }
}