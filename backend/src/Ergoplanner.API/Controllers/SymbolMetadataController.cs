using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Ergoplanner.Application.SymbolMetadata.Commands;
using Ergoplanner.Application.SymbolMetadata.Queries;
using System;
using System.Threading.Tasks;

namespace Ergoplanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SymbolMetadataController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SymbolMetadataController> _logger;

    public SymbolMetadataController(IMediator mediator, ILogger<SymbolMetadataController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get symbol metadata by ID
    /// </summary>
    /// <param name="id">Metadata ID</param>
    /// <returns>Symbol metadata</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SymbolMetadataDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SymbolMetadataDto>> GetById(Guid id)
    {
        var query = new GetSymbolMetadataQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Get symbol metadata by symbol ID
    /// </summary>
    /// <param name="symbolId">Symbol ID</param>
    /// <returns>Symbol metadata</returns>
    [HttpGet("symbol/{symbolId}")]
    [ProducesResponseType(typeof(SymbolMetadataDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SymbolMetadataDto>> GetBySymbolId(Guid symbolId)
    {
        var query = new GetSymbolMetadataBySymbolIdQuery { SymbolId = symbolId };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Create new symbol metadata
    /// </summary>
    /// <param name="command">Create metadata command</param>
    /// <returns>Created metadata</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SymbolMetadataDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SymbolMetadataDto>> Create([FromBody] CreateSymbolMetadataCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for creating symbol metadata");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update symbol metadata
    /// </summary>
    /// <param name="id">Metadata ID</param>
    /// <param name="command">Update command</param>
    /// <returns>Updated metadata</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SymbolMetadataDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SymbolMetadataDto>> Update(Guid id, [FromBody] UpdateSymbolMetadataCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        try
        {
            var result = await _mediator.Send(command);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for updating symbol metadata");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Delete symbol metadata
    /// </summary>
    /// <param name="id">Metadata ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var command = new DeleteSymbolMetadataCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Apply property template to symbol metadata
    /// </summary>
    /// <param name="id">Metadata ID</param>
    /// <param name="templateId">Template ID</param>
    /// <returns>Updated metadata</returns>
    [HttpPost("{id}/apply-template/{templateId}")]
    [ProducesResponseType(typeof(SymbolMetadataDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SymbolMetadataDto>> ApplyTemplate(Guid id, string templateId)
    {
        var command = new ApplyTemplateCommand { MetadataId = id, TemplateId = templateId };

        try
        {
            var result = await _mediator.Send(command);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for applying template");
            return BadRequest(new { error = ex.Message });
        }
    }
}