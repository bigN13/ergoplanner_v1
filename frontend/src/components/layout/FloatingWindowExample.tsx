"use client";

import React from "react";
import { FloatingWindowProvider, useFloatingWindows } from "@/contexts/FloatingWindowContext";

/**
 * Example usage of FloatingWindowManager
 *
 * This demonstrates how to:
 * 1. Wrap your app with FloatingWindowProvider
 * 2. Register floating windows
 * 3. Use window controls (minimize, maximize, close)
 * 4. Arrange windows (cascade, tile)
 *
 * Usage in your layout:
 *
 * ```tsx
 * import { FloatingWindowProvider } from '@/contexts/FloatingWindowContext';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <FloatingWindowProvider>
 *           {children}
 *         </FloatingWindowProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * Then in any component:
 *
 * ```tsx
 * import { useFloatingWindows } from '@/contexts/FloatingWindowContext';
 * import { FloatingWindow } from '@/components/layout/FloatingWindow';
 *
 * function MyComponent() {
 *   const { registerWindow, arrangeWindows } = useFloatingWindows();
 *
 *   const handleCreateWindow = () => {
 *     registerWindow({
 *       id: 'my-window-1',
 *       title: 'My Window',
 *       position: { x: 100, y: 100 },
 *       size: { width: 400, height: 300 },
 *       isMinimized: false,
 *       isMaximized: false,
 *       panelId: 'panel-1',
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleCreateWindow}>Create Window</button>
 *       <button onClick={() => arrangeWindows('cascade')}>Cascade</button>
 *
 *       <FloatingWindow windowId="my-window-1">
 *         <div>Window content here</div>
 *       </FloatingWindow>
 *     </>
 *   );
 * }
 * ```
 */

const FloatingWindowControls: React.FC = () => {
  const {
    windows,
    registerWindow,
    arrangeWindows,
    tileWindows,
  } = useFloatingWindows();

  const handleCreateWindow = () => {
    const id = `window-${Date.now()}`;
    registerWindow({
      id,
      title: `Window ${windows.size + 1}`,
      position: { x: 100 + windows.size * 30, y: 100 + windows.size * 30 },
      size: { width: 400, height: 300 },
      isMinimized: false,
      isMaximized: false,
      panelId: `panel-${id}`,
    });
  };

  return (
    <div style={{ padding: "20px", borderBottom: "1px solid #ddd" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button onClick={handleCreateWindow} style={{ padding: "8px 16px" }}>
          Create Window
        </button>
        <button onClick={() => arrangeWindows("cascade")} style={{ padding: "8px 16px" }}>
          Cascade
        </button>
        <button onClick={() => tileWindows("horizontal")} style={{ padding: "8px 16px" }}>
          Tile Horizontal
        </button>
        <button onClick={() => tileWindows("vertical")} style={{ padding: "8px 16px" }}>
          Tile Vertical
        </button>
        <button onClick={() => tileWindows("grid")} style={{ padding: "8px 16px" }}>
          Tile Grid
        </button>
      </div>
      <div>Active Windows: {windows.size}</div>
    </div>
  );
};

/**
 * Example component demonstrating FloatingWindowManager
 */
export const FloatingWindowExample: React.FC = () => {
  return (
    <FloatingWindowProvider>
      <div style={{ width: "100vw", height: "100vh", backgroundColor: "#f0f0f0" }}>
        <FloatingWindowControls />

        {/* Render all registered floating windows */}
        {/* This would typically be done automatically by the dock layout */}
      </div>
    </FloatingWindowProvider>
  );
};
