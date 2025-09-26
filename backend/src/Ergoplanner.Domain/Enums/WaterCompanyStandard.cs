namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Represents UK water company standards for P&ID symbols
/// Each company has specific symbol requirements and variations
/// </summary>
public enum WaterCompanyStandard
{
    /// <summary>
    /// Generic/universal water industry standard
    /// </summary>
    Generic = 0,

    /// <summary>
    /// Thames Water standard (London and Thames Valley)
    /// </summary>
    ThamesWater = 1,

    /// <summary>
    /// Severn Trent Water standard (Midlands)
    /// </summary>
    SevernTrent = 2,

    /// <summary>
    /// Welsh Water / Dŵr Cymru standard (Wales)
    /// </summary>
    WelshWater = 3,

    /// <summary>
    /// United Utilities standard (North West England)
    /// </summary>
    UnitedUtilities = 4,

    /// <summary>
    /// Northumbrian Water standard (North East England)
    /// </summary>
    NorthumbrianWater = 5,

    /// <summary>
    /// Anglian Water standard (East of England)
    /// </summary>
    AnglianWater = 6,

    /// <summary>
    /// Yorkshire Water standard (Yorkshire)
    /// </summary>
    YorkshireWater = 7,

    /// <summary>
    /// South West Water standard (Devon, Cornwall)
    /// </summary>
    SouthWestWater = 8,

    /// <summary>
    /// Southern Water standard (South East England)
    /// </summary>
    SouthernWater = 9,

    /// <summary>
    /// Wessex Water standard (South West England)
    /// </summary>
    WessexWater = 10,

    /// <summary>
    /// Scottish Water standard (Scotland)
    /// </summary>
    ScottishWater = 11,

    /// <summary>
    /// Northern Ireland Water standard (Northern Ireland)
    /// </summary>
    NorthernIrelandWater = 12
}