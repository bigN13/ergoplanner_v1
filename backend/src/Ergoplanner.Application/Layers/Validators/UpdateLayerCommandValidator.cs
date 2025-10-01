using FluentValidation;
using Ergoplanner.Application.Layers.Commands;

namespace Ergoplanner.Application.Layers.Validators;

public class UpdateLayerCommandValidator : AbstractValidator<UpdateLayerCommand>
{
    public UpdateLayerCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Layer ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Layer name is required")
            .MaximumLength(200).WithMessage("Layer name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Layer description must not exceed 1000 characters");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Layer color is required")
            .Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Layer color must be a valid hex color (e.g., #FF0000)");

        RuleFor(x => x.Opacity)
            .InclusiveBetween(0.0, 1.0).WithMessage("Layer opacity must be between 0.0 and 1.0");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("Modified by is required")
            .MaximumLength(200).WithMessage("Modified by must not exceed 200 characters");
    }
}
