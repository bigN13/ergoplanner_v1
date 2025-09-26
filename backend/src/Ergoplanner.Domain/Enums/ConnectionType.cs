namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Types of connections available on engineering symbols
/// </summary>
public enum ConnectionType
{
    /// <summary>
    /// Process fluid inlet connection
    /// </summary>
    ProcessInlet = 1,

    /// <summary>
    /// Process fluid outlet connection
    /// </summary>
    ProcessOutlet = 2,

    /// <summary>
    /// Vent connection for gas release
    /// </summary>
    Vent = 3,

    /// <summary>
    /// Drain connection for liquid drainage
    /// </summary>
    Drain = 4,

    /// <summary>
    /// Instrument connection point
    /// </summary>
    Instrument = 5,

    /// <summary>
    /// Utility connection (steam, cooling water, air, etc.)
    /// </summary>
    Utility = 6,

    /// <summary>
    /// Electrical connection
    /// </summary>
    Electrical = 7,

    /// <summary>
    /// Signal or control connection
    /// </summary>
    Signal = 8,

    /// <summary>
    /// Mechanical connection (coupling, drive, etc.)
    /// </summary>
    Mechanical = 9,

    /// <summary>
    /// Generic connection point
    /// </summary>
    Generic = 10
}