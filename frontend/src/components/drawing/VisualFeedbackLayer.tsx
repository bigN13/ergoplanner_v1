"use client";

import React, { useEffect, useState } from "react";

import { useDropZone } from "@/contexts/DropZoneContext";

interface FeedbackColors {
  valid: string;
  invalid: string;
  hover: string;
  guide: string;
}

const defaultColors: FeedbackColors = {
  valid: "rgba(34, 197, 94, 0.1)", // green-500 with opacity
  invalid: "rgba(239, 68, 68, 0.1)", // red-500 with opacity
  hover: "rgba(59, 130, 246, 0.1)", // blue-500 with opacity
  guide: "rgba(99, 102, 241, 0.5)", // indigo-500 with opacity
};

export default function VisualFeedbackLayer(): React.ReactElement {
  const { activeDropZone, feedbackState, dragItem } = useDropZone();
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [cursorStyle, setCursorStyle] = useState<string>("auto");

  useEffect(() => {
    if (!dragItem) {
      setOverlayStyle({ display: "none" });
      setCursorStyle("auto");
      return;
    }

    switch (feedbackState) {
      case "valid_drop":
        if (activeDropZone) {
          setOverlayStyle({
            position: "fixed",
            left: activeDropZone.bounds.left,
            top: activeDropZone.bounds.top,
            width: activeDropZone.bounds.width,
            height: activeDropZone.bounds.height,
            backgroundColor: defaultColors.valid,
            border: "2px solid rgba(34, 197, 94, 0.5)",
            borderRadius: "4px",
            pointerEvents: "none",
            transition: "all 0.2s ease-in-out",
            zIndex: 9999,
          });
        }
        setCursorStyle("copy");
        break;

      case "invalid_drop":
        if (activeDropZone) {
          setOverlayStyle({
            position: "fixed",
            left: activeDropZone.bounds.left,
            top: activeDropZone.bounds.top,
            width: activeDropZone.bounds.width,
            height: activeDropZone.bounds.height,
            backgroundColor: defaultColors.invalid,
            border: "2px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "4px",
            pointerEvents: "none",
            transition: "all 0.2s ease-in-out",
            zIndex: 9999,
          });
        }
        setCursorStyle("not-allowed");
        break;

      case "hovering":
        if (activeDropZone) {
          setOverlayStyle({
            position: "fixed",
            left: activeDropZone.bounds.left,
            top: activeDropZone.bounds.top,
            width: activeDropZone.bounds.width,
            height: activeDropZone.bounds.height,
            backgroundColor: defaultColors.hover,
            border: "2px dashed rgba(59, 130, 246, 0.5)",
            borderRadius: "4px",
            pointerEvents: "none",
            transition: "all 0.2s ease-in-out",
            zIndex: 9999,
          });
        } else {
          setOverlayStyle({ display: "none" });
        }
        setCursorStyle("move");
        break;

      case "idle":
      default:
        setOverlayStyle({ display: "none" });
        setCursorStyle("auto");
        break;
    }
  }, [activeDropZone, feedbackState, dragItem]);

  // Apply cursor style globally during drag
  useEffect(() => {
    if (dragItem) {
      document.body.style.cursor = cursorStyle;
      return () => {
        document.body.style.cursor = "auto";
      };
    }
    return undefined;
  }, [dragItem, cursorStyle]);

  return (
    <>
      <div className="visual-feedback-overlay" style={overlayStyle} />
      <style jsx global>{`
        .drop-zone-compatible {
          outline: 2px dashed rgba(99, 102, 241, 0.3);
          outline-offset: 2px;
        }

        .drop-zone-compatible:hover {
          outline-color: rgba(99, 102, 241, 0.6);
        }

        /* Animation for feedback transitions */
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }

        .visual-feedback-overlay {
          animation: pulse 2s infinite;
        }
      `}</style>
    </>
  );
}