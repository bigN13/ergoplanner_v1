using FluentValidation;
using Ergoplanner.Application.Layers.Commands;

namespace Ergoplanner.Application.Layers.Validators;

public class CreateLayerCommandValidator : AbstractValidator<CreateLayerCommand>
{
    public CreateLayerCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Layer code is required")
            .MaximumLength(50).WithMessage("Layer code must not exceed 50 characters")
            .Matches("^[A-Z0-9_-]+$").WithMessage("Layer code must contain only uppercase letters, numbers, underscores, and hyphens");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Layer name is required")
            .MaximumLength(200).WithMessage("Layer name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Layer description must not exceed 1000 characters");

        RuleFor(x => x.DrawingId)
            .NotEmpty().WithMessage("Drawing ID is required");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Layer color is required")
            .Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Layer color must be a valid hex color (e.g., #FF0000)");

        RuleFor(x => x.Opacity)
            .InclusiveBetween(0.0, 1.0).WithMessage("Layer opacity must be between 0.0 and 1.0");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order must be non-negative");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("Created by is required")
            .MaximumLength(200).WithMessage("Created by must not exceed 200 characters");
    }
}
