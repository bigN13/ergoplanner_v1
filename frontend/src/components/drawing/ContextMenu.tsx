"use client";

import {
  Copy,
  Clipboard,
  Trash2,
  RotateCcw,
  RotateCw,
  Move,
  Lock,
  Unlock,
  // Eye,
  // EyeOff,
  // Layers,
  Settings,
  // Info,
  ArrowUp,
  ArrowDown,
  Group,
  Ungroup,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import type { Node, Edge } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

interface ContextMenuProps {
  x: number;
  y: number;
  selectedNode?: Node | null;
  selectedEdge?: Edge | null;
  selectedNodes?: Node[];
  onClose: () => void;
  onAction: (action: string, data?: unknown) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
  action: () => void;
}

export default function ContextMenu({
  x,
  y,
  selectedNode,
  selectedEdge,
  selectedNodes = [],
  onClose,
  onAction,
}: ContextMenuProps): React.ReactElement {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<unknown>(null);

  const { deleteNode, deleteEdge, markDirty, addNode } = useDrawingStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as HTMLElement)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const hasSelection = selectedNode || selectedEdge || selectedNodes.length > 0;
  const isMultipleSelection = selectedNodes.length > 1;
  const isNodeSelected = selectedNode || selectedNodes.length > 0;
  // const isEdgeSelected = selectedEdge; // Currently unused

  const handleCopy = (): void => {
    if (selectedNode) {
      setClipboard({ type: "node", data: selectedNode });
      onAction("copy", selectedNode);
    } else if (selectedNodes.length > 0) {
      setClipboard({ type: "nodes", data: selectedNodes });
      onAction("copy", selectedNodes);
    }
    onClose();
  };

  const handleCut = (): void => {
    handleCopy();
    handleDelete();
  };

  const handlePaste = (): void => {
    if (clipboard) {
      onAction("paste", { clipboard, position: { x, y } });
    }
    onClose();
  };

  const handleDelete = (): void => {
    if (selectedNode) {
      deleteNode(selectedNode.id);
      onAction("delete", selectedNode);
    } else if (selectedEdge) {
      deleteEdge(selectedEdge.id);
      onAction("delete", selectedEdge);
    } else if (selectedNodes.length > 0) {
      selectedNodes.forEach((node) => deleteNode(node.id));
      onAction("delete", selectedNodes);
    }
    markDirty();
    onClose();
  };

  const handleDuplicate = (): void => {
    if (selectedNode) {
      const newNode = {
        ...selectedNode,
        id: `${selectedNode.id}-copy-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 20,
          y: selectedNode.position.y + 20,
        },
      };
      addNode(newNode);
      onAction("duplicate", newNode);
    } else if (selectedNodes.length > 0) {
      selectedNodes.forEach((node) => {
        const newNode = {
          ...node,
          id: `${node.id}-copy-${Date.now()}`,
          position: {
            x: node.position.x + 20,
            y: node.position.y + 20,
          },
        };
        addNode(newNode);
      });
      onAction("duplicate", selectedNodes);
    }
    markDirty();
    onClose();
  };

  const handleRotate = (direction: "cw" | "ccw"): void => {
    const rotation = direction === "cw" ? 90 : -90;
    onAction("rotate", {
      rotation,
      nodes: selectedNodes.length > 0 ? selectedNodes : [selectedNode],
    });
    onClose();
  };

  const handleLock = (): void => {
    onAction("lock", selectedNodes.length > 0 ? selectedNodes : [selectedNode]);
    onClose();
  };

  const handleUnlock = (): void => {
    onAction("unlock", selectedNodes.length > 0 ? selectedNodes : [selectedNode]);
    onClose();
  };

  const handleLayerAction = (action: string): void => {
    onAction(`layer-${action}`, selectedNodes.length > 0 ? selectedNodes : [selectedNode]);
    onClose();
  };

  const handleAlign = (alignment: string): void => {
    if (selectedNodes.length > 1) {
      onAction("align", { alignment, nodes: selectedNodes });
    }
    onClose();
  };

  const handleGroup = (): void => {
    if (selectedNodes.length > 1) {
      onAction("group", selectedNodes);
    }
    onClose();
  };

  const handleUngroup = (): void => {
    onAction("ungroup", selectedNodes.length > 0 ? selectedNodes : [selectedNode]);
    onClose();
  };

  const editMenuItems: MenuItem[] = [
    {
      id: "copy",
      label: "Copy",
      icon: <Copy className="h-4 w-4" />,
      shortcut: "Ctrl+C",
      disabled: !hasSelection,
      action: handleCopy,
    },
    {
      id: "cut",
      label: "Cut",
      icon: <Clipboard className="h-4 w-4" />,
      shortcut: "Ctrl+X",
      disabled: !hasSelection,
      action: handleCut,
    },
    {
      id: "paste",
      label: "Paste",
      icon: <Clipboard className="h-4 w-4" />,
      shortcut: "Ctrl+V",
      disabled: !clipboard,
      action: handlePaste,
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: <Copy className="h-4 w-4" />,
      shortcut: "Ctrl+D",
      disabled: !hasSelection,
      action: handleDuplicate,
    },
    {
      id: "divider-1",
      label: "",
      icon: null,
      divider: true,
      action: () => {},
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      shortcut: "Del",
      disabled: !hasSelection,
      action: handleDelete,
    },
  ];

  const transformMenuItems: MenuItem[] = [
    {
      id: "rotate-cw",
      label: "Rotate Clockwise",
      icon: <RotateCw className="h-4 w-4" />,
      disabled: !isNodeSelected,
      action: () => handleRotate("cw"),
    },
    {
      id: "rotate-ccw",
      label: "Rotate Counter-clockwise",
      icon: <RotateCcw className="h-4 w-4" />,
      disabled: !isNodeSelected,
      action: () => handleRotate("ccw"),
    },
    {
      id: "divider-2",
      label: "",
      icon: null,
      divider: true,
      action: () => {},
    },
    {
      id: "lock",
      label: "Lock",
      icon: <Lock className="h-4 w-4" />,
      disabled: !hasSelection,
      action: handleLock,
    },
    {
      id: "unlock",
      label: "Unlock",
      icon: <Unlock className="h-4 w-4" />,
      disabled: !hasSelection,
      action: handleUnlock,
    },
  ];

  const alignMenuItems: MenuItem[] = [
    {
      id: "align-left",
      label: "Align Left",
      icon: <AlignLeft className="h-4 w-4" />,
      disabled: !isMultipleSelection,
      action: () => handleAlign("left"),
    },
    {
      id: "align-center",
      label: "Align Center",
      icon: <AlignCenter className="h-4 w-4" />,
      disabled: !isMultipleSelection,
      action: () => handleAlign("center"),
    },
    {
      id: "align-right",
      label: "Align Right",
      icon: <AlignRight className="h-4 w-4" />,
      disabled: !isMultipleSelection,
      action: () => handleAlign("right"),
    },
    {
      id: "align-top",
      label: "Align Top",
      icon: <AlignJustify className="h-4 w-4 rotate-90" />,
      disabled: !isMultipleSelection,
      action: () => handleAlign("top"),
    },
    {
      id: "align-middle",
      label: "Align Middle",
      icon: <AlignCenter className="h-4 w-4 rotate-90" />,
      disabled: !isMultipleSelection,
      action: () => handleAlign("middle"),
    },
    {
      id: "align-bottom",
      label: "Align Bottom",
      icon: <AlignJustify className="h-4 w-4 rotate-90" />,
      disabled: !isMultipleSelection,
      action: () => handleAlign("bottom"),
    },
  ];

  const layerMenuItems: MenuItem[] = [
    {
      id: "bring-forward",
      label: "Bring Forward",
      icon: <ArrowUp className="h-4 w-4" />,
      disabled: !hasSelection,
      action: () => handleLayerAction("bring-forward"),
    },
    {
      id: "send-backward",
      label: "Send Backward",
      icon: <ArrowDown className="h-4 w-4" />,
      disabled: !hasSelection,
      action: () => handleLayerAction("send-backward"),
    },
    {
      id: "bring-to-front",
      label: "Bring to Front",
      icon: <ArrowUp className="h-4 w-4" />,
      disabled: !hasSelection,
      action: () => handleLayerAction("bring-to-front"),
    },
    {
      id: "send-to-back",
      label: "Send to Back",
      icon: <ArrowDown className="h-4 w-4" />,
      disabled: !hasSelection,
      action: () => handleLayerAction("send-to-back"),
    },
  ];

  const groupMenuItems: MenuItem[] = [
    {
      id: "group",
      label: "Group",
      icon: <Group className="h-4 w-4" />,
      shortcut: "Ctrl+G",
      disabled: !isMultipleSelection,
      action: handleGroup,
    },
    {
      id: "ungroup",
      label: "Ungroup",
      icon: <Ungroup className="h-4 w-4" />,
      shortcut: "Ctrl+Shift+G",
      disabled: !hasSelection,
      action: handleUngroup,
    },
  ];

  const mainMenuItems: MenuItem[] = [
    ...editMenuItems,
    {
      id: "divider-main-1",
      label: "",
      icon: null,
      divider: true,
      action: () => {},
    },
    {
      id: "arrange",
      label: "Arrange",
      icon: <Move className="h-4 w-4" />,
      submenu: [
        ...transformMenuItems,
        {
          id: "divider-arrange-1",
          label: "",
          icon: null,
          divider: true,
          action: () => {},
        },
        ...layerMenuItems,
      ],
      action: () => setSubmenuOpen("arrange"),
    },
    {
      id: "align",
      label: "Align",
      icon: <AlignCenter className="h-4 w-4" />,
      disabled: !isMultipleSelection,
      submenu: alignMenuItems,
      action: () => setSubmenuOpen("align"),
    },
    {
      id: "group-menu",
      label: "Group",
      icon: <Group className="h-4 w-4" />,
      submenu: groupMenuItems,
      action: () => setSubmenuOpen("group-menu"),
    },
    {
      id: "divider-main-2",
      label: "",
      icon: null,
      divider: true,
      action: () => {},
    },
    {
      id: "properties",
      label: "Properties",
      icon: <Settings className="h-4 w-4" />,
      disabled: !hasSelection,
      action: () => {
        onAction("properties", selectedNode || selectedEdge || selectedNodes);
        onClose();
      },
    },
  ];

  const renderMenuItem = (item: MenuItem, level = 0): React.ReactElement => {
    if (item.divider) {
      return <div key={item.id} className="my-1 border-t border-gray-200" />;
    }

    return (
      <div
        key={item.id}
        className={`relative flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
          item.disabled ? "cursor-not-allowed text-gray-400" : "text-gray-700 hover:bg-gray-100"
        } ${level > 0 ? "pl-6" : ""} `}
        onClick={item.disabled ? undefined : item.action}
        onMouseEnter={() => item.submenu && setSubmenuOpen(item.id)}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {item.shortcut && <span className="text-xs text-gray-400">{item.shortcut}</span>}
        {item.submenu && <span className="text-gray-400">▶</span>}
      </div>
    );
  };

  const renderSubmenu = (items: MenuItem[], parentId: string): React.ReactElement | null => {
    if (submenuOpen !== parentId) return null;

    return (
      <div className="absolute top-0 left-full z-50 ml-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
        {items.map((item) => renderMenuItem(item, 1))}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      style={{
        left: x,
        top: y,
        maxHeight: "400px",
        overflowY: "auto",
      }}
      onMouseLeave={() => setSubmenuOpen(null)}
    >
      {mainMenuItems.map((item) => (
        <div key={item.id} className="relative">
          {renderMenuItem(item)}
          {item.submenu && renderSubmenu(item.submenu, item.id)}
        </div>
      ))}
    </div>
  );
}
