"use client";

import { animated, useSpring } from "@react-spring/web";
import React, { useEffect } from "react";

import { DropZoneProvider, useDropZone } from "@/contexts/DropZoneContext";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

import GridOverlay from "./GridOverlay";
import SmartGuides from "./SmartGuides";
import VisualFeedbackLayer from "./VisualFeedbackLayer";

interface FeedbackSystemProps {
  children: React.ReactNode;
  enableHaptic?: boolean;
  enableSmartGuides?: boolean;
  enableGrid?: boolean;
  elements?: Array<{
    id: string;
    bounds: DOMRect;
    centerX: number;
    centerY: number;
  }>;
}

function FeedbackSystemContent({
  children,
  enableHaptic = true,
  enableSmartGuides = true,
  enableGrid = true,
  elements = [],
}: FeedbackSystemProps): React.ReactElement {
  const { feedbackState, activeDropZone, dragItem } = useDropZone();
  const haptic = useHapticFeedback({ enabled: enableHaptic });

  // Animate feedback transitions
  const feedbackSpring = useSpring({
    opacity: dragItem ? 1 : 0,
    scale: dragItem ? 1 : 0.95,
    config: { tension: 300, friction: 20 },
  });

  // Trigger haptic feedback on state changes
  useEffect(() => {
    if (!enableHaptic) return;

    switch (feedbackState) {
      case "valid_drop":
        haptic.triggerSnap();
        break;
      case "invalid_drop":
        haptic.triggerError();
        break;
      case "hovering":
        if (activeDropZone) {
          haptic.triggerCustom(5);
        }
        break;
    }
  }, [feedbackState, activeDropZone, haptic, enableHaptic]);

  // Handle successful drop
  useEffect(() => {
    if (!dragItem && feedbackState === "idle" && activeDropZone) {
      haptic.triggerSuccess();
    }
  }, [dragItem, feedbackState, activeDropZone, haptic]);

  return (
    <animated.div
      style={{
        width: "100%",
        height: "100%",
        ...feedbackSpring,
      }}
    >
      {children}
      {enableGrid && <GridOverlay showOnlyDuringDrag />}
      {enableSmartGuides && <SmartGuides elements={elements} />}
      <VisualFeedbackLayer />
    </animated.div>
  );
}

export default function FeedbackSystem(props: FeedbackSystemProps): React.ReactElement {
  return (
    <DropZoneProvider>
      <FeedbackSystemContent {...props} />
    </DropZoneProvider>
  );
}