import React, { useContext } from 'react';
import { MinigameProvider, MinigameContext } from './core/MinigameProvider';
import { MinigameDebugger } from './MinigameDebugger';
import { minigames } from './minigames/registry';
import { MinigameProps, MinigameResult } from './core/types';

const ActiveMinigame: React.FC = () => {
	const { activeGame, gameConfig, endGame, cancelGame, debugMode } = useContext(MinigameContext);

	if (!activeGame || !gameConfig) return null;

	const MinigameComponent = minigames[activeGame];

	if (!MinigameComponent) {
		console.error(`Minigame "${activeGame}" not found in registry`);
		return null;
	}

	const minigameProps: MinigameProps = {
		config: gameConfig,
		onComplete: (result: MinigameResult) => {
			endGame(result);
		},
		onCancel: () => {
			cancelGame();
		},
		debug: debugMode,
	};

	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				padding: 0,
				margin: 0,
				overflow: 'hidden',
				backgroundColor: 'rgba(0, 0, 0, 0.85)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<MinigameComponent {...minigameProps} />
		</div>
	);
};

const App: React.FC = () => {
	return (
		<MinigameProvider>
			<ActiveMinigame />
			<MinigameDebugger />
		</MinigameProvider>
	);
};

export default App;
