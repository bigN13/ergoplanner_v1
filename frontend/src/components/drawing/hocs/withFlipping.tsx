import type { ComponentType} from 'react';
import React, { useState, useCallback } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../nodes/BaseSymbolNode';

export interface FlippingControls {
  flipHorizontal: boolean;
  flipVertical: boolean;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  resetFlipping: () => void;
}

export interface WithFlippingProps {
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  allowFlipping?: boolean;
}

/**
 * HOC that adds flipping capabilities to a symbol component
 */
export function withFlipping<T extends BaseSymbolData>(
  WrappedComponent: ComponentType<NodeProps<T>>
): ComponentType<NodeProps<T & WithFlippingProps>> {
  const FlippableComponent = (props: NodeProps<T & WithFlippingProps>) => {
    const { data, ...restProps } = props;
    const [flipHorizontal, setFlipHorizontal] = useState(data.flipHorizontal || false);
    const [flipVertical, setFlipVertical] = useState(data.flipVertical || false);

    const allowFlipping = data.allowFlipping !== false;

    const handleFlipHorizontal = useCallback(() => {
      setFlipHorizontal((prev) => !prev);
    }, []);

    const handleFlipVertical = useCallback(() => {
      setFlipVertical((prev) => !prev);
    }, []);

    const resetFlipping = useCallback(() => {
      setFlipHorizontal(false);
      setFlipVertical(false);
    }, []);

    if (!allowFlipping) {
      return <WrappedComponent data={data} {...restProps} />;
    }

    const flippedData = {
      ...data,
      flipHorizontal,
      flipVertical,
      onFlipHorizontal: handleFlipHorizontal,
      onFlipVertical: handleFlipVertical,
      resetFlipping,
    };

    const scaleX = flipHorizontal ? -1 : 1;
    const scaleY = flipVertical ? -1 : 1;

    return (
      <div
        style={{
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-in-out',
          width: '100%',
          height: '100%',
        }}
      >
        <WrappedComponent data={flippedData} {...restProps} />
        
        {/* Flipping controls overlay */}
        {props.selected && (
          <div
            className="absolute top-0 left-0 flex gap-1 p-1"
            style={{
              transform: `scale(${scaleX}, ${scaleY})`,
            }}
          >
            <button
              onClick={handleFlipHorizontal}
              className={`p-1 rounded transition-colors ${
                flipHorizontal
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title="Flip Horizontal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 21h2v-2h-2v2zm4 0h2v-2h-2v2zM7 21h2v-2H7v2zm4 0h2v-2h-2v2zm8-4h2v-2h-2v2zm0-4h2v-2h-2v2zM3 3v18h2V3H3zm16 6h2V7h-2v2zm0-4h2V3h-2v2zm-4 0h2V3h-2v2zm-8 8h2v-2H7v2zm0-4h2V7H7v2zm0-4h2V3H7v2zm4 4h2V7h-2v2zm0-4h2V3h-2v2zm0 8h2v-2h-2v2z" />
              </svg>
            </button>
            
            <button
              onClick={handleFlipVertical}
              className={`p-1 rounded transition-colors ${
                flipVertical
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title="Flip Vertical"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 15v2h2v-2H3zm0 4v2h2v-2H3zm2-8v2H3v-2h2zm0-4v2H3V7h2zm0-4v2H3V3h2zm16 0v2h-2V3h2zm-8 0v2h-2V3h2zm4 0v2h-2V3h2zm-8 0v2H7V3h2zm12 16v2h-2v-2h2zm0-4v2h-2v-2h2zM11 21h2v-2h-2v2zm4 0h2v-2h-2v2zm-8 0h2v-2H7v2zm12-8v2h-2v-2h2zm0-4v2h-2V9h2zm0-4v2h-2V5h2z" />
              </svg>
            </button>
            
            {(flipHorizontal || flipVertical) && (
              <button
                onClick={resetFlipping}
                className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                title="Reset Flipping"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  FlippableComponent.displayName = `withFlipping(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return FlippableComponent;
}

export default withFlipping;