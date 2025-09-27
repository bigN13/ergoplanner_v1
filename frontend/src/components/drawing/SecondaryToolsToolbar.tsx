"use client";

import {
  AlignCenter,
  AlignCenterVertical,
  AlignEndVertical,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  ChevronDown,
  Copy,
  FileText,
  FlipHorizontal,
  FlipVertical,
  Grid3x3,
  Hash,
  Image as ImageIcon,
  Layers,
  Link,
  PaintBucket,
  Paintbrush,
  Palette,
  Plus,
  RotateCw,
  Table,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useDrawingStore } from "@/store/drawingStore";

interface SecondaryToolsToolbarProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

interface MenuState {
  insert: boolean;
  arrange: boolean;
  format: boolean;
}

interface NodeFormatting {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
}

export default function SecondaryToolsToolbar({
  orientation = "horizontal",
  className = "",
}: SecondaryToolsToolbarProps): ReactElement {
  const [activeMenu, setActiveMenu] = useState<keyof MenuState | null>(null);
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<NodeFormatting | null>(null);

  const insertMenuRef = useRef<HTMLDivElement>(null);
  const arrangeMenuRef = useRef<HTMLDivElement>(null);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  const {
    addNode,
    updateNode,
  } = useDrawingStore();

  // These will be replaced with proper implementations later
   
  const selectedNode: any = null;
   
  const selectedNodes: any[] = [];
   
  const groupNodes = (() => {}) as any;
   
  const ungroupNodes = (() => {}) as any;
   
  const alignNodes = (() => {}) as any;
   
  const distributeNodes = (() => {}) as any;

  // Keyboard shortcuts
  useHotkeys("ctrl+shift+i", () => toggleMenu("insert"), []);
  useHotkeys("ctrl+g", () => handleGroupNodes(), [selectedNodes]);
  useHotkeys("ctrl+shift+g", () => handleUngroupNodes(), [selectedNodes]);
  useHotkeys("ctrl+shift+c", () => handleCopyFormat(), [selectedNode]);
  useHotkeys("ctrl+shift+v", () => handlePasteFormat(), [copiedFormat, selectedNodes]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (insertMenuRef.current && !insertMenuRef.current.contains(target)) {
        setActiveMenu((prev) => (prev === "insert" ? null : prev));
      }
      if (arrangeMenuRef.current && !arrangeMenuRef.current.contains(target)) {
        setActiveMenu((prev) => (prev === "arrange" ? null : prev));
      }
      if (formatMenuRef.current && !formatMenuRef.current.contains(target)) {
        setActiveMenu((prev) => (prev === "format" ? null : prev));
      }
    };

    if (activeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu]);

  const toggleMenu = (menu: keyof MenuState): void => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  // Insert menu handlers
  const handleInsertImage = (): void => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          addNode({
            id: `image-${Date.now()}`,
            type: "image",
            position: { x: 100, y: 100 },
            data: {
              url: imageUrl,
              width: 200,
              height: 200,
            },
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    setActiveMenu(null);
  };

  const handleInsertTable = (): void => {
    addNode({
      id: `table-${Date.now()}`,
      type: "table",
      position: { x: 100, y: 100 },
      data: {
        rows: 3,
        columns: 3,
        headers: true,
      },
    });
    setActiveMenu(null);
  };

  const handleInsertLink = (): void => {
    // eslint-disable-next-line no-alert
    const url = prompt("Enter URL:");
    if (url) {
      addNode({
        id: `link-${Date.now()}`,
        type: "text",
        position: { x: 100, y: 100 },
        data: {
          text: url,
          isLink: true,
          url,
        },
      });
    }
    setActiveMenu(null);
  };

  const handleInsertEquation = (): void => {
    // eslint-disable-next-line no-alert
    const latex = prompt("Enter LaTeX equation:");
    if (latex) {
      addNode({
        id: `equation-${Date.now()}`,
        type: "equation",
        position: { x: 100, y: 100 },
        data: {
          latex,
        },
      });
    }
    setActiveMenu(null);
  };

  // Arrange menu handlers
  const handleAlign = (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"): void => {
    if (selectedNodes && selectedNodes.length > 1) {
      alignNodes?.(selectedNodes, alignment);
    }
    setActiveMenu(null);
  };

  const handleDistribute = (direction: "horizontal" | "vertical"): void => {
    if (selectedNodes && selectedNodes.length > 2) {
      distributeNodes?.(selectedNodes, direction);
    }
    setActiveMenu(null);
  };

  const handleGroupNodes = (): void => {
    if (selectedNodes && selectedNodes.length > 1) {
      groupNodes?.(selectedNodes);
    }
    setActiveMenu(null);
  };

  const handleUngroupNodes = (): void => {
    if (selectedNodes && selectedNodes.length > 0) {
      ungroupNodes?.(selectedNodes);
    }
    setActiveMenu(null);
  };

  const handleRotate = (angle: number): void => {
    selectedNodes?.forEach((node: any) => {
      updateNode?.(node.id, {
        ...node,
        data: {
          ...node.data,
          rotation: ((node.data?.rotation || 0) + angle) % 360,
        },
      });
    });
    setActiveMenu(null);
  };

  const handleFlip = (direction: "horizontal" | "vertical"): void => {
    selectedNodes?.forEach((node: any) => {
      updateNode?.(node.id, {
        ...node,
        data: {
          ...node.data,
          [`flip${direction.charAt(0).toUpperCase() + direction.slice(1)}`]:
            !node.data?.[`flip${direction.charAt(0).toUpperCase() + direction.slice(1)}`],
        },
      });
    });
    setActiveMenu(null);
  };

  // Format menu handlers
  const handleCopyFormat = (): void => {
    if (selectedNode) {
      setCopiedFormat({
        fill: selectedNode.style?.backgroundColor,
        stroke: selectedNode.style?.borderColor,
        strokeWidth: selectedNode.style?.borderWidth,
        fontSize: selectedNode.style?.fontSize,
        fontFamily: selectedNode.style?.fontFamily,
        opacity: selectedNode.style?.opacity,
      });
      setFormatPainterActive(true);
    }
    setActiveMenu(null);
  };

  const handlePasteFormat = (): void => {
    if (copiedFormat && selectedNodes) {
      selectedNodes.forEach((node: any) => {
        updateNode?.(node.id, {
          ...node,
          style: {
            ...node.style,
            ...copiedFormat,
          },
        });
      });
    }
    setFormatPainterActive(false);
    setActiveMenu(null);
  };

  const handleClearFormatting = (): void => {
    selectedNodes?.forEach((node: any) => {
      updateNode?.(node.id, {
        ...node,
        style: {},
      });
    });
    setActiveMenu(null);
  };

  return (
    <div
      className={`flex items-center rounded-lg border bg-white p-1 shadow-sm ${
        orientation === "vertical" ? "w-12 flex-col" : ""
      } ${className}`}
    >
      {/* Insert Menu */}
      <div className="relative" ref={insertMenuRef}>
        <button
          onClick={() => toggleMenu("insert")}
          className={`flex items-center gap-1 rounded px-2 py-1.5 transition-colors ${
            activeMenu === "insert" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          }`}
          title="Insert (Ctrl+Shift+I)"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Insert</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {activeMenu === "insert" && (
          <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-md border bg-white shadow-lg">
            <button
              onClick={handleInsertImage}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Image</span>
            </button>
            <button
              onClick={handleInsertTable}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Table className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button
              onClick={handleInsertLink}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Link className="h-4 w-4" />
              <span>Link</span>
            </button>
            <button
              onClick={handleInsertEquation}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Hash className="h-4 w-4" />
              <span>Equation</span>
            </button>
            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
              <FileText className="h-4 w-4" />
              <span>From Template</span>
            </button>
          </div>
        )}
      </div>

      {/* Arrange Menu */}
      <div className="relative" ref={arrangeMenuRef}>
        <button
          onClick={() => toggleMenu("arrange")}
          className={`flex items-center gap-1 rounded px-2 py-1.5 transition-colors ${
            activeMenu === "arrange" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          }`}
          title="Arrange"
        >
          <Grid3x3 className="h-4 w-4" />
          <span className="text-sm">Arrange</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {activeMenu === "arrange" && (
          <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-md border bg-white shadow-lg">
            <div className="border-b p-2">
              <div className="mb-1 text-xs font-semibold text-gray-500">Alignment</div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAlign("left")}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAlign("center")}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAlign("right")}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <div className="mx-1 border-l" />
                <button
                  onClick={() => handleAlign("top")}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Align Top"
                >
                  <AlignStartVertical className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAlign("middle")}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Align Middle"
                >
                  <AlignCenterVertical className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAlign("bottom")}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Align Bottom"
                >
                  <AlignEndVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => handleDistribute("horizontal")}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Grid3x3 className="h-4 w-4" />
              <span>Distribute Horizontally</span>
            </button>
            <button
              onClick={() => handleDistribute("vertical")}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Grid3x3 className="h-4 w-4 rotate-90" />
              <span>Distribute Vertically</span>
            </button>

            <div className="border-t" />

            <button
              onClick={handleGroupNodes}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Layers className="h-4 w-4" />
              <span>Group (Ctrl+G)</span>
            </button>
            <button
              onClick={handleUngroupNodes}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Layers className="h-4 w-4" />
              <span>Ungroup (Ctrl+Shift+G)</span>
            </button>

            <div className="border-t" />

            <button
              onClick={() => handleRotate(90)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <RotateCw className="h-4 w-4" />
              <span>Rotate 90°</span>
            </button>
            <button
              onClick={() => handleFlip("horizontal")}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <FlipHorizontal className="h-4 w-4" />
              <span>Flip Horizontal</span>
            </button>
            <button
              onClick={() => handleFlip("vertical")}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <FlipVertical className="h-4 w-4" />
              <span>Flip Vertical</span>
            </button>
          </div>
        )}
      </div>

      {/* Format Menu */}
      <div className="relative" ref={formatMenuRef}>
        <button
          onClick={() => toggleMenu("format")}
          className={`flex items-center gap-1 rounded px-2 py-1.5 transition-colors ${
            activeMenu === "format" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          } ${formatPainterActive ? "bg-yellow-100" : ""}`}
          title="Format"
        >
          <Paintbrush className="h-4 w-4" />
          <span className="text-sm">Format</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {activeMenu === "format" && (
          <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-md border bg-white shadow-lg">
            <button
              onClick={handleCopyFormat}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Format (Ctrl+Shift+C)</span>
            </button>
            <button
              onClick={handlePasteFormat}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
              disabled={!copiedFormat}
            >
              <PaintBucket className="h-4 w-4" />
              <span>Paste Format (Ctrl+Shift+V)</span>
            </button>

            <div className="border-t" />

            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
              <Palette className="h-4 w-4" />
              <span>Themes</span>
            </button>
            <button
              onClick={handleClearFormatting}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <span>Clear Formatting</span>
            </button>
          </div>
        )}
      </div>

      {formatPainterActive && (
        <div className="ml-2 flex items-center rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
          Format Painter Active
        </div>
      )}
    </div>
  );
}