using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Interface for symbol standard conversion service
/// </summary>
public interface ISymbolStandardConversionService
{
    /// <summary>
    /// Convert a symbol to a different standard
    /// </summary>
    Task<Symbol> ConvertToStandardAsync(Symbol symbol, string targetStandard, CancellationToken cancellationToken = default);

    /// <summary>
    /// Find an equivalent symbol in a different standard
    /// </summary>
    Task<Symbol?> FindEquivalentSymbolAsync(Symbol symbol, string targetStandard, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if conversion between two standards is supported
    /// </summary>
    bool CanConvert(string fromStandard, string toStandard);

    /// <summary>
    /// Get list of standards that a source standard can be converted to
    /// </summary>
    List<string> GetSupportedConversions(string fromStandard);
}