export interface MinigameConfig {
    id: string;
    name: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
    maxAttempts?: number;
    customOptions?: Record<string, any>;
}

export interface MinigameResult {
    success: boolean;
    score?: number;
    timeTaken?: number;
    attempts?: number;
    reason?: string;
}

export interface MinigameProps {
    config: MinigameConfig;
    onComplete: (result: MinigameResult) => void;
    onCancel?: () => void;
    debug?: boolean;
}

export interface MinigameContextValue {
    activeGame: string | null;
    startGame: (gameId: string, config: MinigameConfig) => void;
    endGame: (result: MinigameResult) => void;
    cancelGame: () => void;
    gameConfig: MinigameConfig | null;
    isActive: boolean;
    debugMode: boolean;
    setDebugMode: (mode: boolean) => void;
}

export interface FiveMBridge {
    sendResult: (gameId: string, result: MinigameResult) => void;
    onGameRequest: (callback: (gameId: string, config: MinigameConfig) => void) => void;
    debugStartGame: (gameId: string, config: MinigameConfig) => void;
}

export interface MinigameRegistry {
    [key: string]: React.ComponentType<MinigameProps>;
}
