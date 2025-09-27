using FluentValidation;
using Ergoplanner.Application.SymbolMetadata.Commands;
using System.Linq;

namespace Ergoplanner.Application.SymbolMetadata.Validators;

public class CreateSymbolMetadataCommandValidator : AbstractValidator<CreateSymbolMetadataCommand>
{
    private static readonly string[] ValidPressureUnits = { "bar", "psi", "kPa", "MPa", "atm" };
    private static readonly string[] ValidTemperatureUnits = { "°C", "°F", "K" };
    private static readonly string[] ValidFlowUnits = { "m³/h", "gpm", "L/min", "L/s", "ft³/h" };
    private static readonly string[] ValidCategories = { "Process Equipment", "Piping Components", "Instrumentation", "Electrical", "Safety" };

    public CreateSymbolMetadataCommandValidator()
    {
        RuleFor(x => x.SymbolId)
            .NotEmpty().WithMessage("Symbol ID is required");

        RuleFor(x => x.TagNumber)
            .NotEmpty().WithMessage("Tag number is required")
            .MaximumLength(100).WithMessage("Tag number must not exceed 100 characters")
            .Matches(@"^[A-Z0-9\-]+$").WithMessage("Tag number must contain only uppercase letters, numbers, and hyphens");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required")
            .Must(BeValidCategory).WithMessage($"Category must be one of: {string.Join(", ", ValidCategories)}");

        RuleFor(x => x.SubCategory)
            .NotEmpty().WithMessage("SubCategory is required")
            .MaximumLength(100).WithMessage("SubCategory must not exceed 100 characters");

        // Technical specifications validation
        RuleFor(x => x.Size)
            .MaximumLength(50).WithMessage("Size must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Size));

        RuleFor(x => x.Rating)
            .MaximumLength(50).WithMessage("Rating must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Rating));

        RuleFor(x => x.Material)
            .MaximumLength(100).WithMessage("Material must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Material));

        // Process data validation
        RuleFor(x => x.DesignPressure)
            .GreaterThanOrEqualTo(0).WithMessage("Design pressure must be non-negative")
            .When(x => x.DesignPressure.HasValue);

        RuleFor(x => x.DesignPressureUnit)
            .Must(BeValidPressureUnit).WithMessage($"Pressure unit must be one of: {string.Join(", ", ValidPressureUnits)}")
            .When(x => x.DesignPressure.HasValue);

        RuleFor(x => x.DesignTemperature)
            .InclusiveBetween(-273.15m, 5000m).WithMessage("Design temperature must be between -273.15 and 5000")
            .When(x => x.DesignTemperature.HasValue && x.DesignTemperatureUnit == "°C");

        RuleFor(x => x.DesignTemperatureUnit)
            .Must(BeValidTemperatureUnit).WithMessage($"Temperature unit must be one of: {string.Join(", ", ValidTemperatureUnits)}")
            .When(x => x.DesignTemperature.HasValue);

        RuleFor(x => x.FlowRate)
            .GreaterThanOrEqualTo(0).WithMessage("Flow rate must be non-negative")
            .When(x => x.FlowRate.HasValue);

        RuleFor(x => x.FlowRateUnit)
            .Must(BeValidFlowUnit).WithMessage($"Flow rate unit must be one of: {string.Join(", ", ValidFlowUnits)}")
            .When(x => x.FlowRate.HasValue);

        // Standards validation
        RuleFor(x => x.ISAStandard)
            .MaximumLength(100).WithMessage("ISA Standard must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.ISAStandard));

        RuleFor(x => x.PIPStandard)
            .MaximumLength(100).WithMessage("PIP Standard must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.PIPStandard));

        RuleFor(x => x.ISOStandard)
            .MaximumLength(100).WithMessage("ISO Standard must not exceed 100 characters")
            .Matches(@"^ISO\s\d+").WithMessage("ISO Standard must start with 'ISO' followed by a number")
            .When(x => !string.IsNullOrEmpty(x.ISOStandard));

        // Custom properties validation
        RuleFor(x => x.CustomProperties)
            .Must(HaveValidPropertyKeys).WithMessage("Custom property keys must be alphanumeric with underscores only")
            .When(x => x.CustomProperties != null && x.CustomProperties.Any());
    }

    private bool BeValidCategory(string category)
    {
        return ValidCategories.Contains(category);
    }

    private bool BeValidPressureUnit(string? unit)
    {
        return string.IsNullOrEmpty(unit) || ValidPressureUnits.Contains(unit);
    }

    private bool BeValidTemperatureUnit(string? unit)
    {
        return string.IsNullOrEmpty(unit) || ValidTemperatureUnits.Contains(unit);
    }

    private bool BeValidFlowUnit(string? unit)
    {
        return string.IsNullOrEmpty(unit) || ValidFlowUnits.Contains(unit);
    }

    private bool HaveValidPropertyKeys(Dictionary<string, object>? properties)
    {
        if (properties == null) return true;

        return properties.Keys.All(key =>
            !string.IsNullOrWhiteSpace(key) &&
            System.Text.RegularExpressions.Regex.IsMatch(key, @"^[a-zA-Z0-9_]+$"));
    }
}