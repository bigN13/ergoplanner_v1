using FluentAssertions;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;
using Xunit;

namespace Ergoplanner.Domain.Tests.Entities;

public class InstrumentSymbolTests
{
    [Fact]
    public void Constructor_WithValidParameters_ShouldCreateSuccessfully()
    {
        // Arrange
        var tagNumber = new TagNumber("FIC-101");
        var baseSymbolId = Guid.NewGuid();

        // Act
        var instrumentSymbol = new InstrumentSymbol(
            tagNumber,
            baseSymbolId,
            InstrumentFunction.Flow,
            new List<InstrumentType> { InstrumentType.Indicate, InstrumentType.Control },
            InstrumentLocation.Field,
            "GPM",
            0,
            100);

        // Assert
        instrumentSymbol.TagNumber.Should().Be(tagNumber);
        instrumentSymbol.BaseSymbolId.Should().Be(baseSymbolId);
        instrumentSymbol.PrimaryFunction.Should().Be(InstrumentFunction.Flow);
        instrumentSymbol.SecondaryFunctions.Should().HaveCount(2);
        instrumentSymbol.SecondaryFunctions.Should().Contain(InstrumentType.Indicate);
        instrumentSymbol.SecondaryFunctions.Should().Contain(InstrumentType.Control);
        instrumentSymbol.Location.Should().Be(InstrumentLocation.Field);
        instrumentSymbol.EngineeringUnits.Should().Be("GPM");
        instrumentSymbol.RangeMin.Should().Be(0);
        instrumentSymbol.RangeMax.Should().Be(100);
    }

    [Fact]
    public void Constructor_WithInvalidRange_ShouldThrowArgumentException()
    {
        // Arrange
        var tagNumber = new TagNumber("FIC-101");
        var baseSymbolId = Guid.NewGuid();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => new InstrumentSymbol(
            tagNumber,
            baseSymbolId,
            InstrumentFunction.Flow,
            rangeMin: 100,
            rangeMax: 50)); // Invalid: min > max
    }

    [Fact]
    public void UpdateTagNumber_WithValidTag_ShouldUpdateCorrectly()
    {
        // Arrange
        var originalTag = new TagNumber("FIC-101");
        var newTag = new TagNumber("FT-101");
        var instrumentSymbol = new InstrumentSymbol(originalTag, Guid.NewGuid(), InstrumentFunction.Flow);
        var modifiedBy = "test-user";

        // Act
        instrumentSymbol.UpdateTagNumber(newTag, modifiedBy);

        // Assert
        instrumentSymbol.TagNumber.Should().Be(newTag);
        instrumentSymbol.PrimaryFunction.Should().Be(InstrumentFunction.Flow); // From new tag
        instrumentSymbol.SecondaryFunctions.Should().Contain(InstrumentType.Transmit); // From new tag
        instrumentSymbol.ModifiedBy.Should().Be(modifiedBy);
        instrumentSymbol.ModifiedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetMeasurementRange_WithValidRange_ShouldUpdateCorrectly()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("PT-201"),
            Guid.NewGuid(),
            InstrumentFunction.Pressure);
        var modifiedBy = "test-user";

        // Act
        instrumentSymbol.SetMeasurementRange(0, 150, "PSI", modifiedBy);

        // Assert
        instrumentSymbol.RangeMin.Should().Be(0);
        instrumentSymbol.RangeMax.Should().Be(150);
        instrumentSymbol.EngineeringUnits.Should().Be("PSI");
        instrumentSymbol.ModifiedBy.Should().Be(modifiedBy);
    }

    [Fact]
    public void SetMeasurementRange_WithInvalidRange_ShouldThrowArgumentException()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("PT-201"),
            Guid.NewGuid(),
            InstrumentFunction.Pressure);

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            instrumentSymbol.SetMeasurementRange(150, 100, "PSI", "test-user")); // Invalid: min > max
    }

    [Fact]
    public void SetControlParameters_WithValidValues_ShouldUpdateCorrectly()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("FIC-101"),
            Guid.NewGuid(),
            InstrumentFunction.Flow);
        instrumentSymbol.SetMeasurementRange(0, 100, "GPM", "test-user");
        var modifiedBy = "test-user";

        // Act
        instrumentSymbol.SetControlParameters(
            setPoint: 50,
            alarmHigh: 90,
            alarmLow: 10,
            tripHigh: 95,
            tripLow: 5,
            modifiedBy);

        // Assert
        instrumentSymbol.SetPoint.Should().Be(50);
        instrumentSymbol.AlarmHigh.Should().Be(90);
        instrumentSymbol.AlarmLow.Should().Be(10);
        instrumentSymbol.TripHigh.Should().Be(95);
        instrumentSymbol.TripLow.Should().Be(5);
    }

    [Fact]
    public void SetControlParameters_WithInvalidAlarmValues_ShouldThrowArgumentException()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("FIC-101"),
            Guid.NewGuid(),
            InstrumentFunction.Flow);

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            instrumentSymbol.SetControlParameters(
                setPoint: 50,
                alarmHigh: 10, // Invalid: alarm high < alarm low
                alarmLow: 90,
                tripHigh: null,
                tripLow: null,
                "test-user"));
    }

    [Fact]
    public void SetSafetyClassification_WithValidSIL_ShouldUpdateCorrectly()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("PSH-301"),
            Guid.NewGuid(),
            InstrumentFunction.Pressure);
        var modifiedBy = "test-user";

        // Act
        instrumentSymbol.SetSafetyClassification(
            isSafetyCritical: true,
            safetyIntegrityLevel: 2,
            failureMode: "Fail Safe",
            modifiedBy);

        // Assert
        instrumentSymbol.IsSafetyCritical.Should().BeTrue();
        instrumentSymbol.SafetyIntegrityLevel.Should().Be(2);
        instrumentSymbol.FailureMode.Should().Be("Fail Safe");
    }

    [Fact]
    public void SetSafetyClassification_WithInvalidSIL_ShouldThrowArgumentException()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("PSH-301"),
            Guid.NewGuid(),
            InstrumentFunction.Pressure);

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            instrumentSymbol.SetSafetyClassification(
                isSafetyCritical: true,
                safetyIntegrityLevel: 5, // Invalid: SIL must be 1-4
                failureMode: "Fail Safe",
                "test-user"));
    }

    [Fact]
    public void RequiresCalibration_WithDueDateInFuture_ShouldReturnFalse()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("FT-101"),
            Guid.NewGuid(),
            InstrumentFunction.Flow);
        instrumentSymbol.SetAssetInformation(
            manufacturer: "Test Corp",
            modelNumber: "TEST-123",
            installationDate: DateTime.UtcNow.AddYears(-1),
            calibrationDueDate: DateTime.UtcNow.AddDays(45), // 45 days in future
            "test-user");

        // Act
        var requiresCalibration = instrumentSymbol.RequiresCalibration();

        // Assert
        requiresCalibration.Should().BeFalse();
    }

    [Fact]
    public void RequiresCalibration_WithDueDateWithin30Days_ShouldReturnTrue()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("FT-101"),
            Guid.NewGuid(),
            InstrumentFunction.Flow);
        instrumentSymbol.SetAssetInformation(
            manufacturer: "Test Corp",
            modelNumber: "TEST-123",
            installationDate: DateTime.UtcNow.AddYears(-1),
            calibrationDueDate: DateTime.UtcNow.AddDays(15), // 15 days in future
            "test-user");

        // Act
        var requiresCalibration = instrumentSymbol.RequiresCalibration();

        // Assert
        requiresCalibration.Should().BeTrue();
    }

    [Fact]
    public void IsCalibrationOverdue_WithPastDueDate_ShouldReturnTrue()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("FT-101"),
            Guid.NewGuid(),
            InstrumentFunction.Flow);
        instrumentSymbol.SetAssetInformation(
            manufacturer: "Test Corp",
            modelNumber: "TEST-123",
            installationDate: DateTime.UtcNow.AddYears(-1),
            calibrationDueDate: DateTime.UtcNow.AddDays(-5), // 5 days ago
            "test-user");

        // Act
        var isOverdue = instrumentSymbol.IsCalibrationOverdue();

        // Assert
        isOverdue.Should().BeTrue();
    }

    [Theory]
    [InlineData(50, InstrumentAlarmStatus.Normal)]
    [InlineData(95, InstrumentAlarmStatus.AlarmHigh)]
    [InlineData(5, InstrumentAlarmStatus.AlarmLow)]
    [InlineData(99, InstrumentAlarmStatus.TripHigh)]
    [InlineData(1, InstrumentAlarmStatus.TripLow)]
    public void GetAlarmStatus_WithDifferentValues_ShouldReturnCorrectStatus(
        double currentValue,
        InstrumentAlarmStatus expectedStatus)
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("FIC-101"),
            Guid.NewGuid(),
            InstrumentFunction.Flow);
        instrumentSymbol.SetMeasurementRange(0, 100, "GPM", "test-user");
        instrumentSymbol.SetControlParameters(
            setPoint: 50,
            alarmHigh: 90,
            alarmLow: 10,
            tripHigh: 98,
            tripLow: 2,
            "test-user");

        // Act
        var alarmStatus = instrumentSymbol.GetAlarmStatus(currentValue);

        // Assert
        alarmStatus.Should().Be(expectedStatus);
    }

    [Fact]
    public void IsISACompliant_WithMatchingTagAndFunctions_ShouldReturnTrue()
    {
        // Arrange
        var tagNumber = new TagNumber("FIC-101");
        var instrumentSymbol = new InstrumentSymbol(
            tagNumber,
            Guid.NewGuid(),
            InstrumentFunction.Flow, // Matches 'F' in tag
            new List<InstrumentType> { InstrumentType.Indicate, InstrumentType.Control }); // Matches 'IC' in tag

        // Act
        var isCompliant = instrumentSymbol.IsISACompliant();

        // Assert
        isCompliant.Should().BeTrue();
    }

    [Fact]
    public void IsISACompliant_WithMismatchedFunctions_ShouldReturnFalse()
    {
        // Arrange
        var tagNumber = new TagNumber("FIC-101");
        var instrumentSymbol = new InstrumentSymbol(
            tagNumber,
            Guid.NewGuid(),
            InstrumentFunction.Pressure, // Doesn't match 'F' in tag
            new List<InstrumentType> { InstrumentType.Indicate, InstrumentType.Control });

        // Act
        var isCompliant = instrumentSymbol.IsISACompliant();

        // Assert
        isCompliant.Should().BeFalse();
    }

    [Fact]
    public void GenerateISADescription_ShouldCreateCorrectDescription()
    {
        // Arrange
        var instrumentSymbol = new InstrumentSymbol(
            new TagNumber("FIC-101"),
            Guid.NewGuid(),
            InstrumentFunction.Flow,
            new List<InstrumentType> { InstrumentType.Indicate, InstrumentType.Control },
            InstrumentLocation.Field,
            "GPM",
            0,
            100);

        // Act
        var description = instrumentSymbol.GenerateISADescription();

        // Assert
        description.Should().Be("FIC-101: Flow Indicator/Controller (GPM) Range: 0.0 - 100.0");
    }
}