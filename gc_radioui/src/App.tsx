import React, { useState, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import RadioUI from './components/radio';

const App: React.FC = () => {
	const [showRadio, setShowRadio] = useState<boolean>(true);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'F8') {
			setShowRadio(!showRadio);
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);

		// Listen for NUI events from FiveM
		window.addEventListener('message', (event) => {
			const data = event.data;

			if (data.action === 'toggleRadio') {
				setShowRadio((prev) => !prev);
			}

			if (data.action === 'setRadioState' && data.show !== undefined) {
				setShowRadio(data.show);
			}
		});

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	const handleConnect = (frequency: string) => {
		console.log(`Connected to frequency: ${frequency}`);
		sendNuiMessage('connectRadio', { frequency });
	};

	const handleDisconnect = () => {
		console.log('Disconnected from radio');
		sendNuiMessage('disconnectRadio');
	};

	const handleVolumeChange = (volume: number) => {
		console.log(`Volume changed to: ${volume}`);
		sendNuiMessage('setRadioVolume', { volume });
	};

	const handleToggleClicks = (enabled: boolean) => {
		console.log(`Radio clicks ${enabled ? 'enabled' : 'disabled'}`);
		sendNuiMessage('setRadioClicks', { enabled });
	};

	const sendNuiMessage = (action: string, data: any = {}) => {
		if (typeof (window as any).GetParentResourceName === 'function') {
			fetch(`https://${(window as any).GetParentResourceName()}/${action}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=UTF-8',
				},
				body: JSON.stringify(data),
			}).catch((error) => {
				console.error(`Error sending NUI message: ${error}`);
			});
		} else {
			// Development mode - just log the action
			console.log(`DEV MODE - ${action}:`, data);
		}
	};

	return (
		<MantineProvider
			theme={{
				primaryColor: 'blue',
				primaryShade: 5,
				black: '#101113',
				colors: {
					dark: ['#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40', '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113'],
				},
			}}
		>
			{showRadio && <RadioUI onClose={() => setShowRadio(false)} onConnect={handleConnect} onDisconnect={handleDisconnect} onVolumeChange={handleVolumeChange} onToggleClicks={handleToggleClicks} />}
		</MantineProvider>
	);
};

export default App;
