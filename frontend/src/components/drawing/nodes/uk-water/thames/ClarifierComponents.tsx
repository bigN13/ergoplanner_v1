/**
 * Thames Water Treatment - Clarifier Components
 * Sedimentation and clarification equipment per TW-STD-2023
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../../BaseSymbolNode';
import BaseSymbolNode from '../../BaseSymbolNode';

/**
 * Clarifier types
 */
export type ClarifierType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'lamella'
  | 'circular'
  | 'rectangular';

/**
 * Rake mechanism types
 */
export type RakeMechanism =
  | 'center-feed'
  | 'peripheral-feed'
  | 'bridge-scraper'
  | 'suction'
  | 'chain-flight';

/**
 * Sludge removal method
 */
export type SludgeRemoval =
  | 'gravity'
  | 'pumped'
  | 'vacuum'
  | 'airlift';

/**
 * Clarifier data interface
 */
export interface ClarifierNodeData extends BaseSymbolData {
  clarifierType?: ClarifierType;
  rakeMechanism?: RakeMechanism;
  sludgeRemoval?: SludgeRemoval;
  diameter?: number; // meters (for circular)
  length?: number; // meters (for rectangular)
  width?: number; // meters (for rectangular)
  depth?: number; // meters
  overflowRate?: number; // m³/m²/hr
  hasSkimmer?: boolean;
  hasBaffles?: boolean;
  numberOfClarifiers?: number;
}

/**
 * Primary Clarifier
 * First stage sedimentation per Thames Water standards
 */
export const PrimaryClarifierNode = memo<{
  id: string;
  data: ClarifierNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const rakeMechanism = data.rakeMechanism || 'center-feed';
  const diameter = data.diameter || 30; // 30m typical
  const hasSkimmer = data.hasSkimmer ?? true;

  const nodeData: ClarifierNodeData = {
    ...data,
    clarifierType: 'primary',
    defaultWidth: 100,
    defaultHeight: 100,
    connectionPoints: [
      { id: 'influent', position: 'left', type: 'input', label: 'Influent' },
      { id: 'effluent', position: 'right', type: 'output', label: 'Effluent' },
      { id: 'sludge', position: 'bottom', type: 'output', label: 'Sludge' },
      { id: 'scum', position: 'top', type: 'output', label: 'Scum' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Clarifier tank - circular */}
      <circle
        cx={50}
        cy={50}
        r={40}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      />

      {/* Water level */}
      <ellipse
        cx={50}
        cy={50}
        rx={40}
        ry={8}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="4,2"
      />

      {/* Center feed well */}
      {rakeMechanism === 'center-feed' && (
        <g>
          <circle
            cx={50}
            cy={50}
            r={12}
            fill="white"
            stroke="currentColor"
            strokeWidth={2}
          />
          {/* Inlet pipe */}
          <line
            x1={10}
            y1={50}
            x2={38}
            y2={50}
            stroke="currentColor"
            strokeWidth={2}
          />
          <text
            x={50}
            y={53}
            fontSize={8}
            textAnchor="middle"
            fill="currentColor"
            fontWeight="600"
          >
            FEED
          </text>
        </g>
      )}

      {/* Rake arms */}
      <g>
        {/* Center mechanism housing */}
        <rect
          x={46}
          y={30}
          width={8}
          height={40}
          fill="currentColor"
          opacity={0.3}
          rx={1}
        />

        {/* Rake arms (4 arms at 90° intervals) */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 50 + 35 * Math.cos(rad);
          const y2 = 50 + 35 * Math.sin(rad);
          return (
            <line
              key={angle}
              x1={50}
              y1={50}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="3,2"
            />
          );
        })}

        {/* Rotation indicator */}
        <path
          d="M 60 45 A 10 10 0 0 1 55 60"
          fill="none"
          stroke="#3498db"
          strokeWidth={1.5}
          markerEnd="url(#arrow-rotate)"
        />
      </g>

      {/* Skimmer mechanism */}
      {hasSkimmer && (
        <g>
          <rect
            x={70}
            y={45}
            width={15}
            height={4}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <text
            x={77}
            y={43}
            fontSize={6}
            textAnchor="middle"
            fill="currentColor"
          >
            SKIM
          </text>
          <line x1={85} y1={47} x2={92} y2={42} stroke="currentColor" strokeWidth={1.5} />
        </g>
      )}

      {/* Sludge hopper */}
      <path
        d="M 30 80 L 50 90 L 70 80"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
      <line x1={50} y1={90} x2={50} y2={95} stroke="currentColor" strokeWidth={2} />

      {/* Effluent weir */}
      <path
        d="M 85 40 L 90 40 L 90 50 L 85 50"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrow-rotate"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#3498db" />
        </marker>
      </defs>

      {/* Label */}
      <text
        x={50}
        y={12}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        PRIMARY CLARIFIER
      </text>

      {/* Dimensions */}
      {diameter && (
        <text
          x={50}
          y={98}
          fontSize={7}
          textAnchor="middle"
          fill="currentColor"
        >
          Ø{diameter}m
        </text>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={50}
          y={8}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

PrimaryClarifierNode.displayName = 'PrimaryClarifierNode';

/**
 * Secondary Clarifier
 * Activated sludge settlement
 */
export const SecondaryClarifierNode = memo<{
  id: string;
  data: ClarifierNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const rakeMechanism = data.rakeMechanism || 'peripheral-feed';
  const diameter = data.diameter || 35; // 35m typical for secondary

  const nodeData: ClarifierNodeData = {
    ...data,
    clarifierType: 'secondary',
    defaultWidth: 110,
    defaultHeight: 110,
    connectionPoints: [
      { id: 'influent', position: 'left', type: 'input', label: 'Mixed Liquor' },
      { id: 'effluent', position: 'right', type: 'output', label: 'Effluent' },
      { id: 'ras', position: 'bottom', type: 'output', label: 'RAS' },
      { id: 'was', position: 'bottom', type: 'output', label: 'WAS' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Clarifier tank */}
      <circle
        cx={55}
        cy={55}
        r={45}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      />

      {/* Water level with slight perspective */}
      <ellipse
        cx={55}
        cy={55}
        rx={45}
        ry={9}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="4,2"
      />

      {/* Peripheral feed channel */}
      {rakeMechanism === 'peripheral-feed' && (
        <g>
          <circle
            cx={55}
            cy={55}
            r={38}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="2,2"
          />
          {/* Feed pipe */}
          <line
            x1={10}
            y1={55}
            x2={17}
            y2={55}
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <text
            x={20}
            y={52}
            fontSize={7}
            fill="currentColor"
            fontWeight="600"
          >
            MLSS
          </text>
        </g>
      )}

      {/* Center column and rake mechanism */}
      <g>
        {/* Center column */}
        <circle
          cx={55}
          cy={55}
          r={6}
          fill="currentColor"
          opacity={0.4}
        />

        {/* Rake arms with scrapers */}
        {[30, 150, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 55 + 40 * Math.cos(rad);
          const y2 = 55 + 40 * Math.sin(rad);
          return (
            <g key={angle}>
              <line
                x1={55}
                y1={55}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={2.5}
              />
              {/* Scraper blade */}
              <line
                x1={x2}
                y1={y2}
                x2={x2 - 5 * Math.sin(rad)}
                y2={y2 + 5 * Math.cos(rad)}
                stroke="currentColor"
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* Drive motor indicator */}
        <rect
          x={48}
          y={20}
          width={14}
          height={10}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          rx={2}
        />
        <text
          x={55}
          y={27}
          fontSize={6}
          textAnchor="middle"
          fill="currentColor"
        >
          DRIVE
        </text>
      </g>

      {/* Sludge collection hopper */}
      <path
        d="M 35 85 L 55 98 L 75 85"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* RAS/WAS lines */}
      <g>
        <line x1={50} y1={98} x2={50} y2={105} stroke="currentColor" strokeWidth={2} />
        <text x={48} y={108} fontSize={6} fill="currentColor">RAS</text>

        <line x1={60} y1={98} x2={60} y2={105} stroke="currentColor" strokeWidth={2} />
        <text x={58} y={108} fontSize={6} fill="currentColor">WAS</text>
      </g>

      {/* Effluent launder */}
      <circle
        cx={55}
        cy={55}
        r={33}
        fill="none"
        stroke="#3498db"
        strokeWidth={1.5}
        strokeDasharray="3,3"
      />

      {/* Effluent outlet */}
      <g>
        <line x1={95} y1={55} x2={105} y2={55} stroke="currentColor" strokeWidth={2.5} />
        <path
          d="M 97 55 L 100 52 L 100 58 Z"
          fill="currentColor"
        />
      </g>

      {/* Label */}
      <text
        x={55}
        y={12}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        SECONDARY CLARIFIER
      </text>

      {/* Dimensions */}
      {diameter && (
        <text
          x={55}
          y={107}
          fontSize={7}
          textAnchor="middle"
          fill="currentColor"
        >
          Ø{diameter}m
        </text>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={55}
          y={8}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

SecondaryClarifierNode.displayName = 'SecondaryClarifierNode';

/**
 * Rectangular Clarifier
 * Rectangular sedimentation tank with bridge scraper
 */
export const RectangularClarifierNode = memo<{
  id: string;
  data: ClarifierNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const length = data.length || 40; // 40m typical
  const width = data.width || 10; // 10m typical
  const hasBaffles = data.hasBaffles ?? true;

  const nodeData: ClarifierNodeData = {
    ...data,
    clarifierType: 'rectangular',
    defaultWidth: 120,
    defaultHeight: 60,
    connectionPoints: [
      { id: 'influent', position: 'left', type: 'input', label: 'Influent' },
      { id: 'effluent', position: 'right', type: 'output', label: 'Effluent' },
      { id: 'sludge', position: 'bottom', type: 'output', label: 'Sludge' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Tank outline */}
      <rect
        x={10}
        y={15}
        width={100}
        height={40}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      />

      {/* Water level line */}
      <line
        x1={10}
        y1={25}
        x2={110}
        y2={25}
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="4,2"
      />

      {/* Inlet baffle */}
      {hasBaffles && (
        <rect
          x={15}
          y={20}
          width={3}
          height={30}
          fill="currentColor"
          opacity={0.5}
        />
      )}

      {/* Bridge scraper mechanism */}
      <g>
        {/* Bridge rails */}
        <line x1={10} y1={18} x2={110} y2={18} stroke="currentColor" strokeWidth={2} />
        <line x1={10} y1={52} x2={110} y2={52} stroke="currentColor" strokeWidth={2} />

        {/* Scraper carriage */}
        <rect
          x={50}
          y={16}
          width={12}
          height={6}
          fill="currentColor"
          opacity={0.6}
          rx={1}
        />

        {/* Scraper blades */}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={54 + i * 3}
            y1={22}
            x2={54 + i * 3}
            y2={50}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="2,1"
          />
        ))}

        {/* Drive motor */}
        <rect
          x={54}
          y={10}
          width={8}
          height={6}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          rx={1}
        />
        <text x={58} y={14} fontSize={5} textAnchor="middle" fill="currentColor">
          M
        </text>

        {/* Movement indicator */}
        <path
          d="M 65 13 L 70 13"
          stroke="#3498db"
          strokeWidth={1.5}
          markerEnd="url(#arrow-move)"
        />
      </g>

      {/* Sludge hopper */}
      <path
        d="M 20 55 L 30 48 L 90 48 L 100 55"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Sludge withdrawal pipes */}
      {[35, 60, 85].map((x) => (
        <g key={x}>
          <line x1={x} y1={48} x2={x} y2={43} stroke="currentColor" strokeWidth={1.5} />
          <circle cx={x} cy={41} r={1.5} fill="currentColor" />
        </g>
      ))}

      {/* Outlet weir */}
      <g>
        <path
          d="M 105 25 L 108 25 L 108 40 L 105 40"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
        <line x1={108} y1={32} x2={115} y2={32} stroke="currentColor" strokeWidth={2} />
      </g>

      {/* Inlet */}
      <line x1={5} y1={32} x2={10} y2={32} stroke="currentColor" strokeWidth={2.5} />

      {/* Arrow marker */}
      <defs>
        <marker
          id="arrow-move"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#3498db" />
        </marker>
      </defs>

      {/* Label */}
      <text
        x={60}
        y={10}
        fontSize={9}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        RECTANGULAR CLARIFIER
      </text>

      {/* Dimensions */}
      {length && width && (
        <text
          x={60}
          y={58}
          fontSize={7}
          textAnchor="middle"
          fill="currentColor"
        >
          {length}m × {width}m
        </text>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={60}
          y={6}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

RectangularClarifierNode.displayName = 'RectangularClarifierNode';

/**
 * Lamella Clarifier
 * High-rate clarifier with inclined plates
 */
export const LamellaClarifierNode = memo<{
  id: string;
  data: ClarifierNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const nodeData: ClarifierNodeData = {
    ...data,
    clarifierType: 'lamella',
    defaultWidth: 80,
    defaultHeight: 90,
    connectionPoints: [
      { id: 'influent', position: 'bottom', type: 'input', label: 'Influent' },
      { id: 'effluent', position: 'top', type: 'output', label: 'Effluent' },
      { id: 'sludge', position: 'bottom', type: 'output', label: 'Sludge' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Tank outline */}
      <path
        d="M 20 20 L 60 20 L 60 70 L 20 70 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      />

      {/* Inclined lamella plates (60° angle) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const y1 = 25 + i * 9;
        const y2 = y1 + 15;
        return (
          <line
            key={i}
            x1={25}
            y1={y1}
            x2={55}
            y2={y2}
            stroke="currentColor"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Sludge collection zone */}
      <path
        d="M 25 70 L 40 78 L 55 70"
        fill="currentColor"
        opacity={0.2}
      />

      {/* Influent distribution */}
      <g>
        <rect
          x={30}
          y={75}
          width={20}
          height={8}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          rx={1}
        />
        <text x={40} y={81} fontSize={6} textAnchor="middle" fill="currentColor">
          DIST
        </text>
        <line x1={40} y1={83} x2={40} y2={88} stroke="currentColor" strokeWidth={2} />
      </g>

      {/* Effluent collection channel */}
      <g>
        <rect
          x={25}
          y={12}
          width={30}
          height={6}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          rx={1}
        />
        <line x1={40} y1={12} x2={40} y2={5} stroke="currentColor" strokeWidth={2} />
      </g>

      {/* Sludge outlet */}
      <line x1={40} y1={78} x2={40} y2={85} stroke="currentColor" strokeWidth={2} />

      {/* Flow direction indicators */}
      <g>
        {/* Upflow arrows */}
        {[32, 48].map((x) => (
          <path
            key={x}
            d={`M ${x} 65 L ${x} 55`}
            stroke="#3498db"
            strokeWidth={1.5}
            markerEnd="url(#arrow-up)"
          />
        ))}
      </g>

      {/* Arrow marker */}
      <defs>
        <marker
          id="arrow-up"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#3498db" />
        </marker>
      </defs>

      {/* Label */}
      <text
        x={40}
        y={10}
        fontSize={9}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        LAMELLA CLARIFIER
      </text>

      {/* Tag label */}
      {data.tag && (
        <text
          x={40}
          y={6}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

LamellaClarifierNode.displayName = 'LamellaClarifierNode';
