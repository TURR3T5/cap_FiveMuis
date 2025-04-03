import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Group, Text, Progress, Button, useMantineTheme, Stack, Modal } from '@mantine/core';
import { Clock, RotateCcw, Check, X, AlertTriangle, Eye, EyeOff, Loader } from 'lucide-react';
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
	const [showSuccess, setShowSuccess] = useState(false);
	const [showFailure, setShowFailure] = useState(false);
	const [forceRender, setForceRender] = useState(0);

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
		setShowSuccess(false);
		setShowFailure(false);

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

			const timerInterval = setInterval(() => {
				setForceRender((prev) => prev + 1);
			}, 100);

			return () => clearInterval(timerInterval);
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

			const successThreshold = config?.difficulty === 'easy' ? 80 : config?.difficulty === 'medium' ? 90 : 100;

			if (newSimilarity >= successThreshold) {
				setShowSuccess(true);

				setTimeout(() => {
					completeGame(true, newSimilarity);
					onComplete?.({ success: true, score: newSimilarity, timeTaken: timeElapsed });
				}, 2000);
			}
		}
	}, [userPattern, targetPattern, completeGame, onComplete, timeElapsed, config?.difficulty]);

	useEffect(() => {
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			setShowFailure(true);

			setTimeout(() => {
				completeGame(false, similarity);
				onComplete?.({ success: false, score: similarity, timeTaken: timeElapsed });
			}, 2000);
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete, similarity, forceRender]);

	const handleParticleClick = (particleId: string) => {
		if (selectedParticle === null) {
			setSelectedParticle(particleId);
		} else if (selectedParticle === particleId) {
			setSelectedParticle(null);
		} else {
			const connectionIds = [selectedParticle, particleId].sort() as [string, string];

			const connectionExists = userConnections.some(([a, b]) => a === connectionIds[0] && b === connectionIds[1]);

			if (connectionExists) {
				setUserConnections((prev) => prev.filter(([a, b]) => !(a === connectionIds[0] && b === connectionIds[1])));
			} else {
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

	const getParticleById = (id: string) => {
		return particles.find((p) => p.id === id);
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
					{userConnections.length === 0 && (
						<Box p='xs' bg={theme.colors.dark[6]} style={{ borderRadius: theme.radius.sm }}>
							<Text ta='center' size='sm'>
								<AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
								Click on particles to connect them and match the encryption pattern
							</Text>
						</Box>
					)}

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
						{}
						<svg width='sm' height='sm' style={{ position: 'absolute', top: 0, left: 0 }}>
							{}
							{userConnections.map(([a, b], index) => {
								const particleA = getParticleById(a);
								const particleB = getParticleById(b);

								if (!particleA || !particleB) return null;

								return <line key={`connection-${a}-${b}`} x1={`${particleA.position.x}%`} y1={`${particleA.position.y}%`} x2={`${particleB.position.x}%`} y2={`${particleB.position.y}%`} stroke='rgba(255, 255, 255, 0.7)' strokeWidth='2' />;
							})}

							{}
							{showTarget &&
								targetPattern.connections.map(([a, b], index) => {
									const particleA = getParticleById(a);
									const particleB = getParticleById(b);

									if (!particleA || !particleB) return null;

									const isUserConnection = userConnections.some(([c, d]) => (c === a && d === b) || (c === b && d === a));

									return <line key={`target-${a}-${b}`} x1={`${particleA.position.x}%`} y1={`${particleA.position.y}%`} x2={`${particleB.position.x}%`} y2={`${particleB.position.y}%`} stroke={isUserConnection ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'} strokeWidth='3' strokeDasharray='5,5' />;
								})}

							{}
							{selectedParticle && <line id='dragging-line' x1={`${getParticleById(selectedParticle)?.position.x || 0}%`} y1={`${getParticleById(selectedParticle)?.position.y || 0}%`} x2={`${Math.min(Math.max(0, forceRender % 2 === 0 ? 50 : 50.1), 100)}%`} y2={`${Math.min(Math.max(0, forceRender % 2 === 0 ? 50 : 50.1), 100)}%`} stroke='rgba(255, 255, 255, 0.3)' strokeWidth='2' strokeDasharray='3,3' />}
						</svg>

						{selectedParticle && (
							<div
								style={{
									position: 'absolute',
									top: 10,
									left: 0,
									right: 0,
									textAlign: 'center',
									backgroundColor: 'rgba(0,0,0,0.7)',
									padding: '5px 10px',
									borderRadius: theme.radius.sm,
									zIndex: 20,
								}}
							>
								<Text size='sm' c='white'>
									Click another particle to connect
								</Text>
							</div>
						)}
						{particles.map((particle) => {
							const isSelected = selectedParticle === particle.id;
							const color = particleColorMap[particle.type];
							const opacity = particleStateOpacity[particle.state];

							return (
								<Box
									key={particle.id}
									style={{
										position: 'absolute',
										left: `calc(${particle.position.x}% - 15px)`,
										top: `calc(${particle.position.y}% - 15px)`,
										width: 30,
										height: 30,
										borderRadius: '50%',
										backgroundColor: color,
										opacity: opacity,
										transform: `rotate(${particle.rotation}deg)`,
										border: isSelected ? `3px solid white` : 'none',
										boxShadow: `0 0 10px ${color}`,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										zIndex: isSelected ? 10 : 1,
										animation: userConnections.length === 0 && !selectedParticle ? 'pulse 2s infinite' : 'none',
									}}
									onClick={() => handleParticleClick(particle.id)}
								>
									<style>{`
                    @keyframes pulse {
                      0% {
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
                      }
                      70% {
                        box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
                      }
                      100% {
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
                      }
                    }
                  `}</style>
									<Box
										style={{
											position: 'absolute',
											top: '50%',
											left: '50%',
											transform: 'translate(-50%, -50%)',
											fontSize: 12,
											fontWeight: 'bold',
											color: 'white',
											textShadow: '0 0 3px rgba(0,0,0,0.7)',
										}}
									>
										{particle.type.charAt(0).toUpperCase()}
									</Box>
								</Box>
							);
						})}

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
								Nulstil
							</Button>

							{(customConfig?.showHints || debug) && (
								<Button variant='subtle' size='xs' leftSection={showTarget ? <EyeOff size={16} /> : <Eye size={16} />} onClick={toggleTargetHint}>
									{showTarget ? 'Skjul Mønster' : 'Vis Mønster'}
								</Button>
							)}
						</Group>

						<Text size='sm'>Mønster Match: {Math.round(similarity)}%</Text>
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

			<Modal opened={showSuccess} onClose={() => {}} withCloseButton={false} centered padding='xl' size='md' radius='md'>
				<Box p='md' style={{ textAlign: 'center', background: 'linear-gradient(135deg, #001030 0%, #003060 100%)', border: '1px solid #00a0ff', borderRadius: theme.radius.md }}>
					<Box mb={20} style={{ position: 'relative' }}>
						<Check size={60} color='#00a0ff' stroke='md' />
						<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #00a0ff', opacity: 0.5, animation: 'pulse 2s infinite' }} />
					</Box>
					<Text size='xl' fw={700} mb='md' style={{ color: '#00a0ff' }}>
						KVANTE DEKRYPTERING SUCCESFULD
					</Text>
					<Text mb='lg' style={{ color: '#80c0ff' }}>
						Kvante mønster succesfuldt dekrypteret og stabiliseret.
					</Text>
					<Text c='dimmed'>Match Rate: {Math.round(similarity)}%</Text>
					<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
						<Loader size='sm' color='#00a0ff' type='dots' />
					</Box>
				</Box>
			</Modal>

			<Modal opened={showFailure} onClose={() => {}} withCloseButton={false} centered padding='xl' size='md' radius='md'>
				<Box p='md' style={{ textAlign: 'center', background: 'linear-gradient(135deg, #300010 0%, #600030 100%)', border: '1px solid #ff00a0', borderRadius: theme.radius.md }}>
					<Box mb={20} style={{ position: 'relative' }}>
						<X size={60} color='#ff00a0' stroke='md' />
						<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #ff00a0', opacity: 0.3, animation: 'flicker 1s infinite' }} />
					</Box>
					<Text size='xl' fw={700} mb='md' style={{ color: '#ff00a0' }}>
						DEKRYPTERING MISLYKKEDES
					</Text>
					<Text mb='lg' style={{ color: '#ff80c0' }}>
						Kunne ikke etablere kvante mønster match.
					</Text>
					<Text c='dimmed'>Match Rate: {Math.round(similarity)}%</Text>
					<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
						<Loader size='sm' color='#ff00a0' type='dots' />
					</Box>
				</Box>
			</Modal>
		</Box>
	);
};

export default QuantumDecryption;
