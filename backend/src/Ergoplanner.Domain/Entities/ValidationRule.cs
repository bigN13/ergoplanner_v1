using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents an engineering validation rule that can be applied to P&ID drawings
/// </summary>
public class ValidationRule : BaseEntity
{
    /// <summary>
    /// Rule code/identifier (e.g., "PRESS-001", "MAT-COMPAT-003")
    /// </summary>
    public string RuleCode { get; private set; } = string.Empty;

    /// <summary>
    /// Human-readable rule name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Detailed description of the rule
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Rule category
    /// </summary>
    public ValidationRuleCategory Category { get; private set; }

    /// <summary>
    /// Severity level for violations of this rule
    /// </summary>
    public ValidationSeverity Severity { get; private set; }

    /// <summary>
    /// Whether this rule is currently active
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Rule implementation logic as JSON configuration
    /// (e.g., threshold values, compatibility matrices, formulas)
    /// </summary>
    public string? ConfigurationJson { get; private set; }

    /// <summary>
    /// Reference to industry standard (e.g., "ISA-5.1 Section 3.2")
    /// </summary>
    public string? StandardReference { get; private set; }

    /// <summary>
    /// Error message template for violations
    /// Can include placeholders like {component}, {value}, {expected}
    /// </summary>
    public string ViolationMessageTemplate { get; private set; } = string.Empty;

    /// <summary>
    /// Suggested remediation action
    /// </summary>
    public string? RemediationGuidance { get; private set; }

    /// <summary>
    /// Rule execution order (lower numbers execute first)
    /// </summary>
    public int ExecutionOrder { get; private set; }

    // Private constructor for EF Core
    private ValidationRule() { }

    public ValidationRule(
        string ruleCode,
        string name,
        string description,
        ValidationRuleCategory category,
        ValidationSeverity severity,
        string violationMessageTemplate,
        int executionOrder = 100,
        string? configurationJson = null,
        string? standardReference = null,
        string? remediationGuidance = null)
    {
        if (string.IsNullOrWhiteSpace(ruleCode))
            throw new ArgumentException("Rule code is required", nameof(ruleCode));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Rule name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(violationMessageTemplate))
            throw new ArgumentException("Violation message template is required", nameof(violationMessageTemplate));

        RuleCode = ruleCode;
        Name = name;
        Description = description;
        Category = category;
        Severity = severity;
        ViolationMessageTemplate = violationMessageTemplate;
        ExecutionOrder = executionOrder;
        ConfigurationJson = configurationJson;
        StandardReference = standardReference;
        RemediationGuidance = remediationGuidance;
        IsActive = true;
    }

    /// <summary>
    /// Update rule details
    /// </summary>
    public void Update(
        string name,
        string description,
        ValidationSeverity severity,
        string violationMessageTemplate,
        string? remediationGuidance,
        string modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Rule name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(violationMessageTemplate))
            throw new ArgumentException("Violation message template is required", nameof(violationMessageTemplate));

        Name = name;
        Description = description;
        Severity = severity;
        ViolationMessageTemplate = violationMessageTemplate;
        RemediationGuidance = remediationGuidance;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update rule configuration
    /// </summary>
    public void UpdateConfiguration(string? configurationJson, string modifiedBy)
    {
        ConfigurationJson = configurationJson;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Update execution order
    /// </summary>
    public void UpdateExecutionOrder(int executionOrder, string modifiedBy)
    {
        ExecutionOrder = executionOrder;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Activate the rule
    /// </summary>
    public void Activate(string modifiedBy)
    {
        IsActive = true;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Deactivate the rule
    /// </summary>
    public void Deactivate(string modifiedBy)
    {
        IsActive = false;
        UpdateModificationInfo(modifiedBy);
    }
}
