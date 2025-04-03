import { calculateDifficulty, generateRandomString } from '../../core/utils';
import { Block, BlockTransaction, BlockchainVerificationConfig } from './types';

const generateSHA256Hash = (_input: string): string => {
  let hash = '';
  const chars = 'abcdef0123456789';
  
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return hash;
};

export const generateTransactions = (
  count: number
): BlockTransaction[] => {
  const transactions: BlockTransaction[] = [];
  const users = [
    '0xA1B2...F3E4', '0xB2C3...E4F5', '0xC3D4...F5A6', 
    '0xD4E5...A6B7', '0xE5F6...B7C8', '0xF6A7...C8D9'
  ];
  
  for (let i = 0; i < count; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    let recipient = users[Math.floor(Math.random() * users.length)];
    
    while (recipient === sender) {
      recipient = users[Math.floor(Math.random() * users.length)];
    }
    
    const amount = Math.floor(Math.random() * 100) + 1;
    const timestamp = Date.now() - Math.floor(Math.random() * 86400000);
    
    transactions.push({
      id: `tx-${generateRandomString(8, '0123456789abcdef')}`,
      sender,
      recipient,
      amount,
      timestamp,
      signature: generateRandomString(16, '0123456789abcdef'),
      valid: true
    });
  }
  
  return transactions;
};

export const generateBlock = (
  index: number,
  previousHash: string,
  transactions: BlockTransaction[]
): Block => {
  const timestamp = Date.now() - (index * 600000);
  const nonce = Math.floor(Math.random() * 10000);
  
  const blockData = JSON.stringify({
    index,
    timestamp,
    transactions: transactions.map(tx => tx.id),
    previousHash,
    nonce
  });
  
  const hash = generateSHA256Hash(blockData);
  
  return {
    id: `block-${index}`,
    index,
    timestamp,
    previousHash,
    hash,
    transactions,
    nonce,
    verified: false
  };
};

export const generateBlockchain = (
  blockCount: number,
  transactionsPerBlock: number,
  corruptionRate: number
): Block[] => {
  const blocks: Block[] = [];
  let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  
  for (let i = 0; i < blockCount; i++) {
    const transactions = generateTransactions(transactionsPerBlock);
    
    const block = generateBlock(i, previousHash, transactions);
    blocks.push(block);
    
    previousHash = block.hash;
  }
  
  if (corruptionRate > 0) {
    applyCorruption(blocks, corruptionRate);
  }
  
  return blocks;
};

export const applyCorruption = (
  blocks: Block[],
  corruptionRate: number
): void => {
  const blockCorruptionCount = Math.floor(blocks.length * corruptionRate);
  const corruptedBlockIndices = new Set<number>();
  
  while (corruptedBlockIndices.size < blockCorruptionCount) {
    const index = Math.floor(Math.random() * blocks.length);
    corruptedBlockIndices.add(index);
  }
  
  corruptedBlockIndices.forEach(blockIndex => {
    const block = blocks[blockIndex];
    const corruptionType = Math.floor(Math.random() * 3);
    
    switch (corruptionType) {
      case 0: 
        block.hash = generateSHA256Hash('corrupted');
        break;
      case 1: 
        if (blockIndex > 0) {
          block.previousHash = generateSHA256Hash('corrupted');
        }
        break;
      case 2: 
        const txIndex = Math.floor(Math.random() * block.transactions.length);
        block.transactions[txIndex].amount += 100;
        block.transactions[txIndex].valid = false;
        break;
    }
  });
};

export const validateBlock = (
  block: Block, 
  previousBlock?: Block
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check hash format
  if (!/^[0-9a-f]{64}$/i.test(block.hash)) {
    issues.push('Hash format is invalid');
  }
  
  // Check previous hash matches
  if (previousBlock && block.previousHash !== previousBlock.hash) {
    issues.push('Previous hash does not match the hash of the previous block');
  }
  
  // Check transactions
  const invalidTransactions = block.transactions.filter(tx => tx.valid === false);
  if (invalidTransactions.length > 0) {
    issues.push(`Contains ${invalidTransactions.length} invalid transaction(s)`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

export const calculateVerificationProgress = (blocks: Block[]): number => {
  if (blocks.length === 0) return 0;
  
  const verifiedCount = blocks.filter(block => block.verified).length;
  return (verifiedCount / blocks.length) * 100;
};

export const generateBlockchainVerificationConfig = (
  difficulty: 'easy' | 'medium' | 'hard',
  customConfig?: BlockchainVerificationConfig
): BlockchainVerificationConfig => {
  const blockCount = customConfig?.blockCount || 
    calculateDifficulty(5, difficulty);
  
  const transactionsPerBlock = customConfig?.transactionsPerBlock || 
    calculateDifficulty(3, difficulty);
  
  const corruptionRate = customConfig?.corruptionRate || 
    (difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.4 : 0.6);
  
  const requiredVerificationRate = customConfig?.requiredVerificationRate || 
    (difficulty === 'easy' ? 90 : difficulty === 'medium' ? 95 : 100);
  
  const showHints = customConfig?.showHints !== undefined ? 
    customConfig.showHints : difficulty === 'easy';
  
  const autoVerify = customConfig?.autoVerify !== undefined ? 
    customConfig.autoVerify : difficulty === 'easy';
  
  return {
    blockCount,
    transactionsPerBlock,
    corruptionRate,
    requiredVerificationRate,
    showHints,
    autoVerify
  };
};