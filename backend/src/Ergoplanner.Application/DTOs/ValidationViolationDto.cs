using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.DTOs;

/// <summary>
/// DTO for validation violations to be displayed in the UI
/// </summary>
public class ValidationViolationDto
{
    public Guid Id { get; set; }
    public string RuleCode { get; set; } = string.Empty;
    public string RuleName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public ValidationSeverity Severity { get; set; }
    public string? ComponentId { get; set; }
    public string? ComponentType { get; set; }
    public bool IsAcknowledged { get; set; }
    public bool IsResolved { get; set; }
    public DateTime DetectedAt { get; set; }
    public string? RemediationGuidance { get; set; }
}

/// <summary>
/// DTO for visual error indicators on the drawing canvas
/// </summary>
public class ValidationErrorIndicatorDto
{
    /// <summary>
    /// Component ID (ReactFlow node/edge ID)
    /// </summary>
    public string ComponentId { get; set; } = string.Empty;

    /// <summary>
    /// Number of violations for this component
    /// </summary>
    public int ViolationCount { get; set; }

    /// <summary>
    /// Highest severity level for this component
    /// </summary>
    public ValidationSeverity HighestSeverity { get; set; }

    /// <summary>
    /// Whether component has critical violations
    /// </summary>
    public bool HasCritical { get; set; }

    /// <summary>
    /// Whether component has errors
    /// </summary>
    public bool HasErrors { get; set; }

    /// <summary>
    /// Whether component has warnings
    /// </summary>
    public bool HasWarnings { get; set; }

    /// <summary>
    /// Summary of violations for tooltip
    /// </summary>
    public List<string> ViolationSummaries { get; set; } = new();
}

/// <summary>
/// Summary of validation results for a drawing
/// </summary>
public class ValidationSummaryDto
{
    public Guid DrawingId { get; set; }
    public DateTime LastValidatedAt { get; set; }
    public int TotalViolations { get; set; }
    public int CriticalCount { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public int InfoCount { get; set; }
    public int ResolvedCount { get; set; }
    public int AcknowledgedCount { get; set; }
    public bool IsValid { get; set; }
    public List<ValidationErrorIndicatorDto> ErrorIndicators { get; set; } = new();
}
