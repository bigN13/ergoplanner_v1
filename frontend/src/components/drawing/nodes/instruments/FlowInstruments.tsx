/**
 * Flow Measurement Instruments
 * Orifice plates, venturi meters, flow nozzles, magnetic flowmeters, vortex meters, etc.
 */

import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

// ============================================================================
// ORIFICE PLATE
// ============================================================================

export interface OrificePlateData extends BaseSymbolData {
  symbolType: 'flow-instrument';
  instrumentType: 'orifice-plate';

  // Orifice configuration
  orificeBoreType?: 'concentric' | 'eccentric' | 'segmental' | 'quadrant-edge';
  diameter?: number; // mm or inches
  beta?: number; // Bore to pipe diameter ratio
  tapType?: 'flange' | 'corner' | 'D-D/2' | 'vena-contracta';

  // Transmitter
  hasTransmitter?: boolean;
  transmitterType?: 'differential-pressure' | 'smart' | 'multivariable';

  // Installation
  pipeSize?: string;
  material?: string;
  tag?: string;
}

export const OrificePlateNode = memo<NodeProps<OrificePlateData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 10,
        y: 30,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 50,
        y: 30,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow outlet'
      },
      ...(data.hasTransmitter ? [{
        id: 'signal',
        type: 'signal' as const,
        x: 30,
        y: 10,
        direction: 270,
        compatible: ['instrumentation', 'control'],
        required: false,
        description: 'Transmitter signal'
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

    const enhancedData: OrificePlateData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderContent = (): React.JSX.Element => {
      const orificeBoreType = data.orificeBoreType || 'concentric';

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
            {/* Pipe section */}
            <rect x="10" y="25" width="40" height="10" stroke="currentColor" strokeWidth="2" fill="white" />

            {/* Orifice plate */}
            <g>
              {/* Plate body */}
              <rect x="28" y="20" width="4" height="20" fill="currentColor" opacity="0.7" stroke="currentColor" strokeWidth="1" />

              {/* Bore opening */}
              {orificeBoreType === 'concentric' && (
                <circle cx="30" cy="30" r="3" fill="white" stroke="currentColor" strokeWidth="1" />
              )}
              {orificeBoreType === 'eccentric' && (
                <circle cx="30" cy="32" r="3" fill="white" stroke="currentColor" strokeWidth="1" />
              )}
              {orificeBoreType === 'segmental' && (
                <path d="M 30 27 A 3 3 0 0 1 30 33 L 30 27" fill="white" stroke="currentColor" strokeWidth="1" />
              )}
              {orificeBoreType === 'quadrant-edge' && (
                <path d="M 27 30 Q 30 27 33 30 Q 30 33 27 30" fill="white" stroke="currentColor" strokeWidth="1" />
              )}
            </g>

            {/* Pressure taps */}
            {data.tapType && (
              <g>
                {/* Upstream tap */}
                <circle cx="20" cy="24" r="1" fill="currentColor" />
                <line x1="20" y1="24" x2="20" y2="18" stroke="currentColor" strokeWidth="1" />

                {/* Downstream tap */}
                <circle cx="40" cy="24" r="1" fill="currentColor" />
                <line x1="40" y1="24" x2="40" y2="18" stroke="currentColor" strokeWidth="1" />

                {/* Connecting line to transmitter */}
                <line x1="20" y1="18" x2="30" y2="12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1" />
                <line x1="40" y1="18" x2="30" y2="12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1" />
              </g>
            )}

            {/* Transmitter symbol */}
            {data.hasTransmitter && (
              <g>
                <circle cx="30" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="white" />
                <text x="30" y="10" textAnchor="middle" fontSize="5" fill="currentColor">DP</text>
              </g>
            )}

            {/* Flow direction */}
            <path d="M 15 30 L 19 30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead-flow)" />

            {/* Tag */}
            {data.tag && (
              <text x="30" y="50" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">
                {data.tag}
              </text>
            )}

            {/* Orifice type indicator */}
            <text x="30" y="56" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.6">
              {orificeBoreType.toUpperCase()}
            </text>

            <defs>
              <marker id="arrowhead-flow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
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
        renderCustomContent={renderContent}
      />
    );
  }
);

OrificePlateNode.displayName = 'OrificePlateNode';

// ============================================================================
// VENTURI METER
// ============================================================================

export interface VenturiMeterData extends BaseSymbolData {
  symbolType: 'flow-instrument';
  instrumentType: 'venturi-meter';

  throatDiameter?: number;
  hasTransmitter?: boolean;
  tag?: string;
}

export const VenturiMeterNode = memo<NodeProps<VenturiMeterData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 10,
        y: 30,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 50,
        y: 30,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow outlet'
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

    const enhancedData: VenturiMeterData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderContent = (): React.JSX.Element => {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Venturi tube profile */}
            <path
              d="M 10 27 L 22 27 L 26 30 L 34 30 L 38 27 L 50 27 L 50 33 L 38 33 L 34 30 L 26 30 L 22 33 L 10 33 Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />

            {/* Pressure taps */}
            <circle cx="20" cy="26" r="1" fill="currentColor" />
            <circle cx="30" cy="29" r="1" fill="currentColor" />
            <line x1="20" y1="26" x2="20" y2="18" stroke="currentColor" strokeWidth="0.8" />
            <line x1="30" y1="29" x2="30" y2="18" stroke="currentColor" strokeWidth="0.8" />

            {/* Transmitter */}
            {data.hasTransmitter && (
              <g>
                <circle cx="25" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" fill="white" />
                <text x="25" y="12" textAnchor="middle" fontSize="5" fill="currentColor">DP</text>
              </g>
            )}

            {/* Flow direction */}
            <path d="M 15 30 L 19 30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead-venturi)" />

            {/* Tag */}
            {data.tag && (
              <text x="30" y="48" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">
                {data.tag}
              </text>
            )}

            <defs>
              <marker id="arrowhead-venturi" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
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
        renderCustomContent={renderContent}
      />
    );
  }
);

VenturiMeterNode.displayName = 'VenturiMeterNode';

// ============================================================================
// MAGNETIC FLOWMETER
// ============================================================================

export interface MagneticFlowmeterData extends BaseSymbolData {
  symbolType: 'flow-instrument';
  instrumentType: 'magnetic-flowmeter';

  linerMaterial?: 'PTFE' | 'PFA' | 'rubber' | 'ceramic';
  electrodeType?: 'standard' | 'scraper' | 'retractable';
  tag?: string;
}

export const MagneticFlowmeterNode = memo<NodeProps<MagneticFlowmeterData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 10,
        y: 30,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 50,
        y: 30,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow outlet'
      },
      {
        id: 'signal',
        type: 'signal' as const,
        x: 30,
        y: 10,
        direction: 270,
        compatible: ['instrumentation', 'control'],
        required: false,
        description: 'Transmitter signal'
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

    const enhancedData: MagneticFlowmeterData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderContent = (): React.JSX.Element => {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Meter body */}
            <rect x="20" y="24" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="white" />

            {/* Magnetic coils (top and bottom) */}
            <g>
              {/* Top coil */}
              <rect x="27" y="20" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1" />
              <path d="M 28 20 Q 30 18 32 20" stroke="currentColor" strokeWidth="0.8" fill="none" />

              {/* Bottom coil */}
              <rect x="27" y="36" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1" />
              <path d="M 28 40 Q 30 42 32 40" stroke="currentColor" strokeWidth="0.8" fill="none" />
            </g>

            {/* Electrodes */}
            <circle cx="20" cy="30" r="1.5" fill="currentColor" />
            <circle cx="40" cy="30" r="1.5" fill="currentColor" />
            <line x1="20" y1="30" x2="18" y2="30" stroke="currentColor" strokeWidth="1" />
            <line x1="40" y1="30" x2="42" y2="30" stroke="currentColor" strokeWidth="1" />

            {/* Transmitter */}
            <g>
              <rect x="25" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="white" />
              <text x="30" y="7.5" textAnchor="middle" fontSize="5" fill="currentColor">MAG</text>
            </g>

            {/* Signal cable */}
            <line x1="30" y1="10" x2="30" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />

            {/* Flow direction */}
            <path d="M 15 30 L 19 30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead-mag)" />

            {/* Tag */}
            {data.tag && (
              <text x="30" y="52" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">
                {data.tag}
              </text>
            )}

            <defs>
              <marker id="arrowhead-mag" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
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
        renderCustomContent={renderContent}
      />
    );
  }
);

MagneticFlowmeterNode.displayName = 'MagneticFlowmeterNode';

// ============================================================================
// VORTEX FLOWMETER
// ============================================================================

export interface VortexFlowmeterData extends BaseSymbolData {
  symbolType: 'flow-instrument';
  instrumentType: 'vortex-flowmeter';

  tag?: string;
}

export const VortexFlowmeterNode = memo<NodeProps<VortexFlowmeterData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const defaultConnectionPoints = [
      {
        id: 'inlet',
        type: 'inlet' as const,
        x: 10,
        y: 30,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow inlet'
      },
      {
        id: 'outlet',
        type: 'outlet' as const,
        x: 50,
        y: 30,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
        description: 'Flow outlet'
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

    const enhancedData: VortexFlowmeterData = {
      ...data,
      dimensions: data.dimensions || defaultDimensions,
      connectionPoints: data.connectionPoints || defaultConnectionPoints,
      minZoomLevel: data.minZoomLevel || 0.3,
      maxDetailZoom: data.maxDetailZoom || 2.5,
      standard: data.standard || 'ISA-5.1'
    };

    const renderContent = (): React.JSX.Element => {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pipe section */}
            <rect x="10" y="25" width="40" height="10" stroke="currentColor" strokeWidth="2" fill="white" />

            {/* Bluff body (vortex shedder) */}
            <rect x="28" y="26" width="4" height="8" fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="1" />

            {/* Sensor */}
            <rect x="29" y="20" width="2" height="6" fill="currentColor" opacity="0.4" />

            {/* Vortex representation */}
            <g opacity="0.4">
              <path d="M 32 27 Q 35 28 35 30 Q 35 32 32 33" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M 36 27 Q 39 28 39 30 Q 39 32 36 33" stroke="currentColor" strokeWidth="0.8" fill="none" />
            </g>

            {/* Transmitter */}
            <g>
              <rect x="25" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="white" />
              <text x="30" y="7.5" textAnchor="middle" fontSize="4" fill="currentColor">VORTEX</text>
            </g>

            {/* Signal cable */}
            <line x1="30" y1="10" x2="30" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />

            {/* Flow direction */}
            <path d="M 15 30 L 19 30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead-vortex)" />

            {/* Tag */}
            {data.tag && (
              <text x="30" y="48" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">
                {data.tag}
              </text>
            )}

            <defs>
              <marker id="arrowhead-vortex" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
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
        renderCustomContent={renderContent}
      />
    );
  }
);

VortexFlowmeterNode.displayName = 'VortexFlowmeterNode';

export default {
  OrificePlateNode,
  VenturiMeterNode,
  MagneticFlowmeterNode,
  VortexFlowmeterNode,
};
