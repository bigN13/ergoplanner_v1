namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Categories of engineering validation rules for P&ID drawings
/// </summary>
public enum ValidationRuleCategory
{
    /// <summary>
    /// Pressure rating and safety checks
    /// </summary>
    PressureRating = 1,

    /// <summary>
    /// Material compatibility validation
    /// </summary>
    MaterialCompatibility = 2,

    /// <summary>
    /// Pipe sizing and flow calculations
    /// </summary>
    PipeSizing = 3,

    /// <summary>
    /// Symbol and component placement rules
    /// </summary>
    ComponentPlacement = 4,

    /// <summary>
    /// Connection and piping rules
    /// </summary>
    ConnectionRules = 5,

    /// <summary>
    /// Instrument and control validation
    /// </summary>
    InstrumentationRules = 6,

    /// <summary>
    /// Industry standard compliance (ISA-5.1, ISO 14617)
    /// </summary>
    StandardCompliance = 7,

    /// <summary>
    /// Safety and regulatory requirements
    /// </summary>
    SafetyRules = 8,

    /// <summary>
    /// Custom project-specific rules
    /// </summary>
    CustomRules = 99
}
