namespace Ergoplanner.Domain.Enums;

/// <summary>
/// Method used to create symbol mapping
/// </summary>
public enum SymbolMappingMethod
{
    /// <summary>
    /// Exact match by symbol ID or code
    /// </summary>
    ExactMatch = 1,

    /// <summary>
    /// Fuzzy matching using Levenshtein distance
    /// </summary>
    FuzzyMatch = 2,

    /// <summary>
    /// ML-based recognition using trained models
    /// </summary>
    MLRecognition = 3,

    /// <summary>
    /// Image-based detection using OpenCV
    /// </summary>
    ImageDetection = 4,

    /// <summary>
    /// Manual mapping by user
    /// </summary>
    Manual = 5,

    /// <summary>
    /// Imported from external mapping file
    /// </summary>
    Imported = 6
}
