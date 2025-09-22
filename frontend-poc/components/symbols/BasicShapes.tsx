'use client';

import React from 'react';

interface BasicShapeProps {
  type: 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note';
  width?: number;
  height?: number;
  className?: string;
}

export default function BasicShape({ type, width = 32, height = 32, className }: BasicShapeProps) {
  const baseProps = {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    className: className || '',
  };

  switch (type) {
    case 'rectangle':
      return (
        <svg {...baseProps}>
          <rect
            x="2"
            y="8"
            width={width - 4}
            height={height - 16}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            rx="2"
          />
        </svg>
      );

    case 'circle':
      return (
        <svg {...baseProps}>
          <circle
            cx={width / 2}
            cy={height / 2}
            r={Math.min(width, height) / 2 - 3}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'diamond':
      return (
        <svg {...baseProps}>
          <path
            d={`M ${width / 2} 3 L ${width - 3} ${height / 2} L ${width / 2} ${height - 3} L 3 ${height / 2} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'triangle':
      return (
        <svg {...baseProps}>
          <path
            d={`M ${width / 2} 3 L ${width - 3} ${height - 3} L 3 ${height - 3} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'line':
      return (
        <svg {...baseProps}>
          <line
            x1="3"
            y1={height / 2}
            x2={width - 3}
            y2={height / 2}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'text':
      return (
        <svg {...baseProps}>
          <text
            x={width / 2}
            y={height / 2 + 2}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            fontFamily="Arial, sans-serif"
          >
            T
          </text>
        </svg>
      );

    case 'note':
      return (
        <svg {...baseProps}>
          <path
            d={`M 3 3 L ${width - 8} 3 L ${width - 3} 8 L ${width - 3} ${height - 3} L 3 ${height - 3} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d={`L ${width - 8} 3 L ${width - 8} 8 L ${width - 3} 8`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="6" y1="12" x2={width - 6} y2="12" stroke="currentColor" strokeWidth="0.8" />
          <line x1="6" y1="16" x2={width - 6} y2="16" stroke="currentColor" strokeWidth="0.8" />
          <line x1="6" y1="20" x2={width - 9} y2="20" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      );

    default:
      return (
        <svg {...baseProps}>
          <rect
            x="2"
            y="2"
            width={width - 4}
            height={height - 4}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}