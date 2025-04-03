import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Paper, Group, Text, Progress, Button, useMantineTheme, Stack, Tabs } from '@mantine/core';
import { Clock, RotateCcw, Check, X, Fingerprint, Eye, User, Hand, Mic, AlertTriangle, Loader } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { BiometricPattern, BiometricType, BiometricOverrideConfig } from './types';
import { generateBiometricPattern, calculatePatternSimilarity, generateBiometricOverrideConfig } from './utils';

const BiometricOverride: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('biometricOverride');
	const theme = useMantineTheme();

	const customConfig = config?.customOptions as BiometricOverrideConfig;
	const boConfig = useMemo(() => generateBiometricOverrideConfig(config?.difficulty || 'medium', customConfig), [config?.difficulty, customConfig]);

	const gridSize = 9;
	const [patterns, setPatterns] = useState<BiometricPattern[]>([]);
	const [activeTab, setActiveTab] = useState<string | null>('0');
	const [userPatterns, setUserPatterns] = useState<Record<string, string[]>>({});
	const [isDrawing, setIsDrawing] = useState(false);
	const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
	const [similarities, setSimilarities] = useState<Record<string, number>>({});
	const [patternStatuses, setPatternStatuses] = useState<Record<string, 'waiting' | 'success' | 'failed'>>({});
	const [overallProgress, setOverallProgress] = useState(0);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showFailure, setShowFailure] = useState(false);
	const [forceRender, setForceRender] = useState(0);

	const successMessage = 'BIOMETRISK VERIFIKATION SUCCESFULD';
	const successDescription = 'Sikkerhedssystem omgået. Biometriske mønstre accepteret.';
	const failureMessage = 'BIOMETRISK ADGANG NÆGTET';
	const failureDescription = 'Kunne ikke omgå biometrisk sikkerhed inden for tidsgrænsen.';

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const biometricIcons = {
		fingerprint: <Fingerprint />,
		retina: <Eye />,
		facial: <User />,
		palm: <Hand />,
		voice: <Mic />,
	};

	const biometricLabels = {
		fingerprint: 'Fingeraftryk',
		retina: 'Retina',
		facial: 'Ansigtsgenkendelse',
		palm: 'Håndaftryk',
		voice: 'Stemme',
	};

	const initializeGame = useCallback(() => {
		if (!config) return;

		let patternTypes = boConfig.patternTypes || ['fingerprint', 'retina', 'facial'];

		if (!patternTypes.includes('fingerprint')) {
			patternTypes = ['fingerprint', ...patternTypes.filter((t) => t !== 'fingerprint')].slice(0, boConfig.patternCount || 3) as BiometricType[];
		}

		const newPatterns = patternTypes.map((type) => generateBiometricPattern(type, gridSize, boConfig.complexity || 0.5));

		const initialUserPatterns: Record<string, string[]> = {};
		const initialSimilarities: Record<string, number> = {};
		const initialStatuses: Record<string, 'waiting' | 'success' | 'failed'> = {};

		newPatterns.forEach((pattern) => {
			initialUserPatterns[pattern.id] = [];
			initialSimilarities[pattern.id] = 0;
			initialStatuses[pattern.id] = 'waiting';
		});

		setPatterns(newPatterns);
		setUserPatterns(initialUserPatterns);
		setSimilarities(initialSimilarities);
		setPatternStatuses(initialStatuses);
		setActiveTab('0');
		setOverallProgress(0);
		setShowSuccess(false);
		setShowFailure(false);

		if (debug) {
			console.log('Biometric Override initialized with:', {
				patterns: newPatterns,
				config: boConfig,
			});
		}
	}, [config, boConfig, gridSize, debug]);

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
		drawCanvas();
	}, [activeTab, userPatterns, patterns]);

	useEffect(() => {
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			setShowFailure(true);

			setTimeout(() => {
				completeGame(false, overallProgress);
				onComplete?.({ success: false, score: overallProgress, timeTaken: timeElapsed });
			}, 3000);
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete, overallProgress, forceRender]);

	const drawCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const patternIndex = activeTab ? parseInt(activeTab) : 0;
		const pattern = patterns[patternIndex];
		if (!pattern) return;

		const cellSize = canvas.width / gridSize;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.strokeStyle = '#444';
		ctx.lineWidth = 0.5;

		for (let i = 0; i <= gridSize; i++) {
			ctx.beginPath();
			ctx.moveTo(i * cellSize, 0);
			ctx.lineTo(i * cellSize, canvas.height);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, i * cellSize);
			ctx.lineTo(canvas.width, i * cellSize);
			ctx.stroke();
		}

		if (boConfig.showGuides || debug) {
			ctx.globalAlpha = 0.4;
			ctx.strokeStyle = pattern.color;
			ctx.lineWidth = 3;
			ctx.beginPath();

			pattern.path.forEach((point, index) => {
				const [x, y] = point.split(',').map(Number);
				const canvasX = (x + 0.5) * cellSize;
				const canvasY = (y + 0.5) * cellSize;

				if (index === 0) {
					ctx.moveTo(canvasX, canvasY);
				} else {
					ctx.lineTo(canvasX, canvasY);
				}
			});

			ctx.stroke();

			pattern.path.forEach((point, index) => {
				const [x, y] = point.split(',').map(Number);
				const canvasX = (x + 0.5) * cellSize;
				const canvasY = (y + 0.5) * cellSize;

				ctx.beginPath();
				const radius = index === 0 ? 7 : index < 3 ? 5 : 3;
				ctx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
				ctx.fillStyle = index === 0 ? '#ffffff' : index < 3 ? '#ffff00' : pattern.color;
				ctx.fill();

				if (index < 5) {
					ctx.fillStyle = '#ffffff';
					ctx.font = '11px Arial';
					ctx.fillText(`${index + 1}`, canvasX - 3, canvasY + 3);
				}
			});

			const [startX, startY] = pattern.path[0].split(',').map(Number);
			const startCanvasX = (startX + 0.5) * cellSize;
			const startCanvasY = (startY + 0.5) * cellSize;

			ctx.beginPath();
			ctx.arc(startCanvasX, startCanvasY, 9, 0, Math.PI * 2);
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 10px Arial';
			ctx.fillText('START', startCanvasX + 10, startCanvasY - 5);

			ctx.globalAlpha = 1.0;
		}

		const userPattern = userPatterns[pattern.id] || [];

		if (userPattern.length > 0) {
			ctx.strokeStyle = pattern.color;
			ctx.lineWidth = 4;
			ctx.beginPath();

			userPattern.forEach((point, index) => {
				const [x, y] = point.split(',').map(Number);
				const canvasX = (x + 0.5) * cellSize;
				const canvasY = (y + 0.5) * cellSize;

				if (index === 0) {
					ctx.moveTo(canvasX, canvasY);
				} else {
					ctx.lineTo(canvasX, canvasY);
				}
			});

			ctx.stroke();

			userPattern.forEach((point) => {
				const [x, y] = point.split(',').map(Number);
				const canvasX = (x + 0.5) * cellSize;
				const canvasY = (y + 0.5) * cellSize;

				ctx.beginPath();
				ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
				ctx.fillStyle = pattern.color;
				ctx.fill();
			});
		}
	};

	const handlePatternReset = () => {
		if (!activeTab) return;

		const patternIndex = parseInt(activeTab);
		const pattern = patterns[patternIndex];
		if (!pattern) return;

		setUserPatterns((prev) => ({
			...prev,
			[pattern.id]: [],
		}));

		setSimilarities((prev) => ({
			...prev,
			[pattern.id]: 0,
		}));

		setPatternStatuses((prev) => ({
			...prev,
			[pattern.id]: 'waiting',
		}));

		updateOverallProgress();
	};

	const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!activeTab || patternStatuses[patterns[parseInt(activeTab)].id] !== 'waiting') return;

		setIsDrawing(true);
		const point = getCanvasCoordinates(e);
		if (!point) return;

		const gridPoint = `${point.x},${point.y}`;

		const patternIndex = parseInt(activeTab);
		const pattern = patterns[patternIndex];

		setUserPatterns((prev) => ({
			...prev,
			[pattern.id]: [...(prev[pattern.id] || []), gridPoint],
		}));

		setLastPoint(point);
	};

	const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!isDrawing || !activeTab || !lastPoint) return;

		const point = getCanvasCoordinates(e);
		if (!point) return;

		if (point.x === lastPoint.x && point.y === lastPoint.y) return;

		const gridPoint = `${point.x},${point.y}`;
		const patternIndex = parseInt(activeTab);
		const pattern = patterns[patternIndex];
		const currentUserPattern = [...(userPatterns[pattern.id] || [])];

		if (currentUserPattern.length >= 2) {
			if (currentUserPattern[currentUserPattern.length - 2] === gridPoint) {
				setUserPatterns((prev) => {
					const updated = [...prev[pattern.id]];
					updated.pop();
					return {
						...prev,
						[pattern.id]: updated,
					};
				});

				setLastPoint(point);
				return;
			}
		}

		if (!currentUserPattern.includes(gridPoint)) {
			setUserPatterns((prev) => ({
				...prev,
				[pattern.id]: [...(prev[pattern.id] || []), gridPoint],
			}));
		}

		setLastPoint(point);
	};

	const handleCanvasMouseUp = () => {
		if (!isDrawing || !activeTab) return;

		setIsDrawing(false);
		setLastPoint(null);

		const patternIndex = parseInt(activeTab);
		const pattern = patterns[patternIndex];
		const userPattern = userPatterns[pattern.id] || [];

		const similarity = calculatePatternSimilarity(userPattern, pattern.path);

		setSimilarities((prev) => ({
			...prev,
			[pattern.id]: similarity,
		}));

		const successThreshold = config?.difficulty === 'easy' ? 80 : config?.difficulty === 'medium' ? 85 : 90;

		if (similarity >= successThreshold) {
			setPatternStatuses((prev) => ({
				...prev,
				[pattern.id]: 'success',
			}));

			setTimeout(() => {
				const newStatuses = {
					...patternStatuses,
					[pattern.id]: 'success',
				};

				const allComplete = patterns.every((p) => newStatuses[p.id] === 'success');

				if (allComplete) {
					setShowSuccess(true);

					setTimeout(() => {
						completeGame(true, overallProgress);
						onComplete?.({
							success: true,
							score: overallProgress,
							timeTaken: timeElapsed,
						});
					}, 3000);
				} else {
					const nextIndex = (patternIndex + 1) % patterns.length;
					setActiveTab(nextIndex.toString());
				}
			}, 1000);
		} else if (userPattern.length >= pattern.minPatternLength) {
			if (!boConfig.allowRetry) {
				setPatternStatuses((prev) => ({
					...prev,
					[pattern.id]: 'failed',
				}));
			}
		}

		updateOverallProgress();
	};

	const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
		const canvas = canvasRef.current;
		if (!canvas) return null;

		const rect = canvas.getBoundingClientRect();

		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		const cellSize = canvas.width / gridSize;

		const gridX = Math.floor(x / cellSize);
		const gridY = Math.floor(y / cellSize);

		if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
			return null;
		}

		return { x: gridX, y: gridY };
	};

	const updateOverallProgress = () => {
		const totalSimilarity = Object.values(similarities).reduce((sum, val) => sum + val, 0);
		const newProgress = (totalSimilarity / (patterns.length * 100)) * 100;
		setOverallProgress(newProgress);
	};

	const timeProgress = config?.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;

	if (!isActive || !config || patterns.length === 0) return null;

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Group justify='space-between' mb='xs'>
				<Group>
					<Fingerprint size={20} />
					<Text fw={700}>BIOMETRISK OVERRIDE</Text>
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
							Fremskridt:
						</Text>
						<Text size='sm'>{Math.round(overallProgress)}%</Text>
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
					<Text size='sm'>Tegn de biometriske mønstre præcist for at omgå sikkerhedssystemet.</Text>

					<Tabs value={activeTab} onChange={setActiveTab} variant='outline'>
						<Tabs.List>
							{patterns.map((pattern, index) => (
								<Tabs.Tab
									key={pattern.id}
									value={index.toString()}
									leftSection={biometricIcons[pattern.type]}
									rightSection={patternStatuses[pattern.id] === 'success' ? <Check size={16} color='green' /> : patternStatuses[pattern.id] === 'failed' ? <X size={16} color='red' /> : null}
									style={{
										borderBottom: `2px solid ${pattern.color}`,
										opacity: patternStatuses[pattern.id] === 'success' ? 0.7 : 1,
									}}
								>
									{biometricLabels[pattern.type]}
								</Tabs.Tab>
							))}
						</Tabs.List>
					</Tabs>

					<Box
						style={{
							width: '100%',
							height: 400,
							backgroundColor: '#1a1a1a',
							borderRadius: theme.radius.md,
							overflow: 'hidden',
							position: 'relative',
							cursor: patternStatuses[patterns[parseInt(activeTab || '0')].id] === 'waiting' ? 'crosshair' : 'default',
						}}
					>
						{patterns.map((pattern, index) => (
							<Box
								key={pattern.id}
								style={{
									display: activeTab === index.toString() ? 'block' : 'none',
									width: '100%',
									height: '100%',
									position: 'relative',
								}}
							>
								<canvas
									ref={canvasRef}
									width={400}
									height={400}
									onMouseDown={handleCanvasMouseDown}
									onMouseMove={handleCanvasMouseMove}
									onMouseUp={handleCanvasMouseUp}
									onMouseLeave={handleCanvasMouseUp}
									style={{
										width: '100%',
										height: '100%',
										backgroundColor: '#0f0f0f',
										opacity: patternStatuses[pattern.id] === 'success' ? 0.8 : 1,
									}}
								/>

								{}
								<Box
									style={{
										position: 'absolute',
										bottom: 10,
										left: 10,
										right: 10,
										backgroundColor: 'rgba(0,0,0,0.7)',
										padding: '8px 12px',
										borderRadius: theme.radius.sm,
										display: 'flex',
										flexDirection: 'column',
										gap: '5px',
									}}
								>
									<Text size='sm' fw={500}>
										Træk med musen for at tegne mønstret
									</Text>

									<Group justify='space-between'>
										<Group>
											<Text size='xs' style={{ opacity: 0.7 }}>
												Mønstertype:
											</Text>
											<Text size='xs' fw={700} style={{ color: patterns[parseInt(activeTab || '0')].color }}>
												{biometricLabels[patterns[parseInt(activeTab || '0')].type]}
											</Text>
										</Group>

										<Group>
											<Text size='xs' style={{ opacity: 0.7 }}>
												Min. længde:
											</Text>
											<Text size='xs' fw={700}>
												{patterns[parseInt(activeTab || '0')].minPatternLength} punkter
											</Text>
										</Group>

										<Group>
											<Text size='xs' style={{ opacity: 0.7 }}>
												Dine punkter:
											</Text>
											<Text size='xs' fw={700}>
												{(userPatterns[patterns[parseInt(activeTab || '0')].id] || []).length}
											</Text>
										</Group>
									</Group>
								</Box>

								<Box
									style={{
										position: 'absolute',
										top: 60,
										left: '50%',
										transform: 'translateX(-50%)',
										backgroundColor: 'rgba(0,0,0,0.7)',
										padding: '5px 10px',
										borderRadius: theme.radius.sm,
										display: patternStatuses[patterns[parseInt(activeTab || '0')].id] === 'waiting' && isDrawing ? 'block' : 'none',
									}}
								>
									<Text size='xs' fw={700} c={patterns[parseInt(activeTab || '0')].color}>
										Tegner... {(userPatterns[patterns[parseInt(activeTab || '0')].id] || []).length} punkter
									</Text>
								</Box>
								{}
								{patternStatuses[pattern.id] === 'success' && (
									<Box
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											backgroundColor: 'rgba(0, 128, 0, 0.2)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexDirection: 'column',
											gap: '10px',
										}}
									>
										<Check size={60} color='green' />
										<Text fw={700} size='xl' color='green'>
											Adgang Godkendt
										</Text>
									</Box>
								)}

								{patternStatuses[pattern.id] === 'failed' && (
									<Box
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											backgroundColor: 'rgba(128, 0, 0, 0.2)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexDirection: 'column',
											gap: '10px',
										}}
									>
										<X size={60} color='red' />
										<Text fw={700} size='xl' color='red'>
											Adgang Nægtet
										</Text>
									</Box>
								)}
							</Box>
						))}
					</Box>

					<Group justify='space-between'>
						<Button variant='light' leftSection={<RotateCcw size={16} />} onClick={handlePatternReset} disabled={!activeTab || patternStatuses[patterns[parseInt(activeTab)].id] === 'success' || (!boConfig.allowRetry && patternStatuses[patterns[parseInt(activeTab)].id] === 'failed')}>
							Nulstil Mønster
						</Button>

						<Group>
							<Text size='sm' fw={500}>
								Samlet fremskridt:
							</Text>
							<Progress value={overallProgress} size='md' w={150} color={overallProgress > 80 ? 'green' : overallProgress > 50 ? 'yellow' : 'red'} />
							<Text size='sm' fw={700}>
								{Math.round(overallProgress)}%
							</Text>
						</Group>
					</Group>

					{}
					{boConfig.showGuides && (
						<Box
							p='xs'
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
								borderRadius: theme.radius.sm,
								border: '1px solid rgba(255, 255, 255, 0.1)',
							}}
						>
							<Group align='flex-start' gap={5}>
								<AlertTriangle size={18} style={{ marginTop: 2 }} />
								<Text size='sm'>Tegn mønstret ved at klikke og trække på gitteret. Følg det svagt synlige guidemønster for at opnå højt match.</Text>
							</Group>
						</Box>
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
					<Box style={{ textAlign: 'center', background: 'linear-gradient(135deg, #002010 0%, #004020 100%)', padding: '30px', borderRadius: theme.radius.md, border: '1px solid #00ff80', maxWidth: '80%' }}>
						<Box mb={20} style={{ position: 'relative' }}>
							<Fingerprint size={60} color='#00ff80' />
							<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #00ff80', opacity: 0.5, animation: 'bo-pulse 2s infinite' }} />
						</Box>
						<Text size='xl' fw={700} mb='md' style={{ color: '#00ff80' }}>
							{successMessage}
						</Text>
						<Text mb='lg' style={{ color: '#a0ffd0' }}>
							{successDescription}
						</Text>
						<Text c='#80c0a0'>Nøjagtighed: {Math.round(overallProgress)}%</Text>
						<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
							<Loader size='sm' color='#00ff80' type='bars' />
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
					<Box style={{ textAlign: 'center', background: 'linear-gradient(135deg, #200010 0%, #400020 100%)', padding: '30px', borderRadius: theme.radius.md, border: '1px solid #ff0040', maxWidth: '80%' }}>
						<Box mb={20} style={{ position: 'relative' }}>
							<Fingerprint size={60} color='#ff0040' />
							<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #ff0040', opacity: 0.3, animation: 'bo-flicker 1s infinite' }} />
						</Box>
						<Text size='xl' fw={700} mb='md' style={{ color: '#ff0040' }}>
							{failureMessage}
						</Text>
						<Text mb='lg' style={{ color: '#ff8080' }}>
							{failureDescription}
						</Text>
						<Text c='dimmed'>Opnået match: {Math.round(overallProgress)}%</Text>
						<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
							<Loader size='sm' color='#ff0040' type='dots' />
						</Box>
					</Box>
				</Box>
			)}

			<style>{`
        @keyframes bo-pulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes bo-flicker {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>

			{debug && (
				<Box mt='xs' p='xs' bg='rgba(0,0,0,0.2)' style={{ borderRadius: 4 }}>
					<Text size='xs' c='dimmed'>
						Debug Info - Aktive mønstre: {patterns.map((p) => p.type).join(', ')}
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default BiometricOverride;
