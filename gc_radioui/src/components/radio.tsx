import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, TextInput, ActionIcon, Slider, Checkbox, Group, Stack } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Volume2, VolumeX, X, Settings, Power } from 'lucide-react';

interface RadioUIProps {
	onClose?: () => void;
	onConnect?: (frequency: string) => void;
	onDisconnect?: () => void;
	onVolumeChange?: (volume: number) => void;
	onToggleClicks?: (enabled: boolean) => void;
}

interface Position {
	x: number;
	y: number;
}

interface RadioSettings {
	enableClicks: boolean;
	size: number;
}

const RadioUI: React.FC<RadioUIProps> = ({ onClose = () => {}, onConnect = () => {}, onDisconnect = () => {}, onVolumeChange = () => {}, onToggleClicks = () => {} }) => {
	const [frequency, setFrequency] = useState<string>('');
	const [connected, setConnected] = useState<boolean>(false);
	const [currentFrequency, setCurrentFrequency] = useState<string>('');
	const [volume, setVolume] = useState<number>(80);
	const [muted, setMuted] = useState<boolean>(false);
	const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
	const [showSettings, setShowSettings] = useState<boolean>(false);

	const [settings, setSettings] = useLocalStorage<RadioSettings>({
		key: 'radio-settings',
		defaultValue: {
			enableClicks: true,
			size: 1.0,
		},
	});

	const radioRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const savedPosition = localStorage.getItem('radio-position');
		if (savedPosition) {
			setPosition(JSON.parse(savedPosition));
		}

		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging && radioRef.current) {
				const newX = e.clientX - dragOffset.x;
				const newY = e.clientY - dragOffset.y;

				const radioRect = radioRef.current.getBoundingClientRect();
				const maxX = window.innerWidth - radioRect.width;
				const maxY = window.innerHeight - radioRect.height;

				const boundedX = Math.max(0, Math.min(newX, maxX));
				const boundedY = Math.max(0, Math.min(newY, maxY));

				const newPosition = {
					x: (boundedX / window.innerWidth) * 100,
					y: (boundedY / window.innerHeight) * 100,
				};

				setPosition(newPosition);
				localStorage.setItem('radio-position', JSON.stringify(newPosition));
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, dragOffset]);

	const handleStartDrag = (e: React.MouseEvent<HTMLDivElement>) => {
		if (radioRef.current) {
			const radioRect = radioRef.current.getBoundingClientRect();
			setDragOffset({
				x: e.clientX - radioRect.left,
				y: e.clientY - radioRect.top,
			});
			setIsDragging(true);
		}
	};

	const handleConnect = () => {
		if (frequency.trim() === '' || connected) return;

		setConnected(true);
		setCurrentFrequency(frequency);
		onConnect(frequency);
	};

	const handleDisconnect = () => {
		if (!connected) return;

		setConnected(false);
		setCurrentFrequency('');
		onDisconnect();
	};

	const handleVolumeChange = (value: number) => {
		setVolume(value);
		onVolumeChange(value);
	};

	const toggleMute = () => {
		setMuted(!muted);
		onVolumeChange(muted ? volume : 0);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleConnect();
		}
	};

	const handleSizeChange = (value: number) => {
		setSettings({ ...settings, size: value });
	};

	const handleClicksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.checked;
		setSettings({ ...settings, enableClicks: newValue });
		onToggleClicks(newValue);
	};

	return (
		<Box
			ref={radioRef}
			style={{
				position: 'absolute',
				left: `${position.x}%`,
				top: `${position.y}%`,
				transform: 'translate(-50%, -50%) scale(' + settings.size + ')',
				cursor: isDragging ? 'grabbing' : 'grab',
				transformOrigin: 'center',
				userSelect: 'none',
			}}
		>
			<Box
				style={{
					backgroundImage: `url('/radio-frame.png')`,
					backgroundSize: 'contain',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					width: '300px',
					height: '600px',
					position: 'relative',
				}}
				onMouseDown={handleStartDrag}
			>
				{}
				<Box
					style={{
						position: 'absolute',
						top: '178px',
						left: '50%',
						transform: 'translateX(-50%)',
						width: '225px',
						height: '320px',
						backgroundColor: 'rgba(16, 17, 22, 0.9)',
						borderRadius: '5px',
						padding: '15px',
						display: 'flex',
						flexDirection: 'column',
						color: '#ffffff',
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{!showSettings ? (
						<>
							<Box style={{ marginBottom: '15px' }}>
								<Group justify='space-between'>
									<Text size='xs' c={connected ? 'teal' : 'dimmed'}>
										{connected ? `CONNECTED: ${currentFrequency} MHz` : 'DISCONNECTED'}
									</Text>
									<Text size='xs' c='dimmed'>
										VOL: {muted ? 'MUTE' : volume}
									</Text>
								</Group>
							</Box>

							<Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
								<TextInput
									placeholder='Frequency (MHz)'
									value={frequency}
									onChange={(e) => setFrequency(e.target.value)}
									onKeyDown={handleKeyDown}
									size='sm'
									style={{ flex: 0 }}
									maxLength={6}
									rightSection={
										<ActionIcon size='sm' onClick={connected ? handleDisconnect : handleConnect} color={connected ? 'red' : 'teal'}>
											<Power size={14} />
										</ActionIcon>
									}
								/>

								<Text size='xs' ta='center' mt='xs' mb='xs'>
									{connected ? <span style={{ color: '#4DABF7' }}>⚠️ Active connection</span> : <span style={{ color: '#868E96' }}>🔌 Ready to connect</span>}
								</Text>

								<Group justify='space-between' gap='xs'>
									<ActionIcon onClick={toggleMute} variant='light' color={muted ? 'red' : 'blue'}>
										{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
									</ActionIcon>
									<Box style={{ flex: 1 }}>
										<Slider
											value={volume}
											onChange={handleVolumeChange}
											size='xs'
											min={0}
											max={100}
											step={5}
											disabled={muted}
											styles={{
												track: { backgroundColor: '#2C2E33' },
												thumb: { borderWidth: 2 },
												bar: { backgroundColor: '#4DABF7' },
											}}
										/>
									</Box>
								</Group>

								<Group justify='space-between' mt='auto' mb='xs'>
									<ActionIcon onClick={() => setShowSettings(true)} color='gray'>
										<Settings size={16} />
									</ActionIcon>
									<ActionIcon onClick={onClose} color='red'>
										<X size={16} />
									</ActionIcon>
								</Group>
							</Box>
						</>
					) : (
						<Stack gap='sm'>
							<Text size='sm' fw={600}>
								Settings
							</Text>

							<Text size='xs'>UI Scale:</Text>
							<Slider
								value={settings.size}
								onChange={handleSizeChange}
								min={0.7}
								max={1.5}
								step={0.1}
								marks={[
									{ value: 0.7, label: 'S' },
									{ value: 1, label: 'M' },
									{ value: 1.5, label: 'L' },
								]}
								size='xs'
								styles={{
									track: { backgroundColor: '#2C2E33' },
									thumb: { borderWidth: 2 },
									bar: { backgroundColor: '#4DABF7' },
									mark: { backgroundColor: '#4DABF7' },
									markLabel: { fontSize: 10 },
								}}
							/>

							<Checkbox label='Enable radio clicks' checked={settings.enableClicks} onChange={handleClicksChange} size='xs' />

							<Group justify='space-between' mt='auto'>
								<ActionIcon onClick={() => setShowSettings(false)} color='blue'>
									<X size={16} />
								</ActionIcon>
							</Group>
						</Stack>
					)}
				</Box>

				{}
				<ActionIcon
					style={{
						position: 'absolute',
						top: '120px',
						right: '75px',
						backgroundColor: 'transparent',
						width: '40px',
						height: '40px',
						borderRadius: '50%',
						cursor: 'pointer',
					}}
					onClick={toggleMute}
				/>

				<ActionIcon
					style={{
						position: 'absolute',
						bottom: '90px',
						left: '50%',
						transform: 'translateX(-50%)',
						backgroundColor: 'transparent',
						width: '50px',
						height: '20px',
						cursor: 'pointer',
					}}
					onClick={connected ? handleDisconnect : handleConnect}
				/>
			</Box>
		</Box>
	);
};

export default RadioUI;
