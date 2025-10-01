using System.Diagnostics;
using Ergoplanner.Application.Common.Interfaces;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ergoplanner.Infrastructure.Services;

/// <summary>
/// Engineering validation engine for P&ID drawings
/// </summary>
public class ValidationEngine : IValidationEngine
{
    private readonly IApplicationDbContext _context;
    private readonly IEnumerable<IValidationRuleExecutor> _ruleExecutors;
    private readonly ILogger<ValidationEngine> _logger;

    public ValidationEngine(
        IApplicationDbContext context,
        IEnumerable<IValidationRuleExecutor> ruleExecutors,
        ILogger<ValidationEngine> logger)
    {
        _context = context;
        _ruleExecutors = ruleExecutors;
        _logger = logger;
    }

    public async Task<List<ValidationViolation>> ValidateDrawingAsync(
        Guid drawingId,
        IEnumerable<ValidationRuleCategory>? categories = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        _logger.LogInformation("Starting validation for drawing {DrawingId}", drawingId);

        // Get drawing with its data
        var drawing = await _context.Drawings
            .FirstOrDefaultAsync(d => d.Id == drawingId, cancellationToken);

        if (drawing == null)
        {
            _logger.LogWarning("Drawing {DrawingId} not found", drawingId);
            throw new InvalidOperationException($"Drawing {drawingId} not found");
        }

        // Get active rules
        var query = _context.ValidationRules
            .Where(r => r.IsActive)
            .OrderBy(r => r.ExecutionOrder);

        if (categories != null && categories.Any())
        {
            query = (IOrderedQueryable<ValidationRule>)query.Where(r => categories.Contains(r.Category));
        }

        var rules = await query.ToListAsync(cancellationToken);

        _logger.LogInformation("Executing {RuleCount} validation rules for drawing {DrawingId}",
            rules.Count, drawingId);

        // Execute rules
        var violations = new List<ValidationViolation>();

        // For now, we'll use empty drawing data - will be populated when ReactFlow integration is complete
        var drawingData = "{}"; // TODO: Get actual ReactFlow JSON from drawing

        foreach (var rule in rules)
        {
            try
            {
                var executor = _ruleExecutors.FirstOrDefault(e => e.CanExecute(rule));
                if (executor != null)
                {
                    var ruleViolations = await executor.ExecuteRuleAsync(
                        rule,
                        drawingId,
                        drawingData,
                        null,
                        cancellationToken);

                    violations.AddRange(ruleViolations);
                }
                else
                {
                    _logger.LogWarning("No executor found for rule {RuleCode} (Category: {Category})",
                        rule.RuleCode, rule.Category);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing validation rule {RuleCode}", rule.RuleCode);
                // Continue with other rules
            }
        }

        // Save violations to database
        if (violations.Any())
        {
            await _context.ValidationViolations.AddRangeAsync(violations, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        stopwatch.Stop();
        _logger.LogInformation(
            "Validation completed for drawing {DrawingId}. Found {ViolationCount} violations in {Duration}ms",
            drawingId, violations.Count, stopwatch.ElapsedMilliseconds);

        return violations;
    }

    public async Task<List<ValidationViolation>> ValidateComponentAsync(
        Guid drawingId,
        string componentId,
        string componentType,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Validating component {ComponentId} ({ComponentType}) in drawing {DrawingId}",
            componentId, componentType, drawingId);

        // Get drawing
        var drawing = await _context.Drawings
            .FirstOrDefaultAsync(d => d.Id == drawingId, cancellationToken);

        if (drawing == null)
        {
            throw new InvalidOperationException($"Drawing {drawingId} not found");
        }

        // Get active rules relevant to this component type
        var rules = await _context.ValidationRules
            .Where(r => r.IsActive)
            .OrderBy(r => r.ExecutionOrder)
            .ToListAsync(cancellationToken);

        var violations = new List<ValidationViolation>();
        var drawingData = "{}"; // TODO: Get actual ReactFlow JSON

        foreach (var rule in rules)
        {
            try
            {
                var executor = _ruleExecutors.FirstOrDefault(e => e.CanExecute(rule));
                if (executor != null)
                {
                    var ruleViolations = await executor.ExecuteRuleAsync(
                        rule,
                        drawingId,
                        drawingData,
                        componentId,
                        cancellationToken);

                    violations.AddRange(ruleViolations);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing validation rule {RuleCode} for component {ComponentId}",
                    rule.RuleCode, componentId);
            }
        }

        return violations;
    }

    public async Task<List<ValidationRule>> GetActiveRulesAsync(
        ValidationRuleCategory? category = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ValidationRules
            .Where(r => r.IsActive)
            .OrderBy(r => r.Category)
            .ThenBy(r => r.ExecutionOrder);

        if (category.HasValue)
        {
            query = (IOrderedQueryable<ValidationRule>)query.Where(r => r.Category == category.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<List<ValidationViolation>> GetViolationsAsync(
        Guid drawingId,
        bool includeResolved = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ValidationViolations
            .Include(v => v.ValidationRule)
            .Where(v => v.DrawingId == drawingId);

        if (!includeResolved)
        {
            query = query.Where(v => !v.IsResolved);
        }

        return await query
            .OrderByDescending(v => v.Severity)
            .ThenBy(v => v.DetectedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task ClearViolationsAsync(Guid drawingId, CancellationToken cancellationToken = default)
    {
        var violations = await _context.ValidationViolations
            .Where(v => v.DrawingId == drawingId && !v.IsAcknowledged)
            .ToListAsync(cancellationToken);

        _context.ValidationViolations.RemoveRange(violations);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Cleared {Count} unacknowledged violations for drawing {DrawingId}",
            violations.Count, drawingId);
    }
}
