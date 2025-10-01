/**
 * Safety and Pressure Relief Valves
 * Safety valves, pressure relief valves, and vacuum relief valves
 */

import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

// ============================================================================
// SAFETY VALVE
// ============================================================================

export interface SafetyValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'safety';

  // Valve specifications
  size?: string;
  setPressure?: number; // PSI or bar
  relievingPressure?: number;
  capacity?: string; // SCFM or kg/h

  // Design features
  safetyValveType?: 'conventional' | 'balanced' | 'pilot-operated';
  spring?: 'single' | 'dual';
  bonnet?: 'open' | 'closed';

  // Operating state
  state?: 'closed' | 'lifting' | 'popping' | 'relieving';
  liftPercentage?: number;

  // Features
  indication?: boolean;
  discharge?: 'atmospheric' | 'piped';

  // Service
  fluid?: string;
  mediaPhase?: 'gas' | 'vapor' | 'liquid' | 'two-phase';
}

export const SafetyValveNode = memo<NodeProps<SafetyValveData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 30,
        y: 55,
        direction: 90,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Pressure inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 30,
        y: 10,
        direction: 270,
        compatible: ['pipe', 'vent'],
        required: true,
        description: 'Relief outlet'
      }
    ];

    const defaultDimensions = {
      width: 60,
      height: 70,
      originX: 30,
      originY: 35,
      scale: 1.0,
      minScale: 0.5,
      maxScale: 3.0,
      maintainAspectRatio: true,
      units: 'px'
    };

    const enhancedData: SafetyValveData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ASME VIII'
    };

    const renderValveContent = (): React.JSX.Element => {
      const state = data.state || 'closed';
      const liftPercentage = data.liftPercentage || (state === 'relieving' ? 100 : state === 'popping' ? 50 : state === 'lifting' ? 25 : 0);
      const discLift = (liftPercentage / 100) * 6;

      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 60 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none"
          >
            {/* Valve body */}
            <path
              d="M 20 50 L 25 40 L 30 35 L 35 40 L 40 50 L 40 60 L 20 60 Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />

            {/* Seat */}
            <ellipse cx="30" cy="40" rx="5" ry="1.5" fill="currentColor" opacity="0.4" />

            {/* Disc - lifts when relieving */}
            <ellipse
              cx="30"
              cy={40 - discLift}
              rx="4.5"
              ry="2"
              fill="currentColor"
              opacity="0.7"
              stroke="currentColor"
              strokeWidth="1"
            />

            {/* Stem */}
            <line
              x1="30"
              y1={38 - discLift}
              x2="30"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Spring */}
            <path
              d="M 28 20 L 28 18 L 29 19 L 30 18 L 31 19 L 32 18 L 32 20"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 28 18 L 28 16 L 29 17 L 30 16 L 31 17 L 32 16 L 32 18"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Spring adjuster */}
            <rect
              x="25"
              y="14"
              width="10"
              height="4"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="white"
            />

            {/* Bonnet */}
            {data.bonnet === 'open' ? (
              <g>
                <path d="M 24 20 L 24 14 L 36 14 L 36 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </g>
            ) : (
              <g>
                <path d="M 24 20 L 24 14 L 36 14 L 36 20" stroke="currentColor" strokeWidth="1.5" fill="white" />
              </g>
            )}

            {/* Outlet horn/nozzle */}
            <path
              d="M 28 35 L 26 15 L 34 15 L 32 35"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="white"
            />

            {/* Discharge piping indicator */}
            {data.discharge === 'piped' && (
              <rect x="26" y="8" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
            )}

            {/* Inlet connection */}
            <rect x="25" y="60" width="10" height="8" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Set pressure label */}
            <text x="45" y="35" fontSize="6" fill="currentColor" opacity="0.6">
              {data.setPressure ? `${data.setPressure}` : 'SET'}
            </text>

            {/* Valve state color indicator */}
            <circle
              cx="15"
              cy="15"
              r="3"
              fill={
                state === 'relieving' ? '#ef4444' :
                state === 'popping' || state === 'lifting' ? '#f59e0b' :
                '#10b981'
              }
              opacity="0.8"
            />

            {/* Pilot operated indicator */}
            {data.valveType === 'pilot-operated' && (
              <g>
                <rect x="38" y="25" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="white" />
                <text x="42" y="29" textAnchor="middle" fontSize="4" fill="currentColor">P</text>
              </g>
            )}
          </svg>
        </div>
      );
    };

    return (
      <BaseSymbolNode
        id={id}
        data={enhancedData}
        selected={selected}
        dragging={dragging}
        renderCustomContent={renderValveContent}
      />
    );
  }
);

SafetyValveNode.displayName = 'SafetyValveNode';

// ============================================================================
// PRESSURE RELIEF VALVE
// ============================================================================

export interface PressureReliefValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'pressure-relief';

  // Valve specifications
  size?: string;
  setPressure?: number;
  reseatPressure?: number;
  capacity?: string;

  // Design features
  reliefType?: 'direct-acting' | 'pilot-operated' | 'proportional';
  action?: 'poppet' | 'spool' | 'diaphragm';

  // Operating state
  state?: 'closed' | 'modulating' | 'wide-open';
  flowPercentage?: number;

  // Features
  indication?: boolean;
  returnLine?: boolean;

  // Service
  fluid?: string;
  application?: 'hydraulic' | 'pneumatic' | 'process';
}

export const PressureReliefValveNode = memo<NodeProps<PressureReliefValveData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 15,
        y: 35,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Pressure inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 45,
        y: 35,
        direction: 0,
        compatible: ['pipe', 'return'],
        required: false,
        description: 'Relief outlet'
      },
      ...(data.returnLine ? [{
        id: 'return',
        type: 'outlet' as const,
        x: 30,
        y: 50,
        direction: 90,
        compatible: ['pipe', 'tank'],
        required: true,
        description: 'Return to tank'
      }] : [])
    ];

    const defaultDimensions = {
      width: 60,
      height: 60,
      originX: 30,
      originY: 30,
      scale: 1.0,
      minScale: 0.5,
      maxScale: 3.0,
      maintainAspectRatio: true,
      units: 'px'
    };

    const enhancedData: PressureReliefValveData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISO-4414'
    };

    const renderValveContent = (): React.JSX.Element => {
      const state = data.state || 'closed';
      const flowPercentage = data.flowPercentage || (state === 'wide-open' ? 100 : state === 'modulating' ? 50 : 0);

      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none"
          >
            {/* Valve body (square/rectangular) */}
            <rect
              x="20"
              y="25"
              width="20"
              height="15"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />

            {/* Spring chamber */}
            <rect
              x="24"
              y="15"
              width="12"
              height="10"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="white"
            />

            {/* Spring */}
            <path
              d="M 28 16 L 28 14 L 29 15 L 30 14 L 31 15 L 32 14 L 32 16"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Adjustment screw */}
            <rect x="28" y="12" width="4" height="3" fill="currentColor" opacity="0.5" />

            {/* Poppet/spool - position based on state */}
            <rect
              x="27"
              y={state === 'wide-open' ? 28 : state === 'modulating' ? 30 : 32}
              width="6"
              height="6"
              fill="currentColor"
              opacity="0.7"
              stroke="currentColor"
              strokeWidth="1"
            />

            {/* Stem */}
            <line
              x1="30"
              y1={state === 'wide-open' ? 25 : state === 'modulating' ? 27 : 29}
              x2="30"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Inlet port */}
            <rect x="10" y="30" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Outlet/return port */}
            {data.returnLine ? (
              <rect x="27" y="40" width="6" height="10" stroke="currentColor" strokeWidth="1.5" fill="white" />
            ) : (
              <rect x="38" y="30" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
            )}

            {/* Flow path indicator */}
            {state !== 'closed' && (
              <path
                d="M 22 33 L 38 33"
                stroke="#f59e0b"
                strokeWidth="2"
                opacity={flowPercentage / 100}
                markerEnd="url(#arrowhead-relief)"
              />
            )}

            {/* Pilot operated indicator */}
            {data.reliefType === 'pilot-operated' && (
              <g>
                <rect x="40" y="18" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="white" />
                <line x1="40" y1="21" x2="36" y2="21" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
                <text x="44" y="22" textAnchor="middle" fontSize="4" fill="currentColor">P</text>
              </g>
            )}

            {/* Proportional indicator */}
            {data.reliefType === 'proportional' && (
              <text x="30" y="50" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">
                PROP
              </text>
            )}

            {/* Valve state color indicator */}
            <circle
              cx="15"
              cy="15"
              r="2.5"
              fill={
                state === 'wide-open' ? '#ef4444' :
                state === 'modulating' ? '#f59e0b' :
                '#10b981'
              }
              opacity="0.8"
            />

            {/* Set pressure label */}
            {data.setPressure && (
              <text x="47" y="14" fontSize="5" fill="currentColor" opacity="0.6">
                {data.setPressure}
              </text>
            )}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead-relief"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon
                  points="0 0, 6 2, 0 4"
                  fill="#f59e0b"
                />
              </marker>
            </defs>
          </svg>
        </div>
      );
    };

    return (
      <BaseSymbolNode
        id={id}
        data={enhancedData}
        selected={selected}
        dragging={dragging}
        renderCustomContent={renderValveContent}
      />
    );
  }
);

PressureReliefValveNode.displayName = 'PressureReliefValveNode';

// ============================================================================
// VACUUM RELIEF VALVE
// ============================================================================

export interface VacuumReliefValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'vacuum-relief';

  size?: string;
  setPressure?: number; // Vacuum setpoint (negative pressure)

  state?: 'closed' | 'open';

  endConnections?: 'flanged' | 'threaded' | 'socket-weld';
}

export const VacuumReliefValveNode = memo<NodeProps<VacuumReliefValveData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'vessel',
        type: 'inlet' as const,
        x: 30,
        y: 55,
        direction: 90,
        compatible: ['pipe', 'vessel'],
        required: true,
        description: 'Vessel connection'
      },
      {
        id: 'atmosphere',
        type: 'inlet' as const,
        x: 30,
        y: 10,
        direction: 270,
        compatible: ['vent'],
        required: true,
        description: 'Atmospheric inlet'
      }
    ];

    const defaultDimensions = {
      width: 60,
      height: 70,
      originX: 30,
      originY: 35,
      scale: 1.0,
      minScale: 0.5,
      maxScale: 3.0,
      maintainAspectRatio: true,
      units: 'px'
    };

    const enhancedData: VacuumReliefValveData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'API-2000'
    };

    const renderValveContent = (): React.JSX.Element => {
      const state = data.state || 'closed';

      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 60 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none"
          >
            {/* Valve body */}
            <path
              d="M 20 20 L 25 30 L 25 50 L 35 50 L 35 30 L 40 20 Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />

            {/* Seat */}
            <ellipse cx="30" cy="30" rx="5" ry="1.5" fill="currentColor" opacity="0.4" />

            {/* Pallet/disc - lifts upward when vacuum exists */}
            <ellipse
              cx="30"
              cy={state === 'open' ? 26 : 30}
              rx="4.5"
              ry="2"
              fill="currentColor"
              opacity="0.7"
              stroke="currentColor"
              strokeWidth="1"
            />

            {/* Guide rod */}
            <line
              x1="30"
              y1={state === 'open' ? 24 : 28}
              x2="30"
              y2="18"
              stroke="currentColor"
              strokeWidth="1.5"
            />

            {/* Weight */}
            <rect
              x="27"
              y="16"
              width="6"
              height="4"
              fill="currentColor"
              opacity="0.6"
            />

            {/* Atmospheric inlet */}
            <rect x="26" y="8" width="8" height="10" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Vessel connection */}
            <rect x="25" y="50" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Flow arrow (downward when relieving) */}
            {state === 'open' && (
              <path
                d="M 30 12 L 30 16"
                stroke="#10b981"
                strokeWidth="2"
                markerEnd="url(#arrowhead-vacuum)"
              />
            )}

            {/* Vacuum indicator */}
            <text x="45" y="35" fontSize="6" fill="currentColor" opacity="0.6">
              VAC
            </text>

            {/* Valve state color indicator */}
            <circle
              cx="15"
              cy="15"
              r="2.5"
              fill={state === 'open' ? '#10b981' : '#6b7280'}
              opacity="0.8"
            />

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead-vacuum"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon
                  points="0 0, 6 2, 0 4"
                  fill="#10b981"
                />
              </marker>
            </defs>
          </svg>
        </div>
      );
    };

    return (
      <BaseSymbolNode
        id={id}
        data={enhancedData}
        selected={selected}
        dragging={dragging}
        renderCustomContent={renderValveContent}
      />
    );
  }
);

VacuumReliefValveNode.displayName = 'VacuumReliefValveNode';

export default {
  SafetyValveNode,
  PressureReliefValveNode,
  VacuumReliefValveNode,
};
