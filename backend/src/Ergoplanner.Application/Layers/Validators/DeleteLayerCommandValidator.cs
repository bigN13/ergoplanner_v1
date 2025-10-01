using FluentValidation;
using Ergoplanner.Application.Layers.Commands;

namespace Ergoplanner.Application.Layers.Validators;

public class DeleteLayerCommandValidator : AbstractValidator<DeleteLayerCommand>
{
    public DeleteLayerCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Layer ID is required");

        RuleFor(x => x.DeletedBy)
            .NotEmpty().WithMessage("Deleted by is required")
            .MaximumLength(200).WithMessage("Deleted by must not exceed 200 characters");
    }
}
