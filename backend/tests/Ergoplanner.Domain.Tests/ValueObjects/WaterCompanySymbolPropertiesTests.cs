using FluentAssertions;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;
using Xunit;

namespace Ergoplanner.Domain.Tests.ValueObjects;

public class WaterCompanySymbolPropertiesTests
{
    [Fact]
    public void Constructor_WithValidParameters_ShouldCreateSuccessfully()
    {
        // Arrange & Act
        var properties = new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            WaterSymbolCategory.PumpingStation,
            "TW-P-001",
            "2024-R1",
            "Raw Water Intake",
            minFlowRate: 100,
            maxFlowRate: 500,
            pressureRating: 10,
            materialSpecification: "Cast Iron",
            complianceNotes: "Compliant with TW standards",
            isPotableWaterApproved: true,
            requiresWRASApproval: true,
            installationLocation: "Underground",
            telemetryTagPattern: "PS_{LOCATION}_{NUMBER}");

        // Assert
        properties.Standard.Should().Be(WaterCompanyStandard.ThamesWater);
        properties.Category.Should().Be(WaterSymbolCategory.PumpingStation);
        properties.CompanyCode.Should().Be("TW-P-001");
        properties.StandardRevision.Should().Be("2024-R1");
        properties.ProcessApplication.Should().Be("Raw Water Intake");
        properties.MinFlowRate.Should().Be(100);
        properties.MaxFlowRate.Should().Be(500);
        properties.PressureRating.Should().Be(10);
        properties.MaterialSpecification.Should().Be("Cast Iron");
        properties.ComplianceNotes.Should().Be("Compliant with TW standards");
        properties.IsPotableWaterApproved.Should().BeTrue();
        properties.RequiresWRASApproval.Should().BeTrue();
        properties.InstallationLocation.Should().Be("Underground");
        properties.TelemetryTagPattern.Should().Be("PS_{LOCATION}_{NUMBER}");
    }

    [Fact]
    public void Constructor_WithInvalidFlowRates_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new WaterCompanySymbolProperties(
                WaterCompanyStandard.ThamesWater,
                WaterSymbolCategory.PumpingStation,
                "TW-P-001",
                "2024-R1",
                minFlowRate: 500,
                maxFlowRate: 100)); // Min > Max
    }

    [Fact]
    public void Constructor_WithEmptyCompanyCode_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new WaterCompanySymbolProperties(
                WaterCompanyStandard.ThamesWater,
                WaterSymbolCategory.PumpingStation,
                "", // Empty company code
                "2024-R1"));
    }

    [Fact]
    public void Constructor_WithEmptyStandardRevision_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new WaterCompanySymbolProperties(
                WaterCompanyStandard.ThamesWater,
                WaterSymbolCategory.PumpingStation,
                "TW-P-001",
                "")); // Empty standard revision
    }

    [Fact]
    public void CreateThamesWaterSymbol_ShouldCreateWithCorrectPrefix()
    {
        // Act
        var properties = WaterCompanySymbolProperties.CreateThamesWaterSymbol(
            WaterSymbolCategory.WaterTreatment,
            "WT-001",
            "Clarifier");

        // Assert
        properties.Standard.Should().Be(WaterCompanyStandard.ThamesWater);
        properties.CompanyCode.Should().Be("TW-WT-001");
        properties.StandardRevision.Should().Be("TW-2024-R1");
        properties.Category.Should().Be(WaterSymbolCategory.WaterTreatment);
        properties.ProcessApplication.Should().Be("Clarifier");
    }

    [Fact]
    public void CreateSevernTrentSymbol_ShouldCreateWithCorrectPrefix()
    {
        // Act
        var properties = WaterCompanySymbolProperties.CreateSevernTrentSymbol(
            WaterSymbolCategory.Filtration,
            "F-001",
            "Sand Filter");

        // Assert
        properties.Standard.Should().Be(WaterCompanyStandard.SevernTrent);
        properties.CompanyCode.Should().Be("ST-F-001");
        properties.StandardRevision.Should().Be("STW-2024-V2");
        properties.ProcessApplication.Should().Be("Sand Filter");
    }

    [Fact]
    public void CreateWelshWaterSymbol_ShouldCreateWithCorrectPrefix()
    {
        // Act
        var properties = WaterCompanySymbolProperties.CreateWelshWaterSymbol(
            WaterSymbolCategory.ChemicalTreatment,
            "CT-001",
            "Chlorine Dosing");

        // Assert
        properties.Standard.Should().Be(WaterCompanyStandard.WelshWater);
        properties.CompanyCode.Should().Be("DCWW-CT-001");
        properties.StandardRevision.Should().Be("DCWW-2024");
        properties.ProcessApplication.Should().Be("Chlorine Dosing");
    }

    [Fact]
    public void CreateUnitedUtilitiesSymbol_ShouldCreateWithCorrectPrefix()
    {
        // Act
        var properties = WaterCompanySymbolProperties.CreateUnitedUtilitiesSymbol(
            WaterSymbolCategory.SludgeHandling,
            "SH-001",
            "Sludge Thickener");

        // Assert
        properties.Standard.Should().Be(WaterCompanyStandard.UnitedUtilities);
        properties.CompanyCode.Should().Be("UU-SH-001");
        properties.StandardRevision.Should().Be("UU-STD-2024");
    }

    [Fact]
    public void CreateNorthumbrianWaterSymbol_ShouldCreateWithCorrectPrefix()
    {
        // Act
        var properties = WaterCompanySymbolProperties.CreateNorthumbrianWaterSymbol(
            WaterSymbolCategory.AerationMixing,
            "AM-001");

        // Assert
        properties.Standard.Should().Be(WaterCompanyStandard.NorthumbrianWater);
        properties.CompanyCode.Should().Be("NW-AM-001");
        properties.StandardRevision.Should().Be("NWL-2024");
    }

    [Theory]
    [InlineData(WaterCompanyStandard.Generic, WaterCompanyStandard.ThamesWater, true)]
    [InlineData(WaterCompanyStandard.ThamesWater, WaterCompanyStandard.Generic, true)]
    [InlineData(WaterCompanyStandard.ThamesWater, WaterCompanyStandard.ThamesWater, true)]
    [InlineData(WaterCompanyStandard.ThamesWater, WaterCompanyStandard.SouthernWater, true)]
    [InlineData(WaterCompanyStandard.SevernTrent, WaterCompanyStandard.UnitedUtilities, true)]
    [InlineData(WaterCompanyStandard.WelshWater, WaterCompanyStandard.ScottishWater, true)]
    [InlineData(WaterCompanyStandard.ThamesWater, WaterCompanyStandard.WelshWater, false)]
    public void IsCompatibleWith_ShouldReturnExpectedResult(
        WaterCompanyStandard source,
        WaterCompanyStandard target,
        bool expectedCompatibility)
    {
        // Arrange
        var properties = new WaterCompanySymbolProperties(
            source,
            WaterSymbolCategory.PumpingStation,
            "TEST-001",
            "2024");

        // Act
        var isCompatible = properties.IsCompatibleWith(target);

        // Assert
        isCompatible.Should().Be(expectedCompatibility);
    }

    [Theory]
    [InlineData(WaterCompanyStandard.ThamesWater, "Thames Water")]
    [InlineData(WaterCompanyStandard.SevernTrent, "Severn Trent Water")]
    [InlineData(WaterCompanyStandard.WelshWater, "Dŵr Cymru Welsh Water")]
    [InlineData(WaterCompanyStandard.UnitedUtilities, "United Utilities")]
    [InlineData(WaterCompanyStandard.NorthumbrianWater, "Northumbrian Water")]
    [InlineData(WaterCompanyStandard.ScottishWater, "Scottish Water")]
    [InlineData(WaterCompanyStandard.Generic, "Generic")]
    public void GetStandardDisplayName_ShouldReturnCorrectName(
        WaterCompanyStandard standard,
        string expectedDisplayName)
    {
        // Arrange
        var properties = new WaterCompanySymbolProperties(
            standard,
            WaterSymbolCategory.PumpingStation,
            "TEST-001",
            "2024");

        // Act
        var displayName = properties.GetStandardDisplayName();

        // Assert
        displayName.Should().Be(expectedDisplayName);
    }

    [Fact]
    public void Equals_WithSameProperties_ShouldReturnTrue()
    {
        // Arrange
        var props1 = new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            WaterSymbolCategory.PumpingStation,
            "TW-P-001",
            "2024-R1");

        var props2 = new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            WaterSymbolCategory.PumpingStation,
            "TW-P-001",
            "2024-R1");

        // Act & Assert
        props1.Should().Be(props2);
        props1.GetHashCode().Should().Be(props2.GetHashCode());
    }

    [Fact]
    public void Equals_WithDifferentProperties_ShouldReturnFalse()
    {
        // Arrange
        var props1 = new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            WaterSymbolCategory.PumpingStation,
            "TW-P-001",
            "2024-R1");

        var props2 = new WaterCompanySymbolProperties(
            WaterCompanyStandard.SevernTrent,
            WaterSymbolCategory.PumpingStation,
            "ST-P-001",
            "2024-R1");

        // Act & Assert
        props1.Should().NotBe(props2);
    }

    [Fact]
    public void Equals_WithDifferentOptionalProperties_ShouldStillBeEqual()
    {
        // Arrange
        var props1 = new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            WaterSymbolCategory.PumpingStation,
            "TW-P-001",
            "2024-R1",
            processApplication: "Raw Water");

        var props2 = new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            WaterSymbolCategory.PumpingStation,
            "TW-P-001",
            "2024-R1",
            processApplication: "Final Water");

        // Act & Assert
        // Should be equal as ProcessApplication is not part of equality check
        props1.Should().Be(props2);
    }
}