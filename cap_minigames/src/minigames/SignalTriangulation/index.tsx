import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Group, Text, Progress, Button, useMantineTheme, Stack, Slider } from '@mantine/core';
import { Clock, RotateCcw, X, MapPin, Antenna, Radio, Loader } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { SignalReceiver, TargetSignal, SignalTriangulationConfig } from './types';
import { generateReceivers, generateTargetSignal, calculateSignalStrength, calculateIntersectionAccuracy, generateSignalTriangulationConfig } from './utils';

const SignalTriangulation: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('signalTriangulation');
	const theme = useMantineTheme();

	const customConfig = config?.customOptions as SignalTriangulationConfig;
	const stConfig = useMemo(() => generateSignalTriangulationConfig(config?.difficulty || 'medium', customConfig), [config?.difficulty, customConfig]);

	const [receivers, setReceivers] = useState<SignalReceiver[]>([]);
	const [targetSignal, setTargetSignal] = useState<TargetSignal | null>(null);
	const [userPosition, setUserPosition] = useState<{ x: number; y: number } | null>(null);
	const [userFrequencies, setUserFrequencies] = useState<number[]>([]);
	const [signalStrengths, setSignalStrengths] = useState<number[]>([]);
	const [accuracy, setAccuracy] = useState(0);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showFailure, setShowFailure] = useState(false);
	const [forceRender, setForceRender] = useState(0);

	const successMessage = 'SIGNAL LOKALISERET';
	const successDescription = 'Signal triangulering succesfuld. Målposition identificeret.';
	const failureMessage = 'SIGNAL MISTET';
	const failureDescription = 'Kunne ikke triangulere målsignalet inden for tidsgrænsen.';

	const minFrequency = stConfig.minFrequency || 60;
	const maxFrequency = stConfig.maxFrequency || 160;

	const initializeGame = useCallback(() => {
		if (!config) return;

		const newReceivers = generateReceivers(stConfig.receiverCount || 3, minFrequency, maxFrequency);

		const newTargetSignal = generateTargetSignal(newReceivers, minFrequency, maxFrequency);

		const initialFrequencies = newReceivers.map((_r) => minFrequency + Math.floor(Math.random() * (maxFrequency - minFrequency)));

		setReceivers(newReceivers);
		setTargetSignal(newTargetSignal);
		setUserPosition(null);
		setUserFrequencies(initialFrequencies);
		setSignalStrengths(Array(newReceivers.length).fill(0));
		setAccuracy(0);
		setShowSuccess(false);
		setShowFailure(false);

		if (debug) {
			console.log('Signal Triangulation initialized with:', {
				receivers: newReceivers,
				targetSignal: newTargetSignal,
			});
		}
	}, [config, stConfig, minFrequency, maxFrequency, debug]);

	useEffect(() => {
		if (isActive) {
			initializeGame();

			const timerInterval = setInterval(() => {
				setForceRender((prev) => prev + 1);
			}, 100);

			return () => clearInterval(timerInterval);
		}
	}, [isActive, initializeGame]);

	useEffect(() => {
		if (!targetSignal || userFrequencies.length === 0) return;

		const newStrengths = receivers.map((receiver, idx) => {
			if (!targetSignal) return 0;

			return calculateSignalStrength(receiver.position, receiver.position, userFrequencies[idx], targetSignal.frequencies[idx], receiver.range, stConfig.sensitivity);
		});

		setSignalStrengths(newStrengths);
	}, [receivers, targetSignal, userFrequencies, stConfig.sensitivity]);

	useEffect(() => {
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			setShowFailure(true);

			setTimeout(() => {
				completeGame(false, accuracy);
				onComplete?.({ success: false, score: accuracy, timeTaken: timeElapsed });
			}, 3000);
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete, accuracy, forceRender]);

	const handleFrequencyChange = (value: number, index: number) => {
		const newFrequencies = [...userFrequencies];
		newFrequencies[index] = value;
		setUserFrequencies(newFrequencies);
	};

	const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (showSuccess || showFailure) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		setUserPosition({ x, y });

		if (targetSignal) {
			const newAccuracy = calculateIntersectionAccuracy({ x, y }, targetSignal.position);

			setAccuracy(newAccuracy);

			if (newAccuracy >= (stConfig.targetPrecision || 90)) {
				setShowSuccess(true);

				setTimeout(() => {
					completeGame(true, newAccuracy);
					onComplete?.({ success: true, score: newAccuracy, timeTaken: timeElapsed });
				}, 3000);
			}
		}
	};

	const resetUserPosition = () => {
		setUserPosition(null);
		setAccuracy(0);
	};

	const timeProgress = config?.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;

	if (!isActive || !targetSignal || !config) return null;

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Group justify='space-between' mb='xs'>
				<Group>
					<Antenna size={20} />
					<Text fw={700}>SIGNAL TRIANGULERING</Text>
				</Group>
				<Group>
					{config.timeLimit && (
						<Group gap='xs'>
							<Clock size={16} />
							<Progress value={100 - timeProgress} color={timeProgress > 75 ? 'red' : timeProgress > 50 ? 'yellow' : 'green'} size='sm' w={100} />
						</Group>
					)}
					<Group gap={5}>
						<Text size='sm' fw={500}>
							Præcision:
						</Text>
						<Text size='sm'>{Math.round(accuracy)}%</Text>
					</Group>
					<Button
						variant='subtle'
						size='xs'
						color='red'
						onClick={() => {
							cancelGame();
							onCancel?.();
						}}
					>
						<X size={16} />
					</Button>
				</Group>
			</Group>

			<Paper p='md' radius='md' withBorder>
				<Stack gap='md'>
					<Text size='sm'>Juster frekvenserne på signalmodtagerne for at triangulere målsignalet. Klik på kortet for at markere den beregnede position.</Text>

					<Box
						style={{
							position: 'relative',
							width: '100%',
							height: 400,
							background: `linear-gradient(rgba(20, 20, 30, 0.9), rgba(10, 10, 20, 0.9)), 
                          url('/grid-background.png')`,
							backgroundSize: 'cover',
							borderRadius: theme.radius.md,
							overflow: 'hidden',
							cursor: 'crosshair',
						}}
						onClick={handleMapClick}
					>
						{/* Signals visualization */}
						<svg width='100%' height='100%' style={{ position: 'absolute', top: 0, left: 0 }}>
							{receivers.map((receiver, index) => {
								const strength = signalStrengths[index];
								return (
									<g key={receiver.id}>
										<circle cx={`${receiver.position.x}%`} cy={`${receiver.position.y}%`} r={`${receiver.range * strength}%`} fill={`${receiver.color}33`} stroke={receiver.color} strokeWidth='1' strokeDasharray='5,5' style={{ transition: 'all 0.3s ease' }} />
										<circle cx={`${receiver.position.x}%`} cy={`${receiver.position.y}%`} r={`${Math.max(3, (receiver.range * strength) / 3)}%`} fill={`${receiver.color}66`} style={{ transition: 'all 0.3s ease' }} />
									</g>
								);
							})}
						</svg>

						{/* Signal receivers */}
						{receivers.map((receiver, index) => (
							<Box
								key={receiver.id}
								style={{
									position: 'absolute',
									left: `calc(${receiver.position.x}% - 15px)`,
									top: `calc(${receiver.position.y}% - 15px)`,
									width: 30,
									height: 30,
									borderRadius: '50%',
									backgroundColor: '#222',
									border: `2px solid ${receiver.color}`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									zIndex: 10,
									boxShadow: `0 0 10px ${receiver.color}${Math.floor(signalStrengths[index] * 255)
										.toString(16)
										.padStart(2, '0')}`,
									transition: 'box-shadow 0.3s ease',
								}}
							>
								<Radio size={16} color={receiver.color} />
							</Box>
						))}

						{/* Target guide (debug or if enabled) */}
						{(debug || stConfig.showGuides) && targetSignal && (
							<Box
								style={{
									position: 'absolute',
									left: `calc(${targetSignal.position.x}% - 5px)`,
									top: `calc(${targetSignal.position.y}% - 5px)`,
									width: 10,
									height: 10,
									borderRadius: '50%',
									backgroundColor: '#ff0',
									opacity: 0.5,
									zIndex: 5,
								}}
							/>
						)}

						{/* User position marker */}
						{userPosition && (
							<Box
								style={{
									position: 'absolute',
									left: `calc(${userPosition.x}% - 10px)`,
									top: `calc(${userPosition.y}% - 20px)`,
									zIndex: 20,
								}}
							>
								<MapPin size={20} color='#ff0000' />
							</Box>
						)}
					</Box>

					{/* Frequency adjustment sliders */}
					<Stack gap='sm'>
						<Group justify='space-between'>
							<Text size='sm' fw={500}>
								Frekvens Justeringer:
							</Text>
							<Button variant='light' size='xs' leftSection={<RotateCcw size={16} />} onClick={resetUserPosition}>
								Nulstil Markør
							</Button>
						</Group>

						{receivers.map((receiver, index) => (
							<Group key={receiver.id} align='center' style={{ position: 'relative' }}>
								<Box w={12} style={{ backgroundColor: receiver.color, height: 12, borderRadius: '50%' }} />
								<Box style={{ flex: 1 }}>
									<Slider
										value={userFrequencies[index]}
										onChange={(value) => handleFrequencyChange(value, index)}
										min={minFrequency}
										max={maxFrequency}
										step={1}
										size='sm'
										label={(value) => `${value} MHz`}
										styles={{
											track: { backgroundColor: '#333' },
											bar: { backgroundColor: receiver.color },
											thumb: { backgroundColor: receiver.color, borderColor: receiver.color },
											mark: { backgroundColor: receiver.color },
										}}
										marks={[
											{ value: minFrequency, label: `${minFrequency} MHz` },
											{ value: maxFrequency, label: `${maxFrequency} MHz` },
										]}
									/>
								</Box>

								<Text size='xs' w={80} ta='right' style={{ paddingRight: '8px' }}>
									{userFrequencies[index]} MHz
								</Text>

								<Progress value={signalStrengths[index] * 100} size='sm' w={60} color={receiver.color} />
							</Group>
						))}
					</Stack>

					{/* Accuracy indicator */}
					{userPosition && (
						<Group justify='center'>
							<Text size='sm'>Signal Præcision:</Text>
							<Progress value={accuracy} size='md' w={200} color={accuracy > 85 ? 'green' : accuracy > 60 ? 'yellow' : 'red'} />
							<Text size='sm' fw={700}>
								{Math.round(accuracy)}%
							</Text>
						</Group>
					)}
				</Stack>
			</Paper>

			{showSuccess && (
				<Box
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(0,0,0,0.7)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						gap: '16px',
						zIndex: 1000,
					}}
				>
					<Box style={{ textAlign: 'center', background: 'linear-gradient(135deg, #002030 0%, #004060 100%)', padding: '30px', borderRadius: theme.radius.md, border: '1px solid #00a0ff', maxWidth: '80%' }}>
						<Box mb={20} style={{ position: 'relative' }}>
							<MapPin size={60} color='#00ff00' />
							<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #00ff00', opacity: 0.5, animation: 'st-pulse 2s infinite' }} />
						</Box>
						<Text size='xl' fw={700} mb='md' style={{ color: '#00ff00' }}>
							{successMessage}
						</Text>
						<Text mb='lg' style={{ color: '#a0ffa0' }}>
							{successDescription}
						</Text>
						<Text c='#80c0ff'>Præcision: {Math.round(accuracy)}%</Text>
						<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
							<Loader size='sm' color='#00ff00' type='dots' />
						</Box>
					</Box>
				</Box>
			)}

			{showFailure && (
				<Box
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(0,0,0,0.7)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						gap: '16px',
						zIndex: 1000,
					}}
				>
					<Box style={{ textAlign: 'center', background: 'linear-gradient(135deg, #300010 0%, #600030 100%)', padding: '30px', borderRadius: theme.radius.md, border: '1px solid #ff0050', maxWidth: '80%' }}>
						<Box mb={20} style={{ position: 'relative' }}>
							<Radio size={60} color='#ff0050' />
							<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #ff0050', opacity: 0.3, animation: 'st-flicker 1s infinite' }} />
						</Box>
						<Text size='xl' fw={700} mb='md' style={{ color: '#ff0050' }}>
							{failureMessage}
						</Text>
						<Text mb='lg' style={{ color: '#ff8080' }}>
							{failureDescription}
						</Text>
						{userPosition && <Text c='dimmed'>Opnået præcision: {Math.round(accuracy)}%</Text>}
						<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
							<Loader size='sm' color='#ff0050' type='dots' />
						</Box>
					</Box>
				</Box>
			)}
			<style>{`
        @keyframes st-pulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes st-flicker {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>

			{debug && (
				<Box mt='xs' p='xs' bg='rgba(0,0,0,0.2)' style={{ borderRadius: 4 }}>
					<Text size='xs' c='dimmed'>
						Debug Info - Target Position: X:{Math.round(targetSignal.position.x)}% Y:{Math.round(targetSignal.position.y)}%, Target Frequencies: {targetSignal.frequencies.map((f) => Math.round(f)).join(', ')}
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default SignalTriangulation;
