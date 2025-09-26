namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Categories for water industry specific symbols
/// Based on UK water industry standards and typical water treatment processes
/// </summary>
public enum WaterSymbolCategory
{
    /// <summary>
    /// Water treatment process equipment
    /// </summary>
    WaterTreatment = 1,

    /// <summary>
    /// Wastewater treatment equipment
    /// </summary>
    WastewaterTreatment = 2,

    /// <summary>
    /// Pumping station equipment
    /// </summary>
    PumpingStation = 3,

    /// <summary>
    /// Filtration systems
    /// </summary>
    Filtration = 4,

    /// <summary>
    /// Disinfection and chemical treatment
    /// </summary>
    ChemicalTreatment = 5,

    /// <summary>
    /// Sludge handling and treatment
    /// </summary>
    SludgeHandling = 6,

    /// <summary>
    /// Aeration and mixing equipment
    /// </summary>
    AerationMixing = 7,

    /// <summary>
    /// Clarification and sedimentation
    /// </summary>
    Clarification = 8,

    /// <summary>
    /// Biological treatment processes
    /// </summary>
    BiologicalTreatment = 9,

    /// <summary>
    /// Flow measurement and control
    /// </summary>
    FlowMeasurement = 10,

    /// <summary>
    /// Screening and grit removal
    /// </summary>
    ScreeningGritRemoval = 11,

    /// <summary>
    /// Storage tanks and reservoirs
    /// </summary>
    StorageReservoirs = 12,

    /// <summary>
    /// Distribution network components
    /// </summary>
    Distribution = 13,

    /// <summary>
    /// Odor control equipment
    /// </summary>
    OdorControl = 14,

    /// <summary>
    /// Membrane processes (RO, UF, MF)
    /// </summary>
    MembraneProcesses = 15,

    /// <summary>
    /// UV treatment systems
    /// </summary>
    UVTreatment = 16,

    /// <summary>
    /// Ozone treatment systems
    /// </summary>
    OzoneTreatment = 17,

    /// <summary>
    /// Digestion systems
    /// </summary>
    Digestion = 18,

    /// <summary>
    /// Sampling and monitoring points
    /// </summary>
    SamplingMonitoring = 19,

    /// <summary>
    /// Emergency and overflow systems
    /// </summary>
    EmergencyOverflow = 20
}