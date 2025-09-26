namespace Ergoplanner.Domain.Enums;

/// <summary>
/// ISA-5.1 compliant instrument function codes
/// Represents the functional identification letters used in P&ID instrument tags
/// </summary>
public enum InstrumentFunction
{
    // Primary Measurement Functions (First Letter)

    /// <summary>
    /// Flow measurement
    /// </summary>
    Flow = 1,

    /// <summary>
    /// Pressure measurement
    /// </summary>
    Pressure = 2,

    /// <summary>
    /// Level measurement
    /// </summary>
    Level = 3,

    /// <summary>
    /// Temperature measurement
    /// </summary>
    Temperature = 4,

    /// <summary>
    /// Analysis/Quality measurement (pH, conductivity, etc.)
    /// </summary>
    Analysis = 5,

    /// <summary>
    /// Density/Specific gravity measurement
    /// </summary>
    Density = 6,

    /// <summary>
    /// Electrical measurement (current, voltage, power)
    /// </summary>
    Electrical = 7,

    /// <summary>
    /// Humidity measurement
    /// </summary>
    Humidity = 8,

    /// <summary>
    /// Current measurement (electrical)
    /// </summary>
    Current = 9,

    /// <summary>
    /// Hand/Manual operation
    /// </summary>
    Hand = 10,

    /// <summary>
    /// Time/Schedule measurement
    /// </summary>
    Time = 11,

    /// <summary>
    /// Vibration/Mechanical measurement
    /// </summary>
    Vibration = 12,

    /// <summary>
    /// Weight/Force measurement
    /// </summary>
    Weight = 13,

    /// <summary>
    /// Position/Dimension measurement
    /// </summary>
    Position = 14,

    /// <summary>
    /// Quantity/Counting measurement
    /// </summary>
    Quantity = 15,

    /// <summary>
    /// Radiation measurement
    /// </summary>
    Radiation = 16,

    /// <summary>
    /// Speed/Frequency measurement
    /// </summary>
    Speed = 17,

    /// <summary>
    /// Multivariable measurement
    /// </summary>
    Multivariable = 18,

    /// <summary>
    /// Unclassified measurement
    /// </summary>
    Unclassified = 19,

    /// <summary>
    /// Voltage measurement
    /// </summary>
    Voltage = 20,

    /// <summary>
    /// Torque measurement
    /// </summary>
    Torque = 21,

    /// <summary>
    /// Safety/Burner management
    /// </summary>
    Safety = 22,

    /// <summary>
    /// Choosen by user (Z)
    /// </summary>
    UserDefined = 23
}