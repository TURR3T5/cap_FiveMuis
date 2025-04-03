import { useContext, useState, useEffect, useCallback } from 'react';
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

  const isActive = activeGame === gameId || debugMode;

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(Date.now());
    } else if (!isActive) {
      setStartTime(null);
      setAttempts(0);
    }
  }, [isActive, startTime]);

  const completeGame = useCallback(
    (success: boolean, score?: number) => {
      const result: MinigameResult = {
        success,
        score,
        timeTaken: startTime ? Date.now() - startTime : undefined,
        attempts,
      };
      endGame(result);
    },
    [endGame, startTime, attempts]
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
    timeElapsed: startTime ? Date.now() - startTime : 0,
    debugMode
  };
};