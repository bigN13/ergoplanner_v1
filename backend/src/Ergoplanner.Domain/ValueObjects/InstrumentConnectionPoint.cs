using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Specialized connection point for instrumentation symbols with ISA-5.1 compliance
/// Extends the base ConnectionPoint with instrument-specific properties
/// </summary>
public class InstrumentConnectionPoint : ConnectionPoint
{
    /// <summary>
    /// Type of instrument signal (4-20mA, digital, pneumatic, etc.)
    /// </summary>
    public InstrumentSignalType SignalType { get; }

    /// <summary>
    /// Whether this connection is for process measurement or control signal
    /// </summary>
    public bool IsProcessConnection { get; }

    /// <summary>
    /// Whether this connection carries power supply
    /// </summary>
    public bool IsPowerSupply { get; }

    /// <summary>
    /// Voltage level for electrical connections (24VDC, 120VAC, etc.)
    /// </summary>
    public string? VoltageLevel { get; }

    /// <summary>
    /// Current range for analog signals (4-20mA, 0-10V, etc.)
    /// </summary>
    public string? CurrentRange { get; }

    /// <summary>
    /// Communication protocol for digital signals (HART, Foundation Fieldbus, etc.)
    /// </summary>
    public string? Protocol { get; }

    /// <summary>
    /// Wire or tube size for the connection
    /// </summary>
    public string? WireSize { get; }

    /// <summary>
    /// Intrinsic safety classification (IS, Non-IS)
    /// </summary>
    public string? IntrinsicSafetyRating { get; }

    /// <summary>
    /// Terminal or junction box reference
    /// </summary>
    public string? TerminalReference { get; }

    /// <summary>
    /// Cable or conduit identification
    /// </summary>
    public string? CableId { get; }

    /// <summary>
    /// Creates a new InstrumentConnectionPoint instance
    /// </summary>
    public InstrumentConnectionPoint(
        string id,
        ConnectionType type,
        double x,
        double y,
        double direction,
        string size,
        InstrumentSignalType signalType,
        bool isProcessConnection = false,
        bool isPowerSupply = false,
        string? voltageLevel = null,
        string? currentRange = null,
        string? protocol = null,
        string? wireSize = null,
        string? intrinsicSafetyRating = null,
        string? terminalReference = null,
        string? cableId = null,
        string? pressureRating = null,
        string? serviceType = null,
        string? description = null,
        bool isRequired = true,
        bool allowsMultipleConnections = false,
        double? minLineSize = null,
        double? maxLineSize = null,
        List<ConnectionType>? compatibleTypes = null)
        : base(id, type, x, y, direction, size, pressureRating, serviceType, description,
               isRequired, allowsMultipleConnections, minLineSize, maxLineSize, compatibleTypes)
    {
        SignalType = signalType;
        IsProcessConnection = isProcessConnection;
        IsPowerSupply = isPowerSupply;
        VoltageLevel = voltageLevel;
        CurrentRange = currentRange;
        Protocol = protocol;
        WireSize = wireSize;
        IntrinsicSafetyRating = intrinsicSafetyRating;
        TerminalReference = terminalReference;
        CableId = cableId;

        ValidateInstrumentSpecificParameters();
    }

    /// <summary>
    /// Check if this connection point can connect to another instrument connection point
    /// </summary>
    public new bool CanConnectTo(ConnectionPoint other)
    {
        // Base compatibility check first
        if (!base.CanConnectTo(other))
            return false;

        // Additional instrument-specific checks
        if (other is InstrumentConnectionPoint instrumentOther)
        {
            // Signal type compatibility
            if (!AreSignalTypesCompatible(SignalType, instrumentOther.SignalType))
                return false;

            // Voltage level compatibility
            if (!string.IsNullOrEmpty(VoltageLevel) && !string.IsNullOrEmpty(instrumentOther.VoltageLevel))
            {
                if (!VoltageLevel.Equals(instrumentOther.VoltageLevel, StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            // Current range compatibility
            if (!string.IsNullOrEmpty(CurrentRange) && !string.IsNullOrEmpty(instrumentOther.CurrentRange))
            {
                if (!CurrentRange.Equals(instrumentOther.CurrentRange, StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            // Protocol compatibility for digital signals
            if (SignalType == InstrumentSignalType.Digital && instrumentOther.SignalType == InstrumentSignalType.Digital)
            {
                if (!string.IsNullOrEmpty(Protocol) && !string.IsNullOrEmpty(instrumentOther.Protocol))
                {
                    if (!Protocol.Equals(instrumentOther.Protocol, StringComparison.OrdinalIgnoreCase))
                        return false;
                }
            }

            // Intrinsic safety compatibility
            if (!string.IsNullOrEmpty(IntrinsicSafetyRating) && !string.IsNullOrEmpty(instrumentOther.IntrinsicSafetyRating))
            {
                if (!IntrinsicSafetyRating.Equals(instrumentOther.IntrinsicSafetyRating, StringComparison.OrdinalIgnoreCase))
                    return false;
            }
        }

        return true;
    }

    /// <summary>
    /// Create a process connection point
    /// </summary>
    public static InstrumentConnectionPoint CreateProcessConnection(
        string id,
        double x,
        double y,
        double direction,
        string size,
        string? pressureRating = null,
        string? serviceType = null)
    {
        return new InstrumentConnectionPoint(
            id,
            ConnectionType.ProcessInlet,
            x, y, direction, size,
            InstrumentSignalType.Process,
            isProcessConnection: true,
            pressureRating: pressureRating,
            serviceType: serviceType);
    }

    /// <summary>
    /// Create a 4-20mA analog signal connection point
    /// </summary>
    public static InstrumentConnectionPoint CreateAnalogSignalConnection(
        string id,
        double x,
        double y,
        double direction,
        string wireSize = "16 AWG",
        bool isPowerSupply = false)
    {
        return new InstrumentConnectionPoint(
            id,
            ConnectionType.Signal,
            x, y, direction, wireSize,
            InstrumentSignalType.Analog,
            isPowerSupply: isPowerSupply,
            currentRange: "4-20mA",
            voltageLevel: isPowerSupply ? "24VDC" : null,
            wireSize: wireSize);
    }

    /// <summary>
    /// Create a digital communication connection point
    /// </summary>
    public static InstrumentConnectionPoint CreateDigitalConnection(
        string id,
        double x,
        double y,
        double direction,
        string protocol,
        string wireSize = "16 AWG")
    {
        return new InstrumentConnectionPoint(
            id,
            ConnectionType.Signal,
            x, y, direction, wireSize,
            InstrumentSignalType.Digital,
            protocol: protocol,
            wireSize: wireSize);
    }

    /// <summary>
    /// Create a pneumatic signal connection point
    /// </summary>
    public static InstrumentConnectionPoint CreatePneumaticConnection(
        string id,
        double x,
        double y,
        double direction,
        string tubeSize = "1/4\"")
    {
        return new InstrumentConnectionPoint(
            id,
            ConnectionType.Signal,
            x, y, direction, tubeSize,
            InstrumentSignalType.Pneumatic,
            serviceType: "Instrument Air");
    }

    /// <summary>
    /// Create a power supply connection point
    /// </summary>
    public static InstrumentConnectionPoint CreatePowerConnection(
        string id,
        double x,
        double y,
        double direction,
        string voltageLevel,
        string wireSize = "14 AWG")
    {
        return new InstrumentConnectionPoint(
            id,
            ConnectionType.Electrical,
            x, y, direction, wireSize,
            InstrumentSignalType.Power,
            isPowerSupply: true,
            voltageLevel: voltageLevel,
            wireSize: wireSize);
    }

    /// <summary>
    /// Get the ISA-5.1 standard line type for this connection
    /// </summary>
    public string GetISALineType()
    {
        return SignalType switch
        {
            InstrumentSignalType.Process => "Process Line",
            InstrumentSignalType.Analog => "Instrument Signal Line",
            InstrumentSignalType.Digital => "Data Link",
            InstrumentSignalType.Pneumatic => "Pneumatic Signal Line",
            InstrumentSignalType.Hydraulic => "Hydraulic Signal Line",
            InstrumentSignalType.Power => "Power Line",
            InstrumentSignalType.Mechanical => "Mechanical Link",
            _ => "Generic Signal Line"
        };
    }

    /// <summary>
    /// Get the recommended line style for drawing this connection
    /// </summary>
    public LineStyle GetRecommendedLineStyle()
    {
        return SignalType switch
        {
            InstrumentSignalType.Process => LineStyle.Solid,
            InstrumentSignalType.Analog => LineStyle.Dashed,
            InstrumentSignalType.Digital => LineStyle.DashedDot,
            InstrumentSignalType.Pneumatic => LineStyle.Dashed,
            InstrumentSignalType.Hydraulic => LineStyle.Dashed,
            InstrumentSignalType.Power => LineStyle.Solid,
            InstrumentSignalType.Mechanical => LineStyle.Solid,
            _ => LineStyle.Solid
        };
    }

    private void ValidateInstrumentSpecificParameters()
    {
        // Validate signal type specific requirements
        switch (SignalType)
        {
            case InstrumentSignalType.Analog:
                if (string.IsNullOrEmpty(CurrentRange))
                    throw new ArgumentException("Current range is required for analog signals");
                break;

            case InstrumentSignalType.Digital:
                if (string.IsNullOrEmpty(Protocol))
                    throw new ArgumentException("Protocol is required for digital signals");
                break;

            case InstrumentSignalType.Power:
                if (string.IsNullOrEmpty(VoltageLevel))
                    throw new ArgumentException("Voltage level is required for power connections");
                break;
        }

        // Validate power supply connections
        if (IsPowerSupply && string.IsNullOrEmpty(VoltageLevel))
            throw new ArgumentException("Voltage level is required for power supply connections");
    }

    private static bool AreSignalTypesCompatible(InstrumentSignalType type1, InstrumentSignalType type2)
    {
        // Same types are always compatible
        if (type1 == type2)
            return true;

        // Define compatible signal type pairs
        var compatiblePairs = new Dictionary<InstrumentSignalType, List<InstrumentSignalType>>
        {
            {
                InstrumentSignalType.Analog,
                new List<InstrumentSignalType> { InstrumentSignalType.Analog, InstrumentSignalType.Power }
            },
            {
                InstrumentSignalType.Digital,
                new List<InstrumentSignalType> { InstrumentSignalType.Digital, InstrumentSignalType.Power }
            },
            {
                InstrumentSignalType.Power,
                new List<InstrumentSignalType> { InstrumentSignalType.Analog, InstrumentSignalType.Digital, InstrumentSignalType.Power }
            },
            {
                InstrumentSignalType.Process,
                new List<InstrumentSignalType> { InstrumentSignalType.Process }
            },
            {
                InstrumentSignalType.Pneumatic,
                new List<InstrumentSignalType> { InstrumentSignalType.Pneumatic }
            },
            {
                InstrumentSignalType.Hydraulic,
                new List<InstrumentSignalType> { InstrumentSignalType.Hydraulic }
            }
        };

        return compatiblePairs.ContainsKey(type1) && compatiblePairs[type1].Contains(type2);
    }
}

/// <summary>
/// Types of instrument signals according to ISA-5.1 standards
/// </summary>
public enum InstrumentSignalType
{
    /// <summary>
    /// Process fluid connection
    /// </summary>
    Process = 1,

    /// <summary>
    /// Analog electrical signal (4-20mA, 0-10V, etc.)
    /// </summary>
    Analog = 2,

    /// <summary>
    /// Digital communication signal
    /// </summary>
    Digital = 3,

    /// <summary>
    /// Pneumatic signal (3-15 PSI)
    /// </summary>
    Pneumatic = 4,

    /// <summary>
    /// Hydraulic signal
    /// </summary>
    Hydraulic = 5,

    /// <summary>
    /// Electrical power supply
    /// </summary>
    Power = 6,

    /// <summary>
    /// Mechanical linkage
    /// </summary>
    Mechanical = 7
}

/// <summary>
/// Line styles for drawing connections
/// </summary>
public enum LineStyle
{
    /// <summary>
    /// Solid line
    /// </summary>
    Solid = 1,

    /// <summary>
    /// Dashed line
    /// </summary>
    Dashed = 2,

    /// <summary>
    /// Dotted line
    /// </summary>
    Dotted = 3,

    /// <summary>
    /// Dash-dot line
    /// </summary>
    DashedDot = 4,

    /// <summary>
    /// Double line
    /// </summary>
    Double = 5
}