/**
 * Actuator State Management Hook
 * Manages actuator state transitions and behavior
 */

import { useState, useCallback, useEffect } from 'react';

import type { ActuatorData } from './ActuatorTypes';
import {
  ActuatorState,
  ActuatorType,
  FailSafePosition,
  ActuatorAction,
} from './ActuatorTypes';

export interface ActuatorStateManager {
  // Current state
  state: ActuatorState;
  position: number; // 0-100%
  isEnergized: boolean;
  isFaulted: boolean;
  isMoving: boolean;

  // State transitions
  energize: () => void;
  deEnergize: () => void;
  setPosition: (position: number) => void;
  moveTo: (targetPosition: number, duration?: number) => void;
  stop: () => void;
  fault: (message?: string) => void;
  reset: () => void;
  manualOverride: (enabled: boolean) => void;

  // Fail-safe behavior
  triggerFailSafe: () => void;
  getFailSafePosition: () => number;

  // Status queries
  canMove: () => boolean;
  getStatusMessage: () => string;
}

export interface UseActuatorStateOptions {
  initialPosition?: number;
  failSafe?: FailSafePosition;
  actuatorType?: ActuatorType;
  actuatorAction?: ActuatorAction;
  strokeTime?: number; // seconds for full stroke
  enableAutoFailSafe?: boolean;
  onStateChange?: (state: ActuatorState) => void;
  onPositionChange?: (position: number) => void;
  onFault?: (message: string) => void;
}

/**
 * Hook for managing actuator state
 */
export function useActuatorState(options: UseActuatorStateOptions = {}): ActuatorStateManager {
  const {
    initialPosition = 0,
    failSafe = FailSafePosition.NO_FAIL_SAFE,
    actuatorType = ActuatorType.PNEUMATIC,
    actuatorAction = ActuatorAction.SINGLE_ACTING,
    strokeTime = 5,
    enableAutoFailSafe = true,
    onStateChange,
    onPositionChange,
    onFault,
  } = options;

  const [state, setState] = useState<ActuatorState>(ActuatorState.IDLE);
  const [position, setPositionInternal] = useState<number>(initialPosition);
  const [isEnergized, setIsEnergized] = useState<boolean>(false);
  const [isFaulted, setIsFaulted] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [faultMessage, setFaultMessage] = useState<string>('');
  const [manualOverrideEnabled, setManualOverrideEnabled] = useState<boolean>(false);
  const [movementTimer, setMovementTimer] = useState<NodeJS.Timeout | null>(null);

  // Get fail-safe position based on configuration
  const getFailSafePosition = useCallback((): number => {
    switch (failSafe) {
      case FailSafePosition.FAIL_OPEN:
        return 100;
      case FailSafePosition.FAIL_CLOSED:
        return 0;
      case FailSafePosition.FAIL_IN_PLACE:
      case FailSafePosition.FAIL_LOCKED:
        return position; // Stay at current position
      default:
        return position;
    }
  }, [failSafe, position]);

  // Trigger fail-safe action
  const triggerFailSafe = useCallback(() => {
    if (failSafe === FailSafePosition.NO_FAIL_SAFE) {
      return;
    }

    const failSafePos = getFailSafePosition();
    setPositionInternal(failSafePos);
    setState(ActuatorState.DE_ENERGIZED);
    setIsEnergized(false);
    setIsMoving(false);

    if (onPositionChange) {
      onPositionChange(failSafePos);
    }
    if (onStateChange) {
      onStateChange(ActuatorState.DE_ENERGIZED);
    }
  }, [failSafe, getFailSafePosition, onPositionChange, onStateChange]);

  // Energize actuator
  const energize = useCallback(() => {
    if (isFaulted || manualOverrideEnabled) {
      return;
    }

    setIsEnergized(true);
    setState(ActuatorState.ENERGIZED);

    if (onStateChange) {
      onStateChange(ActuatorState.ENERGIZED);
    }
  }, [isFaulted, manualOverrideEnabled, onStateChange]);

  // De-energize actuator
  const deEnergize = useCallback(() => {
    setIsEnergized(false);
    setState(ActuatorState.DE_ENERGIZED);

    if (onStateChange) {
      onStateChange(ActuatorState.DE_ENERGIZED);
    }

    // Trigger fail-safe if enabled
    if (enableAutoFailSafe && failSafe !== FailSafePosition.NO_FAIL_SAFE) {
      triggerFailSafe();
    }
  }, [enableAutoFailSafe, failSafe, triggerFailSafe, onStateChange]);

  // Set position directly
  const setPosition = useCallback((newPosition: number) => {
    const clampedPosition = Math.max(0, Math.min(100, newPosition));
    setPositionInternal(clampedPosition);

    if (onPositionChange) {
      onPositionChange(clampedPosition);
    }
  }, [onPositionChange]);

  // Move to target position with animation
  const moveTo = useCallback((targetPosition: number, duration?: number) => {
    if (isFaulted || manualOverrideEnabled) {
      return;
    }

    // Check if actuator can move
    const isElectric = actuatorType === ActuatorType.ELECTRIC || actuatorType === ActuatorType.ELECTRO_PNEUMATIC || actuatorType === ActuatorType.ELECTRO_HYDRAULIC;
    const isDoubleActing = actuatorAction === ActuatorAction.DOUBLE_ACTING;

    if (!isEnergized && !(isDoubleActing || isElectric)) {
      // Single-acting actuators need to be energized to move against spring
      return;
    }

    // Clear any existing movement timer
    if (movementTimer) {
      clearTimeout(movementTimer);
    }

    const clampedTarget = Math.max(0, Math.min(100, targetPosition));
    const delta = clampedTarget - position;

    if (Math.abs(delta) < 0.1) {
      // Already at target
      return;
    }

    setIsMoving(true);
    setState(ActuatorState.MOVING);

    if (onStateChange) {
      onStateChange(ActuatorState.MOVING);
    }

    // Calculate movement time
    const movementDuration = duration || (strokeTime * Math.abs(delta) / 100);
    const steps = 20; // Number of animation steps
    const stepDuration = (movementDuration * 1000) / steps;
    const stepSize = delta / steps;

    let currentStep = 0;

    const moveStep = () => {
      currentStep++;

      if (currentStep <= steps) {
        const newPos = position + (stepSize * currentStep);
        setPositionInternal(newPos);

        if (onPositionChange) {
          onPositionChange(newPos);
        }

        const timer = setTimeout(moveStep, stepDuration);
        setMovementTimer(timer);
      } else {
        // Movement complete
        setIsMoving(false);
        setState(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);
        setMovementTimer(null);

        if (onStateChange) {
          onStateChange(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);
        }
      }
    };

    moveStep();
  }, [
    position,
    isEnergized,
    isFaulted,
    manualOverrideEnabled,
    actuatorType,
    actuatorAction,
    strokeTime,
    movementTimer,
    onPositionChange,
    onStateChange,
  ]);

  // Stop movement
  const stop = useCallback(() => {
    if (movementTimer) {
      clearTimeout(movementTimer);
      setMovementTimer(null);
    }

    setIsMoving(false);
    setState(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);

    if (onStateChange) {
      onStateChange(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);
    }
  }, [movementTimer, isEnergized, onStateChange]);

  // Trigger fault
  const fault = useCallback((message: string = 'Actuator fault') => {
    setIsFaulted(true);
    setFaultMessage(message);
    setState(ActuatorState.FAULTED);
    stop();

    if (onFault) {
      onFault(message);
    }
    if (onStateChange) {
      onStateChange(ActuatorState.FAULTED);
    }
  }, [stop, onFault, onStateChange]);

  // Reset from fault
  const reset = useCallback(() => {
    setIsFaulted(false);
    setFaultMessage('');
    setState(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);

    if (onStateChange) {
      onStateChange(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);
    }
  }, [isEnergized, onStateChange]);

  // Toggle manual override
  const manualOverride = useCallback((enabled: boolean) => {
    setManualOverrideEnabled(enabled);

    if (enabled) {
      setState(ActuatorState.MANUAL_OVERRIDE);
      if (onStateChange) {
        onStateChange(ActuatorState.MANUAL_OVERRIDE);
      }
    } else {
      setState(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);
      if (onStateChange) {
        onStateChange(isEnergized ? ActuatorState.ENERGIZED : ActuatorState.IDLE);
      }
    }
  }, [isEnergized, onStateChange]);

  // Check if actuator can move
  const canMove = useCallback((): boolean => {
    if (isFaulted) return false;
    if (manualOverrideEnabled) return true; // Manual override allows movement

    const isElectric = actuatorType === ActuatorType.ELECTRIC || actuatorType === ActuatorType.ELECTRO_PNEUMATIC || actuatorType === ActuatorType.ELECTRO_HYDRAULIC;
    const isDoubleActing = actuatorAction === ActuatorAction.DOUBLE_ACTING;

    // Electric and double-acting actuators can move anytime
    if (isElectric || isDoubleActing) return true;

    // Single-acting needs to be energized
    return isEnergized;
  }, [isFaulted, manualOverrideEnabled, isEnergized, actuatorType, actuatorAction]);

  // Get status message
  const getStatusMessage = useCallback((): string => {
    if (isFaulted) return faultMessage || 'Faulted';
    if (manualOverrideEnabled) return 'Manual Override';
    if (isMoving) return 'Moving';
    if (isEnergized) return 'Energized';
    return 'Idle';
  }, [isFaulted, manualOverrideEnabled, isMoving, isEnergized, faultMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (movementTimer) {
        clearTimeout(movementTimer);
      }
    };
  }, [movementTimer]);

  return {
    state,
    position,
    isEnergized,
    isFaulted,
    isMoving,
    energize,
    deEnergize,
    setPosition,
    moveTo,
    stop,
    fault,
    reset,
    manualOverride,
    triggerFailSafe,
    getFailSafePosition,
    canMove,
    getStatusMessage,
  };
}

export default useActuatorState;
