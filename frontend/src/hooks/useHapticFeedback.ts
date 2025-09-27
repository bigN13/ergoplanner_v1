import { useCallback, useRef } from "react";

interface HapticPattern {
  duration: number;
  intensity?: number;
}

interface HapticConfig {
  enabled?: boolean;
  patterns?: {
    snap: HapticPattern;
    drop: HapticPattern;
    error: HapticPattern;
    success: HapticPattern;
  };
}

const defaultPatterns = {
  snap: { duration: 10, intensity: 1 },
  drop: { duration: 20, intensity: 2 },
  error: { duration: 30, intensity: 3 },
  success: { duration: 15, intensity: 1 },
};

export function useHapticFeedback(config: HapticConfig = {}) {
  const { enabled = true, patterns = defaultPatterns } = config;
  const isSupported = useRef<boolean>(false);

  // Check if Vibration API is supported
  if (typeof window !== "undefined") {
    isSupported.current = "vibrate" in navigator;
  }

  const vibrate = useCallback(
    (pattern: HapticPattern | number[]) => {
      if (!enabled || !isSupported.current) return;

      try {
        if (Array.isArray(pattern)) {
          navigator.vibrate(pattern);
        } else {
          navigator.vibrate(pattern.duration);
        }
      } catch {
        // Haptic feedback not available - silently fail
      }
    },
    [enabled]
  );

  const triggerSnap = useCallback(() => {
    vibrate(patterns.snap);
  }, [vibrate, patterns.snap]);

  const triggerDrop = useCallback(() => {
    vibrate(patterns.drop);
  }, [vibrate, patterns.drop]);

  const triggerError = useCallback(() => {
    vibrate(patterns.error);
  }, [vibrate, patterns.error]);

  const triggerSuccess = useCallback(() => {
    vibrate(patterns.success);
  }, [vibrate, patterns.success]);

  const triggerCustom = useCallback(
    (duration: number | number[]) => {
      vibrate(Array.isArray(duration) ? duration : { duration, intensity: 1 });
    },
    [vibrate]
  );

  return {
    isSupported: isSupported.current,
    triggerSnap,
    triggerDrop,
    triggerError,
    triggerSuccess,
    triggerCustom,
  };
}