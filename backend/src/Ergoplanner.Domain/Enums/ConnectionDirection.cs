namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Represents the direction of a connection point
/// </summary>
public enum ConnectionDirection
{
    /// <summary>
    /// Input connection - data or flow coming into the symbol
    /// </summary>
    Input,

    /// <summary>
    /// Output connection - data or flow going out from the symbol
    /// </summary>
    Output,

    /// <summary>
    /// Bidirectional connection - data or flow can go both ways
    /// </summary>
    Bidirectional,

    /// <summary>
    /// No specific direction - neutral connection point
    /// </summary>
    None
}