using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace Ergoplanner.API.Hubs;

/// <summary>
/// SignalR Hub for real-time layer updates
/// Broadcasts layer changes to all connected clients viewing the same drawing
/// </summary>
[Authorize]
public class LayerHub : Hub
{
    private readonly ILogger<LayerHub> _logger;

    public LayerHub(ILogger<LayerHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Join a drawing-specific group to receive layer updates
    /// </summary>
    /// <param name="drawingId">Drawing ID to subscribe to</param>
    public async Task JoinDrawingGroup(string drawingId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"drawing_{drawingId}");
        _logger.LogInformation(
            "Client {ConnectionId} joined drawing group {DrawingId}",
            Context.ConnectionId, drawingId);
    }

    /// <summary>
    /// Leave a drawing-specific group
    /// </summary>
    /// <param name="drawingId">Drawing ID to unsubscribe from</param>
    public async Task LeaveDrawingGroup(string drawingId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"drawing_{drawingId}");
        _logger.LogInformation(
            "Client {ConnectionId} left drawing group {DrawingId}",
            Context.ConnectionId, drawingId);
    }

    /// <summary>
    /// Notify clients that a layer was created
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="layerId">Created layer ID</param>
    /// <param name="layerData">Layer data</param>
    public async Task NotifyLayerCreated(string drawingId, Guid layerId, object layerData)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("LayerCreated", new
        {
            drawingId,
            layerId,
            layer = layerData,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified layer created: DrawingId={DrawingId}, LayerId={LayerId}",
            drawingId, layerId);
    }

    /// <summary>
    /// Notify clients that a layer was updated
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="layerId">Updated layer ID</param>
    /// <param name="layerData">Updated layer data</param>
    public async Task NotifyLayerUpdated(string drawingId, Guid layerId, object layerData)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("LayerUpdated", new
        {
            drawingId,
            layerId,
            layer = layerData,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified layer updated: DrawingId={DrawingId}, LayerId={LayerId}",
            drawingId, layerId);
    }

    /// <summary>
    /// Notify clients that a layer was deleted
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="layerId">Deleted layer ID</param>
    public async Task NotifyLayerDeleted(string drawingId, Guid layerId)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("LayerDeleted", new
        {
            drawingId,
            layerId,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified layer deleted: DrawingId={DrawingId}, LayerId={LayerId}",
            drawingId, layerId);
    }

    /// <summary>
    /// Notify clients that layer visibility was changed
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="layerId">Layer ID</param>
    /// <param name="isVisible">New visibility state</param>
    /// <param name="isLocked">New locked state</param>
    public async Task NotifyLayerVisibilityChanged(
        string drawingId,
        Guid layerId,
        bool isVisible,
        bool isLocked)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("LayerVisibilityChanged", new
        {
            drawingId,
            layerId,
            isVisible,
            isLocked,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified layer visibility changed: DrawingId={DrawingId}, LayerId={LayerId}, Visible={IsVisible}, Locked={IsLocked}",
            drawingId, layerId, isVisible, isLocked);
    }

    /// <summary>
    /// Notify clients that layer order was changed
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="layerId">Layer ID</param>
    /// <param name="newOrder">New display order</param>
    /// <param name="newParentId">New parent layer ID (if moved in hierarchy)</param>
    public async Task NotifyLayerOrderChanged(
        string drawingId,
        Guid layerId,
        int newOrder,
        Guid? newParentId)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("LayerOrderChanged", new
        {
            drawingId,
            layerId,
            displayOrder = newOrder,
            parentLayerId = newParentId,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified layer order changed: DrawingId={DrawingId}, LayerId={LayerId}, Order={Order}",
            drawingId, layerId, newOrder);
    }

    /// <summary>
    /// Notify clients that elements were assigned to a layer
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="layerId">Layer ID</param>
    /// <param name="elementCount">Number of elements assigned</param>
    public async Task NotifyElementsAssigned(string drawingId, Guid layerId, int elementCount)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("ElementsAssignedToLayer", new
        {
            drawingId,
            layerId,
            elementCount,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified elements assigned: DrawingId={DrawingId}, LayerId={LayerId}, Count={Count}",
            drawingId, layerId, elementCount);
    }

    /// <summary>
    /// Notify clients that layers were merged
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="targetLayerId">Target layer ID (result of merge)</param>
    /// <param name="sourceLayerIds">Source layer IDs that were merged</param>
    public async Task NotifyLayersMerged(
        string drawingId,
        Guid targetLayerId,
        List<Guid> sourceLayerIds)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("LayersMerged", new
        {
            drawingId,
            targetLayerId,
            sourceLayerIds,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified layers merged: DrawingId={DrawingId}, TargetLayerId={TargetLayerId}, SourceCount={Count}",
            drawingId, targetLayerId, sourceLayerIds.Count);
    }

    /// <summary>
    /// Notify clients that a layer was split
    /// </summary>
    /// <param name="drawingId">Drawing ID</param>
    /// <param name="sourceLayerId">Source layer ID that was split</param>
    /// <param name="newLayerIds">New layer IDs created from split</param>
    public async Task NotifyLayerSplit(
        string drawingId,
        Guid sourceLayerId,
        List<Guid> newLayerIds)
    {
        await Clients.Group($"drawing_{drawingId}").SendAsync("LayerSplit", new
        {
            drawingId,
            sourceLayerId,
            newLayerIds,
            timestamp = DateTime.UtcNow
        });

        _logger.LogDebug(
            "Notified layer split: DrawingId={DrawingId}, SourceLayerId={SourceLayerId}, NewLayerCount={Count}",
            drawingId, sourceLayerId, newLayerIds.Count);
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation(
            "Client connected: ConnectionId={ConnectionId}, User={User}",
            Context.ConnectionId,
            Context.User?.Identity?.Name ?? "Anonymous");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception != null)
        {
            _logger.LogWarning(
                exception,
                "Client disconnected with error: ConnectionId={ConnectionId}",
                Context.ConnectionId);
        }
        else
        {
            _logger.LogInformation(
                "Client disconnected: ConnectionId={ConnectionId}",
                Context.ConnectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
