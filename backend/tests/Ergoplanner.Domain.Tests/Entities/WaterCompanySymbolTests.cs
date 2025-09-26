using FluentAssertions;
using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;
using Xunit;

namespace Ergoplanner.Domain.Tests.Entities;

public class WaterCompanySymbolTests
{
    [Fact]
    public void Constructor_WithValidParameters_ShouldCreateSuccessfully()
    {
        // Arrange
        var baseSymbolId = Guid.NewGuid();
        var properties = WaterCompanySymbolProperties.CreateThamesWaterSymbol(
            WaterSymbolCategory.PumpingStation,
            "P-001",
            "Raw Water Intake");

        // Act
        var symbol = new WaterCompanySymbol(baseSymbolId, properties, "Underground installation only");

        // Assert
        symbol.BaseSymbolId.Should().Be(baseSymbolId);
        symbol.Properties.Should().Be(properties);
        symbol.UsageRestrictions.Should().Be("Underground installation only");
        symbol.IsActive.Should().BeTrue();
        symbol.IsSuperseded.Should().BeFalse();
        symbol.StandardMappings.Should().BeEmpty();
        symbol.Certifications.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithEmptyBaseSymbolId_ShouldThrowArgumentException()
    {
        // Arrange
        var properties = WaterCompanySymbolProperties.CreateThamesWaterSymbol(
            WaterSymbolCategory.PumpingStation,
            "P-001");

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new WaterCompanySymbol(Guid.Empty, properties));
    }

    [Fact]
    public void AddStandardMapping_WithValidMapping_ShouldAddSuccessfully()
    {
        // Arrange
        var symbol = CreateTestSymbol(WaterCompanyStandard.ThamesWater);
        var targetSymbolId = Guid.NewGuid();
        var modifiedBy = "test-user";

        // Act
        symbol.AddStandardMapping(WaterCompanyStandard.SevernTrent, targetSymbolId, modifiedBy);

        // Assert
        symbol.StandardMappings.Should().ContainKey(WaterCompanyStandard.SevernTrent);
        symbol.StandardMappings[WaterCompanyStandard.SevernTrent].Should().Be(targetSymbolId);
        symbol.ModifiedBy.Should().Be(modifiedBy);
    }

    [Fact]
    public void AddStandardMapping_ToSameStandard_ShouldThrowArgumentException()
    {
        // Arrange
        var symbol = CreateTestSymbol(WaterCompanyStandard.ThamesWater);
        var targetSymbolId = Guid.NewGuid();

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            symbol.AddStandardMapping(WaterCompanyStandard.ThamesWater, targetSymbolId, "test-user"));
    }

    [Fact]
    public void AddCertification_WithValidCertification_ShouldAddSuccessfully()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var certification = new WaterComplianceCertification(
            "WRAS",
            "WRAS-2024-12345",
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(5),
            "Water Regulations Advisory Scheme");
        var modifiedBy = "test-user";

        // Act
        symbol.AddCertification(certification, modifiedBy);

        // Assert
        symbol.Certifications.Should().Contain(certification);
        symbol.Certifications.Should().HaveCount(1);
        symbol.ModifiedBy.Should().Be(modifiedBy);
    }

    [Fact]
    public void AddCertification_DuplicateType_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var cert1 = new WaterComplianceCertification(
            "WRAS",
            "WRAS-2024-001",
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(5),
            "WRAS");
        var cert2 = new WaterComplianceCertification(
            "WRAS",
            "WRAS-2024-002",
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(5),
            "WRAS");

        symbol.AddCertification(cert1, "test-user");

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() =>
            symbol.AddCertification(cert2, "test-user"));
    }

    [Fact]
    public void ValidateSymbol_ShouldUpdateValidationInfo()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var validatedBy = "QA Team";
        var notes = "Validated against Thames Water Standard 2024";

        // Act
        symbol.ValidateSymbol(validatedBy, notes);

        // Assert
        symbol.LastValidatedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        symbol.ValidatedBy.Should().Be(validatedBy);
        symbol.ChangeNotes.Should().Be(notes);
    }

    [Fact]
    public void MarkAsSuperseded_WithValidParameters_ShouldMarkCorrectly()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var newSymbolId = Guid.NewGuid();
        var changeNotes = "Updated to new standard revision";
        var modifiedBy = "test-user";

        // Act
        symbol.MarkAsSuperseded(newSymbolId, changeNotes, modifiedBy);

        // Assert
        symbol.IsSuperseded.Should().BeTrue();
        symbol.SupersededById.Should().Be(newSymbolId);
        symbol.ChangeNotes.Should().Be(changeNotes);
        symbol.IsActive.Should().BeFalse();
    }

    [Fact]
    public void MarkAsSuperseded_WithSelfReference_ShouldThrowArgumentException()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var symbolId = symbol.Id;

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            symbol.MarkAsSuperseded(symbolId, "notes", "test-user"));
    }

    [Fact]
    public void Deactivate_ShouldSetInactiveWithReason()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var reason = "Symbol withdrawn from standard";
        var modifiedBy = "test-user";

        // Act
        symbol.Deactivate(reason, modifiedBy);

        // Assert
        symbol.IsActive.Should().BeFalse();
        symbol.UsageRestrictions.Should().Be($"DEACTIVATED: {reason}");
    }

    [Fact]
    public void Reactivate_ShouldSetActiveAndClearDeactivationReason()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        symbol.Deactivate("Temporary withdrawal", "test-user");

        // Act
        symbol.Reactivate("test-user");

        // Assert
        symbol.IsActive.Should().BeTrue();
        symbol.UsageRestrictions.Should().BeNull();
    }

    [Fact]
    public void CanConvertToStandard_WithMappedStandard_ShouldReturnTrue()
    {
        // Arrange
        var symbol = CreateTestSymbol(WaterCompanyStandard.ThamesWater);
        symbol.AddStandardMapping(WaterCompanyStandard.SevernTrent, Guid.NewGuid(), "test-user");

        // Act
        var canConvert = symbol.CanConvertToStandard(WaterCompanyStandard.SevernTrent);

        // Assert
        canConvert.Should().BeTrue();
    }

    [Fact]
    public void CanConvertToStandard_ToSameStandard_ShouldReturnFalse()
    {
        // Arrange
        var symbol = CreateTestSymbol(WaterCompanyStandard.ThamesWater);

        // Act
        var canConvert = symbol.CanConvertToStandard(WaterCompanyStandard.ThamesWater);

        // Assert
        canConvert.Should().BeFalse();
    }

    [Fact]
    public void GetMappedSymbolId_WithExistingMapping_ShouldReturnId()
    {
        // Arrange
        var symbol = CreateTestSymbol(WaterCompanyStandard.ThamesWater);
        var targetId = Guid.NewGuid();
        symbol.AddStandardMapping(WaterCompanyStandard.SevernTrent, targetId, "test-user");

        // Act
        var mappedId = symbol.GetMappedSymbolId(WaterCompanyStandard.SevernTrent);

        // Assert
        mappedId.Should().Be(targetId);
    }

    [Fact]
    public void GetMappedSymbolId_WithoutMapping_ShouldReturnNull()
    {
        // Arrange
        var symbol = CreateTestSymbol(WaterCompanyStandard.ThamesWater);

        // Act
        var mappedId = symbol.GetMappedSymbolId(WaterCompanyStandard.WelshWater);

        // Assert
        mappedId.Should().BeNull();
    }

    [Fact]
    public void HasValidCertifications_WithValidCerts_ShouldReturnTrue()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var certification = new WaterComplianceCertification(
            "WRAS",
            "WRAS-2024-12345",
            DateTime.UtcNow.AddDays(-30),
            DateTime.UtcNow.AddYears(5),
            "WRAS");
        symbol.AddCertification(certification, "test-user");

        // Act
        var hasValid = symbol.HasValidCertifications();

        // Assert
        hasValid.Should().BeTrue();
    }

    [Fact]
    public void HasValidCertifications_WithExpiredCerts_ShouldReturnFalse()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var certification = new WaterComplianceCertification(
            "WRAS",
            "WRAS-2020-12345",
            DateTime.UtcNow.AddYears(-5),
            DateTime.UtcNow.AddDays(-1), // Expired yesterday
            "WRAS");
        symbol.AddCertification(certification, "test-user");

        // Act
        var hasValid = symbol.HasValidCertifications();

        // Assert
        hasValid.Should().BeFalse();
    }

    [Fact]
    public void RequiresWRASApproval_WhenPotableWaterApproved_ShouldReturnTrue()
    {
        // Arrange
        var properties = new WaterCompanySymbolProperties(
            WaterCompanyStandard.ThamesWater,
            WaterSymbolCategory.WaterTreatment,
            "TW-WT-001",
            "2024",
            isPotableWaterApproved: true);
        var symbol = new WaterCompanySymbol(Guid.NewGuid(), properties);

        // Act
        var requiresWRAS = symbol.RequiresWRASApproval();

        // Assert
        requiresWRAS.Should().BeTrue();
    }

    [Fact]
    public void HasWRASCertification_WithValidWRAS_ShouldReturnTrue()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var certification = new WaterComplianceCertification(
            "WRAS",
            "WRAS-2024-12345",
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(5),
            "WRAS");
        symbol.AddCertification(certification, "test-user");

        // Act
        var hasWRAS = symbol.HasWRASCertification();

        // Assert
        hasWRAS.Should().BeTrue();
    }

    [Fact]
    public void UpdateTypicalSpecification_ShouldUpdateSuccessfully()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var specification = new EquipmentSpecification(
            "Centrifugal Pump",
            "100 m³/h",
            powerRequirement: 15.5,
            efficiency: 85);
        var modifiedBy = "test-user";

        // Act
        symbol.UpdateTypicalSpecification(specification, modifiedBy);

        // Assert
        symbol.TypicalSpecification.Should().Be(specification);
        symbol.TypicalSpecification!.EquipmentType.Should().Be("Centrifugal Pump");
        symbol.TypicalSpecification.PowerRequirement.Should().Be(15.5);
        symbol.ModifiedBy.Should().Be(modifiedBy);
    }

    [Fact]
    public void AddDocumentationReference_ShouldAddSuccessfully()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var reference = "TW-DWG-2024-001";
        var modifiedBy = "test-user";

        // Act
        symbol.AddDocumentationReference(reference, modifiedBy);

        // Assert
        symbol.DocumentationReferences.Should().Contain(reference);
        symbol.DocumentationReferences.Should().HaveCount(1);
    }

    [Fact]
    public void AddDocumentationReference_Duplicate_ShouldNotAddAgain()
    {
        // Arrange
        var symbol = CreateTestSymbol();
        var reference = "TW-DWG-2024-001";
        symbol.AddDocumentationReference(reference, "test-user");

        // Act
        symbol.AddDocumentationReference(reference, "test-user");

        // Assert
        symbol.DocumentationReferences.Should().HaveCount(1);
    }

    private static WaterCompanySymbol CreateTestSymbol(WaterCompanyStandard standard = WaterCompanyStandard.ThamesWater)
    {
        var properties = standard switch
        {
            WaterCompanyStandard.ThamesWater => WaterCompanySymbolProperties.CreateThamesWaterSymbol(
                WaterSymbolCategory.PumpingStation, "P-001"),
            WaterCompanyStandard.SevernTrent => WaterCompanySymbolProperties.CreateSevernTrentSymbol(
                WaterSymbolCategory.WaterTreatment, "WT-001"),
            WaterCompanyStandard.WelshWater => WaterCompanySymbolProperties.CreateWelshWaterSymbol(
                WaterSymbolCategory.Filtration, "F-001"),
            _ => WaterCompanySymbolProperties.CreateUnitedUtilitiesSymbol(
                WaterSymbolCategory.ChemicalTreatment, "CT-001")
        };

        return new WaterCompanySymbol(Guid.NewGuid(), properties);
    }
}