"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";

export interface DropZone {
  id: string;
  element: HTMLElement;
  type: "symbol" | "connection" | "container" | "canvas";
  acceptedTypes: string[];
  bounds: DOMRect;
  isActive: boolean;
  isValid: boolean;
  metadata?: Record<string, unknown>;
}

export interface DragItem {
  id: string;
  type: string;
  data: unknown;
  source: "palette" | "canvas" | "external";
  preview?: HTMLElement;
}

export type FeedbackState = "idle" | "hovering" | "valid_drop" | "invalid_drop";

interface DropZoneContextValue {
  dropZones: Map<string, DropZone>;
  activeDropZone: DropZone | null;
  dragItem: DragItem | null;
  feedbackState: FeedbackState;
  registerDropZone: (zone: Omit<DropZone, "bounds" | "isActive" | "isValid">) => void;
  unregisterDropZone: (id: string) => void;
  updateDropZone: (id: string, updates: Partial<DropZone>) => void;
  startDrag: (item: DragItem) => void;
  endDrag: () => void;
  updateDragPosition: (x: number, y: number) => void;
  validateDrop: (zoneId: string, item: DragItem) => boolean;
  getActiveDropZone: (x: number, y: number) => DropZone | null;
}

const DropZoneContext = createContext<DropZoneContextValue | undefined>(undefined);

export function useDropZone(): DropZoneContextValue {
  const context = useContext(DropZoneContext);
  if (!context) {
    throw new Error("useDropZone must be used within a DropZoneProvider");
  }
  return context;
}

interface DropZoneProviderProps {
  children: ReactNode;
}

export function DropZoneProvider({ children }: DropZoneProviderProps): React.ReactElement {
  const [dropZones] = useState<Map<string, DropZone>>(new Map());
  const [activeDropZone, setActiveDropZone] = useState<DropZone | null>(null);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize Intersection Observer for performance
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const zoneId = entry.target.getAttribute("data-dropzone-id");
          if (zoneId && dropZones.has(zoneId)) {
            const zone = dropZones.get(zoneId);
            if (zone) {
              zone.bounds = entry.boundingClientRect;
              zone.isActive = entry.isIntersecting;
              dropZones.set(zoneId, zone);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [dropZones]);

  const registerDropZone = useCallback(
    (zone: Omit<DropZone, "bounds" | "isActive" | "isValid">) => {
      const element = document.querySelector(`[data-dropzone-id="${zone.id}"]`) as HTMLElement;
      if (!element) return;

      const bounds = element.getBoundingClientRect();
      const fullZone: DropZone = {
        ...zone,
        element,
        bounds,
        isActive: false,
        isValid: false,
      };

      dropZones.set(zone.id, fullZone);
      observerRef.current?.observe(element);
    },
    [dropZones]
  );

  const unregisterDropZone = useCallback(
    (id: string) => {
      const zone = dropZones.get(id);
      if (zone) {
        observerRef.current?.unobserve(zone.element);
        dropZones.delete(id);
      }
    },
    [dropZones]
  );

  const updateDropZone = useCallback(
    (id: string, updates: Partial<DropZone>) => {
      const zone = dropZones.get(id);
      if (zone) {
        dropZones.set(id, { ...zone, ...updates });
      }
    },
    [dropZones]
  );

  const validateDrop = useCallback((zoneId: string, item: DragItem): boolean => {
    const zone = dropZones.get(zoneId);
    if (!zone) return false;

    // Check if zone accepts this type
    if (!zone.acceptedTypes.includes(item.type) && !zone.acceptedTypes.includes("*")) {
      return false;
    }

    // Additional validation logic based on zone type
    switch (zone.type) {
      case "symbol":
        return item.source === "palette" && item.type.includes("symbol");
      case "connection":
        return item.type === "pipe" || item.type === "wire";
      case "container":
        return true; // Containers accept anything
      case "canvas":
        return item.source !== "canvas"; // Canvas accepts everything except items already on it
      default:
        return true;
    }
  }, [dropZones]);

  const getActiveDropZone = useCallback(
    (x: number, y: number): DropZone | null => {
      for (const zone of dropZones.values()) {
        if (!zone.isActive) continue;

        const { left, right, top, bottom } = zone.bounds;
        if (x >= left && x <= right && y >= top && y <= bottom) {
          return zone;
        }
      }
      return null;
    },
    [dropZones]
  );

  const updateDragPosition = useCallback(
    (x: number, y: number) => {
      if (!dragItem) return;

      const zone = getActiveDropZone(x, y);

      if (zone !== activeDropZone) {
        // Zone changed
        if (activeDropZone) {
          updateDropZone(activeDropZone.id, { isValid: false });
        }

        if (zone) {
          const isValid = validateDrop(zone.id, dragItem);
          updateDropZone(zone.id, { isValid });
          setFeedbackState(isValid ? "valid_drop" : "invalid_drop");
        } else {
          setFeedbackState("hovering");
        }

        setActiveDropZone(zone);
      }
    },
    [dragItem, activeDropZone, getActiveDropZone, validateDrop, updateDropZone]
  );

  const startDrag = useCallback((item: DragItem) => {
    setDragItem(item);
    setFeedbackState("hovering");

    // Mark all compatible zones
    dropZones.forEach((zone) => {
      if (zone.acceptedTypes.includes(item.type) || zone.acceptedTypes.includes("*")) {
        zone.element.classList.add("drop-zone-compatible");
      }
    });
  }, [dropZones]);

  const endDrag = useCallback(() => {
    // Clean up all zones
    dropZones.forEach((zone) => {
      zone.element.classList.remove("drop-zone-compatible");
      updateDropZone(zone.id, { isValid: false });
    });

    setDragItem(null);
    setActiveDropZone(null);
    setFeedbackState("idle");
  }, [dropZones, updateDropZone]);

  const value: DropZoneContextValue = {
    dropZones,
    activeDropZone,
    dragItem,
    feedbackState,
    registerDropZone,
    unregisterDropZone,
    updateDropZone,
    startDrag,
    endDrag,
    updateDragPosition,
    validateDrop,
    getActiveDropZone,
  };

  return <DropZoneContext.Provider value={value}>{children}</DropZoneContext.Provider>;
}