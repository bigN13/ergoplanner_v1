"use client";

import React, { useEffect, useState, useCallback } from "react";

import { useDropZone } from "@/contexts/DropZoneContext";

interface GuideLineElement {
  id: string;
  bounds: DOMRect;
  centerX: number;
  centerY: number;
}

interface GuideLine {
  type: "vertical" | "horizontal";
  position: number;
  elements: string[];
  isActive: boolean;
}

interface DistanceIndicator {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance: number;
}

interface SmartGuidesProps {
  elements: GuideLineElement[];
  snapDistance?: number;
  showDistances?: boolean;
  guideColor?: string;
}

export default function SmartGuides({
  elements = [],
  snapDistance = 10,
  showDistances = true,
  guideColor = "rgba(99, 102, 241, 0.5)",
}: SmartGuidesProps): React.ReactElement {
  const { dragItem } = useDropZone();
  const [guidelines, setGuidelines] = useState<GuideLine[]>([]);
  const [distances, setDistances] = useState<DistanceIndicator[]>([]);
  const [, setDragPosition] = useState({ x: 0, y: 0 });

  const detectAlignment = useCallback(
    (dragX: number, dragY: number, dragWidth: number, dragHeight: number) => {
      const newGuidelines: GuideLine[] = [];
      const newDistances: DistanceIndicator[] = [];

      const dragCenterX = dragX + dragWidth / 2;
      const dragCenterY = dragY + dragHeight / 2;
      const dragRight = dragX + dragWidth;
      const dragBottom = dragY + dragHeight;

      elements.forEach((element) => {
        const elementRight = element.bounds.left + element.bounds.width;
        const elementBottom = element.bounds.top + element.bounds.height;

        // Check vertical alignments
        const verticalChecks = [
          { pos: element.bounds.left, type: "left" },
          { pos: element.centerX, type: "center" },
          { pos: elementRight, type: "right" },
        ];

        const dragVerticalPoints = [
          { pos: dragX, type: "left" },
          { pos: dragCenterX, type: "center" },
          { pos: dragRight, type: "right" },
        ];

        verticalChecks.forEach((elementCheck) => {
          dragVerticalPoints.forEach((dragCheck) => {
            if (Math.abs(elementCheck.pos - dragCheck.pos) < snapDistance) {
              let guideline = newGuidelines.find(
                (g) => g.type === "vertical" && Math.abs(g.position - elementCheck.pos) < 1
              );
              if (!guideline) {
                guideline = {
                  type: "vertical",
                  position: elementCheck.pos,
                  elements: [],
                  isActive: true,
                };
                newGuidelines.push(guideline);
              }
              guideline.elements.push(element.id);
            }
          });
        });

        // Check horizontal alignments
        const horizontalChecks = [
          { pos: element.bounds.top, type: "top" },
          { pos: element.centerY, type: "middle" },
          { pos: elementBottom, type: "bottom" },
        ];

        const dragHorizontalPoints = [
          { pos: dragY, type: "top" },
          { pos: dragCenterY, type: "middle" },
          { pos: dragBottom, type: "bottom" },
        ];

        horizontalChecks.forEach((elementCheck) => {
          dragHorizontalPoints.forEach((dragCheck) => {
            if (Math.abs(elementCheck.pos - dragCheck.pos) < snapDistance) {
              let guideline = newGuidelines.find(
                (g) => g.type === "horizontal" && Math.abs(g.position - elementCheck.pos) < 1
              );
              if (!guideline) {
                guideline = {
                  type: "horizontal",
                  position: elementCheck.pos,
                  elements: [],
                  isActive: true,
                };
                newGuidelines.push(guideline);
              }
              guideline.elements.push(element.id);
            }
          });
        });

        // Calculate distances for nearest elements
        if (showDistances) {
          // Horizontal distance
          const horizontalGap = dragX - elementRight;
          if (horizontalGap > 0 && horizontalGap < 100) {
            newDistances.push({
              x1: elementRight,
              y1: element.centerY,
              x2: dragX,
              y2: element.centerY,
              distance: Math.round(horizontalGap),
            });
          }

          // Vertical distance
          const verticalGap = dragY - elementBottom;
          if (verticalGap > 0 && verticalGap < 100) {
            newDistances.push({
              x1: element.centerX,
              y1: elementBottom,
              x2: element.centerX,
              y2: dragY,
              distance: Math.round(verticalGap),
            });
          }
        }
      });

      setGuidelines(newGuidelines);
      setDistances(newDistances);
    },
    [elements, snapDistance, showDistances]
  );

  useEffect(() => {
    if (!dragItem) {
      setGuidelines([]);
      setDistances([]);
      return;
    }

    const handleMouseMove = (e: MouseEvent): void => {
      setDragPosition({ x: e.clientX, y: e.clientY });
      // Assume a default drag size, this should come from the actual dragged element
      detectAlignment(e.clientX - 50, e.clientY - 30, 100, 60);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [dragItem, detectAlignment]);

  if (!dragItem || guidelines.length === 0) {
    return <></>;
  }

  return (
    <svg
      className="smart-guides-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9998,
      }}
    >
      {/* Render guide lines */}
      {guidelines.map((guide, index) => {
        if (guide.type === "vertical") {
          return (
            <line
              key={`guide-${index}`}
              x1={guide.position}
              y1={0}
              x2={guide.position}
              y2={window.innerHeight}
              stroke={guideColor}
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          );
        } else {
          return (
            <line
              key={`guide-${index}`}
              x1={0}
              y1={guide.position}
              x2={window.innerWidth}
              y2={guide.position}
              stroke={guideColor}
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          );
        }
      })}

      {/* Render distance indicators */}
      {distances.map((distance, index) => (
        <g key={`distance-${index}`}>
          <line
            x1={distance.x1}
            y1={distance.y1}
            x2={distance.x2}
            y2={distance.y2}
            stroke={guideColor}
            strokeWidth="1"
            markerStart="url(#arrow)"
            markerEnd="url(#arrow)"
          />
          <text
            x={(distance.x1 + distance.x2) / 2}
            y={(distance.y1 + distance.y2) / 2 - 5}
            fill={guideColor}
            fontSize="12"
            textAnchor="middle"
            style={{ fontFamily: "monospace" }}
          >
            {distance.distance}px
          </text>
        </g>
      ))}

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={guideColor} />
        </marker>
      </defs>
    </svg>
  );
}