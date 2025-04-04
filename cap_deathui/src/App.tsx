import React from 'react';
import LastStandUI from './components/LastStandUI';

const App: React.FC = () => {
	const handleRequestHelp = () => {
		// Here you can call your FiveM NUI callback to request help
		console.log('Help requested');
		// example: fetch(`https://${GetParentResourceName()}/requestMedic`, { method: 'POST' });
	};

	const handleRespawn = () => {
		// Here you can call your FiveM NUI callback to respawn
		console.log('Respawning');
		// example: fetch(`https://${GetParentResourceName()}/respawnPlayer`, { method: 'POST' });
	};

	return (
		<LastStandUI
			initialTime={300} // 5 minutes in seconds
			onRequestHelp={handleRequestHelp}
			onRespawn={handleRespawn}
		/>
	);
};

export default App;
