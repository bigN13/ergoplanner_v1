/**
 * Severn Trent Sewage Treatment - Biological Treatment Components
 *
 * Standard: Severn Trent Engineering Standards ST-ES-2024
 * Category: Biological Treatment Systems
 *
 * Components:
 * - Activated Sludge Tank with diffused aeration
 * - Trickling Filter with rotating distributor
 * - SBR (Sequencing Batch Reactor) with decant mechanism
 */

import React from 'react';
import { BaseSymbolNode, BaseSymbolData, BaseSymbolProps } from '../../BaseSymbolNode';

// ============================================================================
// Type Definitions
// ============================================================================

export type BiologicalTreatmentType =
  | 'activated-sludge'
  | 'trickling-filter'
  | 'sbr'
  | 'mbbr';

export type AerationSystem =
  | 'fine-bubble-diffused'
  | 'coarse-bubble'
  | 'surface-mechanical'
  | 'jet-aeration';

export type TricklingFilterType =
  | 'low-rate'
  | 'high-rate'
  | 'super-high-rate'
  | 'roughing';

export type SBRPhase =
  | 'fill'
  | 'react'
  | 'settle'
  | 'decant'
  | 'idle';

export interface BiologicalTreatmentNodeData extends BaseSymbolData {
  treatmentType?: BiologicalTreatmentType;
  aerationSystem?: AerationSystem;
  tricklingFilterType?: TricklingFilterType;
  sbrPhase?: SBRPhase;

  // Activated Sludge specific
  mlss?: number;                    // mg/L (Mixed Liquor Suspended Solids)
  srt?: number;                     // days (Sludge Retention Time)
  airFlowRate?: number;             // m³/hr
  doSetpoint?: number;              // mg/L (Dissolved Oxygen)
  currentDO?: number;               // mg/L

  // Trickling Filter specific
  diameter?: number;                // meters
  height?: number;                  // meters
  mediaType?: string;               // 'plastic', 'rock', 'ceramic'
  hydraulicLoading?: number;        // m³/m²/day
  distributorSpeed?: number;        // rpm
  isDistributorRotating?: boolean;

  // SBR specific
  cycleTime?: number;               // minutes
  fillTime?: number;                // minutes
  reactTime?: number;               // minutes
  settleTime?: number;              // minutes
  decantTime?: number;              // minutes
  volumeDecanted?: number;          // m³

  // Common parameters
  flowRate?: number;                // m³/hr
  organicLoading?: number;          // kg BOD/day
  removalEfficiency?: number;       // % BOD removal
}

// ============================================================================
// Activated Sludge Tank with Diffused Aeration
// ============================================================================

export const ActivatedSludgeTankNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as BiologicalTreatmentNodeData;

  const renderSymbol = () => (
    <g>
      {/* Tank body */}
      <rect
        x="10"
        y="30"
        width="140"
        height="90"
        fill="#8B7355"
        opacity="0.2"
        stroke="black"
        strokeWidth="2"
      />

      {/* Mixed liquor level */}
      <rect
        x="10"
        y="50"
        width="140"
        height="70"
        fill="#654321"
        opacity="0.3"
      />

      {/* Fine bubble diffusers at bottom - 3 arrays */}
      {[40, 75, 110].map((x, idx) => (
        <g key={idx}>
          {/* Diffuser pipe */}
          <line
            x1={x}
            y1="115"
            x2={x}
            y2="120"
            stroke="black"
            strokeWidth="2"
          />

          {/* Air bubbles rising */}
          {data.currentDO !== undefined && data.currentDO > 0 && (
            <g>
              {[105, 90, 75, 60].map((y, bubbleIdx) => (
                <g key={bubbleIdx}>
                  <circle cx={x - 5} cy={y} r="1.5" fill="lightblue" opacity="0.6" />
                  <circle cx={x} cy={y - 3} r="1.5" fill="lightblue" opacity="0.6" />
                  <circle cx={x + 5} cy={y - 6} r="1.5" fill="lightblue" opacity="0.6" />
                </g>
              ))}
            </g>
          )}
        </g>
      ))}

      {/* Air header pipe at bottom */}
      <line x1="15" y1="125" x2="145" y2="125" stroke="orange" strokeWidth="3" />
      <text x="80" y="135" fontSize="7" textAnchor="middle" fill="orange">Air Header</text>

      {/* Inlet */}
      <path
        d="M 5 60 L 10 60"
        stroke="blue"
        strokeWidth="3"
        markerEnd="url(#arrowblue)"
      />
      <text x="2" y="58" fontSize="7" fill="blue">Influent</text>

      {/* Outlet (mixed liquor to clarifier) */}
      <path
        d="M 150 80 L 155 80"
        stroke="brown"
        strokeWidth="3"
        markerEnd="url(#arrowbrown)"
      />
      <text x="152" y="78" fontSize="7" fill="brown">MLSS</text>

      {/* Surface aerators/mixers (optional) */}
      {data.aerationSystem === 'surface-mechanical' && (
        <g>
          <circle cx="50" cy="50" r="8" fill="white" stroke="black" strokeWidth="1.5" />
          <line x1="45" y1="50" x2="55" y2="50" stroke="black" strokeWidth="1.5" />
          <line x1="50" y1="45" x2="50" y2="55" stroke="black" strokeWidth="1.5" />

          <circle cx="110" cy="50" r="8" fill="white" stroke="black" strokeWidth="1.5" />
          <line x1="105" y1="50" x2="115" y2="50" stroke="black" strokeWidth="1.5" />
          <line x1="110" y1="45" x2="110" y2="55" stroke="black" strokeWidth="1.5" />
        </g>
      )}

      {/* Title */}
      <text x="80" y="20" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
        ACTIVATED SLUDGE TANK
      </text>

      {/* Aeration system label */}
      <text x="80" y="28" fontSize="7" textAnchor="middle" fill="black">
        {data.aerationSystem === 'fine-bubble-diffused' ? 'Fine Bubble Diffused' :
         data.aerationSystem === 'coarse-bubble' ? 'Coarse Bubble' :
         data.aerationSystem === 'surface-mechanical' ? 'Surface Mechanical' :
         'Fine Bubble Diffused'}
      </text>

      {/* DO (Dissolved Oxygen) indicator */}
      {data.currentDO !== undefined && (
        <g>
          <rect x="15" y="35" width="30" height="12" fill="lightgreen" opacity="0.3" stroke="green" strokeWidth="1" />
          <text x="30" y="43" fontSize="8" fontWeight="bold" textAnchor="middle" fill="green">
            DO: {data.currentDO.toFixed(1)} mg/L
          </text>
        </g>
      )}

      {/* MLSS indicator */}
      {data.mlss !== undefined && (
        <g>
          <rect x="115" y="35" width="30" height="12" fill="brown" opacity="0.2" stroke="brown" strokeWidth="1" />
          <text x="130" y="43" fontSize="7" textAnchor="middle" fill="brown">
            MLSS: {data.mlss} mg/L
          </text>
        </g>
      )}

      {/* Air flow rate */}
      {data.airFlowRate !== undefined && (
        <text x="80" y="145" fontSize="7" textAnchor="middle" fill="orange">
          Air: {data.airFlowRate} m³/hr
        </text>
      )}

      {/* SRT (Sludge Retention Time) */}
      {data.srt !== undefined && (
        <text x="15" y="145" fontSize="7" fill="black">
          SRT: {data.srt} days
        </text>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="blue" />
        </marker>
        <marker id="arrowbrown" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="brown" />
        </marker>
      </defs>
    </g>
  );

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

ActivatedSludgeTankNode.displayName = 'ActivatedSludgeTankNode';

// ============================================================================
// Trickling Filter with Rotating Distributor
// ============================================================================

export const TricklingFilterNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as BiologicalTreatmentNodeData;

  const renderSymbol = () => {
    const centerX = 80;
    const centerY = 80;
    const radius = 50;

    return (
      <g>
        {/* Filter vessel - circular */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="#696969"
          opacity="0.3"
          stroke="black"
          strokeWidth="2"
        />

        {/* Media bed - darker center */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 5}
          fill="#4A4A4A"
          opacity="0.4"
        />

        {/* Rotating distributor arms */}
        {data.isDistributorRotating !== false && (
          <g>
            {/* Center hub */}
            <circle cx={centerX} cy={centerY} r="8" fill="gray" stroke="black" strokeWidth="1.5" />

            {/* 4 distributor arms at 90° */}
            {[0, 90, 180, 270].map((angle, idx) => {
              const angleRad = (angle * Math.PI) / 180;
              const armLength = radius - 10;
              const endX = centerX + armLength * Math.cos(angleRad);
              const endY = centerY + armLength * Math.sin(angleRad);

              return (
                <g key={idx}>
                  {/* Distributor arm */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={endX}
                    y2={endY}
                    stroke="blue"
                    strokeWidth="3"
                  />

                  {/* Spray nozzles along arm */}
                  {[0.3, 0.5, 0.7, 0.9].map((fraction, nozzleIdx) => {
                    const nozzleX = centerX + (armLength * fraction) * Math.cos(angleRad);
                    const nozzleY = centerY + (armLength * fraction) * Math.sin(angleRad);

                    return (
                      <circle
                        key={nozzleIdx}
                        cx={nozzleX}
                        cy={nozzleY}
                        r="2"
                        fill="lightblue"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Rotation indicator */}
            <path
              d={`M ${centerX + 12} ${centerY - 5} A 13 13 0 0 1 ${centerX + 5} ${centerY + 12}`}
              fill="none"
              stroke="red"
              strokeWidth="1.5"
              markerEnd="url(#arrowred-small)"
            />
          </g>
        )}

        {/* Influent inlet at top center */}
        <path
          d={`M ${centerX} 20 L ${centerX} 30`}
          stroke="blue"
          strokeWidth="3"
          markerEnd="url(#arrowblue)"
        />
        <text x={centerX + 3} y="25" fontSize="7" fill="blue">Influent</text>

        {/* Effluent collection trough at bottom */}
        <path
          d={`M ${centerX - 40} 135 L ${centerX + 40} 135`}
          stroke="green"
          strokeWidth="3"
        />
        <path
          d={`M ${centerX} 135 L ${centerX} 145`}
          stroke="green"
          strokeWidth="3"
          markerEnd="url(#arrowgreen)"
        />
        <text x={centerX + 3} y="143" fontSize="7" fill="green">Effluent</text>

        {/* Underdrains */}
        <line x1={centerX - 35} y1="130" x2={centerX + 35} y2="130" stroke="black" strokeWidth="1.5" />
        <circle cx={centerX - 25} cy="130" r="2" fill="black" />
        <circle cx={centerX} cy="130" r="2" fill="black" />
        <circle cx={centerX + 25} cy="130" r="2" fill="black" />

        {/* Ventilation */}
        <g>
          <rect x="15" y="75" width="10" height="12" fill="white" stroke="black" strokeWidth="1" />
          <line x1="17" y1="78" x2="23" y2="78" stroke="black" strokeWidth="0.5" />
          <line x1="17" y1="81" x2="23" y2="81" stroke="black" strokeWidth="0.5" />
          <line x1="17" y1="84" x2="23" y2="84" stroke="black" strokeWidth="0.5" />
          <text x="12" y="73" fontSize="6" fill="black">Vent</text>
        </g>

        {/* Title */}
        <text x={centerX} y="10" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
          TRICKLING FILTER
        </text>

        {/* Filter type */}
        <text x={centerX} y="18" fontSize="7" textAnchor="middle" fill="black">
          {data.tricklingFilterType === 'low-rate' ? 'Low Rate' :
           data.tricklingFilterType === 'high-rate' ? 'High Rate' :
           data.tricklingFilterType === 'super-high-rate' ? 'Super High Rate' :
           data.tricklingFilterType === 'roughing' ? 'Roughing Filter' :
           'High Rate'}
        </text>

        {/* Dimensions */}
        {data.diameter && (
          <text x={centerX} y="155" fontSize="7" textAnchor="middle" fill="black">
            Ø{data.diameter}m × {data.height || 2}m H
          </text>
        )}

        {/* Hydraulic loading */}
        {data.hydraulicLoading !== undefined && (
          <text x="145" y="80" fontSize="7" fill="black">
            {data.hydraulicLoading} m³/m²/d
          </text>
        )}

        {/* Distributor speed */}
        {data.distributorSpeed !== undefined && (
          <g>
            <rect x="55" y="50" width="50" height="10" fill="red" opacity="0.2" stroke="red" strokeWidth="1" />
            <text x={centerX} y="58" fontSize="7" textAnchor="middle" fill="red">
              {data.distributorSpeed} rpm
            </text>
          </g>
        )}

        {/* Arrow markers */}
        <defs>
          <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="green" />
          </marker>
          <marker id="arrowred-small" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="red" />
          </marker>
        </defs>
      </g>
    );
  };

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

TricklingFilterNode.displayName = 'TricklingFilterNode';

// ============================================================================
// SBR (Sequencing Batch Reactor)
// ============================================================================

export const SBRReactorNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as BiologicalTreatmentNodeData;

  const renderSymbol = () => (
    <g>
      {/* Reactor tank */}
      <rect
        x="20"
        y="30"
        width="120"
        height="100"
        fill="#B8860B"
        opacity="0.2"
        stroke="black"
        strokeWidth="2"
      />

      {/* Variable water level based on phase */}
      {(() => {
        const phase = data.sbrPhase || 'react';
        let waterLevel = 80; // Default for react phase

        if (phase === 'fill') waterLevel = 60;
        else if (phase === 'settle') waterLevel = 80;
        else if (phase === 'decant') waterLevel = 100;
        else if (phase === 'idle') waterLevel = 110;

        return (
          <rect
            x="20"
            y={waterLevel}
            width="120"
            height={130 - waterLevel}
            fill="#4682B4"
            opacity="0.4"
          />
        );
      })()}

      {/* Decanter mechanism at top */}
      <g>
        {/* Floating decanter arm */}
        <line x1="70" y1="25" x2="70" y2="50" stroke="green" strokeWidth="2" />
        <rect x="50" y="50" width="40" height="8" fill="green" opacity="0.5" stroke="green" strokeWidth="1.5" />

        {/* Decanter outlet pipe */}
        <path
          d="M 90 54 L 145 54"
          stroke="green"
          strokeWidth="2"
          markerEnd="url(#arrowgreen)"
        />
        <text x="147" y="52" fontSize="7" fill="green">Decant</text>

        {/* Vertical movement indicator */}
        {data.sbrPhase === 'decant' && (
          <g>
            <line x1="65" y1="30" x2="65" y2="45" stroke="red" strokeWidth="1" strokeDasharray="2,2" />
            <polygon points="65,45 63,40 67,40" fill="red" />
          </g>
        )}
      </g>

      {/* Bottom aerators */}
      <g>
        {[35, 60, 85, 110].map((x, idx) => (
          <g key={idx}>
            <line x1={x} y1="125" x2={x} y2="130" stroke="black" strokeWidth="1.5" />

            {/* Bubbles when aerating (react phase) */}
            {data.sbrPhase === 'react' && (
              <g>
                {[115, 100, 85, 70].map((y, bubbleIdx) => (
                  <circle key={bubbleIdx} cx={x} cy={y} r="1.5" fill="lightblue" opacity="0.6" />
                ))}
              </g>
            )}
          </g>
        ))}

        {/* Air header */}
        <line x1="25" y1="135" x2="135" y2="135" stroke="orange" strokeWidth="2.5" />
      </g>

      {/* Inlet valve */}
      <path
        d="M 5 70 L 20 70"
        stroke="blue"
        strokeWidth="3"
        markerEnd="url(#arrowblue)"
      />
      <text x="2" y="68" fontSize="7" fill="blue">Inlet</text>

      {/* Inlet valve indicator */}
      <circle cx="15" cy="70" r="3" fill={data.sbrPhase === 'fill' ? 'green' : 'red'} stroke="black" strokeWidth="1" />

      {/* WAS (Waste Activated Sludge) outlet */}
      <path
        d="M 80 130 L 80 145"
        stroke="brown"
        strokeWidth="2"
        markerEnd="url(#arrowbrown)"
      />
      <text x="83" y="143" fontSize="7" fill="brown">WAS</text>

      {/* Title */}
      <text x="80" y="20" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
        SBR REACTOR
      </text>

      {/* Phase indicator - prominent */}
      {data.sbrPhase && (
        <g>
          <rect x="25" y="35" width="50" height="15" fill={
            data.sbrPhase === 'fill' ? 'blue' :
            data.sbrPhase === 'react' ? 'green' :
            data.sbrPhase === 'settle' ? 'orange' :
            data.sbrPhase === 'decant' ? 'cyan' :
            'gray'
          } opacity="0.3" stroke="black" strokeWidth="1.5" />
          <text x="50" y="45" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
            {data.sbrPhase.toUpperCase()}
          </text>
        </g>
      )}

      {/* Cycle time */}
      {data.cycleTime !== undefined && (
        <text x="100" y="45" fontSize="7" fill="black">
          Cycle: {data.cycleTime} min
        </text>
      )}

      {/* Phase timing display */}
      {data.fillTime !== undefined && (
        <g>
          <text x="145" y="70" fontSize="6" fill="black">Fill: {data.fillTime}m</text>
          <text x="145" y="78" fontSize="6" fill="black">React: {data.reactTime}m</text>
          <text x="145" y="86" fontSize="6" fill="black">Settle: {data.settleTime}m</text>
          <text x="145" y="94" fontSize="6" fill="black">Decant: {data.decantTime}m</text>
        </g>
      )}

      {/* Volume indicator */}
      {data.volumeDecanted !== undefined && (
        <text x="25" y="145" fontSize="7" fill="green">
          Vol: {data.volumeDecanted} m³
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

SBRReactorNode.displayName = 'SBRReactorNode';

// ============================================================================
// Exports
// ============================================================================

export const SevernTrentBiologicalTreatmentComponents = {
  ActivatedSludgeTankNode,
  TricklingFilterNode,
  SBRReactorNode,
};

export const SevernTrentBiologicalTreatmentTypes = {
  ACTIVATED_SLUDGE_TANK: 'severn-activated-sludge-tank',
  TRICKLING_FILTER: 'severn-trickling-filter',
  SBR_REACTOR: 'severn-sbr-reactor',
} as const;
