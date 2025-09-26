using Ergoplanner.Domain.Common;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;

namespace Ergoplanner.Domain.Entities;

/// <summary>
/// Represents an instrumentation symbol in P&ID diagrams following ISA-5.1 standards
/// Extends the base Symbol class with instrument-specific properties and behavior
/// </summary>
public class InstrumentSymbol : BaseEntity
{
    /// <summary>
    /// ISA-5.1 compliant instrument tag number (e.g., FIC-101, PT-205A)
    /// </summary>
    public TagNumber TagNumber { get; private set; }

    /// <summary>
    /// Base symbol that this instrument symbol is based on
    /// </summary>
    public Symbol? BaseSymbol { get; private set; }

    /// <summary>
    /// Foreign key to the base symbol
    /// </summary>
    public Guid BaseSymbolId { get; private set; }

    /// <summary>
    /// Primary function of this instrument (Flow, Pressure, Level, etc.)
    /// </summary>
    public InstrumentFunction PrimaryFunction { get; private set; }

    /// <summary>
    /// Secondary functions/modifiers (Indicate, Control, Transmit, etc.)
    /// </summary>
    public List<InstrumentType> SecondaryFunctions { get; private set; }

    /// <summary>
    /// Engineering units for the measured variable (PSI, GPM, °F, etc.)
    /// </summary>
    public string? EngineeringUnits { get; private set; }

    /// <summary>
    /// Measurement range minimum value
    /// </summary>
    public double? RangeMin { get; private set; }

    /// <summary>
    /// Measurement range maximum value
    /// </summary>
    public double? RangeMax { get; private set; }

    /// <summary>
    /// Set point value for controllers
    /// </summary>
    public double? SetPoint { get; private set; }

    /// <summary>
    /// Alarm high limit
    /// </summary>
    public double? AlarmHigh { get; private set; }

    /// <summary>
    /// Alarm low limit
    /// </summary>
    public double? AlarmLow { get; private set; }

    /// <summary>
    /// Trip high limit (safety shutdown)
    /// </summary>
    public double? TripHigh { get; private set; }

    /// <summary>
    /// Trip low limit (safety shutdown)
    /// </summary>
    public double? TripLow { get; private set; }

    /// <summary>
    /// Accuracy specification (± percentage)
    /// </summary>
    public double? Accuracy { get; private set; }

    /// <summary>
    /// Signal type (4-20mA, digital, pneumatic, etc.)
    /// </summary>
    public string? SignalType { get; private set; }

    /// <summary>
    /// Power supply requirement (24VDC, 120VAC, etc.)
    /// </summary>
    public string? PowerSupply { get; private set; }

    /// <summary>
    /// Location classification (locally mounted, control room, field mounted)
    /// </summary>
    public InstrumentLocation Location { get; private set; }

    /// <summary>
    /// Whether this instrument is safety critical (SIL rated)
    /// </summary>
    public bool IsSafetyCritical { get; private set; }

    /// <summary>
    /// Safety Integrity Level (SIL 1, 2, 3, 4) if safety critical
    /// </summary>
    public int? SafetyIntegrityLevel { get; private set; }

    /// <summary>
    /// Failure mode (fail safe, fail dangerous, fail as-is)
    /// </summary>
    public string? FailureMode { get; private set; }

    /// <summary>
    /// Manufacturer name
    /// </summary>
    public string? Manufacturer { get; private set; }

    /// <summary>
    /// Model number
    /// </summary>
    public string? ModelNumber { get; private set; }

    /// <summary>
    /// Installation/Commissioning date
    /// </summary>
    public DateTime? InstallationDate { get; private set; }

    /// <summary>
    /// Calibration due date
    /// </summary>
    public DateTime? CalibrationDueDate { get; private set; }

    /// <summary>
    /// P&ID sheet number where this instrument appears
    /// </summary>
    public string? SheetNumber { get; private set; }

    /// <summary>
    /// Control system or DCS tag reference
    /// </summary>
    public string? ControlSystemTag { get; private set; }

    /// <summary>
    /// Connection specification for process connections
    /// </summary>
    public string? ProcessConnection { get; private set; }

    /// <summary>
    /// Environmental conditions (normal, hazardous area classification)
    /// </summary>
    public string? EnvironmentalRating { get; private set; }

    /// <summary>
    /// Special notes or comments about this instrument
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Instrument loop drawing reference
    /// </summary>
    public string? LoopDrawingNumber { get; private set; }

    // Private constructor for EF Core
    private InstrumentSymbol()
    {
        TagNumber = new TagNumber("TMP-001"); // Default will be overridden
        SecondaryFunctions = new List<InstrumentType>();
        BaseSymbol = null!; // Will be set by EF Core
        Location = InstrumentLocation.Field;
    }

    /// <summary>
    /// Creates a new InstrumentSymbol instance
    /// </summary>
    public InstrumentSymbol(
        TagNumber tagNumber,
        Guid baseSymbolId,
        InstrumentFunction primaryFunction,
        List<InstrumentType>? secondaryFunctions = null,
        InstrumentLocation location = InstrumentLocation.Field,
        string? engineeringUnits = null,
        double? rangeMin = null,
        double? rangeMax = null) : base()
    {
        ValidateParameters(tagNumber, baseSymbolId);

        TagNumber = tagNumber;
        BaseSymbolId = baseSymbolId;
        PrimaryFunction = primaryFunction;
        SecondaryFunctions = secondaryFunctions ?? new List<InstrumentType>();
        Location = location;
        EngineeringUnits = engineeringUnits;
        RangeMin = rangeMin;
        RangeMax = rangeMax;

        // Validate range values
        if (rangeMin.HasValue && rangeMax.HasValue && rangeMin.Value >= rangeMax.Value)
            throw new ArgumentException("Range minimum must be less than range maximum");
    }

    /// <summary>
    /// Update the instrument tag number
    /// </summary>
    public void UpdateTagNumber(TagNumber newTagNumber, string modifiedBy)
    {
        if (newTagNumber == null)
            throw new ArgumentNullException(nameof(newTagNumber));

        TagNumber = newTagNumber;
        PrimaryFunction = newTagNumber.PrimaryFunction;
        SecondaryFunctions = new List<InstrumentType>(newTagNumber.SecondaryFunctions);

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set measurement range and units
    /// </summary>
    public void SetMeasurementRange(
        double? rangeMin,
        double? rangeMax,
        string? engineeringUnits,
        string modifiedBy)
    {
        if (rangeMin.HasValue && rangeMax.HasValue && rangeMin.Value >= rangeMax.Value)
            throw new ArgumentException("Range minimum must be less than range maximum");

        RangeMin = rangeMin;
        RangeMax = rangeMax;
        EngineeringUnits = engineeringUnits;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set control parameters
    /// </summary>
    public void SetControlParameters(
        double? setPoint,
        double? alarmHigh,
        double? alarmLow,
        double? tripHigh,
        double? tripLow,
        string modifiedBy)
    {
        // Validate alarm and trip values are within range
        ValidateAlarmTripValues(alarmHigh, alarmLow, tripHigh, tripLow);

        SetPoint = setPoint;
        AlarmHigh = alarmHigh;
        AlarmLow = alarmLow;
        TripHigh = tripHigh;
        TripLow = tripLow;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set instrument specifications
    /// </summary>
    public void SetSpecifications(
        double? accuracy,
        string? signalType,
        string? powerSupply,
        string? processConnection,
        string modifiedBy)
    {
        if (accuracy.HasValue && (accuracy.Value < 0 || accuracy.Value > 100))
            throw new ArgumentException("Accuracy must be between 0 and 100 percent", nameof(accuracy));

        Accuracy = accuracy;
        SignalType = signalType;
        PowerSupply = powerSupply;
        ProcessConnection = processConnection;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set safety classification
    /// </summary>
    public void SetSafetyClassification(
        bool isSafetyCritical,
        int? safetyIntegrityLevel,
        string? failureMode,
        string modifiedBy)
    {
        if (isSafetyCritical && safetyIntegrityLevel.HasValue)
        {
            if (safetyIntegrityLevel.Value < 1 || safetyIntegrityLevel.Value > 4)
                throw new ArgumentException("Safety Integrity Level must be between 1 and 4", nameof(safetyIntegrityLevel));
        }

        IsSafetyCritical = isSafetyCritical;
        SafetyIntegrityLevel = isSafetyCritical ? safetyIntegrityLevel : null;
        FailureMode = failureMode;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set asset information
    /// </summary>
    public void SetAssetInformation(
        string? manufacturer,
        string? modelNumber,
        DateTime? installationDate,
        DateTime? calibrationDueDate,
        string modifiedBy)
    {
        Manufacturer = manufacturer;
        ModelNumber = modelNumber;
        InstallationDate = installationDate;
        CalibrationDueDate = calibrationDueDate;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Set documentation references
    /// </summary>
    public void SetDocumentationReferences(
        string? sheetNumber,
        string? controlSystemTag,
        string? loopDrawingNumber,
        string? environmentalRating,
        string modifiedBy)
    {
        SheetNumber = sheetNumber;
        ControlSystemTag = controlSystemTag;
        LoopDrawingNumber = loopDrawingNumber;
        EnvironmentalRating = environmentalRating;

        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Add or update notes
    /// </summary>
    public void UpdateNotes(string? notes, string modifiedBy)
    {
        Notes = notes;
        UpdateModificationInfo(modifiedBy);
    }

    /// <summary>
    /// Check if this instrument requires calibration
    /// </summary>
    public bool RequiresCalibration()
    {
        if (!CalibrationDueDate.HasValue)
            return false;

        return CalibrationDueDate.Value <= DateTime.UtcNow.AddDays(30); // 30-day warning
    }

    /// <summary>
    /// Check if this instrument is overdue for calibration
    /// </summary>
    public bool IsCalibrationOverdue()
    {
        if (!CalibrationDueDate.HasValue)
            return false;

        return CalibrationDueDate.Value < DateTime.UtcNow;
    }

    /// <summary>
    /// Get alarm/trip status for a given value
    /// </summary>
    public InstrumentAlarmStatus GetAlarmStatus(double currentValue)
    {
        if (TripHigh.HasValue && currentValue >= TripHigh.Value)
            return InstrumentAlarmStatus.TripHigh;

        if (TripLow.HasValue && currentValue <= TripLow.Value)
            return InstrumentAlarmStatus.TripLow;

        if (AlarmHigh.HasValue && currentValue >= AlarmHigh.Value)
            return InstrumentAlarmStatus.AlarmHigh;

        if (AlarmLow.HasValue && currentValue <= AlarmLow.Value)
            return InstrumentAlarmStatus.AlarmLow;

        return InstrumentAlarmStatus.Normal;
    }

    /// <summary>
    /// Check if the current instrument configuration is ISA-5.1 compliant
    /// </summary>
    public bool IsISACompliant()
    {
        // Tag number must be ISA compliant
        if (!TagNumber.IsISACompliant())
            return false;

        // Primary function must match tag number first letter
        if (TagNumber.PrimaryFunction != PrimaryFunction)
            return false;

        // Secondary functions should match tag number modifier letters
        var expectedSecondaryFunctions = TagNumber.SecondaryFunctions;
        if (SecondaryFunctions.Count != expectedSecondaryFunctions.Count ||
            !SecondaryFunctions.SequenceEqual(expectedSecondaryFunctions))
            return false;

        return true;
    }

    /// <summary>
    /// Generate ISA-5.1 compliant symbol description
    /// </summary>
    public string GenerateISADescription()
    {
        var description = $"{TagNumber.Value}: ";

        description += PrimaryFunction switch
        {
            InstrumentFunction.Flow => "Flow",
            InstrumentFunction.Pressure => "Pressure",
            InstrumentFunction.Level => "Level",
            InstrumentFunction.Temperature => "Temperature",
            InstrumentFunction.Analysis => "Analysis",
            _ => PrimaryFunction.ToString()
        };

        if (SecondaryFunctions.Any())
        {
            var functions = SecondaryFunctions.Select(f => f switch
            {
                InstrumentType.Indicate => "Indicator",
                InstrumentType.Control => "Controller",
                InstrumentType.Transmit => "Transmitter",
                InstrumentType.Alarm => "Alarm",
                InstrumentType.Switch => "Switch",
                InstrumentType.Record => "Recorder",
                _ => f.ToString()
            });

            description += " " + string.Join("/", functions);
        }

        if (!string.IsNullOrEmpty(EngineeringUnits))
        {
            description += $" ({EngineeringUnits})";
        }

        if (RangeMin.HasValue && RangeMax.HasValue)
        {
            description += $" Range: {RangeMin:F1} - {RangeMax:F1}";
        }

        return description;
    }

    private static void ValidateParameters(TagNumber tagNumber, Guid baseSymbolId)
    {
        if (tagNumber == null)
            throw new ArgumentNullException(nameof(tagNumber));

        if (baseSymbolId == Guid.Empty)
            throw new ArgumentException("Base symbol ID cannot be empty", nameof(baseSymbolId));
    }

    private void ValidateAlarmTripValues(double? alarmHigh, double? alarmLow, double? tripHigh, double? tripLow)
    {
        // Validate that trip values are outside alarm values
        if (alarmHigh.HasValue && tripHigh.HasValue && tripHigh.Value < alarmHigh.Value)
            throw new ArgumentException("Trip high must be greater than or equal to alarm high");

        if (alarmLow.HasValue && tripLow.HasValue && tripLow.Value > alarmLow.Value)
            throw new ArgumentException("Trip low must be less than or equal to alarm low");

        // Validate that high values are greater than low values
        if (alarmHigh.HasValue && alarmLow.HasValue && alarmHigh.Value <= alarmLow.Value)
            throw new ArgumentException("Alarm high must be greater than alarm low");

        if (tripHigh.HasValue && tripLow.HasValue && tripHigh.Value <= tripLow.Value)
            throw new ArgumentException("Trip high must be greater than trip low");

        // Validate values are within measurement range if specified
        if (RangeMin.HasValue && RangeMax.HasValue)
        {
            ValidateValueInRange(alarmHigh, "Alarm high");
            ValidateValueInRange(alarmLow, "Alarm low");
            ValidateValueInRange(tripHigh, "Trip high");
            ValidateValueInRange(tripLow, "Trip low");
        }
    }

    private void ValidateValueInRange(double? value, string valueName)
    {
        if (value.HasValue && RangeMin.HasValue && RangeMax.HasValue)
        {
            if (value.Value < RangeMin.Value || value.Value > RangeMax.Value)
                throw new ArgumentException($"{valueName} must be within measurement range ({RangeMin:F1} - {RangeMax:F1})");
        }
    }
}

/// <summary>
/// Instrument location classification according to ISA-5.1
/// </summary>
public enum InstrumentLocation
{
    /// <summary>
    /// Field mounted instrument
    /// </summary>
    Field = 1,

    /// <summary>
    /// Control room mounted
    /// </summary>
    ControlRoom = 2,

    /// <summary>
    /// Locally mounted on equipment
    /// </summary>
    Local = 3,

    /// <summary>
    /// Panel mounted
    /// </summary>
    Panel = 4,

    /// <summary>
    /// Rack mounted
    /// </summary>
    Rack = 5,

    /// <summary>
    /// Computer/DCS system
    /// </summary>
    Computer = 6
}

/// <summary>
/// Instrument alarm status enumeration
/// </summary>
public enum InstrumentAlarmStatus
{
    /// <summary>
    /// Normal operation, no alarms
    /// </summary>
    Normal = 0,

    /// <summary>
    /// High alarm condition
    /// </summary>
    AlarmHigh = 1,

    /// <summary>
    /// Low alarm condition
    /// </summary>
    AlarmLow = 2,

    /// <summary>
    /// High trip condition (safety shutdown)
    /// </summary>
    TripHigh = 3,

    /// <summary>
    /// Low trip condition (safety shutdown)
    /// </summary>
    TripLow = 4
}