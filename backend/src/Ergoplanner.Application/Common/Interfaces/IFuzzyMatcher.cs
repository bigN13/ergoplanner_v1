namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Interface for fuzzy string matching algorithms
/// </summary>
public interface IFuzzyMatcher
{
    /// <summary>
    /// Calculate Levenshtein distance between two strings
    /// </summary>
    int CalculateLevenshteinDistance(string source, string target);

    /// <summary>
    /// Calculate normalized similarity score (0.0 to 1.0)
    /// </summary>
    double CalculateSimilarityScore(string source, string target);

    /// <summary>
    /// Find best matches from a list of candidates
    /// </summary>
    List<FuzzyMatchResult> FindBestMatches(
        string query,
        IEnumerable<string> candidates,
        double minimumScore = 0.7,
        int maxResults = 10);

    /// <summary>
    /// Check if two strings are similar within a threshold
    /// </summary>
    bool IsSimilar(string source, string target, double threshold = 0.8);
}

/// <summary>
/// Result of a fuzzy match operation
/// </summary>
public class FuzzyMatchResult
{
    public string Candidate { get; set; } = string.Empty;
    public double SimilarityScore { get; set; }
    public int LevenshteinDistance { get; set; }
}
