import React, { useState, useEffect, useCallback } from 'react';
import Terminal from 'react-terminal-ui';
import { Box, Progress, Text, Group, Button } from '@mantine/core';
import { Clock, X, Terminal as TerminalIcon, AlertTriangle } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { generateCommandSet, generateCodePattern, generateTerminalOutput } from './utils';
import { TerminalHackingConfig } from './types';

const TerminalHacking: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('terminalHacking');
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [targetCommand, setTargetCommand] = useState('');
	const [commandSet, setCommandSet] = useState<string[]>([]);
	const [codePattern, setCodePattern] = useState('');
	const [terminalText, setTerminalText] = useState('');
	const [attempts, setAttempts] = useState(0);
	const [maxAttempts] = useState(config?.maxAttempts || 3);

	const customConfig = config?.customOptions as TerminalHackingConfig;

	const initializeGame = useCallback(() => {
		if (!config) return;

		const commands = customConfig?.possibleCommands || generateCommandSet(config.difficulty);

		const targetCmd = customConfig?.requiredCommands?.[0] || commands[Math.floor(Math.random() * commands.length)];

		const pattern = generateCodePattern(config.difficulty, customConfig?.codeLength);

		setCommandSet(commands);
		setTargetCommand(targetCmd);
		setCodePattern(pattern);
		setTerminalText(generateTerminalOutput(commands, targetCmd));
		setCommandHistory([]);
		setAttempts(0);

		// Add debug information if in debug mode
		if (debug) {
			console.log('Terminal Hacking initialized with:', {
				commands,
				targetCommand: targetCmd,
				codePattern: pattern,
			});
		}
	}, [config, customConfig, debug]);

	useEffect(() => {
		if (isActive) {
			initializeGame();
		}
	}, [isActive, initializeGame]);

	const handleInput = (input: string) => {
		const normalizedInput = input.trim().toLowerCase();
		setCommandHistory((prev) => [...prev, `> ${input}`]);

		if (normalizedInput === 'help') {
			setCommandHistory((prev) => [...prev, 'Available commands: clear, exit, help, [any command from list]']);
			return;
		}

		if (normalizedInput === 'clear') {
			setCommandHistory([]);
			return;
		}

		if (normalizedInput === 'exit') {
			cancelGame();
			onCancel?.();
			return;
		}

		// Debug commands only available in debug mode
		if (debug && normalizedInput === 'debug') {
			setCommandHistory((prev) => [...prev, `[DEBUG] Target command: ${targetCommand}`, `[DEBUG] Code pattern: ${codePattern}`]);
			return;
		}

		if (normalizedInput === targetCommand.toLowerCase()) {
			setCommandHistory((prev) => [...prev, `ACCESS GRANTED. Security bypassed.`, `System unlocked with code pattern: ${codePattern}`]);
			setTimeout(() => {
				completeGame(true, 100 - attempts * 20);
				onComplete?.({ success: true, attempts, timeTaken: timeElapsed });
			}, 1500);
			return;
		}

		setAttempts((prev) => prev + 1);
		if (attempts + 1 >= maxAttempts) {
			setCommandHistory((prev) => [...prev, `ACCESS DENIED. Too many incorrect attempts.`, `System lockdown initiated.`]);
			setTimeout(() => {
				completeGame(false, 0);
				onComplete?.({ success: false, attempts: attempts + 1, timeTaken: timeElapsed });
			}, 1500);
			return;
		}

		if (commandSet.some((cmd) => cmd.toLowerCase() === normalizedInput)) {
			setCommandHistory((prev) => [...prev, `Command recognized but insufficient permissions. Try another approach.`]);
		} else {
			setCommandHistory((prev) => [...prev, `Command not recognized. Type 'help' for available commands.`]);
		}
	};

	const timeProgress = config?.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;

	useEffect(() => {
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			completeGame(false, 0);
			onComplete?.({ success: false, timeTaken: timeElapsed });
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete]);

	if (!isActive || !config) return null;

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Group justify='space-between' mb='xs'>
				<Group>
					<TerminalIcon size={24} />
					<Text fw={700}>SECURITY TERMINAL</Text>
				</Group>
				<Group>
					{config.timeLimit && (
						<Group gap='xs'>
							<Clock size={16} />
							<Progress value={100 - timeProgress} color={timeProgress > 75 ? 'red' : timeProgress > 50 ? 'yellow' : 'green'} size='sm' w={100} />
						</Group>
					)}
					<Text size='sm'>
						Attempts: {attempts}/{maxAttempts}
					</Text>
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

			<Terminal name='Cyberpunk Terminal' prompt='>' height='400px' onInput={handleInput} />

			{customConfig?.hints && (
				<Group justify='flex-start' mt='xs'>
					<AlertTriangle size={16} />
					<Text size='xs' color='dimmed'>
						Hint: Find the command mentioned in the terminal output
					</Text>
				</Group>
			)}

			{debug && (
				<Box mt='xs' p='xs' bg='rgba(0,0,0,0.2)' style={{ borderRadius: 4 }}>
					<Text size='xs' color='dimmed'>
						Debug Info - Target Command: {targetCommand}
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default TerminalHacking;
