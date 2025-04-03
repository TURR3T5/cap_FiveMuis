import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Progress, Text, Group, Paper, ScrollArea, TextInput, Modal } from '@mantine/core';
import { Clock, X, Check, Terminal as TerminalIcon, AlertTriangle, Loader } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { generateCommandSet, generateCodePattern, generateTerminalOutput } from './utils';
import { TerminalHackingConfig } from './types';

const TerminalHacking: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('terminalHacking');
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [targetCommand, setTargetCommand] = useState('');
	const [commandSet, setCommandSet] = useState<string[]>([]);
	const [codePattern, setCodePattern] = useState('');
	const [terminalText, setTerminalText] = useState('');
	const [attempts, setAttempts] = useState(0);
	const [maxAttempts] = useState(config?.maxAttempts || 3);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showFailure, setShowFailure] = useState(false);
	const [forceRender, setForceRender] = useState(0);

	const terminalRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

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
		setInputValue('');
		setShowSuccess(false);
		setShowFailure(false);

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

			// Set up interval to force re-renders for timer updates
			const interval = setInterval(() => {
				setForceRender((prev) => prev + 1);
			}, 100); // Update every 100ms

			return () => clearInterval(interval);
		}
	}, [isActive, initializeGame]);

	useEffect(() => {
		// Scroll to bottom when command history changes
		if (terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}

		// Focus input
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [commandHistory]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const handleInputSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!inputValue.trim()) return;

		const normalizedInput = inputValue.trim().toLowerCase();
		setCommandHistory((prev) => [...prev, `C:\\hack> ${inputValue}`]);
		setInputValue('');

		if (normalizedInput === 'help') {
			setCommandHistory((prev) => [
				...prev,
				`HELP MENU:
  - Type any command from the command list to attempt to exploit the system
  - Use 'cmdlist' to see available commands
  - Use 'clear' to clear the terminal
  - Use 'exit' to abort the hacking attempt
  - Use 'scan' to analyze system vulnerabilities again
  - Look for hints in the system scan results`,
			]);
			return;
		}

		if (normalizedInput === 'cmdlist') {
			setCommandHistory((prev) => [...prev, `Available commands:\n${commandSet.join('\n')}`]);
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

		if (normalizedInput === 'scan') {
			setCommandHistory((prev) => [...prev, terminalText.split('\n\nC:\\hack> cmdlist')[0].split('C:\\hack> scan --target system --verbose\n\n')[1]]);
			return;
		}

		// Debug commands only available in debug mode
		if (debug && normalizedInput === 'debug') {
			setCommandHistory((prev) => [...prev, `[DEBUG] Target command: ${targetCommand}`, `[DEBUG] Code pattern: ${codePattern}`]);
			return;
		}

		if (normalizedInput === targetCommand.toLowerCase()) {
			setCommandHistory((prev) => [...prev, `ACCESS GRANTED. Security bypassed.`, `System unlocked with code pattern: ${codePattern}`]);
			setShowSuccess(true);

			// Delay completion to show success screen
			setTimeout(() => {
				completeGame(true, 100 - attempts * 20);
				onComplete?.({ success: true, attempts, timeTaken: timeElapsed });
			}, 3000);
			return;
		}

		setAttempts((prev) => prev + 1);
		if (attempts + 1 >= maxAttempts) {
			setCommandHistory((prev) => [...prev, `ACCESS DENIED. Too many incorrect attempts.`, `System lockdown initiated.`]);
			setShowFailure(true);

			// Delay completion to show failure screen
			setTimeout(() => {
				completeGame(false, 0);
				onComplete?.({ success: false, attempts: attempts + 1, timeTaken: timeElapsed });
			}, 3000);
			return;
		}

		if (commandSet.some((cmd) => cmd.toLowerCase() === normalizedInput)) {
			setCommandHistory((prev) => [...prev, `Command recognized but insufficient permissions. Try another approach.`, `Hint: Look for the specific command mentioned in the scan results.`]);
		} else {
			setCommandHistory((prev) => [...prev, `Command not recognized. Type 'help' for available commands or 'cmdlist' to see the command list.`]);
		}
	};

	const timeProgress = config?.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;

	useEffect(() => {
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			setShowFailure(true);
			setCommandHistory((prev) => [...prev, `TIME EXPIRED. Security lockdown initiated.`]);

			// Delay completion to show failure screen
			setTimeout(() => {
				completeGame(false, 0);
				onComplete?.({ success: false, timeTaken: timeElapsed });
			}, 3000);
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete, forceRender]);

	if (!isActive || !config) return null;

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Paper
				p='xs'
				radius='sm'
				style={(theme) => ({
					backgroundColor: theme.colors.dark[9],
					border: '1px solid #444',
					boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
				})}
			>
				<Group justify='space-between' mb='xs' pl={5} pr={5}>
					<Group gap='xs'>
						<TerminalIcon size={16} />
						<Text size='sm' fw={500}>
							CMD.EXE
						</Text>
					</Group>
					<Group gap='xs'>
						<X
							size={14}
							onClick={() => {
								cancelGame();
								onCancel?.();
							}}
							style={{ cursor: 'pointer' }}
						/>
					</Group>
				</Group>

				<Paper
					p='xs'
					style={() => ({
						backgroundColor: '#0c0c0c',
						color: '#cccccc',
						fontFamily: 'Consolas, monospace',
						fontSize: '14px',
						height: 400,
						display: 'flex',
						flexDirection: 'column',
					})}
				>
					<ScrollArea h={360} type='auto' viewportRef={terminalRef} style={{ flex: 1 }}>
						<Box p={5} style={{ whiteSpace: 'pre-wrap' }}>
							{terminalText}
							{commandHistory.map((cmd, index) => (
								<div key={index}>{cmd}</div>
							))}
						</Box>
					</ScrollArea>

					<Box mt='auto'>
						<form onSubmit={handleInputSubmit}>
							<Group gap={0} align='center'>
								<Text mr={5} fw={700} size='sm'>
									C:\hack&gt;
								</Text>
								<TextInput
									value={inputValue}
									onChange={handleInputChange}
									variant='unstyled'
									ref={inputRef}
									style={{
										flex: 1,
										'& input': {
											color: '#ffffff',
											fontFamily: 'Consolas, monospace',
											fontSize: '14px',
											padding: 0,
											margin: 0,
											height: 'auto',
										},
									}}
									disabled={showSuccess || showFailure}
									autoFocus
								/>
							</Group>
						</form>
					</Box>
				</Paper>

				<Group justify='space-between' mt='xs'>
					<Group gap='xs'>
						{customConfig?.hints && (
							<Group gap={5}>
								<AlertTriangle size={14} />
								<Text size='xs' color='dimmed'>
									Hint: Find the command mentioned in scan results
								</Text>
							</Group>
						)}
					</Group>
					<Group gap='md'>
						<Group gap={5}>
							<Text size='xs'>Attempts:</Text>
							<Text size='xs' fw={700}>
								{attempts}/{maxAttempts}
							</Text>
						</Group>
						{config.timeLimit && (
							<Group gap={5}>
								<Clock size={14} />
								<Progress value={100 - timeProgress} color={timeProgress > 75 ? 'red' : timeProgress > 50 ? 'yellow' : 'green'} size='xs' w={80} />
								<Text size='xs'>{Math.max(0, Math.ceil((config.timeLimit - timeElapsed) / 1000))}s</Text>
							</Group>
						)}
					</Group>
				</Group>
			</Paper>

			{/* Success Modal */}
			<Modal opened={showSuccess} onClose={() => {}} withCloseButton={false} centered padding='xl' size='md' radius='md'>
				<Box p='md' style={{ textAlign: 'center' }}>
					<Check size={60} color='green' stroke='md' style={{ marginBottom: 20 }} />
					<Text size='xl' fw={700} mb='md'>
						ACCESS GRANTED
					</Text>
					<Text mb='lg'>System successfully breached. Security protocols bypassed.</Text>
					<Text color='dimmed'>Code pattern: {codePattern}</Text>
					<Loader size='sm' style={{ marginTop: 20 }} />
				</Box>
			</Modal>

			{/* Failure Modal */}
			<Modal opened={showFailure} onClose={() => {}} withCloseButton={false} centered padding='xl' size='md' radius='md'>
				<Box p='md' style={{ textAlign: 'center' }}>
					<X size={60} color='red' stroke='md' style={{ marginBottom: 20 }} />
					<Text size='xl' fw={700} mb='md'>
						ACCESS DENIED
					</Text>
					<Text mb='lg'>{attempts >= maxAttempts ? 'Too many failed attempts. System locked down.' : 'Time expired. Security protocols engaged.'}</Text>
					<Text color='dimmed'>The correct command was: {targetCommand}</Text>
					<Loader size='sm' style={{ marginTop: 20 }} />
				</Box>
			</Modal>

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
