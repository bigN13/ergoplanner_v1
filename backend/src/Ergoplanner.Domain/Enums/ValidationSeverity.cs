namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Severity levels for validation rule violations
/// </summary>
public enum ValidationSeverity
{
    /// <summary>
    /// Informational message, does not block design
    /// </summary>
    Info = 1,

    /// <summary>
    /// Warning that should be reviewed but can be accepted
    /// </summary>
    Warning = 2,

    /// <summary>
    /// Error that must be fixed before proceeding
    /// </summary>
    Error = 3,

    /// <summary>
    /// Critical safety or regulatory violation
    /// </summary>
    Critical = 4
}
