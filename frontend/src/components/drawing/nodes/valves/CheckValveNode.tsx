import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface CheckValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'check';

  // Valve specifications
  size?: string; // e.g., "DN50", "2 inch"
  rating?: string; // e.g., "PN16", "Class 150"
  material?: string; // e.g., "CS", "SS316", "Bronze"

  // Check valve type
  checkType?: 'swing' | 'lift' | 'dual-plate' | 'tilting-disc' | 'ball' | 'piston' | 'diaphragm' | 'duckbill';

  // Design features
  orientation?: 'horizontal' | 'vertical-up' | 'vertical-down';
  spring?: boolean; // Spring assisted
  silent?: boolean; // Silent/nozzle check
  dashpot?: boolean; // Cushioned closing
  endConnections?: 'flanged' | 'threaded' | 'socket-weld' | 'butt-weld' | 'wafer';

  // Operating state
  state?: 'open' | 'closed' | 'cracking';
  crackingPressure?: number;

  // Features
  indication?: boolean;
  position?: 'horizontal' | 'vertical';

  // Service conditions
  temperature?: string;
  pressure?: string;
  fluid?: string;
  slammingPrevention?: boolean;
}

const CheckValveNode = memo<NodeProps<CheckValveData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for check valve
  const defaultConnectionPoints = [
    {
      id: 'inlet',
      type: 'inlet' as const,
      x: 15,
      y: 30,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Flow inlet'
    },
    {
      id: 'outlet',
      type: 'outlet' as const,
      x: 45,
      y: 30,
      direction: 0, // Right side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Flow outlet'
    }
  ];

  // Default dimensions
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

  // Enhanced data with defaults
  const enhancedData: CheckValveData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content for check valve
  const renderValveContent = (): React.JSX.Element => {
    const checkType = data.checkType || 'swing';
    const state = data.state || 'closed';
    const spring = data.spring || false;

    // Swing angle calculation
    const swingAngle = state === 'open' ? 60 : state === 'cracking' ? 20 : 0;

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
          {checkType === 'swing' ? (
            /* Swing Check Valve */
            <g>
              {/* Valve body */}
              <circle cx="30" cy="30" r="12" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Hinge point */}
              <circle cx="30" cy="20" r="2" fill="currentColor" />

              {/* Disc with hinge - swings based on state */}
              <g transform={`rotate(${swingAngle} 30 20)`}>
                <path
                  d="M 25 20 L 25 38 L 35 38 L 35 20"
                  fill="currentColor"
                  opacity="0.7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                {/* Disc arm */}
                <rect x="28" y="18" width="4" height="3" fill="currentColor" />
              </g>

              {/* Stop */}
              <line x1="22" y1="38" x2="38" y2="38" stroke="currentColor" strokeWidth="2" />

              {/* Spring if specified */}
              {spring && (
                <path
                  d="M 26 40 Q 28 42 30 40 Q 32 38 34 40"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
              )}
            </g>
          ) : checkType === 'lift' ? (
            /* Lift Check Valve */
            <g>
              {/* Valve body (globe-like) */}
              <circle cx="30" cy="32" r="12" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Seat */}
              <ellipse cx="30" cy="35" rx="5" ry="2" fill="currentColor" opacity="0.3" />

              {/* Disc/piston - lifts vertically */}
              <ellipse
                cx="30"
                cy={state === 'open' ? 28 : state === 'cracking' ? 32 : 35}
                rx="4.5"
                ry="2"
                fill="currentColor"
                opacity="0.7"
                stroke="currentColor"
                strokeWidth="1"
              />

              {/* Guide stem */}
              <line
                x1="30"
                y1={state === 'open' ? 26 : state === 'cracking' ? 30 : 33}
                x2="30"
                y2="22"
                stroke="currentColor"
                strokeWidth="1.5"
              />

              {/* Bonnet/cover */}
              <rect x="24" y="18" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="white" />

              {/* Spring if specified */}
              {spring && (
                <g>
                  <path
                    d="M 28 24 L 28 22 L 29 23 L 30 22 L 31 23 L 32 22 L 32 24"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                  />
                </g>
              )}
            </g>
          ) : checkType === 'dual-plate' ? (
            /* Dual Plate (Wafer) Check Valve */
            <g>
              {/* Valve body (thin wafer) */}
              <circle cx="30" cy="30" r="14" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Center hinge pin */}
              <rect x="28" y="15" width="4" height="30" fill="currentColor" opacity="0.3" />
              <circle cx="30" cy="30" r="2.5" fill="currentColor" />

              {/* Left plate */}
              <g transform={`rotate(${state === 'open' ? -45 : state === 'cracking' ? -15 : 0} 30 30)`}>
                <path
                  d="M 23 28 L 23 32 L 28 32 L 28 28 Z"
                  fill="currentColor"
                  opacity="0.7"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </g>

              {/* Right plate */}
              <g transform={`rotate(${state === 'open' ? 45 : state === 'cracking' ? 15 : 0} 30 30)`}>
                <path
                  d="M 32 28 L 32 32 L 37 32 L 37 28 Z"
                  fill="currentColor"
                  opacity="0.7"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </g>

              {/* Springs if specified */}
              {spring && (
                <g>
                  <path d="M 20 28 Q 22 26 24 28" stroke="currentColor" strokeWidth="0.8" fill="none" />
                  <path d="M 40 28 Q 38 26 36 28" stroke="currentColor" strokeWidth="0.8" fill="none" />
                </g>
              )}
            </g>
          ) : checkType === 'tilting-disc' ? (
            /* Tilting Disc Check Valve */
            <g>
              {/* Valve body */}
              <circle cx="30" cy="30" r="13" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Hinge pin */}
              <line x1="25" y1="22" x2="35" y2="38" stroke="currentColor" strokeWidth="2" />
              <circle cx="25" cy="22" r="2" fill="currentColor" />
              <circle cx="35" cy="38" r="2" fill="currentColor" />

              {/* Tilting disc */}
              <g transform={`rotate(${state === 'open' ? 40 : state === 'cracking' ? 15 : 0} 30 30)`}>
                <ellipse
                  cx="30"
                  cy="30"
                  rx="10"
                  ry="2"
                  fill="currentColor"
                  opacity="0.7"
                  stroke="currentColor"
                  strokeWidth="1"
                  transform="rotate(-20 30 30)"
                />
              </g>
            </g>
          ) : checkType === 'ball' ? (
            /* Ball Check Valve */
            <g>
              {/* Valve body */}
              <circle cx="30" cy="30" r="12" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Seat */}
              <ellipse cx="30" cy="36" rx="6" ry="2.5" fill="currentColor" opacity="0.3" />

              {/* Ball */}
              <circle
                cx="30"
                cy={state === 'open' ? 26 : state === 'cracking' ? 32 : 34}
                r="5"
                fill="currentColor"
                opacity="0.6"
                stroke="currentColor"
                strokeWidth="1"
              />

              {/* Cage */}
              <rect x="24" y="20" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            </g>
          ) : (
            /* Default: Piston Check */
            <g>
              {/* Valve body */}
              <circle cx="30" cy="30" r="12" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Piston */}
              <rect
                x="26"
                y={state === 'open' ? 24 : state === 'cracking' ? 28 : 30}
                width="8"
                height="8"
                rx="1"
                fill="currentColor"
                opacity="0.7"
                stroke="currentColor"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Inlet connection */}
          <rect x="10" y="27" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

          {/* Outlet connection */}
          <rect x="38" y="27" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

          {/* Flow direction indicator (critical for check valves) */}
          <path
            d="M 16 30 L 20 30"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#arrowhead-check)"
          />

          {/* Additional flow arrow for emphasis */}
          <path
            d="M 40 30 L 44 30"
            stroke="currentColor"
            strokeWidth="1"
            markerEnd="url(#arrowhead-check)"
          />

          {/* Valve state color indicator */}
          <circle
            cx="15"
            cy="15"
            r="2.5"
            fill={
              state === 'open' ? '#10b981' :
              state === 'closed' ? '#ef4444' :
              '#f59e0b'
            }
            opacity="0.8"
          />

          {/* Silent/nozzle check indicator */}
          {data.silent && (
            <text x="30" y="50" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">
              SILENT
            </text>
          )}

          {/* Dashpot indicator */}
          {data.dashpot && (
            <rect x="26" y="10" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1" fill="white" opacity="0.7" />
          )}

          {/* End connection type indicators */}
          {data.endConnections === 'wafer' && (
            <g>
              <line x1="15" y1="30" x2="10" y2="30" stroke="currentColor" strokeWidth="3" />
              <line x1="45" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="3" />
            </g>
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead-check"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill="currentColor"
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
});

CheckValveNode.displayName = 'CheckValveNode';

export default CheckValveNode;
