using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Engineering validation engine for P&ID drawings
/// </summary>
public interface IValidationEngine
{
    /// <summary>
    /// Validate a drawing against all active rules
    /// </summary>
    /// <param name="drawingId">Drawing to validate</param>
    /// <param name="categories">Optional filter for specific rule categories</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of validation violations found</returns>
    Task<List<ValidationViolation>> ValidateDrawingAsync(
        Guid drawingId,
        IEnumerable<ValidationRuleCategory>? categories = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate a specific component in a drawing
    /// </summary>
    /// <param name="drawingId">Drawing containing the component</param>
    /// <param name="componentId">Component to validate (ReactFlow node/edge ID)</param>
    /// <param name="componentType">Type of component</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of validation violations for this component</returns>
    Task<List<ValidationViolation>> ValidateComponentAsync(
        Guid drawingId,
        string componentId,
        string componentType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all active validation rules
    /// </summary>
    /// <param name="category">Optional filter for specific category</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of active validation rules</returns>
    Task<List<ValidationRule>> GetActiveRulesAsync(
        ValidationRuleCategory? category = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validation violations for a drawing
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="includeResolved">Whether to include resolved violations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of validation violations</returns>
    Task<List<ValidationViolation>> GetViolationsAsync(
        Guid drawingId,
        bool includeResolved = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Clear all violations for a drawing (typically after re-validation)
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task ClearViolationsAsync(Guid drawingId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of an engineering validation operation
/// </summary>
public class EngineeringValidationResult
{
    public Guid DrawingId { get; set; }
    public DateTime ValidatedAt { get; set; }
    public int TotalRulesExecuted { get; set; }
    public List<ValidationViolation> Violations { get; set; } = new();
    public Dictionary<ValidationSeverity, int> ViolationsBySeverity { get; set; } = new();
    public bool HasCriticalViolations { get; set; }
    public bool HasErrors { get; set; }
    public bool HasWarnings { get; set; }
    public TimeSpan ValidationDuration { get; set; }
}
