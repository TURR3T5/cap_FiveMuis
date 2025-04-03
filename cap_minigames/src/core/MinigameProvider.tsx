import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { MinigameConfig, MinigameContextValue, MinigameResult } from './types';
import { fiveMBridge } from './bridge';

export const MinigameContext = createContext<MinigameContextValue>({
	activeGame: null,
	startGame: () => {},
	endGame: () => {},
	cancelGame: () => {},
	gameConfig: null,
	isActive: false,
	debugMode: false,
	setDebugMode: () => {},
});

export const MinigameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [activeGame, setActiveGame] = useState<string | null>(null);
	const [gameConfig, setGameConfig] = useState<MinigameConfig | null>(null);
	const [debugMode, setDebugMode] = useState<boolean>(/* process.env.NODE_ENV === 'development' */ false);

	const startGame = useCallback((gameId: string, config: MinigameConfig) => {
		setActiveGame(gameId);
		setGameConfig(config);
	}, []);

	const endGame = useCallback(
		(result: MinigameResult) => {
			if (gameConfig) {
				fiveMBridge.sendResult(gameConfig.id, result);
			}

			setActiveGame(null);
			setGameConfig(null);
		},
		[gameConfig]
	);

	const cancelGame = useCallback(() => {
		if (gameConfig) {
			fiveMBridge.sendResult(gameConfig.id, { success: false, reason: 'cancelled' });
		}

		setActiveGame(null);
		setGameConfig(null);
	}, [gameConfig]);

	useEffect(() => {
		fiveMBridge.onGameRequest((gameId, config) => {
			startGame(gameId, config);
		});
	}, [startGame]);

	return (
		<MinigameContext.Provider
			value={{
				activeGame,
				startGame,
				endGame,
				cancelGame,
				gameConfig,
				isActive: !!activeGame,
				debugMode,
				setDebugMode,
			}}
		>
			{children}
		</MinigameContext.Provider>
	);
};
