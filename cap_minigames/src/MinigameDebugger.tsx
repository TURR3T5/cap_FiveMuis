import React, { useState } from 'react';
import { Box, Paper, Title, Group, Button, Select, NumberInput, Stack, Switch, Accordion, Text, JsonInput, Badge } from '@mantine/core';
import { Bug, Play, Settings } from 'lucide-react';
import { MinigameConfig, MinigameResult } from './core/types';
import { useContext } from 'react';
import { MinigameContext } from './core/MinigameProvider';
import { minigames } from './minigames/registry';

interface DebugLogEntry {
	id: string;
	time: Date;
	type: 'start' | 'result' | 'error';
	data: any;
}

export const MinigameDebugger: React.FC = () => {
	const { debugMode, setDebugMode, startGame } = useContext(MinigameContext);
	const [selectedGame, setSelectedGame] = useState<string | null>(Object.keys(minigames)[0] || null);
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
	const [timeLimit, setTimeLimit] = useState<number | undefined>(30000);
	const [maxAttempts, setMaxAttempts] = useState<number | undefined>(3);
	const [customOptions, setCustomOptions] = useState<string>('{}');
	const [logs, setLogs] = useState<DebugLogEntry[]>([]);

	// Function to start a game in debug mode
	const handleStartGame = () => {
		if (!selectedGame) return;

		try {
			const config: MinigameConfig = {
				id: `debug-${selectedGame}-${Date.now()}`,
				name: selectedGame,
				difficulty,
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

	// Log game results
	const handleGameResult = (result: MinigameResult) => {
		addLog({
			id: `result-${Date.now()}`,
			time: new Date(),
			type: 'result',
			data: result,
		});
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

	return (
		<Box style={{ position: 'fixed', bottom: 0, right: 0, width: 400, zIndex: 1000 }}>
			<Paper p='md' radius='md' withBorder shadow='md'>
				<Stack gap='sm'>
					<Group justify='space-between'>
						<Title order={4}>Minigame Debugger</Title>
						<Switch checked={debugMode} onChange={(e) => setDebugMode(e.currentTarget.checked)} label='Debug Mode' />
					</Group>

					<Accordion defaultValue='config'>
						<Accordion.Item value='config'>
							<Accordion.Control icon={<Settings size={16} />}>Configuration</Accordion.Control>
							<Accordion.Panel>
								<Stack gap='xs'>
									<Select label='Minigame' data={Object.keys(minigames).map((id) => ({ value: id, label: id }))} value={selectedGame} onChange={setSelectedGame} required />

									<Select
										label='Difficulty'
										data={[
											{ value: 'easy', label: 'Easy' },
											{ value: 'medium', label: 'Medium' },
											{ value: 'hard', label: 'Hard' },
										]}
										value={difficulty}
										onChange={(val) => setDifficulty(val as 'easy' | 'medium' | 'hard')}
									/>

									<NumberInput label='Time Limit (ms)' value={timeLimit} onChange={(val) => setTimeLimit(Number(val) || undefined)} min={0} step={1000} />

									<NumberInput label='Max Attempts' value={maxAttempts} onChange={(val) => setMaxAttempts(Number(val) || undefined)} min={0} />

									<JsonInput label='Custom Options (JSON)' value={customOptions} onChange={setCustomOptions} minRows={3} formatOnBlur validationError='Invalid JSON' />
								</Stack>
							</Accordion.Panel>
						</Accordion.Item>

						<Accordion.Item value='logs'>
							<Accordion.Control>Debug Logs</Accordion.Control>
							<Accordion.Panel>
								<Stack gap='xs' style={{ maxHeight: 200, overflowY: 'auto' }}>
									{logs.length === 0 ? (
										<Text size='sm' c='dimmed'>
											No logs yet
										</Text>
									) : (
										logs.map((log, index) => (
											<Box key={index} p='xs' style={{ borderBottom: '1px solid #eee' }}>
												<Group justify='space-between'>
													<Badge color={log.type === 'start' ? 'blue' : log.type === 'result' ? 'green' : 'red'}>{log.type}</Badge>
													<Text size='xs' color='dimmed'>
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

					<Button leftSection={<Play size={16} />} onClick={handleStartGame} disabled={!selectedGame} fullWidth>
						Start Minigame
					</Button>
				</Stack>
			</Paper>
		</Box>
	);
};
