namespace Ergoplanner.Domain.Enums;

/// <summary>
/// ISA-5.1 compliant instrument type codes
/// Represents the second letter/modifier functions in P&ID instrument tags
/// </summary>
public enum InstrumentType
{
    // Output Functions (Second Letter)

    /// <summary>
    /// Alarm function
    /// </summary>
    Alarm = 1,

    /// <summary>
    /// Control function (automatic)
    /// </summary>
    Control = 2,

    /// <summary>
    /// Differential measurement
    /// </summary>
    Differential = 3,

    /// <summary>
    /// Element/Sensor (primary)
    /// </summary>
    Element = 4,

    /// <summary>
    /// Ratio function
    /// </summary>
    Ratio = 5,

    /// <summary>
    /// Glass/Sight function (local indication)
    /// </summary>
    Glass = 6,

    /// <summary>
    /// High limit alarm/trip
    /// </summary>
    High = 7,

    /// <summary>
    /// Indicate function (local display)
    /// </summary>
    Indicate = 8,

    /// <summary>
    /// Scan/Select function
    /// </summary>
    Scan = 9,

    /// <summary>
    /// Control station/Manual loading
    /// </summary>
    ControlStation = 10,

    /// <summary>
    /// Low limit alarm/trip
    /// </summary>
    Low = 11,

    /// <summary>
    /// Middle/Intermediate function
    /// </summary>
    Middle = 12,

    /// <summary>
    /// User defined function
    /// </summary>
    UserDefined = 13,

    /// <summary>
    /// Point/Connection function
    /// </summary>
    Point = 14,

    /// <summary>
    /// Integrate/Totalize function
    /// </summary>
    Integrate = 15,

    /// <summary>
    /// Record function
    /// </summary>
    Record = 16,

    /// <summary>
    /// Switch function
    /// </summary>
    Switch = 17,

    /// <summary>
    /// Transmit function (remote signal)
    /// </summary>
    Transmit = 18,

    /// <summary>
    /// Multifunction device
    /// </summary>
    Multifunction = 19,

    /// <summary>
    /// Valve/Damper/Louver (final control element)
    /// </summary>
    Valve = 20,

    /// <summary>
    /// Well/Probe function
    /// </summary>
    Well = 21,

    /// <summary>
    /// Safety/Relief function
    /// </summary>
    Safety = 22,

    /// <summary>
    /// Driver/Actuator function
    /// </summary>
    Driver = 23,

    /// <summary>
    /// Primary element (special)
    /// </summary>
    PrimaryElement = 24,

    /// <summary>
    /// Computing/Converting function
    /// </summary>
    Computing = 25
}