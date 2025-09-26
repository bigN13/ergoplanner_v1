import type { ComponentType} from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../nodes/BaseSymbolNode';

export interface ResizingControls {
  width: number;
  height: number;
  scale: number;
  onResize: (width: number, height: number) => void;
  onScale: (scale: number) => void;
  resetSize: () => void;
}

export interface WithResizingProps {
  width?: number;
  height?: number;
  scale?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  minScale?: number;
  maxScale?: number;
  maintainAspectRatio?: boolean;
  allowResizing?: boolean;
}

/**
 * HOC that adds resizing capabilities to a symbol component
 */
export function withResizing<T extends BaseSymbolData>(
  WrappedComponent: ComponentType<NodeProps<T>>
): ComponentType<NodeProps<T & WithResizingProps>> {
  const ResizableComponent = (props: NodeProps<T & WithResizingProps>) => {
    const { data, ...restProps } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    
    const defaultWidth = data.width || 100;
    const defaultHeight = data.height || 100;
    const defaultScale = data.scale || 1;
    
    const [width, setWidth] = useState(defaultWidth);
    const [height, setHeight] = useState(defaultHeight);
    const [scale, setScale] = useState(defaultScale);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
    const [initialSize, setInitialSize] = useState({ width: defaultWidth, height: defaultHeight });

    const minWidth = data.minWidth || 50;
    const minHeight = data.minHeight || 50;
    const maxWidth = data.maxWidth || 500;
    const maxHeight = data.maxHeight || 500;
    const minScale = data.minScale || 0.5;
    const maxScale = data.maxScale || 3;
    const maintainAspectRatio = data.maintainAspectRatio !== false;
    const allowResizing = data.allowResizing !== false;

    const handleResize = useCallback(
      (newWidth: number, newHeight: number) => {
        const finalWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        let finalHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

        if (maintainAspectRatio) {
          const aspectRatio = defaultWidth / defaultHeight;
          if (Math.abs(finalWidth / finalHeight - aspectRatio) > 0.01) {
            finalHeight = finalWidth / aspectRatio;
          }
        }

        setWidth(finalWidth);
        setHeight(finalHeight);
      },
      [minWidth, maxWidth, minHeight, maxHeight, maintainAspectRatio, defaultWidth, defaultHeight]
    );

    const handleScale = useCallback(
      (newScale: number) => {
        const finalScale = Math.max(minScale, Math.min(maxScale, newScale));
        setScale(finalScale);
      },
      [minScale, maxScale]
    );

    const resetSize = useCallback(() => {
      setWidth(defaultWidth);
      setHeight(defaultHeight);
      setScale(1);
    }, [defaultWidth, defaultHeight]);

    const startResize = useCallback(
      (e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        setInitialMousePos({ x: e.clientX, y: e.clientY });
        setInitialSize({ width, height });
      },
      [width, height]
    );

    useEffect(() => {
      if (!isResizing) return;

      const handleMouseMove = (e: MouseEvent): void => {
        if (!resizeHandle) return;

        const dx = e.clientX - initialMousePos.x;
        const dy = e.clientY - initialMousePos.y;

        let newWidth = initialSize.width;
        let newHeight = initialSize.height;

        switch (resizeHandle) {
          case 'se':
            newWidth = initialSize.width + dx;
            newHeight = initialSize.height + dy;
            break;
          case 'sw':
            newWidth = initialSize.width - dx;
            newHeight = initialSize.height + dy;
            break;
          case 'ne':
            newWidth = initialSize.width + dx;
            newHeight = initialSize.height - dy;
            break;
          case 'nw':
            newWidth = initialSize.width - dx;
            newHeight = initialSize.height - dy;
            break;
          case 'e':
            newWidth = initialSize.width + dx;
            break;
          case 'w':
            newWidth = initialSize.width - dx;
            break;
          case 'n':
            newHeight = initialSize.height - dy;
            break;
          case 's':
            newHeight = initialSize.height + dy;
            break;
        }

        handleResize(newWidth, newHeight);
      };

      const handleMouseUp = (): void => {
        setIsResizing(false);
        setResizeHandle(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isResizing, resizeHandle, initialMousePos, initialSize, handleResize]);

    if (!allowResizing) {
      return <WrappedComponent data={data} {...restProps} />;
    }

    const resizedData = {
      ...data,
      width,
      height,
      scale,
      onResize: handleResize,
      onScale: handleScale,
      resetSize,
    };

    const handles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    const handleStyles: Record<string, React.CSSProperties> = {
      n: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      ne: { top: -4, right: -4, cursor: 'nesw-resize' },
      e: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' },
      se: { bottom: -4, right: -4, cursor: 'nwse-resize' },
      s: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      sw: { bottom: -4, left: -4, cursor: 'nesw-resize' },
      w: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' },
      nw: { top: -4, left: -4, cursor: 'nwse-resize' },
    };

    return (
      <div
        ref={containerRef}
        className="relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: isResizing ? 'none' : 'transform 0.2s ease-in-out',
        }}
      >
        <WrappedComponent data={resizedData} {...restProps} />
        
        {/* Resize handles */}
        {props.selected && (
          <>
            {handles.map((handle) => (
              <div
                key={handle}
                className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full"
                style={{
                  ...handleStyles[handle],
                  opacity: isResizing && resizeHandle === handle ? 1 : 0.7,
                }}
                onMouseDown={(e) => startResize(e, handle)}
              />
            ))}
            
            {/* Size info overlay */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {Math.round(width)} × {Math.round(height)} ({Math.round(scale * 100)}%)
            </div>
            
            {/* Scale controls */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-1 flex gap-1">
              <button
                onClick={() => handleScale(scale - 0.1)}
                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Scale Down"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z" />
                </svg>
              </button>
              
              <button
                onClick={() => handleScale(1)}
                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs"
                title="Reset Scale"
              >
                100%
              </button>
              
              <button
                onClick={() => handleScale(scale + 0.1)}
                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Scale Up"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  ResizableComponent.displayName = `withResizing(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ResizableComponent;
}

export default withResizing;