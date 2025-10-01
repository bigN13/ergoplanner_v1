namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Symbol library standards and sources
/// </summary>
public enum SymbolLibraryType
{
    /// <summary>
    /// ISA-5.1 instrumentation symbols standard
    /// </summary>
    ISA_5_1 = 1,

    /// <summary>
    /// ISO 14617 graphical symbols for diagrams
    /// </summary>
    ISO_14617 = 2,

    /// <summary>
    /// Thames Water UK standards
    /// </summary>
    ThamesWater = 3,

    /// <summary>
    /// United Utilities UK standards
    /// </summary>
    UnitedUtilities = 4,

    /// <summary>
    /// Southern Water UK standards
    /// </summary>
    SouthernWater = 5,

    /// <summary>
    /// Anglian Water UK standards
    /// </summary>
    AnglianWater = 6,

    /// <summary>
    /// Yorkshire Water UK standards
    /// </summary>
    YorkshireWater = 7,

    /// <summary>
    /// Custom user-defined symbols
    /// </summary>
    Custom = 100,

    /// <summary>
    /// Unknown or unclassified source
    /// </summary>
    Unknown = 999
}
