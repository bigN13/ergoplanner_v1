using System.Text.RegularExpressions;
using Ergoplanner.Domain.Enums;

namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Value object representing an ISA-5.1 compliant instrument tag number
/// Format: [LOOP_ID][FUNCTION_LETTERS][SEQUENCE_NUMBER]
/// Examples: FIC-101, PT-205A, LAH-301
/// </summary>
public class TagNumber : IEquatable<TagNumber>
{
    /// <summary>
    /// Maximum length for a tag number according to ISA-5.1 standards
    /// </summary>
    public const int MaxTagLength = 32;

    /// <summary>
    /// Minimum length for a tag number
    /// </summary>
    public const int MinTagLength = 4;

    /// <summary>
    /// Regular expression pattern for validating ISA-5.1 tag numbers
    /// Pattern: [FIRST_LETTER][MODIFIER_LETTERS][SEQUENCE_NUMBER][SUFFIX]
    /// </summary>
    private static readonly Regex TagPattern = new Regex(
        @"^([ABCDEFGHIJKLMNOPQRSTUVWXYZ])([ABCDEFGHIJKLMNOPQRSTUVWXYZ]{0,3})[-]?(\d{1,4})([ABCDEFGHIJKLMNOPQRSTUVWXYZ]?)$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    /// <summary>
    /// Complete tag number as string (e.g., "FIC-101")
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// First letter indicating the measured variable (F, P, L, T, etc.)
    /// </summary>
    public char FirstLetter { get; }

    /// <summary>
    /// Modifier letters indicating function (I, C, T, A, etc.)
    /// </summary>
    public string ModifierLetters { get; }

    /// <summary>
    /// Numeric sequence/loop number
    /// </summary>
    public int SequenceNumber { get; }

    /// <summary>
    /// Optional suffix letter (A, B, C, etc.) for duplicate tags
    /// </summary>
    public char? Suffix { get; }

    /// <summary>
    /// The instrument function derived from the first letter
    /// </summary>
    public InstrumentFunction PrimaryFunction { get; }

    /// <summary>
    /// The instrument types derived from modifier letters
    /// </summary>
    public List<InstrumentType> SecondaryFunctions { get; }

    /// <summary>
    /// Whether this tag includes a hyphen in formatting
    /// </summary>
    public bool IncludesHyphen { get; }

    /// <summary>
    /// Loop identification prefix (combination of letters before sequence number)
    /// </summary>
    public string LoopId => $"{FirstLetter}{ModifierLetters}";

    /// <summary>
    /// Creates a new TagNumber instance
    /// </summary>
    /// <param name="tagValue">The complete tag number string</param>
    public TagNumber(string tagValue)
    {
        ValidateTagFormat(tagValue);

        var match = TagPattern.Match(tagValue.ToUpperInvariant());
        if (!match.Success)
            throw new ArgumentException($"Invalid tag number format: {tagValue}. Must follow ISA-5.1 standard.", nameof(tagValue));

        FirstLetter = match.Groups[1].Value[0];
        ModifierLetters = match.Groups[2].Value;
        SequenceNumber = int.Parse(match.Groups[3].Value);
        Suffix = match.Groups[4].Success && !string.IsNullOrEmpty(match.Groups[4].Value)
            ? match.Groups[4].Value[0]
            : null;

        IncludesHyphen = tagValue.Contains('-');
        Value = FormatTagNumber();

        PrimaryFunction = GetInstrumentFunction(FirstLetter);
        SecondaryFunctions = GetInstrumentTypes(ModifierLetters);
    }

    /// <summary>
    /// Creates a new TagNumber from components
    /// </summary>
    public TagNumber(
        char firstLetter,
        string modifierLetters,
        int sequenceNumber,
        char? suffix = null,
        bool includeHyphen = true)
    {
        FirstLetter = char.ToUpperInvariant(firstLetter);
        ModifierLetters = modifierLetters?.ToUpperInvariant() ?? string.Empty;
        SequenceNumber = sequenceNumber;
        Suffix = suffix?.ToString().ToUpperInvariant()[0];
        IncludesHyphen = includeHyphen;

        Value = FormatTagNumber();
        ValidateTagFormat(Value);

        PrimaryFunction = GetInstrumentFunction(FirstLetter);
        SecondaryFunctions = GetInstrumentTypes(ModifierLetters);
    }

    /// <summary>
    /// Creates a new TagNumber with incremented sequence number
    /// </summary>
    public TagNumber IncrementSequence(int increment = 1)
    {
        return new TagNumber(FirstLetter, ModifierLetters, SequenceNumber + increment, Suffix, IncludesHyphen);
    }

    /// <summary>
    /// Creates a new TagNumber with a different suffix
    /// </summary>
    public TagNumber WithSuffix(char? newSuffix)
    {
        return new TagNumber(FirstLetter, ModifierLetters, SequenceNumber, newSuffix, IncludesHyphen);
    }

    /// <summary>
    /// Creates a new TagNumber with different modifier letters
    /// </summary>
    public TagNumber WithModifiers(string newModifierLetters)
    {
        return new TagNumber(FirstLetter, newModifierLetters, SequenceNumber, Suffix, IncludesHyphen);
    }

    /// <summary>
    /// Check if this tag number matches a given pattern
    /// </summary>
    public bool MatchesPattern(string pattern)
    {
        if (string.IsNullOrWhiteSpace(pattern))
            return false;

        // Convert pattern to regex (support wildcards)
        var regexPattern = pattern
            .Replace("*", ".*")
            .Replace("?", ".")
            .Replace("#", @"\d");

        return Regex.IsMatch(Value, $"^{regexPattern}$", RegexOptions.IgnoreCase);
    }

    /// <summary>
    /// Get suggested next available tag number in sequence
    /// </summary>
    public TagNumber GetNextAvailable(HashSet<string> existingTags)
    {
        var baseTag = new TagNumber(FirstLetter, ModifierLetters, SequenceNumber, null, IncludesHyphen);

        // Try without suffix first
        if (!existingTags.Contains(baseTag.Value))
            return baseTag;

        // Try with suffixes A, B, C, etc.
        for (char suffix = 'A'; suffix <= 'Z'; suffix++)
        {
            var tagWithSuffix = baseTag.WithSuffix(suffix);
            if (!existingTags.Contains(tagWithSuffix.Value))
                return tagWithSuffix;
        }

        throw new InvalidOperationException($"No available tag numbers found for pattern {LoopId}-{SequenceNumber:D3}");
    }

    /// <summary>
    /// Validate that the tag follows ISA-5.1 conventions
    /// </summary>
    public bool IsISACompliant()
    {
        // Check if first letter is a valid measured variable
        if (!IsValidMeasuredVariable(FirstLetter))
            return false;

        // Check if modifier letters are valid function letters
        foreach (char modifier in ModifierLetters)
        {
            if (!IsValidFunctionLetter(modifier))
                return false;
        }

        // Sequence number should be reasonable range
        if (SequenceNumber < 1 || SequenceNumber > 9999)
            return false;

        return true;
    }

    public bool Equals(TagNumber? other)
    {
        if (other == null) return false;
        if (ReferenceEquals(this, other)) return true;
        return Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);
    }

    public override bool Equals(object? obj)
    {
        return Equals(obj as TagNumber);
    }

    public override int GetHashCode()
    {
        return Value.ToUpperInvariant().GetHashCode();
    }

    public override string ToString()
    {
        return Value;
    }

    public static bool operator ==(TagNumber? left, TagNumber? right)
    {
        return EqualityComparer<TagNumber>.Default.Equals(left, right);
    }

    public static bool operator !=(TagNumber? left, TagNumber? right)
    {
        return !(left == right);
    }

    /// <summary>
    /// Parse a tag number string into a TagNumber object
    /// </summary>
    public static TagNumber Parse(string tagValue)
    {
        return new TagNumber(tagValue);
    }

    /// <summary>
    /// Try to parse a tag number string
    /// </summary>
    public static bool TryParse(string tagValue, out TagNumber? tagNumber)
    {
        try
        {
            tagNumber = new TagNumber(tagValue);
            return true;
        }
        catch
        {
            tagNumber = null;
            return false;
        }
    }

    private string FormatTagNumber()
    {
        var formatted = $"{FirstLetter}{ModifierLetters}";

        if (IncludesHyphen)
            formatted += "-";

        formatted += SequenceNumber.ToString("D3");

        if (Suffix.HasValue)
            formatted += Suffix.Value;

        return formatted;
    }

    private static void ValidateTagFormat(string tagValue)
    {
        if (string.IsNullOrWhiteSpace(tagValue))
            throw new ArgumentException("Tag number cannot be null or empty", nameof(tagValue));

        if (tagValue.Length < MinTagLength)
            throw new ArgumentException($"Tag number must be at least {MinTagLength} characters long", nameof(tagValue));

        if (tagValue.Length > MaxTagLength)
            throw new ArgumentException($"Tag number cannot exceed {MaxTagLength} characters", nameof(tagValue));
    }

    private static InstrumentFunction GetInstrumentFunction(char firstLetter)
    {
        return firstLetter switch
        {
            'A' => InstrumentFunction.Analysis,
            'B' => InstrumentFunction.UserDefined,
            'C' => InstrumentFunction.UserDefined,
            'D' => InstrumentFunction.Density,
            'E' => InstrumentFunction.Electrical,
            'F' => InstrumentFunction.Flow,
            'G' => InstrumentFunction.UserDefined,
            'H' => InstrumentFunction.Hand,
            'I' => InstrumentFunction.Current,
            'J' => InstrumentFunction.UserDefined,
            'K' => InstrumentFunction.Time,
            'L' => InstrumentFunction.Level,
            'M' => InstrumentFunction.Humidity,
            'N' => InstrumentFunction.UserDefined,
            'O' => InstrumentFunction.UserDefined,
            'P' => InstrumentFunction.Pressure,
            'Q' => InstrumentFunction.Quantity,
            'R' => InstrumentFunction.Radiation,
            'S' => InstrumentFunction.Speed,
            'T' => InstrumentFunction.Temperature,
            'U' => InstrumentFunction.Multivariable,
            'V' => InstrumentFunction.Vibration,
            'W' => InstrumentFunction.Weight,
            'X' => InstrumentFunction.Unclassified,
            'Y' => InstrumentFunction.Position,
            'Z' => InstrumentFunction.UserDefined,
            _ => InstrumentFunction.Unclassified
        };
    }

    private static List<InstrumentType> GetInstrumentTypes(string modifierLetters)
    {
        var types = new List<InstrumentType>();

        foreach (char modifier in modifierLetters)
        {
            var type = modifier switch
            {
                'A' => InstrumentType.Alarm,
                'C' => InstrumentType.Control,
                'D' => InstrumentType.Differential,
                'E' => InstrumentType.Element,
                'F' => InstrumentType.Ratio,
                'G' => InstrumentType.Glass,
                'H' => InstrumentType.High,
                'I' => InstrumentType.Indicate,
                'J' => InstrumentType.Scan,
                'K' => InstrumentType.ControlStation,
                'L' => InstrumentType.Low,
                'M' => InstrumentType.Middle,
                'N' => InstrumentType.UserDefined,
                'O' => InstrumentType.UserDefined,
                'P' => InstrumentType.Point,
                'Q' => InstrumentType.Integrate,
                'R' => InstrumentType.Record,
                'S' => InstrumentType.Switch,
                'T' => InstrumentType.Transmit,
                'U' => InstrumentType.Multifunction,
                'V' => InstrumentType.Valve,
                'W' => InstrumentType.Well,
                'X' => InstrumentType.Safety,
                'Y' => InstrumentType.Driver,
                'Z' => InstrumentType.UserDefined,
                _ => InstrumentType.UserDefined
            };

            types.Add(type);
        }

        return types;
    }

    private static bool IsValidMeasuredVariable(char letter)
    {
        // All letters A-Z are valid for measured variables in ISA-5.1
        return char.IsLetter(letter) && char.IsUpper(char.ToUpperInvariant(letter));
    }

    private static bool IsValidFunctionLetter(char letter)
    {
        // All letters A-Z are valid for function letters in ISA-5.1
        return char.IsLetter(letter) && char.IsUpper(char.ToUpperInvariant(letter));
    }
}