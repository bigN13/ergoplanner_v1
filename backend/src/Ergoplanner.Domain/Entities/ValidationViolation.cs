using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents a validation rule violation found in a P&ID drawing
/// </summary>
public class ValidationViolation : BaseEntity
{
    /// <summary>
    /// Reference to the drawing being validated
    /// </summary>
    public Guid DrawingId { get; private set; }
    public Drawing Drawing { get; private set; } = null!;

    /// <summary>
    /// Reference to the validation rule that was violated
    /// </summary>
    public Guid ValidationRuleId { get; private set; }
    public ValidationRule ValidationRule { get; private set; } = null!;

    /// <summary>
    /// Location in drawing where violation occurred (ReactFlow node/edge ID)
    /// </summary>
    public string? ComponentId { get; private set; }

    /// <summary>
    /// Component type (e.g., "valve", "pipe", "instrument")
    /// </summary>
    public string? ComponentType { get; private set; }

    /// <summary>
    /// Formatted violation message with placeholders filled
    /// </summary>
    public string Message { get; private set; } = string.Empty;

    /// <summary>
    /// Violation severity (may differ from rule default if overridden)
    /// </summary>
    public ValidationSeverity Severity { get; private set; }

    /// <summary>
    /// Detailed context about the violation (JSON)
    /// </summary>
    public string? ContextJson { get; private set; }

    /// <summary>
    /// Whether this violation has been acknowledged by a user
    /// </summary>
    public bool IsAcknowledged { get; private set; }

    /// <summary>
    /// User who acknowledged the violation
    /// </summary>
    public string? AcknowledgedBy { get; private set; }

    /// <summary>
    /// Timestamp when violation was acknowledged
    /// </summary>
    public DateTime? AcknowledgedAt { get; private set; }

    /// <summary>
    /// Justification for accepting this violation
    /// </summary>
    public string? AcknowledgementJustification { get; private set; }

    /// <summary>
    /// Whether this violation has been resolved
    /// </summary>
    public bool IsResolved { get; private set; }

    /// <summary>
    /// Timestamp when violation was detected
    /// </summary>
    public DateTime DetectedAt { get; private set; }

    /// <summary>
    /// Timestamp when violation was resolved
    /// </summary>
    public DateTime? ResolvedAt { get; private set; }

    // Private constructor for EF Core
    private ValidationViolation() { }

    public ValidationViolation(
        Guid drawingId,
        Guid validationRuleId,
        string message,
        ValidationSeverity severity,
        string? componentId = null,
        string? componentType = null,
        string? contextJson = null)
    {
        if (drawingId == Guid.Empty)
            throw new ArgumentException("Drawing ID is required", nameof(drawingId));

        if (validationRuleId == Guid.Empty)
            throw new ArgumentException("Validation rule ID is required", nameof(validationRuleId));

        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Violation message is required", nameof(message));

        DrawingId = drawingId;
        ValidationRuleId = validationRuleId;
        Message = message;
        Severity = severity;
        ComponentId = componentId;
        ComponentType = componentType;
        ContextJson = contextJson;
        IsAcknowledged = false;
        IsResolved = false;
        DetectedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Acknowledge this violation with justification
    /// </summary>
    public void Acknowledge(string acknowledgedBy, string justification)
    {
        if (string.IsNullOrWhiteSpace(acknowledgedBy))
            throw new ArgumentException("Acknowledged by is required", nameof(acknowledgedBy));

        if (string.IsNullOrWhiteSpace(justification))
            throw new ArgumentException("Justification is required", nameof(justification));

        IsAcknowledged = true;
        AcknowledgedBy = acknowledgedBy;
        AcknowledgedAt = DateTime.UtcNow;
        AcknowledgementJustification = justification;
        UpdateModificationInfo(acknowledgedBy);
    }

    /// <summary>
    /// Mark violation as resolved
    /// </summary>
    public void Resolve(string resolvedBy)
    {
        if (string.IsNullOrWhiteSpace(resolvedBy))
            throw new ArgumentException("Resolved by is required", nameof(resolvedBy));

        IsResolved = true;
        ResolvedAt = DateTime.UtcNow;
        UpdateModificationInfo(resolvedBy);
    }

    /// <summary>
    /// Reopen a resolved violation
    /// </summary>
    public void Reopen(string reopenedBy)
    {
        if (string.IsNullOrWhiteSpace(reopenedBy))
            throw new ArgumentException("Reopened by is required", nameof(reopenedBy));

        IsResolved = false;
        ResolvedAt = null;
        IsAcknowledged = false;
        AcknowledgedBy = null;
        AcknowledgedAt = null;
        AcknowledgementJustification = null;
        UpdateModificationInfo(reopenedBy);
    }
}
