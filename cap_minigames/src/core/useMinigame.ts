import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MinigameContext } from './MinigameProvider';
import { MinigameResult } from './types';

export const useMinigame = (gameId: string) => {
  const { 
    activeGame, 
    gameConfig, 
    endGame, 
    cancelGame,
    debugMode
  } = useContext(MinigameContext);
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Use refs to track timer state
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const isActive = activeGame === gameId || debugMode;

  // Setup and clean up the timer
  useEffect(() => {
    if (isActive && !startTimeRef.current) {
      const now = Date.now();
      setStartTime(now);
      startTimeRef.current = now;
      
      // Set up timer to update timeElapsed every 100ms
      timerRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          setTimeElapsed(elapsed);
        }
      }, 100);
    } else if (!isActive) {
      // Clean up when game ends or component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      startTimeRef.current = null;
      setStartTime(null);
      setAttempts(0);
      setTimeElapsed(0);
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  const completeGame = useCallback(
    (success: boolean, score?: number) => {
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const result: MinigameResult = {
        success,
        score,
        timeTaken: timeElapsed,
        attempts,
      };
      endGame(result);
    },
    [endGame, timeElapsed, attempts]
  );

  const attemptAction = useCallback(() => {
    setAttempts((prev) => prev + 1);
    return attempts < (gameConfig?.maxAttempts || Infinity);
  }, [attempts, gameConfig?.maxAttempts]);

  return {
    isActive,
    gameConfig: isActive ? gameConfig : null,
    completeGame,
    cancelGame,
    attemptAction,
    attempts,
    startTime,
    timeElapsed,
    debugMode
  };
};