using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Ergoplanner.Application.Layers.Commands;
using Ergoplanner.Application.Layers.Queries;
using Ergoplanner.Application.Layers.DTOs;

namespace Ergoplanner.API.Controllers;

/// <summary>
/// Layer Management REST API Controller
/// Provides endpoints for CRUD operations on P&ID drawing layers
/// </summary>
[ApiController]
[Route("api")]
[Authorize]
[Produces("application/json")]
public class LayersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<LayersController> _logger;

    public LayersController(IMediator mediator, ILogger<LayersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all layers for a drawing
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <returns>List of layers</returns>
    [HttpGet("drawings/{drawingId}/layers")]
    [ProducesResponseType(typeof(List<LayerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<LayerDto>>> GetLayersByDrawing(Guid drawingId)
    {
        var query = new GetLayersByDrawingQuery { DrawingId = drawingId };
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get layer hierarchy for a drawing
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="parentLayerId">Optional parent layer ID to start from</param>
    /// <returns>Hierarchical layer tree</returns>
    [HttpGet("drawings/{drawingId}/layers/hierarchy")]
    [ProducesResponseType(typeof(List<LayerHierarchyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LayerHierarchyDto>>> GetLayerHierarchy(
        Guid drawingId,
        [FromQuery] Guid? parentLayerId = null)
    {
        var query = new GetLayerHierarchyQuery
        {
            DrawingId = drawingId,
            ParentLayerId = parentLayerId
        };
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get layer by ID
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <returns>Layer details</returns>
    [HttpGet("layers/{id}")]
    [ProducesResponseType(typeof(LayerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LayerDto>> GetLayerById(Guid id)
    {
        var query = new GetLayerByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { error = $"Layer with ID {id} not found" });

        return Ok(result);
    }

    /// <summary>
    /// Get elements assigned to a layer
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <param name="elementType">Optional element type filter</param>
    /// <returns>List of layer elements</returns>
    [HttpGet("layers/{id}/elements")]
    [ProducesResponseType(typeof(List<LayerElementDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<LayerElementDto>>> GetLayerElements(
        Guid id,
        [FromQuery] Domain.Enums.LayerElementType? elementType = null)
    {
        var query = new GetLayerElementsQuery
        {
            LayerId = id,
            ElementType = elementType
        };
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Create a new layer
    /// </summary>
    /// <param name="command">Create layer command</param>
    /// <returns>Created layer</returns>
    [HttpPost("layers")]
    [ProducesResponseType(typeof(LayerDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LayerDto>> CreateLayer([FromBody] CreateLayerCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetLayerById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for creating layer");
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation for creating layer");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update layer properties
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <param name="command">Update layer command</param>
    /// <returns>Updated layer</returns>
    [HttpPut("layers/{id}")]
    [ProducesResponseType(typeof(LayerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LayerDto>> UpdateLayer(Guid id, [FromBody] UpdateLayerCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch between URL and request body" });

        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for updating layer {LayerId}", id);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Delete a layer
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <param name="forceDelete">Force delete even if layer has elements</param>
    /// <returns>No content on success</returns>
    [HttpDelete("layers/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteLayer(Guid id, [FromQuery] bool forceDelete = false)
    {
        try
        {
            var command = new DeleteLayerCommand
            {
                Id = id,
                DeletedBy = User.Identity?.Name ?? "System",
                ForceDelete = forceDelete
            };
            var result = await _mediator.Send(command);

            if (!result)
                return NotFound(new { error = $"Layer with ID {id} not found" });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation for deleting layer {LayerId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Move/reorder a layer in the hierarchy
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <param name="command">Move layer command</param>
    /// <returns>Updated layer</returns>
    [HttpPatch("layers/{id}/move")]
    [ProducesResponseType(typeof(LayerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LayerDto>> MoveLayer(Guid id, [FromBody] MoveLayerCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch between URL and request body" });

        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for moving layer {LayerId}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation for moving layer {LayerId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update layer visibility settings
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <param name="command">Update visibility command</param>
    /// <returns>Updated layer</returns>
    [HttpPatch("layers/{id}/visibility")]
    [ProducesResponseType(typeof(LayerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LayerDto>> UpdateLayerVisibility(
        Guid id,
        [FromBody] UpdateLayerVisibilityCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch between URL and request body" });

        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for updating layer visibility {LayerId}", id);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Bulk assign elements to a layer
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <param name="command">Assign elements command</param>
    /// <returns>Success status</returns>
    [HttpPost("layers/{id}/elements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignElements(Guid id, [FromBody] AssignElementsToLayerCommand command)
    {
        if (id != command.LayerId)
            return BadRequest(new { error = "ID mismatch between URL and request body" });

        try
        {
            var result = await _mediator.Send(command);
            return Ok(new { success = result, message = $"Successfully assigned {command.Elements.Count} elements to layer" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for assigning elements to layer {LayerId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Merge multiple layers into a target layer
    /// </summary>
    /// <param name="command">Merge layers command</param>
    /// <returns>Resulting merged layer</returns>
    [HttpPost("layers/merge")]
    [ProducesResponseType(typeof(LayerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LayerDto>> MergeLayers([FromBody] MergeLayersCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for merging layers");
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation for merging layers");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Split a layer by element types into child layers
    /// </summary>
    /// <param name="command">Split layer command</param>
    /// <returns>List of created child layers</returns>
    [HttpPost("layers/split")]
    [ProducesResponseType(typeof(List<LayerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<LayerDto>>> SplitLayer([FromBody] SplitLayerCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for splitting layer");
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation for splitting layer");
            return BadRequest(new { error = ex.Message });
        }
    }
}
