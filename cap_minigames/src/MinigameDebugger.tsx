import React, { useState, useEffect } from 'react';
import { Box, Paper, Title, Group, Button, NumberInput, Stack, Switch, Accordion, Text, JsonInput, Badge, ActionIcon } from '@mantine/core';
import { SimpleCombobox } from './components/SimpleCombobox';
import { Bug, Play, Settings, RefreshCw, X } from 'lucide-react';
import { useContext } from 'react';
import { MinigameContext } from './core/MinigameProvider';
import { minigames } from './minigames/registry';
import { MinigameConfig } from './core/types';

interface DebugLogEntry {
	id: string;
	time: Date;
	type: 'start' | 'result' | 'error';
	data: any;
}

export const MinigameDebugger: React.FC = () => {
	const { debugMode, setDebugMode, startGame, activeGame } = useContext(MinigameContext);
	const [selectedGame, setSelectedGame] = useState<string>('');
	const [difficulty, setDifficulty] = useState<string>('medium');
	const [timeLimit, setTimeLimit] = useState<number | undefined>(30000);
	const [maxAttempts, setMaxAttempts] = useState<number | undefined>(3);
	const [customOptions, setCustomOptions] = useState<string>('{}');
	const [logs, setLogs] = useState<DebugLogEntry[]>([]);
	const [expanded, setExpanded] = useState(true);

	// Initialize selected game when component mounts
	useEffect(() => {
		if (Object.keys(minigames).length > 0 && !selectedGame) {
			setSelectedGame(Object.keys(minigames)[0]);
		}
	}, [selectedGame]);

	// Function to start a game in debug mode
	const handleStartGame = () => {
		if (!selectedGame) {
			addLog({
				id: `error-${Date.now()}`,
				time: new Date(),
				type: 'error',
				data: { error: 'No game selected' },
			});
			return;
		}

		try {
			const config: MinigameConfig = {
				id: `debug-${selectedGame}-${Date.now()}`,
				name: selectedGame,
				difficulty: difficulty as 'easy' | 'medium' | 'hard',
				timeLimit,
				maxAttempts,
				customOptions: JSON.parse(customOptions),
			};

			// Add to debug log
			addLog({
				id: config.id,
				time: new Date(),
				type: 'start',
				data: config,
			});

			// Start the game
			startGame(selectedGame, config);
		} catch (error) {
			addLog({
				id: `error-${Date.now()}`,
				time: new Date(),
				type: 'error',
				data: { error: (error as Error).message },
			});
		}
	};

	// Function to add a log entry
	const addLog = (entry: DebugLogEntry) => {
		setLogs((prev) => [entry, ...prev].slice(0, 50)); // Keep last 50 logs
	};

	// Clear logs
	const clearLogs = () => {
		setLogs([]);
	};

	if (!debugMode) {
		return (
			<Box style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
				<Button leftSection={<Bug size={16} />} onClick={() => setDebugMode(true)} variant='subtle'>
					Debug
				</Button>
			</Box>
		);
	}

	// Create minigame options for dropdown
	const minigameOptions = Object.keys(minigames).map((id) => ({
		value: id,
		label: id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1'),
	}));

	return (
		<Box style={{ position: 'fixed', bottom: 0, right: 0, width: 400, zIndex: 1000 }}>
			<Paper p='md' radius='md' withBorder shadow='md'>
				<Stack gap='sm'>
					<Group justify='space-between'>
						<Title order={4}>Minigame Debugger</Title>
						<Group gap='xs'>
							<Switch checked={debugMode} onChange={(e) => setDebugMode(e.currentTarget.checked)} label='Debug Mode' size='xs' />
							<ActionIcon size='sm' variant='subtle' onClick={() => setExpanded(!expanded)}>
								{expanded ? <X size={14} /> : <Bug size={14} />}
							</ActionIcon>
						</Group>
					</Group>

					{expanded && (
						<>
							<Accordion defaultValue='config' variant='contained'>
								<Accordion.Item value='config'>
									<Accordion.Control icon={<Settings size={16} />}>Configuration</Accordion.Control>
									<Accordion.Panel>
										<Stack gap='xs'>
											<SimpleCombobox label='Minigame' placeholder='Select a minigame' data={minigameOptions} value={selectedGame} onChange={(val) => val && setSelectedGame(val)} />

											<SimpleCombobox
												label='Difficulty'
												data={[
													{ value: 'easy', label: 'Easy' },
													{ value: 'medium', label: 'Medium' },
													{ value: 'hard', label: 'Hard' },
												]}
												value={difficulty}
												onChange={(val) => val && setDifficulty(val || 'medium')}
											/>

											<NumberInput label='Time Limit (ms)' value={timeLimit} onChange={(val) => setTimeLimit(val ? Number(val) : undefined)} min={0} step={1000} />

											<NumberInput label='Max Attempts' value={maxAttempts} onChange={(val) => setMaxAttempts(val ? Number(val) : undefined)} min={0} step={1} />

											<JsonInput label='Custom Options (JSON)' value={customOptions} onChange={setCustomOptions} minRows={3} formatOnBlur validationError='Invalid JSON' />
										</Stack>
									</Accordion.Panel>
								</Accordion.Item>

								<Accordion.Item value='logs'>
									<Accordion.Control>
										<Group justify='space-between' style={{ width: '100%' }}>
											<span>Debug Logs</span>
											<ActionIcon
												size='xs'
												variant='subtle'
												onClick={(e) => {
													e.stopPropagation();
													clearLogs();
												}}
											>
												<RefreshCw size={14} />
											</ActionIcon>
										</Group>
									</Accordion.Control>
									<Accordion.Panel>
										<Stack gap='xs' style={{ maxHeight: 200, overflowY: 'auto' }}>
											{logs.length === 0 ? (
												<Text size='sm' c='dimmed' ta='center'>
													No logs yet
												</Text>
											) : (
												logs.map((log, index) => (
													<Box key={index} p='xs' style={{ borderBottom: '1px solid #eee' }}>
														<Group justify='space-between'>
															<Badge color={log.type === 'start' ? 'blue' : log.type === 'result' ? 'green' : 'red'}>{log.type}</Badge>
															<Text size='xs' c='dimmed'>
																{log.time.toLocaleTimeString()}
															</Text>
														</Group>
														<Text size='xs' style={{ whiteSpace: 'pre-wrap' }}>
															{JSON.stringify(log.data, null, 2)}
														</Text>
													</Box>
												))
											)}
										</Stack>
									</Accordion.Panel>
								</Accordion.Item>
							</Accordion>

							<Group gap='xs'>
								<Button leftSection={<Play size={16} />} onClick={handleStartGame} disabled={!selectedGame || activeGame !== null} fullWidth>
									Start {selectedGame ? selectedGame.charAt(0).toUpperCase() + selectedGame.slice(1).replace(/([A-Z])/g, ' $1') : 'Minigame'}
								</Button>

								{activeGame && (
									<Button
										leftSection={<X size={16} />}
										variant='light'
										color='red'
										onClick={() => {
											// We don't need to call cancelGame() here as it's handled by the X button in the minigame itself
										}}
										fullWidth
									>
										Active: {activeGame.charAt(0).toUpperCase() + activeGame.slice(1).replace(/([A-Z])/g, ' $1')}
									</Button>
								)}
							</Group>

							<Text size='xs' c='dimmed' ta='center'>
								FiveM Minigame Library Debugger
							</Text>
						</>
					)}
				</Stack>
			</Paper>
		</Box>
	);
};
