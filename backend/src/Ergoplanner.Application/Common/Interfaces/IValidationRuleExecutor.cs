using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Interface for executing individual validation rules against drawing data
/// </summary>
public interface IValidationRuleExecutor
{
    /// <summary>
    /// Execute a validation rule against drawing data
    /// </summary>
    /// <param name="rule">Validation rule to execute</param>
    /// <param name="drawingId">Drawing being validated</param>
    /// <param name="drawingData">Drawing data (ReactFlow JSON)</param>
    /// <param name="componentId">Optional specific component to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of violations found, empty if no violations</returns>
    Task<List<ValidationViolation>> ExecuteRuleAsync(
        ValidationRule rule,
        Guid drawingId,
        string drawingData,
        string? componentId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if executor can handle this rule
    /// </summary>
    /// <param name="rule">Validation rule</param>
    /// <returns>True if executor can handle this rule</returns>
    bool CanExecute(ValidationRule rule);
}
