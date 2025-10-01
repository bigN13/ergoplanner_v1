/**
 * Actuator Overlay Components
 * Reusable SVG components for rendering different actuator types
 */

import React from 'react';

import type {
  ActuatorOverlayProps,
  PneumaticActuatorData,
  ElectricActuatorData,
  HydraulicActuatorData,
  ManualActuatorData,
} from './ActuatorTypes';
import {
  ActuatorType,
  ActuatorAction,
  ActuatorState,
  getFailSafeAbbreviation,
  getActuatorTypeAbbreviation,
  getActuatorStateColor,
} from './ActuatorTypes';

// ============================================================================
// PNEUMATIC ACTUATOR
// ============================================================================

export const PneumaticActuatorOverlay: React.FC<
  ActuatorOverlayProps & { data: PneumaticActuatorData }
> = ({ data, width = 16, height = 10, position = { x: 0, y: 0 }, scale = 1, showLabels = true, compact = false }) => {
  const isSpringReturn = data.action === ActuatorAction.SINGLE_ACTING || data.action === ActuatorAction.SPRING_RETURN;
  const isDiaphragm = data.action === ActuatorAction.SPRING_DIAPHRAGM;
  const state = data.state || ActuatorState.IDLE;
  const stateColor = getActuatorStateColor(state);

  return (
    <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
      {/* Actuator body */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />

      {isDiaphragm ? (
        /* Diaphragm actuator */
        <g>
          {/* Diaphragm casing */}
          <path
            d={`M 0 ${height / 2} Q ${width / 2} 0 ${width} ${height / 2}`}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          {/* Spring if spring-return */}
          {isSpringReturn && (
            <path
              d={`M ${width * 0.3} 2 L ${width * 0.3} 1 L ${width * 0.4} 1.5 L ${width * 0.5} 1 L ${width * 0.6} 1.5 L ${width * 0.7} 1 L ${width * 0.7} 2`}
              stroke="currentColor"
              strokeWidth="0.8"
              fill="none"
            />
          )}
        </g>
      ) : (
        /* Piston actuator */
        <g>
          {/* Piston indicator */}
          <rect
            x={width * 0.1}
            y={height * 0.3}
            width={width * 0.8}
            height={height * 0.4}
            fill="currentColor"
            opacity="0.2"
          />

          {/* Spring if spring-return */}
          {isSpringReturn && (
            <g>
              <path
                d={`M 2 2 L 2 1 L 3 1.5 L 4 1 L 5 1.5 L 6 1 L 6 2`}
                stroke="currentColor"
                strokeWidth="0.8"
                fill="none"
              />
              <rect x="1" y="0.5" width="6" height="1" fill="currentColor" opacity="0.3" />
            </g>
          )}
        </g>
      )}

      {/* Pneumatic ports */}
      {data.action === ActuatorAction.DOUBLE_ACTING ? (
        /* Dual ports for double-acting */
        <g>
          <circle cx={width * 0.25} cy={height} r="1" fill="currentColor" />
          <circle cx={width * 0.75} cy={height} r="1" fill="currentColor" />
        </g>
      ) : (
        /* Single port */
        <circle cx={width * 0.5} cy={height} r="1" fill="currentColor" />
      )}

      {/* Actuator type label */}
      {showLabels && !compact && (
        <text
          x={width / 2}
          y={height / 2 + 1}
          textAnchor="middle"
          fontSize="6"
          fill="currentColor"
          fontWeight="bold"
        >
          {getActuatorTypeAbbreviation(data.type)}
        </text>
      )}

      {/* Fail-safe indicator */}
      {data.failSafe && data.showFailSafe && (
        <text
          x={width / 2}
          y={-1}
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
          fontWeight="bold"
        >
          {getFailSafeAbbreviation(data.failSafe)}
        </text>
      )}

      {/* State indicator */}
      {data.showState && (
        <circle
          cx={width - 2}
          cy={2}
          r="1.5"
          fill={stateColor}
          opacity="0.8"
        />
      )}

      {/* Solenoid indicator */}
      {data.solenoid && (
        <rect
          x={width + 1}
          y={height * 0.3}
          width="3"
          height={height * 0.4}
          rx="0.5"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="white"
        />
      )}
    </g>
  );
};

// ============================================================================
// ELECTRIC ACTUATOR
// ============================================================================

export const ElectricActuatorOverlay: React.FC<
  ActuatorOverlayProps & { data: ElectricActuatorData }
> = ({ data, width = 16, height = 10, position = { x: 0, y: 0 }, scale = 1, showLabels = true, compact = false }) => {
  const state = data.state || ActuatorState.IDLE;
  const stateColor = getActuatorStateColor(state);

  return (
    <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
      {/* Motor housing */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />

      {/* Motor detail */}
      <g>
        {/* Stator representation */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width, height) * 0.35}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />

        {/* Rotor/shaft */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width, height) * 0.15}
          fill="currentColor"
          opacity="0.3"
        />

        {/* Motor phases indicator (3-phase) */}
        {data.phases === 3 && (
          <g>
            <line
              x1={width / 2}
              y1={height / 2 - 2}
              x2={width / 2}
              y2={height / 2 + 2}
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1={width / 2 - 1.7}
              y1={height / 2 + 1}
              x2={width / 2 + 1.7}
              y2={height / 2 - 1}
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </g>
        )}
      </g>

      {/* Electrical connection terminals */}
      <g>
        <rect x="1" y={height - 1} width="2" height="1" fill="currentColor" opacity="0.4" />
        <rect x={width - 3} y={height - 1} width="2" height="1" fill="currentColor" opacity="0.4" />
      </g>

      {/* Actuator type label */}
      {showLabels && !compact && (
        <text
          x={width / 2}
          y={height + 4}
          textAnchor="middle"
          fontSize="5"
          fill="currentColor"
          fontWeight="bold"
        >
          {getActuatorTypeAbbreviation(data.type)}
        </text>
      )}

      {/* Fail-safe indicator */}
      {data.failSafe && data.showFailSafe && (
        <text
          x={width / 2}
          y={-1}
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
          fontWeight="bold"
        >
          {getFailSafeAbbreviation(data.failSafe)}
        </text>
      )}

      {/* State indicator */}
      {data.showState && (
        <circle
          cx={width - 2}
          cy={2}
          r="1.5"
          fill={stateColor}
          opacity="0.8"
        />
      )}

      {/* Manual override handwheel */}
      {data.handwheel && (
        <circle
          cx={width / 2}
          cy={-3}
          r="2.5"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      )}

      {/* Limit switches indicator */}
      {data.limitswitches && (
        <g>
          <rect x="-2" y={height * 0.3} width="1.5" height="2" fill="currentColor" opacity="0.5" />
          <rect x={width + 0.5} y={height * 0.3} width="1.5" height="2" fill="currentColor" opacity="0.5" />
        </g>
      )}
    </g>
  );
};

// ============================================================================
// HYDRAULIC ACTUATOR
// ============================================================================

export const HydraulicActuatorOverlay: React.FC<
  ActuatorOverlayProps & { data: HydraulicActuatorData }
> = ({ data, width = 16, height = 10, position = { x: 0, y: 0 }, scale = 1, showLabels = true, compact = false }) => {
  const isDoubleActing = data.action === ActuatorAction.DOUBLE_ACTING;
  const state = data.state || ActuatorState.IDLE;
  const stateColor = getActuatorStateColor(state);

  return (
    <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
      {/* Cylinder body */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />

      {/* Piston rod */}
      <rect
        x={width * 0.1}
        y={height * 0.35}
        width={width * 0.8}
        height={height * 0.3}
        fill="currentColor"
        opacity="0.3"
      />

      {/* Rod extending from cylinder */}
      <line
        x1={width}
        y1={height / 2}
        x2={width + 4}
        y2={height / 2}
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Hydraulic ports */}
      {isDoubleActing ? (
        /* Dual ports for double-acting */
        <g>
          <circle cx={width * 0.2} cy={height} r="1" fill="currentColor" />
          <circle cx={width * 0.8} cy={height} r="1" fill="currentColor" />
          <text x={width * 0.2} y={height + 3} textAnchor="middle" fontSize="3" fill="currentColor">P1</text>
          <text x={width * 0.8} y={height + 3} textAnchor="middle" fontSize="3" fill="currentColor">P2</text>
        </g>
      ) : (
        /* Single port with spring return */
        <g>
          <circle cx={width * 0.7} cy={height} r="1" fill="currentColor" />
          {/* Spring */}
          <path
            d={`M 2 2 L 2 1 L 3 1.5 L 4 1 L 5 1.5 L 6 1 L 6 2`}
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
        </g>
      )}

      {/* Actuator type label */}
      {showLabels && !compact && (
        <text
          x={width / 2}
          y={height / 2 + 1}
          textAnchor="middle"
          fontSize="6"
          fill="currentColor"
          fontWeight="bold"
        >
          {getActuatorTypeAbbreviation(data.type)}
        </text>
      )}

      {/* Fail-safe indicator */}
      {data.failSafe && data.showFailSafe && (
        <text
          x={width / 2}
          y={-1}
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
          fontWeight="bold"
        >
          {getFailSafeAbbreviation(data.failSafe)}
        </text>
      )}

      {/* State indicator */}
      {data.showState && (
        <circle
          cx={width - 2}
          cy={2}
          r="1.5"
          fill={stateColor}
          opacity="0.8"
        />
      )}

      {/* Pressure indicator */}
      {data.pressure && showLabels && !compact && (
        <text
          x={width / 2}
          y={height + 4}
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
        >
          {data.pressure}PSI
        </text>
      )}
    </g>
  );
};

// ============================================================================
// MANUAL HANDWHEEL
// ============================================================================

export const ManualHandwheelOverlay: React.FC<
  ActuatorOverlayProps & { data: ManualActuatorData }
> = ({ data, width = 12, height = 12, position = { x: 0, y: 0 }, scale = 1, showLabels = true, compact = false }) => {
  const radius = Math.min(width, height) / 2;

  return (
    <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
      {/* Handwheel circle */}
      <circle
        cx={width / 2}
        cy={height / 2}
        r={radius - 1}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />

      {/* Spokes */}
      <line
        x1={width / 2 - (radius - 1)}
        y1={height / 2}
        x2={width / 2 + (radius - 1)}
        y2={height / 2}
        stroke="currentColor"
        strokeWidth="1"
      />
      <line
        x1={width / 2}
        y1={height / 2 - (radius - 1)}
        x2={width / 2}
        y2={height / 2 + (radius - 1)}
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* Hub */}
      <circle
        cx={width / 2}
        cy={height / 2}
        r={radius * 0.3}
        fill="currentColor"
        opacity="0.3"
      />

      {/* Gear indicator if applicable */}
      {data.type === ActuatorType.GEAR && (
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius * 0.6}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeDasharray="1 1"
        />
      )}

      {/* Gear ratio label */}
      {data.gearRatio && showLabels && !compact && (
        <text
          x={width / 2}
          y={height + 4}
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
        >
          {data.gearRatio}:1
        </text>
      )}

      {/* Number of turns indicator */}
      {data.numberOfTurns && showLabels && (
        <text
          x={width / 2}
          y={height / 2 + 1.5}
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
        >
          {data.numberOfTurns}T
        </text>
      )}
    </g>
  );
};

// ============================================================================
// LEVER OPERATOR
// ============================================================================

export const LeverOperatorOverlay: React.FC<
  ActuatorOverlayProps & { data: ManualActuatorData }
> = ({ data, width = 15, height = 4, position = { x: 0, y: 0 }, scale = 1, compact = false }) => {
  const leverAngle = data.position ? (data.position / 100) * 90 : 0; // 0-90 degrees

  return (
    <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
      {/* Lever arm */}
      <line
        x1="0"
        y1={height / 2}
        x2={width * Math.cos((leverAngle * Math.PI) / 180)}
        y2={height / 2 - width * Math.sin((leverAngle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Lever grip */}
      <circle
        cx={width * Math.cos((leverAngle * Math.PI) / 180)}
        cy={height / 2 - width * Math.sin((leverAngle * Math.PI) / 180)}
        r="2"
        fill="currentColor"
      />

      {/* Pivot point */}
      <circle
        cx="0"
        cy={height / 2}
        r="1.5"
        fill="currentColor"
      />
    </g>
  );
};

// ============================================================================
// CHAINWHEEL OPERATOR
// ============================================================================

export const ChainwheelOperatorOverlay: React.FC<
  ActuatorOverlayProps & { data: ManualActuatorData }
> = ({ data, width = 12, height = 12, position = { x: 0, y: 0 }, scale = 1, showLabels = true, compact = false }) => {
  const radius = Math.min(width, height) / 2;

  return (
    <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
      {/* Sprocket wheel */}
      <circle
        cx={width / 2}
        cy={height / 2}
        r={radius - 1}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />

      {/* Sprocket teeth representation */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const x = width / 2 + (radius - 0.5) * Math.cos((angle * Math.PI) / 180);
        const y = height / 2 + (radius - 0.5) * Math.sin((angle * Math.PI) / 180);
        return (
          <rect
            key={i}
            x={x - 0.5}
            y={y - 0.8}
            width="1"
            height="1.6"
            fill="currentColor"
            transform={`rotate(${angle} ${x} ${y})`}
          />
        );
      })}

      {/* Chain representation */}
      <path
        d={`M ${width / 2 + radius + 1} ${height / 2} L ${width / 2 + radius + 1} ${height + 6}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 1"
        fill="none"
      />

      {/* Chain length label */}
      {data.chainLength && showLabels && !compact && (
        <text
          x={width / 2}
          y={height + 4}
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
        >
          {data.chainLength}ft
        </text>
      )}
    </g>
  );
};

// ============================================================================
// ACTUATOR OVERLAY SELECTOR
// ============================================================================

export const ActuatorOverlay: React.FC<ActuatorOverlayProps> = (props) => {
  switch (props.data.type) {
    case ActuatorType.PNEUMATIC:
    case ActuatorType.ELECTRO_PNEUMATIC:
      return <PneumaticActuatorOverlay {...props} data={props.data as PneumaticActuatorData} />;

    case ActuatorType.ELECTRIC:
      return <ElectricActuatorOverlay {...props} data={props.data as ElectricActuatorData} />;

    case ActuatorType.HYDRAULIC:
    case ActuatorType.ELECTRO_HYDRAULIC:
      return <HydraulicActuatorOverlay {...props} data={props.data as HydraulicActuatorData} />;

    case ActuatorType.HANDWHEEL:
    case ActuatorType.GEAR:
    case ActuatorType.MANUAL:
      return <ManualHandwheelOverlay {...props} data={props.data as ManualActuatorData} />;

    case ActuatorType.LEVER:
      return <LeverOperatorOverlay {...props} data={props.data as ManualActuatorData} />;

    case ActuatorType.CHAINWHEEL:
      return <ChainwheelOperatorOverlay {...props} data={props.data as ManualActuatorData} />;

    default:
      return null;
  }
};

export default ActuatorOverlay;
