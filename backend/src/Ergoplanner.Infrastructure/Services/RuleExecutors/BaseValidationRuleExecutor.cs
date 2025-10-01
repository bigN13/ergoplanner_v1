using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Infrastructure.Services.RuleExecutors;

/// <summary>
/// Base class for validation rule executors
/// </summary>
public abstract class BaseValidationRuleExecutor : IValidationRuleExecutor
{
    protected abstract ValidationRuleCategory SupportedCategory { get; }

    public virtual bool CanExecute(ValidationRule rule)
    {
        return rule.Category == SupportedCategory;
    }

    public abstract Task<List<ValidationViolation>> ExecuteRuleAsync(
        ValidationRule rule,
        Guid drawingId,
        string drawingData,
        string? componentId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Helper to create a violation
    /// </summary>
    protected ValidationViolation CreateViolation(
        ValidationRule rule,
        Guid drawingId,
        string message,
        string? componentId = null,
        string? componentType = null,
        string? contextJson = null)
    {
        return new ValidationViolation(
            drawingId,
            rule.Id,
            message,
            rule.Severity,
            componentId,
            componentType,
            contextJson);
    }
}
