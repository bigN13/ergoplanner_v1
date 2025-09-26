using FluentAssertions;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;
using Xunit;

namespace Ergoplanner.Domain.Tests.ValueObjects;

public class InstrumentConnectionPointTests
{
    [Fact]
    public void CreateAnalogSignalConnection_ShouldCreateCorrectConnection()
    {
        // Act
        var connection = InstrumentConnectionPoint.CreateAnalogSignalConnection(
            "SIGNAL_OUT",
            0, 0, 0,
            "16 AWG",
            isPowerSupply: false);

        // Assert
        connection.Id.Should().Be("SIGNAL_OUT");
        connection.Type.Should().Be(ConnectionType.Signal);
        connection.SignalType.Should().Be(InstrumentSignalType.Analog);
        connection.CurrentRange.Should().Be("4-20mA");
        connection.IsPowerSupply.Should().BeFalse();
        connection.WireSize.Should().Be("16 AWG");
    }

    [Fact]
    public void CreateDigitalConnection_ShouldCreateCorrectConnection()
    {
        // Act
        var connection = InstrumentConnectionPoint.CreateDigitalConnection(
            "COMM_PORT",
            0, 0, 0,
            "HART",
            "18 AWG");

        // Assert
        connection.Id.Should().Be("COMM_PORT");
        connection.Type.Should().Be(ConnectionType.Signal);
        connection.SignalType.Should().Be(InstrumentSignalType.Digital);
        connection.Protocol.Should().Be("HART");
        connection.WireSize.Should().Be("18 AWG");
    }

    [Fact]
    public void CreateProcessConnection_ShouldCreateCorrectConnection()
    {
        // Act
        var connection = InstrumentConnectionPoint.CreateProcessConnection(
            "PROCESS_IN",
            0, 0, 0,
            "1/2\" NPT",
            "150#",
            "Steam");

        // Assert
        connection.Id.Should().Be("PROCESS_IN");
        connection.Type.Should().Be(ConnectionType.ProcessInlet);
        connection.SignalType.Should().Be(InstrumentSignalType.Process);
        connection.Size.Should().Be("1/2\" NPT");
        connection.PressureRating.Should().Be("150#");
        connection.ServiceType.Should().Be("Steam");
        connection.IsProcessConnection.Should().BeTrue();
    }

    [Fact]
    public void CreatePneumaticConnection_ShouldCreateCorrectConnection()
    {
        // Act
        var connection = InstrumentConnectionPoint.CreatePneumaticConnection(
            "PNEUMATIC_OUT",
            0, 0, 0,
            "1/4\"");

        // Assert
        connection.Id.Should().Be("PNEUMATIC_OUT");
        connection.Type.Should().Be(ConnectionType.Signal);
        connection.SignalType.Should().Be(InstrumentSignalType.Pneumatic);
        connection.Size.Should().Be("1/4\"");
        connection.ServiceType.Should().Be("Instrument Air");
    }

    [Fact]
    public void CreatePowerConnection_ShouldCreateCorrectConnection()
    {
        // Act
        var connection = InstrumentConnectionPoint.CreatePowerConnection(
            "POWER_IN",
            0, 0, 0,
            "24VDC",
            "14 AWG");

        // Assert
        connection.Id.Should().Be("POWER_IN");
        connection.Type.Should().Be(ConnectionType.Electrical);
        connection.SignalType.Should().Be(InstrumentSignalType.Power);
        connection.VoltageLevel.Should().Be("24VDC");
        connection.WireSize.Should().Be("14 AWG");
        connection.IsPowerSupply.Should().BeTrue();
    }

    [Fact]
    public void CanConnectTo_WithCompatibleAnalogConnections_ShouldReturnTrue()
    {
        // Arrange
        var transmitterOutput = InstrumentConnectionPoint.CreateAnalogSignalConnection(
            "TX_OUT", 0, 0, 0);
        var controllerInput = InstrumentConnectionPoint.CreateAnalogSignalConnection(
            "CTRL_IN", 0, 0, 180);

        // Act
        var canConnect = transmitterOutput.CanConnectTo(controllerInput);

        // Assert
        canConnect.Should().BeTrue();
    }

    [Fact]
    public void CanConnectTo_WithIncompatibleSignalTypes_ShouldReturnFalse()
    {
        // Arrange
        var analogConnection = InstrumentConnectionPoint.CreateAnalogSignalConnection(
            "ANALOG", 0, 0, 0);
        var pneumaticConnection = InstrumentConnectionPoint.CreatePneumaticConnection(
            "PNEUMATIC", 0, 0, 180);

        // Act
        var canConnect = analogConnection.CanConnectTo(pneumaticConnection);

        // Assert
        canConnect.Should().BeFalse();
    }

    [Fact]
    public void CanConnectTo_WithMismatchedVoltages_ShouldReturnFalse()
    {
        // Arrange
        var power24V = InstrumentConnectionPoint.CreatePowerConnection(
            "POWER_24V", 0, 0, 0, "24VDC");
        var power120V = InstrumentConnectionPoint.CreatePowerConnection(
            "POWER_120V", 0, 0, 180, "120VAC");

        // Act
        var canConnect = power24V.CanConnectTo(power120V);

        // Assert
        canConnect.Should().BeFalse();
    }

    [Fact]
    public void CanConnectTo_WithMismatchedProtocols_ShouldReturnFalse()
    {
        // Arrange
        var hartConnection = InstrumentConnectionPoint.CreateDigitalConnection(
            "HART", 0, 0, 0, "HART");
        var modbusConnection = InstrumentConnectionPoint.CreateDigitalConnection(
            "MODBUS", 0, 0, 180, "Modbus");

        // Act
        var canConnect = hartConnection.CanConnectTo(modbusConnection);

        // Assert
        canConnect.Should().BeFalse();
    }

    [Theory]
    [InlineData(InstrumentSignalType.Process, "Process Line")]
    [InlineData(InstrumentSignalType.Analog, "Instrument Signal Line")]
    [InlineData(InstrumentSignalType.Digital, "Data Link")]
    [InlineData(InstrumentSignalType.Pneumatic, "Pneumatic Signal Line")]
    [InlineData(InstrumentSignalType.Power, "Power Line")]
    public void GetISALineType_ShouldReturnCorrectLineType(
        InstrumentSignalType signalType,
        string expectedLineType)
    {
        // Arrange
        var connection = signalType switch
        {
            InstrumentSignalType.Process => InstrumentConnectionPoint.CreateProcessConnection("TEST", 0, 0, 0, "Generic"),
            InstrumentSignalType.Analog => InstrumentConnectionPoint.CreateAnalogSignalConnection("TEST", 0, 0, 0),
            InstrumentSignalType.Digital => InstrumentConnectionPoint.CreateDigitalConnection("TEST", 0, 0, 0, "HART"),
            InstrumentSignalType.Pneumatic => InstrumentConnectionPoint.CreatePneumaticConnection("TEST", 0, 0, 0),
            InstrumentSignalType.Power => InstrumentConnectionPoint.CreatePowerConnection("TEST", 0, 0, 0, "24VDC"),
            _ => throw new ArgumentException("Unsupported signal type")
        };

        // Act
        var lineType = connection.GetISALineType();

        // Assert
        lineType.Should().Be(expectedLineType);
    }

    [Theory]
    [InlineData(InstrumentSignalType.Process, LineStyle.Solid)]
    [InlineData(InstrumentSignalType.Analog, LineStyle.Dashed)]
    [InlineData(InstrumentSignalType.Digital, LineStyle.DashedDot)]
    [InlineData(InstrumentSignalType.Pneumatic, LineStyle.Dashed)]
    [InlineData(InstrumentSignalType.Power, LineStyle.Solid)]
    public void GetRecommendedLineStyle_ShouldReturnCorrectStyle(
        InstrumentSignalType signalType,
        LineStyle expectedStyle)
    {
        // Arrange
        var connection = signalType switch
        {
            InstrumentSignalType.Process => InstrumentConnectionPoint.CreateProcessConnection("TEST", 0, 0, 0, "Generic"),
            InstrumentSignalType.Analog => InstrumentConnectionPoint.CreateAnalogSignalConnection("TEST", 0, 0, 0),
            InstrumentSignalType.Digital => InstrumentConnectionPoint.CreateDigitalConnection("TEST", 0, 0, 0, "HART"),
            InstrumentSignalType.Pneumatic => InstrumentConnectionPoint.CreatePneumaticConnection("TEST", 0, 0, 0),
            InstrumentSignalType.Power => InstrumentConnectionPoint.CreatePowerConnection("TEST", 0, 0, 0, "24VDC"),
            _ => throw new ArgumentException("Unsupported signal type")
        };

        // Act
        var lineStyle = connection.GetRecommendedLineStyle();

        // Assert
        lineStyle.Should().Be(expectedStyle);
    }

    [Fact]
    public void Constructor_WithAnalogSignalButNoCurrentRange_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new InstrumentConnectionPoint(
                "TEST", ConnectionType.Signal, 0, 0, 0, "Generic",
                InstrumentSignalType.Analog)); // Missing current range
    }

    [Fact]
    public void Constructor_WithDigitalSignalButNoProtocol_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new InstrumentConnectionPoint(
                "TEST", ConnectionType.Signal, 0, 0, 0, "Generic",
                InstrumentSignalType.Digital)); // Missing protocol
    }

    [Fact]
    public void Constructor_WithPowerSignalButNoVoltageLevel_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new InstrumentConnectionPoint(
                "TEST", ConnectionType.Electrical, 0, 0, 0, "Generic",
                InstrumentSignalType.Power)); // Missing voltage level
    }

    [Fact]
    public void Constructor_WithPowerSupplyButNoVoltageLevel_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            new InstrumentConnectionPoint(
                "TEST", ConnectionType.Electrical, 0, 0, 0, "Generic",
                InstrumentSignalType.Analog,
                isPowerSupply: true)); // Power supply without voltage level
    }
}