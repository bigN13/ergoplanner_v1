using Ergoplanner.Application.Common.Interfaces;

namespace Ergoplanner.Infrastructure.Services;

/// <summary>
/// Implementation of fuzzy string matching using Levenshtein distance
/// </summary>
public class FuzzyMatchingService : IFuzzyMatcher
{
    /// <summary>
    /// Calculate Levenshtein distance between two strings
    /// Time complexity: O(m*n) where m and n are string lengths
    /// </summary>
    public int CalculateLevenshteinDistance(string source, string target)
    {
        if (string.IsNullOrEmpty(source))
            return target?.Length ?? 0;

        if (string.IsNullOrEmpty(target))
            return source.Length;

        // Normalize strings for comparison
        source = source.ToLowerInvariant().Trim();
        target = target.ToLowerInvariant().Trim();

        int sourceLength = source.Length;
        int targetLength = target.Length;

        // Create distance matrix
        int[,] distance = new int[sourceLength + 1, targetLength + 1];

        // Initialize first row and column
        for (int i = 0; i <= sourceLength; i++)
            distance[i, 0] = i;

        for (int j = 0; j <= targetLength; j++)
            distance[0, j] = j;

        // Calculate distances
        for (int i = 1; i <= sourceLength; i++)
        {
            for (int j = 1; j <= targetLength; j++)
            {
                int cost = (source[i - 1] == target[j - 1]) ? 0 : 1;

                distance[i, j] = Math.Min(
                    Math.Min(
                        distance[i - 1, j] + 1,      // Deletion
                        distance[i, j - 1] + 1),     // Insertion
                    distance[i - 1, j - 1] + cost);  // Substitution
            }
        }

        return distance[sourceLength, targetLength];
    }

    /// <summary>
    /// Calculate normalized similarity score (0.0 to 1.0)
    /// Score = 1 - (distance / max(source.length, target.length))
    /// </summary>
    public double CalculateSimilarityScore(string source, string target)
    {
        if (string.IsNullOrEmpty(source) && string.IsNullOrEmpty(target))
            return 1.0;

        if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target))
            return 0.0;

        int distance = CalculateLevenshteinDistance(source, target);
        int maxLength = Math.Max(source.Length, target.Length);

        double similarity = 1.0 - ((double)distance / maxLength);
        return Math.Max(0.0, similarity); // Ensure non-negative
    }

    /// <summary>
    /// Find best matches from a list of candidates
    /// </summary>
    public List<FuzzyMatchResult> FindBestMatches(
        string query,
        IEnumerable<string> candidates,
        double minimumScore = 0.7,
        int maxResults = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<FuzzyMatchResult>();

        var results = new List<FuzzyMatchResult>();

        foreach (var candidate in candidates)
        {
            if (string.IsNullOrWhiteSpace(candidate))
                continue;

            var score = CalculateSimilarityScore(query, candidate);

            if (score >= minimumScore)
            {
                results.Add(new FuzzyMatchResult
                {
                    Candidate = candidate,
                    SimilarityScore = score,
                    LevenshteinDistance = CalculateLevenshteinDistance(query, candidate)
                });
            }
        }

        // Sort by similarity score (descending) and take top results
        return results
            .OrderByDescending(r => r.SimilarityScore)
            .ThenBy(r => r.LevenshteinDistance)
            .Take(maxResults)
            .ToList();
    }

    /// <summary>
    /// Check if two strings are similar within a threshold
    /// </summary>
    public bool IsSimilar(string source, string target, double threshold = 0.8)
    {
        var score = CalculateSimilarityScore(source, target);
        return score >= threshold;
    }
}
