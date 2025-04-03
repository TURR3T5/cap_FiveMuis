import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Group, Text, Progress, Button, useMantineTheme, Stack, ActionIcon, ScrollArea, rgba } from '@mantine/core';
import { Clock, Shuffle, RotateCcw, X, FileLock, FileWarning, Lightbulb, Loader, HardDrive, ChevronUp, ChevronDown } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { MemoryFragment, MemorySequencingConfig } from './types';
import { generateMemoryFragments, formatTimestamp, evaluateSequenceAccuracy, applyCorruption, generateMemorySequencingConfig } from './utils';

const MemoryFragmentSequencing: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('memoryFragmentSequencing');
	const theme = useMantineTheme();

	const customConfig = config?.customOptions as MemorySequencingConfig;
	const msConfig = useMemo(() => generateMemorySequencingConfig(config?.difficulty || 'medium', customConfig), [config?.difficulty, customConfig]);

	const [fragments, setFragments] = useState<MemoryFragment[]>([]);
	const [userSequence, setUserSequence] = useState<MemoryFragment[]>([]);
	const [accuracy, setAccuracy] = useState(0);
	const [showHint, setShowHint] = useState(false);
	const [hintsUsed, setHintsUsed] = useState(0);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showFailure, setShowFailure] = useState(false);
	const [forceRender, setForceRender] = useState(0);

	const successMessage = 'HUKOMMELSESSTREAM GENDANNET';
	const successDescription = 'Datasekvens succesfuldt rekonstrueret og verificeret.';
	const failureMessage = 'HUKOMMELSESFEJL';
	const failureDescription = 'Kunne ikke rekonstruere datasekvensen inden for tidsgrænsen.';

	const maxHints = useMemo(() => Math.max(1, Math.floor(msConfig.fragmentCount! / 2)), [msConfig.fragmentCount]);

	const correctOrder = useMemo(() => fragments.map((f) => f.index).sort((a, b) => a - b), [fragments]);

	const initializeGame = useCallback(() => {
		if (!config) return;

		const newFragments = generateMemoryFragments(msConfig.fragmentCount || 4, msConfig.patternLength || 4, msConfig.corruptionRate || 0.3);

		setFragments(newFragments);
		setUserSequence(newFragments);
		setAccuracy(0);
		setShowHint(false);
		setHintsUsed(0);
		setShowSuccess(false);
		setShowFailure(false);

		if (debug) {
			console.log('Memory Fragment Sequencing initialized with:', {
				fragments: newFragments,
				config: msConfig,
			});
		}
	}, [config, msConfig, debug]);

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
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			setShowFailure(true);

			setTimeout(() => {
				completeGame(false, accuracy);
				onComplete?.({ success: false, score: accuracy, timeTaken: timeElapsed });
			}, 3000);
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete, accuracy, forceRender]);

	const handleShuffleFragments = () => {
		const shuffled = [...userSequence];

		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		setUserSequence(shuffled);

		const newAccuracy = evaluateSequenceAccuracy(shuffled, correctOrder);
		setAccuracy(newAccuracy);
	};

	const handleResetSequence = () => {
		setUserSequence([...fragments]);
		setAccuracy(0);
	};

	const handleUseHint = () => {
		if (hintsUsed >= maxHints) return;

		setHintsUsed((prev) => prev + 1);
		setShowHint(true);

		setTimeout(() => {
			setShowHint(false);
		}, 3000);
	};

	const handleMoveFragment = (fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return;

		const newSequence = [...userSequence];
		const [movedItem] = newSequence.splice(fromIndex, 1);
		newSequence.splice(toIndex, 0, movedItem);

		setUserSequence(newSequence);

		const newAccuracy = evaluateSequenceAccuracy(newSequence, correctOrder);
		setAccuracy(newAccuracy);

		if (newAccuracy === 100) {
			setShowSuccess(true);

			setTimeout(() => {
				completeGame(true, 100 - hintsUsed * 5);
				onComplete?.({
					success: true,
					score: 100 - hintsUsed * 5,
					timeTaken: timeElapsed,
				});
			}, 3000);
		}
	};

	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		handleMoveFragment(draggedIndex, index);
		setDraggedIndex(index);
	};

	const timeProgress = config?.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;

	if (!isActive || !config) return null;

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Group justify='space-between' mb='xs'>
				<Group>
					<HardDrive size={20} />
					<Text fw={700}>HUKOMMELSESFRAGMENT SEKVENTERING</Text>
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
							Nøjagtighed:
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
					<Text size='sm'>Arranger hukommelsesfragmenterne i den korrekte rækkefølge for at gendanne den ødelagte datastrøm.</Text>

					<Group justify='space-between'>
						<Group>
							<Button variant='light' size='xs' leftSection={<Shuffle size={16} />} onClick={handleShuffleFragments}>
								Bland
							</Button>
							<Button variant='light' size='xs' leftSection={<RotateCcw size={16} />} onClick={handleResetSequence}>
								Nulstil
							</Button>
						</Group>

						{msConfig.allowHints && (
							<Button variant='subtle' size='xs' leftSection={<Lightbulb size={16} />} onClick={handleUseHint} disabled={hintsUsed >= maxHints} color='yellow'>
								Hint ({maxHints - hintsUsed}/{maxHints})
							</Button>
						)}
					</Group>

					<ScrollArea h={400} type='always'>
						<Stack gap='xs'>
							{userSequence.map((fragment, index) => (
								<Paper
									key={fragment.id}
									p='md'
									withBorder
									draggable
									onDragStart={() => handleDragStart(index)}
									onDragEnd={handleDragEnd}
									onDragOver={(e) => handleDragOver(e, index)}
									style={{
										backgroundColor: draggedIndex === index ? rgba(fragment.color, 0.2) : rgba(fragment.color, 0.1),
										borderLeft: `4px solid ${fragment.color}`,
										opacity: draggedIndex === index ? 0.6 : 1,
										cursor: 'grab',
									}}
								>
									<Group justify='space-between' mb={8}>
										<Group gap={8}>
											<FileLock size={16} color={fragment.color} />
											<Text size='sm' fw={700} style={{ color: fragment.color }}>
												Fragment #{index + 1}
											</Text>
										</Group>

										<Group gap={5}>
											{msConfig.showTimestamps && (
												<Text size='xs' style={{ fontFamily: 'monospace' }}>
													{formatTimestamp(fragment.timestamp)}
												</Text>
											)}

											<Group gap={2}>
												<ActionIcon size='xs' variant='subtle' onClick={() => index > 0 && handleMoveFragment(index, index - 1)} disabled={index === 0}>
													<ChevronUp size={14} />
												</ActionIcon>
												<ActionIcon size='xs' variant='subtle' onClick={() => index < userSequence.length - 1 && handleMoveFragment(index, index + 1)} disabled={index === userSequence.length - 1}>
													<ChevronDown size={14} />
												</ActionIcon>
											</Group>
										</Group>
									</Group>

									<Box
										p='xs'
										style={{
											backgroundColor: rgba(fragment.color, 0.05),
											borderRadius: theme.radius.sm,
											fontFamily: 'monospace',
											fontSize: '12px',
										}}
									>
										<Text>{applyCorruption(fragment.content, fragment.corruptionLevel)}</Text>
									</Box>

									<Group justify='space-between' mt={8}>
										<Box
											style={{
												padding: '3px 8px',
												backgroundColor: rgba(fragment.color, 0.2),
												borderRadius: theme.radius.sm,
												fontSize: '10px',
												fontFamily: 'monospace',
											}}
										>
											{fragment.dataPattern}
										</Box>

										{showHint && hintsUsed > 0 && fragment.index === index && (
											<Box
												style={{
													padding: '2px 6px',
													backgroundColor: '#ffd700',
													borderRadius: theme.radius.sm,
													color: '#000',
													fontSize: '10px',
													animation: 'pulse 1s infinite',
												}}
											>
												<Lightbulb size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
												Korrekt position!
											</Box>
										)}
									</Group>
								</Paper>
							))}
						</Stack>
					</ScrollArea>

					<Group justify='center'>
						<Text size='sm'>Sekvens nøjagtighed:</Text>
						<Progress value={accuracy} size='md' w={200} color={accuracy > 85 ? 'green' : accuracy > 60 ? 'yellow' : 'red'} />
						<Text size='sm' fw={700}>
							{Math.round(accuracy)}%
						</Text>
					</Group>
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
					<Box style={{ textAlign: 'center', background: 'linear-gradient(135deg, #002020 0%, #004040 100%)', padding: '30px', borderRadius: theme.radius.md, border: '1px solid #00a080', maxWidth: '80%' }}>
						<Box mb={20} style={{ position: 'relative' }}>
							<FileLock size={60} color='#00ff80'/>
							<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #00ff80', opacity: 0.5, animation: 'mfs-pulse 2s infinite' }} />
						</Box>
						<Text size='xl' fw={700} mb='md' style={{ color: '#00ff80' }}>
							{successMessage}
						</Text>
						<Text mb='lg' style={{ color: '#a0ffd0' }}>
							{successDescription}
						</Text>
						<Group justify='center' gap={5} mb='md'>
							<Text c='#80c0a0'>Nøjagtighed:</Text>
							<Text fw={700} c='#ffffff'>
								{Math.round(accuracy)}%
							</Text>
						</Group>

						{hintsUsed > 0 && (
							<Text size='sm' c='dimmed'>
								Brugte hints: {hintsUsed} (-{hintsUsed * 5} point)
							</Text>
						)}

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
					<Box style={{ textAlign: 'center', background: 'linear-gradient(135deg, #200020 0%, #400040 100%)', padding: '30px', borderRadius: theme.radius.md, border: '1px solid #800080', maxWidth: '80%' }}>
						<Box mb={20} style={{ position: 'relative' }}>
							<FileWarning size={60} color='#ff00ff'/>
							<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #ff00ff', opacity: 0.3, animation: 'mfs-flicker 1s infinite' }} />
						</Box>
						<Text size='xl' fw={700} mb='md' style={{ color: '#ff00ff' }}>
							{failureMessage}
						</Text>
						<Text mb='lg' style={{ color: '#ffa0ff' }}>
							{failureDescription}
						</Text>
						<Text c='dimmed'>Opnået nøjagtighed: {Math.round(accuracy)}%</Text>
						<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
							<Loader size='sm' color='#ff00ff' type='dots' />
						</Box>
					</Box>
				</Box>
			)}

			<style>{`
        @keyframes mfs-pulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes mfs-flicker {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

			{debug && (
				<Box mt='xs' p='xs' bg='rgba(0,0,0,0.2)' style={{ borderRadius: 4 }}>
					<Text size='xs' c='dimmed'>
						Debug Info - Korrekt rækkefølge: {correctOrder.join(', ')}
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default MemoryFragmentSequencing;
