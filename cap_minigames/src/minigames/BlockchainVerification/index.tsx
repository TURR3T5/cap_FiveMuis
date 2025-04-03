import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Group, Text, Progress, Button, useMantineTheme, Stack, Modal, Badge, Accordion, ScrollArea, ActionIcon } from '@mantine/core';
import { Clock, Check, X, AlertTriangle, Lock, Database, FileText, RefreshCw, CheckCircle, XCircle, HelpCircle, Loader, ArrowDown, ArrowUp } from 'lucide-react';
import { MinigameProps } from '../../core/types';
import { useMinigame } from '../../core/useMinigame';
import { Block, BlockchainVerificationConfig } from './types';
import { generateBlockchain, validateBlock, calculateVerificationProgress, generateBlockchainVerificationConfig } from './utils';

const BlockchainVerification: React.FC<MinigameProps> = ({ config, onComplete, onCancel, debug }) => {
	const { isActive, completeGame, cancelGame, timeElapsed } = useMinigame('blockchainVerification');
	const theme = useMantineTheme();

	const customConfig = config?.customOptions as BlockchainVerificationConfig;
	const bcConfig = useMemo(() => generateBlockchainVerificationConfig(config?.difficulty || 'medium', customConfig), [config?.difficulty, customConfig]);

	const [blocks, setBlocks] = useState<Block[]>([]);
	const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
	const [verificationProgress, setVerificationProgress] = useState(0);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showFailure, setShowFailure] = useState(false);
	const [forceRender, setForceRender] = useState(0);

	const selectedBlockData = useMemo(() => blocks.find((b) => b.id === selectedBlock), [blocks, selectedBlock]);

	const initializeGame = useCallback(() => {
		if (!config) return;

		const newBlocks = generateBlockchain(bcConfig.blockCount || 5, bcConfig.transactionsPerBlock || 3, bcConfig.corruptionRate || 0.3);

		setBlocks(newBlocks);
		setSelectedBlock(newBlocks[0]?.id || null);
		setVerificationProgress(0);
		setShowSuccess(false);
		setShowFailure(false);

		if (debug) {
			console.log('Blockchain Verification initialized with:', {
				blocks: newBlocks,
				config: bcConfig,
			});
		}
	}, [config, bcConfig, debug]);

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
		const newProgress = calculateVerificationProgress(blocks);
		setVerificationProgress(newProgress);

		if (newProgress >= (bcConfig.requiredVerificationRate || 100) && blocks.length > 0) {
			setShowSuccess(true);

			setTimeout(() => {
				completeGame(true, newProgress);
				onComplete?.({
					success: true,
					score: newProgress,
					timeTaken: timeElapsed,
				});
			}, 3000);
		}
	}, [blocks, bcConfig.requiredVerificationRate, completeGame, onComplete, timeElapsed]);

	useEffect(() => {
		if (config?.timeLimit && timeElapsed >= config.timeLimit) {
			setShowFailure(true);

			setTimeout(() => {
				completeGame(false, verificationProgress);
				onComplete?.({ success: false, score: verificationProgress, timeTaken: timeElapsed });
			}, 3000);
		}
	}, [timeElapsed, config?.timeLimit, completeGame, onComplete, verificationProgress, forceRender]);

	const handleBlockSelect = (blockId: string) => {
		setSelectedBlock(blockId);
	};

	const handleVerifyBlock = (blockId: string) => {
		const blockIndex = blocks.findIndex((b) => b.id === blockId);
		if (blockIndex === -1) return;

		const block = blocks[blockIndex];
		const previousBlock = blockIndex > 0 ? blocks[blockIndex - 1] : undefined;

		const validation = validateBlock(block, previousBlock);

		setBlocks((prev) =>
			prev.map((b) => {
				if (b.id === blockId) {
					return {
						...b,
						verified: validation.valid,
					};
				}
				return b;
			})
		);

		if (bcConfig.autoVerify && blockIndex < blocks.length - 1) {
			setSelectedBlock(blocks[blockIndex + 1].id);
		}
	};

	const handleVerifyAll = () => {
		setBlocks((prev) =>
			prev.map((block, index) => {
				const previousBlock = index > 0 ? prev[index - 1] : undefined;
				const validation = validateBlock(block, previousBlock);

				return {
					...block,
					verified: validation.valid,
				};
			})
		);
	};

	const formatHexString = (hex: string): string => {
		if (hex.length <= 12) return hex;
		return `${hex.substring(0, 6)}...${hex.substring(hex.length - 6)}`;
	};

	const formatTimestamp = (timestamp: number): string => {
		return new Date(timestamp).toLocaleTimeString();
	};

	const getBlockValidationIssues = (block: Block, index: number): string[] => {
		const previousBlock = index > 0 ? blocks[index - 1] : undefined;
		const validation = validateBlock(block, previousBlock);
		return validation.issues;
	};

	const timeProgress = config?.timeLimit ? (timeElapsed / config.timeLimit) * 100 : 0;

	if (!isActive || !config) return null;

	return (
		<Box style={{ maxWidth: 800, margin: '0 auto' }}>
			<Group justify='space-between' mb='xs'>
				<Group>
					<Database size={20} />
					<Text fw={700}>BLOCKCHAIN VERIFIKATION</Text>
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
							Verificeret:
						</Text>
						<Text size='sm'>{Math.round(verificationProgress)}%</Text>
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
					<Text size='sm'>Verificér blockchain-data ved at inspicere hvert blok og finde korrupte eller ugyldige transaktioner.</Text>

					<Group align='flex-start'>
						<Box style={{ width: '30%' }}>
							<Text size='sm' fw={500} mb='xs'>
								Blokke:
							</Text>
							<ScrollArea h={400} type='auto'>
								<Stack gap='xs'>
									{blocks.map((block, _index) => (
										<Box
											key={block.id}
											style={{
												padding: '10px',
												backgroundColor: selectedBlock === block.id ? theme.colors.dark[5] : theme.colors.dark[7],
												borderRadius: theme.radius.sm,
												borderLeft: `3px solid ${block.verified === true ? theme.colors.green[6] : block.verified === false ? theme.colors.red[6] : theme.colors.gray[7]}`,
												cursor: 'pointer',
											}}
											onClick={() => handleBlockSelect(block.id)}
										>
											<Group justify='space-between'>
												<Box>
													<Group gap={5}>
														<Lock size={14} />
														<Text size='sm' fw={500}>
															Blok #{block.index}
														</Text>
													</Group>
													<Text size='xs' c='dimmed'>
														{formatHexString(block.hash)}
													</Text>
												</Box>

												{block.verified === true ? (
													<CheckCircle size={16} color={theme.colors.green[6]} />
												) : block.verified === false ? (
													<XCircle size={16} color={theme.colors.red[6]} />
												) : (
													<Button
														size='xs'
														variant='subtle'
														onClick={(e) => {
															e.stopPropagation();
															handleVerifyBlock(block.id);
														}}
													>
														Verificér
													</Button>
												)}
											</Group>
										</Box>
									))}
								</Stack>
							</ScrollArea>
						</Box>

						<Box style={{ flex: 1 }}>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									Blokdetaljer:
								</Text>
								{selectedBlockData && (
									<Group gap={5}>
										<Text size='xs'>Tid: {formatTimestamp(selectedBlockData.timestamp)}</Text>
										<Text size='xs'>Nonce: {selectedBlockData.nonce}</Text>
									</Group>
								)}
							</Group>

							{selectedBlockData ? (
								<ScrollArea h={400} type='auto'>
									<Box p='xs'>
										<Group mb='md'>
											<Badge color={selectedBlockData.verified === true ? 'green' : selectedBlockData.verified === false ? 'red' : 'gray'}>{selectedBlockData.verified === true ? 'Verificeret' : selectedBlockData.verified === false ? 'Ugyldig' : 'Ikke verificeret'}</Badge>
										</Group>

										<Box mb='md'>
											<Text size='xs' fw={600}>
												Blok Hash:
											</Text>
											<Text size='xs' style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
												{selectedBlockData.hash}
											</Text>
										</Box>

										<Box mb='md'>
											<Text size='xs' fw={600}>
												Forrige Hash:
											</Text>
											<Text size='xs' style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
												{selectedBlockData.previousHash}
											</Text>
										</Box>

										<Box mb='md'>
											<Group justify='space-between'>
												<Text size='xs' fw={600}>
													Transaktioner:
												</Text>
												<Badge size='sm'>{selectedBlockData.transactions.length}</Badge>
											</Group>

											<Accordion variant='contained' mt='xs'>
												{selectedBlockData.transactions.map((tx) => (
													<Accordion.Item key={tx.id} value={tx.id}>
														<Accordion.Control icon={<FileText size={16} />}>
															<Group>
																<Text size='xs'>Tx: {formatHexString(tx.id)}</Text>
																{tx.valid === false && <AlertTriangle size={14} color={theme.colors.yellow[6]} />}
															</Group>
														</Accordion.Control>
														<Accordion.Panel>
															<Stack gap='xs'>
																<Group justify='space-between'>
																	<Text size='xs'>Fra:</Text>
																	<Text size='xs' ff='monospace'>
																		{tx.sender}
																	</Text>
																</Group>
																<Group justify='space-between'>
																	<Text size='xs'>Til:</Text>
																	<Text size='xs' ff='monospace'>
																		{tx.recipient}
																	</Text>
																</Group>
																<Group justify='space-between'>
																	<Text size='xs'>Beløb:</Text>
																	<Text size='xs' fw={500}>
																		{tx.amount} ETH
																	</Text>
																</Group>
																<Group justify='space-between'>
																	<Text size='xs'>Signatur:</Text>
																	<Text size='xs' ff='monospace'>
																		{formatHexString(tx.signature)}
																	</Text>
																</Group>
																<Group justify='space-between'>
																	<Text size='xs'>Tidsstempel:</Text>
																	<Text size='xs'>{formatTimestamp(tx.timestamp)}</Text>
																</Group>
															</Stack>
														</Accordion.Panel>
													</Accordion.Item>
												))}
											</Accordion>
										</Box>

										{(bcConfig.showHints || selectedBlockData.verified === false) && (
											<Box p='xs' style={{ backgroundColor: theme.colors.dark[8], borderRadius: theme.radius.sm, marginTop: '10px' }}>
												<Group justify='space-between' mb='xs'>
													<Text size='xs' fw={500}>
														Verifikationsresultat:
													</Text>
													{selectedBlockData.verified === true ? <Badge color='green'>Gyldig</Badge> : selectedBlockData.verified === false ? <Badge color='red'>Ugyldig</Badge> : <Badge color='gray'>Ukendt</Badge>}
												</Group>

												{selectedBlockData.verified === false && (
													<Stack gap='xs'>
														<Text size='xs' fw={600} c='red'>
															Fundne problemer:
														</Text>
														{getBlockValidationIssues(
															selectedBlockData,
															blocks.findIndex((b) => b.id === selectedBlockData.id)
														).map((issue, i) => (
															<Text key={i} size='xs' c='red'>
																• {issue}
															</Text>
														))}
													</Stack>
												)}
											</Box>
										)}
									</Box>
								</ScrollArea>
							) : (
								<Box style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<Text c='dimmed'>Vælg en blok for at se detaljer</Text>
								</Box>
							)}

							<Group justify='space-between' mt='md'>
								{selectedBlockData && (
									<Group gap='xs'>
										<ActionIcon
											variant='subtle'
											disabled={blocks.findIndex((b) => b.id === selectedBlockData.id) === 0}
											onClick={() => {
												const currentIndex = blocks.findIndex((b) => b.id === selectedBlockData.id);
												if (currentIndex > 0) {
													setSelectedBlock(blocks[currentIndex - 1].id);
												}
											}}
										>
											<ArrowUp size={16} />
										</ActionIcon>
										<ActionIcon
											variant='subtle'
											disabled={blocks.findIndex((b) => b.id === selectedBlockData.id) === blocks.length - 1}
											onClick={() => {
												const currentIndex = blocks.findIndex((b) => b.id === selectedBlockData.id);
												if (currentIndex < blocks.length - 1) {
													setSelectedBlock(blocks[currentIndex + 1].id);
												}
											}}
										>
											<ArrowDown size={16} />
										</ActionIcon>
									</Group>
								)}

								<Group>
									{selectedBlockData && !selectedBlockData.verified && (
										<Button leftSection={<Check size={16} />} onClick={() => handleVerifyBlock(selectedBlockData.id)}>
											Verificér Blok
										</Button>
									)}
									<Button leftSection={<RefreshCw size={16} />} variant='light' onClick={handleVerifyAll}>
										Verificér Alle
									</Button>
								</Group>
							</Group>
						</Box>
					</Group>

					<Group justify='space-between'>
						<Group>
							{bcConfig.showHints && (
								<Button variant='subtle' leftSection={<HelpCircle size={16} />} onClick={() => {}}>
									Vis hjælp
								</Button>
							)}
						</Group>

						<Group>
							<Text size='sm'>Verificeringsfremskridt:</Text>
							<Progress value={verificationProgress} size='md' w={150} color={verificationProgress > 80 ? 'green' : verificationProgress > 40 ? 'yellow' : 'red'} />
							<Text size='sm' fw={700}>
								{Math.round(verificationProgress)}%
							</Text>
						</Group>
					</Group>
				</Stack>
			</Paper>

			<Modal opened={showSuccess} onClose={() => {}} withCloseButton={false} centered padding='xl' size='md' radius='md'>
				<Box p='md' style={{ textAlign: 'center', background: 'linear-gradient(135deg, #002030 0%, #004060 100%)', border: '1px solid #00c0ff', borderRadius: theme.radius.md }}>
					<Box mb={20} style={{ position: 'relative' }}>
						<Database size={60} color='#00c0ff' strokeWidth={1.5} />
						<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #00c0ff', opacity: 0.5, animation: 'pulse 2s infinite' }} />
					</Box>
					<Text size='xl' fw={700} mb='md' style={{ color: '#00c0ff' }}>
						BLOCKCHAIN VERIFICERET
					</Text>
					<Text mb='lg' style={{ color: '#a0d0ff' }}>
						Blockchain-data verificeret med succes. Alle gyldige blokke er bekræftet.
					</Text>
					<Text c='#80c0ff'>Verificeringsrate: {Math.round(verificationProgress)}%</Text>
					<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
						<Loader size='sm' color='#00c0ff' type='bars' />
					</Box>
				</Box>
			</Modal>

			<Modal opened={showFailure} onClose={() => {}} withCloseButton={false} centered padding='xl' size='md' radius='md'>
				<Box p='md' style={{ textAlign: 'center', background: 'linear-gradient(135deg, #200030 0%, #400060 100%)', border: '1px solid #8000ff', borderRadius: theme.radius.md }}>
					<Box mb={20} style={{ position: 'relative' }}>
						<Database size={60} color='#8000ff' strokeWidth={1.5} />
						<Box style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', boxShadow: '0 0 15px #8000ff', opacity: 0.3, animation: 'flicker 1s infinite' }} />
					</Box>
					<Text size='xl' fw={700} mb='md' style={{ color: '#8000ff' }}>
						VERIFIKATION FEJLEDE
					</Text>
					<Text mb='lg' style={{ color: '#d0a0ff' }}>
						Kunne ikke fuldføre blockchain-verifikationen inden for tidsgrænsen.
					</Text>
					<Text c='dimmed'>Opnået verificeringsrate: {Math.round(verificationProgress)}%</Text>
					<Box mt={20} style={{ display: 'flex', justifyContent: 'center' }}>
						<Loader size='sm' color='#8000ff' type='dots' />
					</Box>
				</Box>
			</Modal>

			{debug && (
				<Box mt='xs' p='xs' bg='rgba(0,0,0,0.2)' style={{ borderRadius: 4 }}>
					<Text size='xs' c='dimmed'>
						Debug Info - Verified Blocks: {blocks.filter((b) => b.verified === true).length}/{blocks.length}, Required Rate: {bcConfig.requiredVerificationRate}%
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default BlockchainVerification;
