/**
 * Specialty Valve Types
 * Needle, diaphragm, pinch, and plug valves
 */

import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

// ============================================================================
// NEEDLE VALVE
// ============================================================================

export interface NeedleValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'needle';

  size?: string;
  rating?: string;
  material?: string;

  position?: 'open' | 'closed' | 'throttled';
  positionPercent?: number;
  operation?: 'manual' | 'fine-adjustment';

  endConnections?: 'threaded' | 'compression' | 'tube';
  application?: 'metering' | 'sampling' | 'instrumentation';

  indication?: boolean;
}

export const NeedleValveNode = memo<NodeProps<NeedleValveData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 15,
        y: 35,
        direction: 180,
        compatible: ['pipe', 'tube'],
        required: true,
        description: 'Valve inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 45,
        y: 35,
        direction: 0,
        compatible: ['pipe', 'tube'],
        required: true,
        description: 'Valve outlet'
      }
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

    const enhancedData: NeedleValveData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderValveContent = (): React.JSX.Element => {
      const position = data.position || 'closed';
      const positionPercent = data.positionPercent || (position === 'open' ? 100 : position === 'closed' ? 0 : 50);
      const needleOffset = (100 - positionPercent) * 0.08;

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
            {/* Valve body */}
            <path
              d="M 20 30 L 25 25 L 30 22 L 35 25 L 40 30 L 40 40 L 20 40 Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />

            {/* Orifice/seat */}
            <circle cx="30" cy="35" r="2.5" fill="currentColor" opacity="0.3" />

            {/* Needle - very fine point */}
            <path
              d={`M 28 ${32 + needleOffset} L 30 ${28 + needleOffset} L 32 ${32 + needleOffset}`}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            />

            {/* Needle stem */}
            <line
              x1="30"
              y1={28 + needleOffset}
              x2="30"
              y2="12"
              stroke="currentColor"
              strokeWidth="1.5"
            />

            {/* Packing gland */}
            <rect
              x="26"
              y="16"
              width="8"
              height="6"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="white"
            />

            {/* Fine adjustment knob */}
            <circle
              cx="30"
              cy="8"
              r="5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="white"
            />

            {/* Adjustment markings */}
            <circle cx="30" cy="8" r="3" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <line x1="30" y1="3" x2="30" y2="5" stroke="currentColor" strokeWidth="0.5" />

            {/* Inlet connection */}
            <rect x="10" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Outlet connection */}
            <rect x="38" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Flow direction */}
            <path
              d="M 16 35 L 20 35"
              stroke="currentColor"
              strokeWidth="1"
              markerEnd="url(#arrowhead-needle)"
            />

            {/* Valve state color indicator */}
            <circle
              cx="15"
              cy="15"
              r="2"
              fill={
                position === 'open' ? '#10b981' :
                position === 'closed' ? '#ef4444' :
                '#f59e0b'
              }
              opacity="0.8"
            />

            {/* Fine metering indicator */}
            {data.application === 'metering' && (
              <text x="30" y="52" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">
                METER
              </text>
            )}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead-needle"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
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

NeedleValveNode.displayName = 'NeedleValveNode';

// ============================================================================
// DIAPHRAGM VALVE
// ============================================================================

export interface DiaphragmValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'diaphragm';

  size?: string;
  rating?: string;
  material?: string;

  position?: 'open' | 'closed' | 'throttled';
  positionPercent?: number;
  operation?: 'manual' | 'pneumatic' | 'electric';

  diaphragmType?: 'weir' | 'straight-through' | 'full-bore';
  diaphragmMaterial?: 'PTFE' | 'EPDM' | 'Viton' | 'natural-rubber';
  bodyLining?: boolean;

  actuated?: boolean;
  indication?: boolean;

  fluid?: string;
  application?: 'corrosive' | 'slurry' | 'hygienic';
}

export const DiaphragmValveNode = memo<NodeProps<DiaphragmValveData>>(
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
        description: 'Valve inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 45,
        y: 35,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Valve outlet'
      }
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

    const enhancedData: DiaphragmValveData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderValveContent = (): React.JSX.Element => {
      const position = data.position || 'closed';
      const positionPercent = data.positionPercent || (position === 'open' ? 100 : position === 'closed' ? 0 : 50);
      const diaphragmDeflection = (100 - positionPercent) * 0.06;
      const isActuated = data.actuated || false;

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
            {/* Valve body */}
            {data.diaphragmType === 'straight-through' ? (
              <rect x="18" y="28" width="24" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="white" />
            ) : (
              /* Weir type body */
              <g>
                <rect x="18" y="28" width="24" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="white" />
                {/* Weir */}
                <rect x="28" y="36" width="4" height="6" fill="currentColor" opacity="0.3" />
              </g>
            )}

            {/* Diaphragm - flexible membrane */}
            <path
              d={`M 20 28 Q 30 ${28 + diaphragmDeflection} 40 28`}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />

            {/* Diaphragm fill */}
            <path
              d={`M 20 28 Q 30 ${28 + diaphragmDeflection} 40 28 L 40 24 L 20 24 Z`}
              fill="currentColor"
              opacity="0.2"
            />

            {/* Compressor stem */}
            <line
              x1="30"
              y1={28 + diaphragmDeflection}
              x2="30"
              y2={isActuated ? "8" : "12"}
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Compressor plate */}
            <rect
              x="26"
              y={26 + diaphragmDeflection}
              width="8"
              height="2"
              fill="currentColor"
              opacity="0.5"
            />

            {/* Bonnet */}
            <path
              d="M 22 24 L 22 18 L 38 18 L 38 24"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="white"
            />

            {/* Actuator or handwheel */}
            {isActuated ? (
              <g>
                <rect x="22" y="4" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="white" />
                {data.operation === 'electric' && (
                  <text x="30" y="9" textAnchor="middle" fontSize="6" fill="currentColor">E</text>
                )}
                {data.operation === 'pneumatic' && (
                  <text x="30" y="9" textAnchor="middle" fontSize="6" fill="currentColor">P</text>
                )}
              </g>
            ) : (
              <g>
                <circle cx="30" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
                <line x1="24" y1="8" x2="36" y2="8" stroke="currentColor" strokeWidth="1" />
                <line x1="30" y1="2" x2="30" y2="14" stroke="currentColor" strokeWidth="1" />
              </g>
            )}

            {/* Inlet connection */}
            <rect x="10" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Outlet connection */}
            <rect x="38" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Flow direction */}
            <path
              d="M 16 35 L 20 35"
              stroke="currentColor"
              strokeWidth="1"
              markerEnd="url(#arrowhead-diaphragm)"
            />

            {/* Valve state color indicator */}
            <circle
              cx="15"
              cy="15"
              r="2"
              fill={
                position === 'open' ? '#10b981' :
                position === 'closed' ? '#ef4444' :
                '#f59e0b'
              }
              opacity="0.8"
            />

            {/* Body lining indicator */}
            {data.bodyLining && (
              <rect x="19" y="29" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
            )}

            {/* Application indicator */}
            {data.application === 'hygienic' && (
              <circle cx="45" cy="45" r="2" fill="#10b981" opacity="0.7" />
            )}
            {data.application === 'corrosive' && (
              <circle cx="45" cy="45" r="2" fill="#ef4444" opacity="0.7" />
            )}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead-diaphragm"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
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

DiaphragmValveNode.displayName = 'DiaphragmValveNode';

// ============================================================================
// PINCH VALVE
// ============================================================================

export interface PinchValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'pinch';

  size?: string;
  rating?: string;

  position?: 'open' | 'closed' | 'throttled';
  positionPercent?: number;
  operation?: 'manual' | 'pneumatic' | 'hydraulic';

  sleeveType?: 'rubber' | 'elastomer' | 'PTFE';
  bodyType?: 'full-bore' | 'reduced-bore';

  actuated?: boolean;

  fluid?: string;
  application?: 'slurry' | 'abrasive' | 'mining';
}

export const PinchValveNode = memo<NodeProps<PinchValveData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 15,
        y: 30,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Valve inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 45,
        y: 30,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Valve outlet'
      }
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

    const enhancedData: PinchValveData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderValveContent = (): React.JSX.Element => {
      const position = data.position || 'closed';
      const positionPercent = data.positionPercent || (position === 'open' ? 100 : position === 'closed' ? 0 : 50);
      const pinchAmount = (100 - positionPercent) * 0.15;
      const isActuated = data.actuated || false;

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
            {/* Valve body/housing */}
            <rect
              x="20"
              y="22"
              width="20"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />

            {/* Flexible sleeve - pinches in center */}
            <path
              d={`M 20 27 L 24 27 Q 30 ${27 + pinchAmount} 36 27 L 40 27`}
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d={`M 20 33 L 24 33 Q 30 ${33 - pinchAmount} 36 33 L 40 33`}
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Sleeve shading */}
            <path
              d={`M 24 27 Q 30 ${27 + pinchAmount} 36 27 L 36 33 Q 30 ${33 - pinchAmount} 24 33 Z`}
              fill="currentColor"
              opacity="0.2"
            />

            {/* Pinch bars/mechanism */}
            {isActuated ? (
              <g>
                {/* Pneumatic/hydraulic actuator bars */}
                <rect
                  x="26"
                  y={20 - (pinchAmount * 0.5)}
                  width="8"
                  height="2"
                  fill="currentColor"
                  opacity="0.5"
                />
                <rect
                  x="26"
                  y={38 + (pinchAmount * 0.5)}
                  width="8"
                  height="2"
                  fill="currentColor"
                  opacity="0.5"
                />

                {/* Actuator housing */}
                <rect x="22" y="4" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="white" />
                {data.operation === 'pneumatic' && (
                  <text x="30" y="9" textAnchor="middle" fontSize="6" fill="currentColor">P</text>
                )}
                {data.operation === 'hydraulic' && (
                  <text x="30" y="9" textAnchor="middle" fontSize="6" fill="currentColor">H</text>
                )}

                {/* Actuator connection */}
                <line x1="30" y1="12" x2="30" y2={20 - (pinchAmount * 0.5)} stroke="currentColor" strokeWidth="1.5" />
              </g>
            ) : (
              <g>
                {/* Manual pinch bars */}
                <line x1="22" y1={20 - (pinchAmount * 0.5)} x2="38" y2={20 - (pinchAmount * 0.5)} stroke="currentColor" strokeWidth="2" />
                <line x1="22" y1={40 + (pinchAmount * 0.5)} x2="38" y2={40 + (pinchAmount * 0.5)} stroke="currentColor" strokeWidth="2" />

                {/* Manual adjustment screw */}
                <rect x="28" y="12" width="4" height="8" fill="currentColor" opacity="0.5" />
                <circle cx="30" cy="8" r="4" stroke="currentColor" strokeWidth="1" fill="white" />
              </g>
            )}

            {/* Inlet connection */}
            <rect x="10" y="27" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Outlet connection */}
            <rect x="38" y="27" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Flow direction */}
            <path
              d="M 16 30 L 20 30"
              stroke="currentColor"
              strokeWidth="1"
              markerEnd="url(#arrowhead-pinch)"
            />

            {/* Valve state color indicator */}
            <circle
              cx="15"
              cy="15"
              r="2"
              fill={
                position === 'open' ? '#10b981' :
                position === 'closed' ? '#ef4444' :
                '#f59e0b'
              }
              opacity="0.8"
            />

            {/* Application indicator */}
            {data.application === 'slurry' && (
              <text x="30" y="52" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">
                SLURRY
              </text>
            )}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead-pinch"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
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

PinchValveNode.displayName = 'PinchValveNode';

// ============================================================================
// PLUG VALVE
// ============================================================================

export interface PlugValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'plug';

  size?: string;
  rating?: string;
  material?: string;

  position?: 'open' | 'closed';
  operation?: 'manual' | 'lever' | 'gear' | 'electric' | 'pneumatic';

  plugType?: 'lubricated' | 'non-lubricated' | 'sleeved';
  portType?: 'full-port' | 'standard-port' | 'multi-port';
  numberOfPorts?: number; // 2, 3, or 4-way

  actuated?: boolean;
  indication?: boolean;

  endConnections?: 'flanged' | 'threaded';
  fluid?: string;
}

export const PlugValveNode = memo<NodeProps<PlugValveData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const numberOfPorts = data.numberOfPorts || 2;

    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 15,
        y: 30,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Valve inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 45,
        y: 30,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Valve outlet'
      },
      ...(numberOfPorts >= 3 ? [{
        id: 'port3',
        type: 'outlet' as const,
        x: 30,
        y: 45,
        direction: 90,
        compatible: ['pipe', 'process'],
        required: false,
        description: 'Third port'
      }] : []),
      ...(numberOfPorts >= 4 ? [{
        id: 'port4',
        type: 'outlet' as const,
        x: 30,
        y: 15,
        direction: 270,
        compatible: ['pipe', 'process'],
        required: false,
        description: 'Fourth port'
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

    const enhancedData: PlugValveData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderValveContent = (): React.JSX.Element => {
      const position = data.position || 'closed';
      const isActuated = data.actuated || false;
      const plugRotation = position === 'open' ? 0 : 90;

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
            {/* Valve body (cylindrical) */}
            <circle
              cx="30"
              cy="30"
              r="12"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />

            {/* Tapered plug - rotates */}
            <g transform={`rotate(${plugRotation} 30 30)`}>
              {/* Plug body */}
              <ellipse
                cx="30"
                cy="30"
                rx="8"
                ry="10"
                fill="currentColor"
                opacity="0.6"
                stroke="currentColor"
                strokeWidth="1"
              />

              {/* Port through plug */}
              {data.portType === 'full-port' ? (
                <rect
                  x="22"
                  y="28"
                  width="16"
                  height="4"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ) : numberOfPorts === 3 ? (
                /* 3-way L-port */
                <g>
                  <rect x="22" y="28" width="8" height="4" fill="white" />
                  <rect x="28" y="28" width="4" height="8" fill="white" />
                </g>
              ) : numberOfPorts === 4 ? (
                /* 4-way X-port */
                <g>
                  <rect x="22" y="28" width="16" height="4" fill="white" />
                  <rect x="28" y="22" width="4" height="16" fill="white" />
                </g>
              ) : (
                /* Standard port */
                <rect
                  x="24"
                  y="28.5"
                  width="12"
                  height="3"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              )}

              {/* Plug indicator line */}
              <line
                x1="30"
                y1="20"
                x2="30"
                y2="24"
                stroke="currentColor"
                strokeWidth="2"
              />
            </g>

            {/* Stem */}
            <line
              x1="30"
              y1="18"
              x2="30"
              y2={isActuated ? "8" : "12"}
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Packing */}
            <rect
              x="26"
              y={isActuated ? "12" : "14"}
              width="8"
              height="4"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="white"
            />

            {/* Actuator or lever */}
            {isActuated ? (
              <g>
                <rect x="22" y="2" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="white" />
                {data.operation === 'electric' && (
                  <text x="30" y="8" textAnchor="middle" fontSize="6" fill="currentColor">E</text>
                )}
                {data.operation === 'pneumatic' && (
                  <text x="30" y="8" textAnchor="middle" fontSize="6" fill="currentColor">P</text>
                )}
              </g>
            ) : data.operation === 'lever' ? (
              <g>
                <line
                  x1="30"
                  y1="12"
                  x2={30 + (15 * Math.cos((plugRotation * Math.PI) / 180))}
                  y2={12 - (15 * Math.sin((plugRotation * Math.PI) / 180))}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx={30 + (15 * Math.cos((plugRotation * Math.PI) / 180))}
                  cy={12 - (15 * Math.sin((plugRotation * Math.PI) / 180))}
                  r="2.5"
                  fill="currentColor"
                />
              </g>
            ) : (
              <g>
                <circle cx="30" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" fill="white" />
                {data.operation === 'gear' && (
                  <circle cx="30" cy="6" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
                )}
              </g>
            )}

            {/* Inlet connection */}
            <rect x="10" y="27" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Outlet connection */}
            <rect x="38" y="27" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

            {/* Additional ports for multi-way valves */}
            {numberOfPorts >= 3 && (
              <rect x="27" y="42" width="6" height="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
            )}
            {numberOfPorts >= 4 && (
              <rect x="27" y="10" width="6" height="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
            )}

            {/* Flow direction */}
            <path
              d="M 16 30 L 20 30"
              stroke="currentColor"
              strokeWidth="1"
              markerEnd="url(#arrowhead-plug)"
            />

            {/* Valve state color indicator */}
            <circle
              cx="15"
              cy="15"
              r="2"
              fill={position === 'open' ? '#10b981' : '#ef4444'}
              opacity="0.8"
            />

            {/* Lubricated indicator */}
            {data.plugType === 'lubricated' && (
              <circle cx="45" cy="15" r="2" fill="#fbbf24" opacity="0.7" />
            )}

            {/* Multi-port indicator */}
            {numberOfPorts > 2 && (
              <text x="30" y="52" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">
                {numberOfPorts}-WAY
              </text>
            )}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead-plug"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
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

PlugValveNode.displayName = 'PlugValveNode';

export default {
  NeedleValveNode,
  DiaphragmValveNode,
  PinchValveNode,
  PlugValveNode,
};
