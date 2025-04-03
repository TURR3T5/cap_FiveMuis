import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Group, Text, Progress, Button, ActionIcon, useMantineTheme, Stack } from '@mantine/core';
import { Clock, RotateCcw, Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { QuantumParticle, QuantumPattern, QuantumDecryptionConfig } from './types';
import { generateQuantumParticles, generateTargetPattern, calculatePatternSimilarity } from './utils';
import { calculateDifficulty } from '../../core/utils';

const QuantumDecryption: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('quantumDecryption');
	const theme = useMantineTheme();

	const customConfig = config?.customOptions as QuantumDecryptionConfig;
	const gridSize = customConfig?.gridSize || calculateDifficulty(3, config?.difficulty || 'medium');
	const particleCount = customConfig?.particleCount || calculateDifficulty(5, config?.difficulty || 'medium');
	const requiredConnections = customConfig?.requiredConnections || calculateDifficulty(3, config?.difficulty || 'medium');

	const [particles, setParticles] = useState<QuantumParticle[]>([]);
	const [targetPattern, setTargetPattern] = useState<QuantumPattern | null>(null);
	const [userConnections, setUserConnections] = useState<[string, string][]>([]);
	const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
	const [similarity, setSimilarity] = useState(0);
	const [showTarget, setShowTarget] = useState(false);

	const particleColorMap = {
		alpha: theme.colors.blue[6],
		beta: theme.colors.green[6],
		gamma: theme.colors.yellow[6],
		delta: theme.colors.red[6],
	};

	const particleStateOpacity = {
		entangled: 1,
		superposition: 0.7,
		collapsed: 0.4,
	};

	const initializeGame = useCallback(() => {
		if (!config) return;

		const newParticles = generateQuantumParticles(particleCount, gridSize, customConfig?.particleTypes);

		const newTargetPattern = generateTargetPattern(newParticles, requiredConnections);

		setParticles(newParticles);
		setTargetPattern(newTargetPattern);
		setUserConnections([]);
		setSelectedParticle(null);
		setSimilarity(0);
		setShowTarget(false);

		// Debug logging
		if (debug) {
			console.log('Quantum Decryption initialized with:', {
				particles: newParticles,
				targetPattern: newTargetPattern,
			});
		}
	}, [config, particleCount, gridSize, requiredConnections, customConfig?.particleTypes, debug]);

	useEffect(() => {
		if (isActive) {
			initializeGame();
		}
	}, [isActive, initializeGame]);

	const userPattern = useMemo(
		() => ({
			particles,
			connections: userConnections,
		}),
		[particles, userConnections]
	);

	useEffect(() => {
		if (targetPattern) {
			const newSimilarity = calculatePatternSimilarity(userPattern, targetPattern);
			setSimilarity(newSimilarity);

			// Success threshold based on difficulty
			const successThreshold = config?.difficulty === 'easy' ? 80 : config?.difficulty === 'medium' ? 90 : 100;

			if (newSimilarity >= successThreshold) {
				setTimeout(() => {
					completeGame(true, newSimilarity);
					onComplete?.({ success: true, score: newSimilarity, timeTaken: timeElapsed });
				}, 1000);
			}
		}
	}, [userPattern, targetPattern, completeGame, onComplete, timeElapsed, config?.difficulty]);

	useEffect(() => {
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			completeGame(false, similarity);
			onComplete?.({ success: false, score: similarity, timeTaken: timeElapsed });
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete, similarity]);

	const handleParticleClick = (particleId: string) => {
		if (selectedParticle === null) {
			setSelectedParticle(particleId);
		} else if (selectedParticle === particleId) {
			setSelectedParticle(null);
		} else {
			// Create a connection
			const connectionIds = [selectedParticle, particleId].sort() as [string, string];

			// Check if this connection already exists
			const connectionExists = userConnections.some(([a, b]) => a === connectionIds[0] && b === connectionIds[1]);

			if (connectionExists) {
				// Remove the connection
				setUserConnections((prev) => prev.filter(([a, b]) => !(a === connectionIds[0] && b === connectionIds[1])));
			} else {
				// Add the connection
				setUserConnections((prev) => [...prev, connectionIds]);
			}

			setSelectedParticle(null);
		}
	};

	const resetConnections = () => {
		setUserConnections([]);
		setSelectedParticle(null);
	};

	const toggleTargetHint = () => {
		setShowTarget((prev) => !prev);
	};

	if (!isActive || !targetPattern || !config) return null;

	const timeProgress = config.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Group justify='space-between' mb='xs'>
				<Text fw={700}>QUANTUM DECRYPTION</Text>
				<Group>
					{config.timeLimit && (
						<Group gap='xs'>
							<Clock size={16} />
							<Progress value={100 - timeProgress} color={timeProgress > 75 ? 'red' : timeProgress > 50 ? 'yellow' : 'green'} size='sm' w={100} />
						</Group>
					)}
					<Box style={{ position: 'relative', width: 100 }}>
						<Progress value={similarity} color={similarity > 80 ? 'green' : similarity > 50 ? 'yellow' : 'red'} size='sm' w={100} />
						<Text style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 12 }}>{`${Math.round(similarity)}%`}</Text>
					</Box>
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
					<Text size='sm'>Connect quantum particles to match the encryption pattern</Text>

					<Box
						style={{
							position: 'relative',
							width: '100%',
							height: 400,
							background: theme.colors.dark[7],
							borderRadius: theme.radius.md,
							overflow: 'hidden',
						}}
					>
						{/* We'll implement a simplified version for now */}
						<Text
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								color: theme.white,
							}}
						>
							Quantum Particle Grid Here
						</Text>

						{/* Just showing a simplified placeholder for the visualization */}
						<Box
							style={{
								position: 'absolute',
								bottom: 10,
								right: 10,
								backgroundColor: 'rgba(0,0,0,0.5)',
								padding: '5px 10px',
								borderRadius: theme.radius.sm,
							}}
						>
							<Text size='xs'>
								Particles: {particles.length} | Connections: {userConnections.length}/{targetPattern.connections.length}
							</Text>
						</Box>
					</Box>

					<Group justify='space-between'>
						<Group>
							<Button variant='light' size='xs' leftSection={<RotateCcw size={16} />} onClick={resetConnections}>
								Reset
							</Button>

							{(customConfig?.showHints || debug) && (
								<Button variant='subtle' size='xs' leftSection={showTarget ? <EyeOff size={16} /> : <Eye size={16} />} onClick={toggleTargetHint}>
									{showTarget ? 'Hide Pattern' : 'Show Pattern'}
								</Button>
							)}
						</Group>

						<Text size='sm'>Pattern Match: {Math.round(similarity)}%</Text>
					</Group>

					{debug && (
						<Box mt='xs' p='xs' bg='rgba(0,0,0,0.2)' style={{ borderRadius: 4 }}>
							<Text size='xs' c='dimmed'>
								Debug Info - Required Connections: {targetPattern.connections.length}
							</Text>
						</Box>
					)}
				</Stack>
			</Paper>
		</Box>
	);
};

export default QuantumDecryption;
