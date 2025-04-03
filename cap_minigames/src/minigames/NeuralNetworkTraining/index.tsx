import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Group, Text, Progress, Button, ActionIcon, useMantineTheme, Stack, Modal, Grid, ScrollArea, Drawer } from '@mantine/core';
import { Clock, Check, X, Brain, HelpCircle, ChevronRight, AlertTriangle, Loader } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { CategoryType, DataPoint, NeuralNetworkConfig, TrainingResult } from './types';
import { generateDataPoints, getCategoryPlaceholderImage, calculateAccuracy, getHelpText, generateNeuralNetworkConfig } from './utils';

const NeuralNetworkTraining: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('neuralNetworkTraining');
	const theme = useMantineTheme();

	const customConfig = config?.customOptions as NeuralNetworkConfig;
	const nnConfig = useMemo(() => generateNeuralNetworkConfig(config?.difficulty || 'medium', customConfig), [config?.difficulty, customConfig]);

	const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
	const [timeForCurrent, setTimeForCurrent] = useState(0);
	const [showFeedback, setShowFeedback] = useState(false);
	const [feedbackCorrect, setFeedbackCorrect] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [forceRender, setForceRender] = useState(0);

	const initializeGame = useCallback(() => {
		if (!config) return;

		const newDataPoints = generateDataPoints(nnConfig.dataPointCount || 15, nnConfig.categories || ['animal', 'person', 'vehicle'], nnConfig.difficultyMultiplier || 1.0);

		setDataPoints(newDataPoints);
		setCurrentIndex(0);
		setCorrectAnswers(0);
		setSelectedCategory(null);
		setTimeForCurrent(0);
		setShowFeedback(false);
		setFeedbackCorrect(false);
		setShowResults(false);
		setGameStarted(true);

		if (debug) {
			console.log('Neural Network Training initialized with:', {
				config: nnConfig,
				dataPoints: newDataPoints,
			});
		}
	}, [config, nnConfig, debug]);

	useEffect(() => {
		if (isActive) {
			initializeGame();

			const timerInterval = setInterval(() => {
				setForceRender((prev) => prev + 1);
			}, 100);

			return () => clearInterval(timerInterval);
		}
	}, [isActive, initializeGame]);

	const handleCategorySelect = (category: CategoryType) => {
		if (!gameStarted) {
			setGameStarted(true);
			return;
		}

		if (showFeedback || currentIndex >= dataPoints.length) return;

		const currentDataPoint = dataPoints[currentIndex];
		const isCorrect = category === currentDataPoint.category;

		setSelectedCategory(category);
		setFeedbackCorrect(isCorrect);
		setShowFeedback(true);

		if (isCorrect) {
			setCorrectAnswers((prev) => prev + 1);
		}

		setTimeout(() => {
			setShowFeedback(false);
			setSelectedCategory(null);
			setTimeForCurrent(0);

			if (currentIndex + 1 >= dataPoints.length) {
				finishGame();
			} else {
				setCurrentIndex((prev) => prev + 1);
			}
		}, 700);
	};

	useEffect(() => {
		if (!gameStarted || showFeedback || currentIndex >= dataPoints.length) return;

		const timer = setTimeout(() => {
			setTimeForCurrent((prev) => prev + 100);

			if (timeForCurrent >= (nnConfig.timePerDecision || 3000)) {
				setShowFeedback(true);
				setFeedbackCorrect(false);

				setTimeout(() => {
					setShowFeedback(false);
					setTimeForCurrent(0);

					if (currentIndex + 1 >= dataPoints.length) {
						finishGame();
					} else {
						setCurrentIndex((prev) => prev + 1);
					}
				}, 700);
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [forceRender, gameStarted, showFeedback, currentIndex, dataPoints.length, timeForCurrent, nnConfig.timePerDecision]);

	const finishGame = () => {
		setShowResults(true);

		const accuracy = calculateAccuracy(dataPoints.length, correctAnswers);
		const speed = dataPoints.length / (timeElapsed / 1000) || 0;
		const mistakes = dataPoints.length - correctAnswers;

		const result: TrainingResult = {
			accuracy,
			speed,
			mistakes,
		};

		const successThreshold = config?.difficulty === 'easy' ? 70 : config?.difficulty === 'medium' ? 80 : 85;

		setTimeout(() => {
			completeGame(accuracy >= successThreshold, accuracy);
			onComplete?.({
				success: accuracy >= successThreshold,
				score: accuracy,
				timeTaken: timeElapsed,
			});
		}, 3000);
	};

	const currentDataPoint = dataPoints[currentIndex];

	if (!isActive || !config || !currentDataPoint) return null;

	const timeProgress = config.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;
	const decisionTimeProgress = (timeForCurrent / (nnConfig.timePerDecision || 3000)) * 100;

	const categoryColors: Record<CategoryType, string> = {
		animal: theme.colors.green[6],
		person: theme.colors.orange[6],
		vehicle: theme.colors.blue[6],
		building: theme.colors.grape[6],
		nature: theme.colors.teal[6],
		tech: theme.colors.red[6],
	};

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Group justify='space-between' mb='xs'>
				<Group>
					<Brain size={20} />
					<Text fw={700}>NEURAL NETWORK TRAINING</Text>
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
							Accuracy:
						</Text>
						<Text size='sm'>{currentIndex > 0 ? Math.round((correctAnswers / currentIndex) * 100) : 0}%</Text>
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
					<>
						{}
						<Group justify='space-between'>
							<Text size='sm'>
								Training Progress: {currentIndex + 1} / {dataPoints.length}
							</Text>
							<Progress value={(currentIndex / dataPoints.length) * 100} size='sm' w={200} />
						</Group>

						{}
						<Group justify='space-between'>
							<Text size='sm'>Decision Timer:</Text>
							<Progress value={100 - decisionTimeProgress} color={decisionTimeProgress > 75 ? 'red' : decisionTimeProgress > 50 ? 'yellow' : 'green'} size='sm' w={200} />
						</Group>

						{}
						<Box
							style={{
								position: 'relative',
								height: 220,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								border: `1px solid ${theme.colors.dark[4]}`,
								borderRadius: theme.radius.md,
								overflow: 'hidden',
								backgroundColor: theme.colors.dark[8],
							}}
						>
							{}
							<Box
								style={{
									width: 180,
									height: 180,
									borderRadius: theme.radius.md,
									overflow: 'hidden',
									position: 'relative',
								}}
							>
								<img
									src={getCategoryPlaceholderImage(currentDataPoint.category, 180)}
									alt='Item to classify'
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										opacity: showFeedback ? 0.7 : 1,
									}}
								/>

								{}
								{showFeedback && (
									<Box
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
											backgroundColor: feedbackCorrect ? 'rgba(0, 180, 0, 0.3)' : 'rgba(180, 0, 0, 0.3)',
											backdropFilter: 'blur(2px)',
										}}
									>
										{feedbackCorrect ? (
											<Check size={50} color='white' />
										) : (
											<>
												<X size={50} color='white' />
												<Text c='white' mt={5} fw={500}>
													{currentDataPoint.category}
												</Text>
											</>
										)}
									</Box>
								)}
							</Box>
						</Box>

						{}
						<Box>
							<Text size='sm' mb='xs'>
								Feature Analysis:
							</Text>
							<Group justify='center' gap='md'>
								{currentDataPoint.features.map((feature, idx) => (
									<Box
										key={idx}
										style={{
											width: 20,
											height: 60,
											backgroundColor: theme.colors.dark[4],
											borderRadius: theme.radius.sm,
											overflow: 'hidden',
											position: 'relative',
										}}
									>
										<Box
											style={{
												position: 'absolute',
												bottom: 0,
												width: '100%',
												height: `${feature * 100}%`,
												backgroundColor: theme.colors.blue[feature > 0.7 ? 7 : feature > 0.4 ? 5 : 3],
												transition: 'height 0.3s ease',
											}}
										/>
									</Box>
								))}
							</Group>
						</Box>

						{}
						<Grid>
							{nnConfig.categories?.map((category) => (
								<Grid.Col span={4} key={category}>
									<Button
										fullWidth
										variant={selectedCategory === category ? 'filled' : 'light'}
										color={categoryColors[category] ? undefined : undefined}
										style={{
											backgroundColor: selectedCategory === category ? categoryColors[category] : 'transparent',
											borderColor: categoryColors[category],
											borderWidth: '1px',
											borderStyle: 'solid',
										}}
										onClick={() => handleCategorySelect(category)}
										disabled={showFeedback}
									>
										{category.charAt(0).toUpperCase() + category.slice(1)}
									</Button>
								</Grid.Col>
							))}
						</Grid>

						{}
						{nnConfig.showHelp && (
							<Group justify='center'>
								<Button variant='subtle' leftSection={<HelpCircle size={16} />} onClick={() => setShowHelp(true)}>
									Help
								</Button>
							</Group>
						)}
					</>
				</Stack>
			</Paper>

			<Modal opened={showResults} onClose={() => {}} withCloseButton={false} centered padding='xl' size='md' radius='md'>
				<Box p='md' style={{ textAlign: 'center', background: 'linear-gradient(135deg, #100030 0%, #300060 100%)', border: '1px solid #a000ff', borderRadius: theme.radius.md }}>
					<Box mb={20} style={{ position: 'relative' }}>
						<Brain size={60} color='#a000ff' stroke='md' />
						<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #a000ff', opacity: 0.3, animation: 'neural-pulse 2s infinite' }} />
					</Box>
					<Text size='xl' fw={700} mb='md' style={{ color: '#a000ff' }}>
						AI TRÆNING FULDFØRT
					</Text>

					<Stack gap='md' mb='lg' style={{ backgroundColor: 'rgba(160, 0, 255, 0.1)', padding: '15px', borderRadius: theme.radius.sm }}>
						<Group justify='space-between'>
							<Text style={{ color: '#d0a0ff' }}>Nøjagtighed:</Text>
							<Text fw={700} style={{ color: '#ffffff' }}>
								{Math.round(calculateAccuracy(dataPoints.length, correctAnswers))}%
							</Text>
						</Group>

						<Group justify='space-between'>
							<Text style={{ color: '#d0a0ff' }}>Behandlede Billeder:</Text>
							<Text style={{ color: '#ffffff' }}>{dataPoints.length}</Text>
						</Group>

						<Group justify='space-between'>
							<Text style={{ color: '#d0a0ff' }}>Korrekte Klassifikationer:</Text>
							<Text style={{ color: '#ffffff' }}>{correctAnswers}</Text>
						</Group>

						<Group justify='space-between'>
							<Text style={{ color: '#d0a0ff' }}>Gennemsnitlig Tid Per Billede:</Text>
							<Text style={{ color: '#ffffff' }}>{(timeElapsed / 1000 / dataPoints.length).toFixed(1)}s</Text>
						</Group>
					</Stack>

					<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
						<Loader size='sm' color='#a000ff' type='bars' />
					</Box>
				</Box>
			</Modal>

			{}
			<Drawer opened={showHelp} onClose={() => setShowHelp(false)} position='right' title='Neural Network Training Guide' padding='lg' size='md'>
				<ScrollArea h={500}>
					<Text style={{ whiteSpace: 'pre-wrap' }}>{getHelpText(nnConfig.categories || [])}</Text>

					<Box mt='xl'>
						<Text fw={700} mb='md'>
							Category Examples:
						</Text>
						<Stack gap='md'>
							{nnConfig.categories?.map((category) => (
								<Group key={category} gap='md'>
									<img src={getCategoryPlaceholderImage(category, 60)} alt={category} style={{ borderRadius: theme.radius.md }} />
									<Box>
										<Text fw={500}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
										<Text size='sm' c='dimmed'>
											{category === 'animal' && 'Living creatures (dogs, cats, birds, etc.)'}
											{category === 'person' && 'Human individuals or groups of people'}
											{category === 'vehicle' && 'Transportation devices (cars, planes, etc.)'}
											{category === 'building' && 'Structures (houses, offices, etc.)'}
											{category === 'nature' && 'Natural elements (mountains, forests, etc.)'}
											{category === 'tech' && 'Electronic devices or technology items'}
										</Text>
									</Box>
								</Group>
							))}
						</Stack>
					</Box>
				</ScrollArea>
			</Drawer>

			{debug && (
				<Box mt='xs' p='xs' bg='rgba(0,0,0,0.2)' style={{ borderRadius: 4 }}>
					<Text size='xs' c='dimmed'>
						Debug Info - Current: {currentDataPoint.category} ({currentDataPoint.features.map((f) => f.toFixed(1)).join(', ')})
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default NeuralNetworkTraining;
