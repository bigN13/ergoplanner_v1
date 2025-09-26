import type { ComponentType} from 'react';
import React, { useState, useCallback } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../nodes/BaseSymbolNode';

export interface RotationControls {
  rotation: number;
  onRotate: (angle: number) => void;
  rotateClockwise: () => void;
  rotateCounterClockwise: () => void;
  resetRotation: () => void;
}

export interface WithRotationProps {
  rotation?: number;
  rotationStep?: number;
  allowRotation?: boolean;
}

/**
 * HOC that adds rotation capabilities to a symbol component
 */
export function withRotation<T extends BaseSymbolData>(
  WrappedComponent: ComponentType<NodeProps<T>>
): ComponentType<NodeProps<T & WithRotationProps>> {
  const RotatableComponent = (props: NodeProps<T & WithRotationProps>) => {
    const { data, ...restProps } = props;
    const [rotation, setRotation] = useState(data.rotation || 0);

    const rotationStep = data.rotationStep || 45;
    const allowRotation = data.allowRotation !== false;

    const handleRotate = useCallback((angle: number) => {
      const normalizedAngle = ((angle % 360) + 360) % 360;
      setRotation(normalizedAngle);
    }, []);

    const rotateClockwise = useCallback(() => {
      handleRotate(rotation + rotationStep);
    }, [rotation, rotationStep, handleRotate]);

    const rotateCounterClockwise = useCallback(() => {
      handleRotate(rotation - rotationStep);
    }, [rotation, rotationStep, handleRotate]);

    const resetRotation = useCallback(() => {
      setRotation(0);
    }, []);

    if (!allowRotation) {
      return <WrappedComponent data={data} {...restProps} />;
    }

    const rotatedData = {
      ...data,
      rotation,
      onRotate: handleRotate,
      rotateClockwise,
      rotateCounterClockwise,
      resetRotation,
    };

    return (
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-in-out',
          width: '100%',
          height: '100%',
        }}
      >
        <WrappedComponent data={rotatedData} {...restProps} />
        
        {/* Rotation controls overlay */}
        {props.selected && (
          <div className="absolute top-0 right-0 flex flex-col gap-1 p-1">
            <button
              onClick={rotateClockwise}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Rotate Clockwise"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
              </svg>
            </button>
            
            <button
              onClick={rotateCounterClockwise}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Rotate Counter-Clockwise"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" transform="scale(-1, 1) translate(-24, 0)" />
              </svg>
            </button>
            
            <button
              onClick={resetRotation}
              className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="Reset Rotation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
              </svg>
            </button>
            
            <div className="text-xs text-center bg-gray-800 text-white px-2 py-1 rounded">
              {rotation}°
            </div>
          </div>
        )}
      </div>
    );
  };

  RotatableComponent.displayName = `withRotation(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return RotatableComponent;
}

export default withRotation;