using FluentAssertions;
using Ergoplanner.Domain.ValueObjects;
using Ergoplanner.Domain.Enums;
using Xunit;

namespace Ergoplanner.Domain.Tests.ValueObjects;

public class TagNumberTests
{
    [Fact]
    public void Constructor_WithValidTagNumber_ShouldCreateSuccessfully()
    {
        // Arrange
        var tagValue = "FIC-101";

        // Act
        var tagNumber = new TagNumber(tagValue);

        // Assert
        tagNumber.Value.Should().Be("FIC-101");
        tagNumber.FirstLetter.Should().Be('F');
        tagNumber.ModifierLetters.Should().Be("IC");
        tagNumber.SequenceNumber.Should().Be(101);
        tagNumber.Suffix.Should().BeNull();
        tagNumber.IncludesHyphen.Should().BeTrue();
        tagNumber.LoopId.Should().Be("FIC");
        tagNumber.PrimaryFunction.Should().Be(InstrumentFunction.Flow);
        tagNumber.SecondaryFunctions.Should().Contain(InstrumentType.Indicate);
        tagNumber.SecondaryFunctions.Should().Contain(InstrumentType.Control);
    }

    [Fact]
    public void Constructor_WithSuffix_ShouldParseCorrectly()
    {
        // Arrange
        var tagValue = "PT-205A";

        // Act
        var tagNumber = new TagNumber(tagValue);

        // Assert
        tagNumber.Value.Should().Be("PT-205A");
        tagNumber.FirstLetter.Should().Be('P');
        tagNumber.ModifierLetters.Should().Be("T");
        tagNumber.SequenceNumber.Should().Be(205);
        tagNumber.Suffix.Should().Be('A');
        tagNumber.PrimaryFunction.Should().Be(InstrumentFunction.Pressure);
        tagNumber.SecondaryFunctions.Should().Contain(InstrumentType.Transmit);
    }

    [Fact]
    public void Constructor_WithoutHyphen_ShouldParseCorrectly()
    {
        // Arrange
        var tagValue = "LAH301";

        // Act
        var tagNumber = new TagNumber(tagValue);

        // Assert
        tagNumber.Value.Should().Be("LAH301");
        tagNumber.FirstLetter.Should().Be('L');
        tagNumber.ModifierLetters.Should().Be("AH");
        tagNumber.SequenceNumber.Should().Be(301);
        tagNumber.IncludesHyphen.Should().BeFalse();
        tagNumber.PrimaryFunction.Should().Be(InstrumentFunction.Level);
        tagNumber.SecondaryFunctions.Should().Contain(InstrumentType.Alarm);
        tagNumber.SecondaryFunctions.Should().Contain(InstrumentType.High);
    }

    [Fact]
    public void Constructor_WithValidSimpleTag_ShouldParseCorrectly()
    {
        // Arrange
        var tagValue = "F123";

        // Act
        var tagNumber = new TagNumber(tagValue);

        // Assert
        tagNumber.Value.Should().Be("F123");
        tagNumber.FirstLetter.Should().Be('F');
        tagNumber.ModifierLetters.Should().Be("");
        tagNumber.SequenceNumber.Should().Be(123);
        tagNumber.IncludesHyphen.Should().BeFalse();
        tagNumber.PrimaryFunction.Should().Be(InstrumentFunction.Flow);
        tagNumber.SecondaryFunctions.Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("ABC")]
    [InlineData("12345")]
    [InlineData("FIC-ABCD")]
    public void Constructor_WithInvalidTagNumber_ShouldThrowArgumentException(string invalidTag)
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => new TagNumber(invalidTag));
    }

    [Fact]
    public void Constructor_FromComponents_ShouldCreateCorrectTag()
    {
        // Act
        var tagNumber = new TagNumber('T', "IC", 101, 'A', includeHyphen: true);

        // Assert
        tagNumber.Value.Should().Be("TIC-101A");
        tagNumber.FirstLetter.Should().Be('T');
        tagNumber.ModifierLetters.Should().Be("IC");
        tagNumber.SequenceNumber.Should().Be(101);
        tagNumber.Suffix.Should().Be('A');
        tagNumber.IncludesHyphen.Should().BeTrue();
    }

    [Fact]
    public void IncrementSequence_ShouldCreateNewTagWithIncrementedNumber()
    {
        // Arrange
        var originalTag = new TagNumber("FIC-101");

        // Act
        var incrementedTag = originalTag.IncrementSequence(5);

        // Assert
        incrementedTag.Value.Should().Be("FIC-106");
        incrementedTag.SequenceNumber.Should().Be(106);
        originalTag.SequenceNumber.Should().Be(101); // Original should be unchanged
    }

    [Fact]
    public void WithSuffix_ShouldCreateNewTagWithSuffix()
    {
        // Arrange
        var originalTag = new TagNumber("PT-205");

        // Act
        var tagWithSuffix = originalTag.WithSuffix('B');

        // Assert
        tagWithSuffix.Value.Should().Be("PT-205B");
        tagWithSuffix.Suffix.Should().Be('B');
        originalTag.Suffix.Should().BeNull(); // Original should be unchanged
    }

    [Fact]
    public void WithModifiers_ShouldCreateNewTagWithDifferentModifiers()
    {
        // Arrange
        var originalTag = new TagNumber("FIC-101");

        // Act
        var modifiedTag = originalTag.WithModifiers("T");

        // Assert
        modifiedTag.Value.Should().Be("FT-101");
        modifiedTag.ModifierLetters.Should().Be("T");
        modifiedTag.SecondaryFunctions.Should().Contain(InstrumentType.Transmit);
        originalTag.ModifierLetters.Should().Be("IC"); // Original should be unchanged
    }

    [Theory]
    [InlineData("FIC-*", "FIC-101", true)]
    [InlineData("FIC-*", "PT-101", false)]
    [InlineData("*IC-101", "FIC-101", true)]
    [InlineData("*IC-101", "TIC-101", true)]
    [InlineData("*IC-101", "FT-101", false)]
    [InlineData("F??-101", "FIC-101", true)]
    [InlineData("F??-101", "FLOW-101", false)]
    public void MatchesPattern_ShouldReturnExpectedResult(string pattern, string tagValue, bool expectedMatch)
    {
        // Arrange
        var tagNumber = new TagNumber(tagValue);

        // Act
        var matches = tagNumber.MatchesPattern(pattern);

        // Assert
        matches.Should().Be(expectedMatch);
    }

    [Fact]
    public void GetNextAvailable_WithNoConflicts_ShouldReturnSameTag()
    {
        // Arrange
        var tagNumber = new TagNumber("FIC-101");
        var existingTags = new HashSet<string> { "FIC-100", "FIC-102" };

        // Act
        var nextAvailable = tagNumber.GetNextAvailable(existingTags);

        // Assert
        nextAvailable.Value.Should().Be("FIC-101");
    }

    [Fact]
    public void GetNextAvailable_WithConflicts_ShouldReturnTagWithSuffix()
    {
        // Arrange
        var tagNumber = new TagNumber("FIC-101");
        var existingTags = new HashSet<string> { "FIC-101", "FIC-101A" };

        // Act
        var nextAvailable = tagNumber.GetNextAvailable(existingTags);

        // Assert
        nextAvailable.Value.Should().Be("FIC-101B");
        nextAvailable.Suffix.Should().Be('B');
    }

    [Fact]
    public void IsISACompliant_WithValidTag_ShouldReturnTrue()
    {
        // Arrange
        var tagNumber = new TagNumber("FIC-101");

        // Act
        var isCompliant = tagNumber.IsISACompliant();

        // Assert
        isCompliant.Should().BeTrue();
    }

    [Theory]
    [InlineData("FIC-101", "FIC-101")]
    [InlineData("fic-101", "FIC-101")]
    [InlineData("FIC101", "FIC101")]
    public void Equals_WithEqualTags_ShouldReturnTrue(string tag1, string tag2)
    {
        // Arrange
        var tagNumber1 = new TagNumber(tag1);
        var tagNumber2 = new TagNumber(tag2);

        // Act & Assert
        tagNumber1.Should().Be(tagNumber2);
        tagNumber1.GetHashCode().Should().Be(tagNumber2.GetHashCode());
    }

    [Fact]
    public void Parse_WithValidString_ShouldReturnTagNumber()
    {
        // Arrange
        var tagValue = "TIC-201";

        // Act
        var tagNumber = TagNumber.Parse(tagValue);

        // Assert
        tagNumber.Value.Should().Be("TIC-201");
    }

    [Fact]
    public void TryParse_WithValidString_ShouldReturnTrueAndTagNumber()
    {
        // Arrange
        var tagValue = "LAH-301";

        // Act
        var success = TagNumber.TryParse(tagValue, out var tagNumber);

        // Assert
        success.Should().BeTrue();
        tagNumber.Should().NotBeNull();
        tagNumber!.Value.Should().Be("LAH-301");
    }

    [Fact]
    public void TryParse_WithInvalidString_ShouldReturnFalseAndNull()
    {
        // Arrange
        var invalidTagValue = "INVALID";

        // Act
        var success = TagNumber.TryParse(invalidTagValue, out var tagNumber);

        // Assert
        success.Should().BeFalse();
        tagNumber.Should().BeNull();
    }

    [Theory]
    [InlineData('F', InstrumentFunction.Flow)]
    [InlineData('P', InstrumentFunction.Pressure)]
    [InlineData('L', InstrumentFunction.Level)]
    [InlineData('T', InstrumentFunction.Temperature)]
    [InlineData('A', InstrumentFunction.Analysis)]
    public void PrimaryFunction_ShouldMapCorrectlyFromFirstLetter(char firstLetter, InstrumentFunction expectedFunction)
    {
        // Arrange & Act
        var tagNumber = new TagNumber(firstLetter, "I", 101);

        // Assert
        tagNumber.PrimaryFunction.Should().Be(expectedFunction);
    }

    [Theory]
    [InlineData("I", InstrumentType.Indicate)]
    [InlineData("C", InstrumentType.Control)]
    [InlineData("T", InstrumentType.Transmit)]
    [InlineData("A", InstrumentType.Alarm)]
    [InlineData("IC", InstrumentType.Indicate, InstrumentType.Control)]
    public void SecondaryFunctions_ShouldMapCorrectlyFromModifierLetters(string modifiers, params InstrumentType[] expectedTypes)
    {
        // Arrange & Act
        var tagNumber = new TagNumber('F', modifiers, 101);

        // Assert
        tagNumber.SecondaryFunctions.Should().HaveCount(expectedTypes.Length);
        foreach (var expectedType in expectedTypes)
        {
            tagNumber.SecondaryFunctions.Should().Contain(expectedType);
        }
    }
}