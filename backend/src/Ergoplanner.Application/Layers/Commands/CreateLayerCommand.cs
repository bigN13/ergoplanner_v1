using MediatR;
using Ergoplanner.Application.Layers.DTOs;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Application.Layers.Commands;

public class CreateLayerCommand : IRequest<LayerDto>
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid DrawingId { get; set; }
    public string Color { get; set; } = "#000000";
    public double Opacity { get; set; } = 1.0;
    public LayerType Type { get; set; } = LayerType.Standard;
    public Guid? ParentLayerId { get; set; }
    public bool IsVisible { get; set; } = true;
    public bool IsSelectable { get; set; } = true;
    public bool IsLocked { get; set; } = false;
    public bool IsPrintable { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public LayerProperties? Properties { get; set; }
    public LayerMetadata? Metadata { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
