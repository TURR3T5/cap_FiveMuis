import { calculateDifficulty, shuffleArray, generateRandomString } from '../../core/utils';
import { MemoryFragment, MemorySequencingConfig } from './types';

const fragmentContentTemplates = [
  "SYSTEM: Initializing memory access protocol...",
  "KERNEL: Loading core subsystems...",
  "USER: Authentication successful, accessing restricted data...",
  "NETWORK: Downloading encrypted data package...",
  "DATABASE: Retrieving archived records...",
  "SECURITY: Bypassing firewall protection...",
  "ENCRYPTION: Decoding protected sequence...",
  "TRANSFER: Moving sensitive information...",
  "METADATA: Processing file structure information...",
  "BACKUP: Recovering deleted sequence...",
];

export const generateMemoryFragments = (
  count: number,
  patternLength: number,
  corruptionRate: number
): MemoryFragment[] => {
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
    '#9b59b6', '#1abc9c', '#d35400', '#c0392b'
  ];
  
  const baseTimestamp = Date.now() - 1000 * 60 * 30;
  const fragments: MemoryFragment[] = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = baseTimestamp + (i * 1000 * 60);
    const dataPattern = generateRandomString(patternLength, '0123456789ABCDEF');
    const corruptionLevel = Math.min(1, Math.max(0, (Math.random() * corruptionRate * 1.5)));
    const contentTemplate = fragmentContentTemplates[i % fragmentContentTemplates.length];
    
    fragments.push({
      id: `fragment-${i}`,
      index: i,
      timestamp,
      dataPattern,
      corruptionLevel,
      content: contentTemplate,
      color: colors[i % colors.length]
    });
  }
  
  return shuffleArray(fragments);
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('da-DK', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  });
};

export const evaluateSequenceAccuracy = (
  userSequence: MemoryFragment[],
  correctOrder: number[]
): number => {
  let correctPositions = 0;
  
  for (let i = 0; i < userSequence.length; i++) {
    if (userSequence[i].index === correctOrder[i]) {
      correctPositions++;
    }
  }
  
  return (correctPositions / userSequence.length) * 100;
};

export const applyCorruption = (
  text: string, 
  corruptionLevel: number
): string => {
  if (corruptionLevel === 0) return text;
  
  const chars = text.split('');
  const corruptionCount = Math.floor(chars.length * corruptionLevel * 0.5);
  
  for (let i = 0; i < corruptionCount; i++) {
    const pos = Math.floor(Math.random() * chars.length);
    
    if (Math.random() < 0.5) {
      chars[pos] = '█';
    } else {
      const options = ['#', '?', '!', '*', '@', '$', '%', '&', '=', '+'];
      chars[pos] = options[Math.floor(Math.random() * options.length)];
    }
  }
  
  return chars.join('');
};

export const generateMemorySequencingConfig = (
  difficulty: 'easy' | 'medium' | 'hard',
  customConfig?: MemorySequencingConfig
): MemorySequencingConfig => {
  const fragmentCount = customConfig?.fragmentCount || 
    calculateDifficulty(4, difficulty);
  
  const corruptionRate = customConfig?.corruptionRate || 
    (difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.4 : 0.6);
  
  const patternLength = customConfig?.patternLength || 
    (difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8);
  
  const showTimestamps = customConfig?.showTimestamps !== undefined ? 
    customConfig.showTimestamps : difficulty === 'easy';
  
  const allowHints = customConfig?.allowHints !== undefined ? 
    customConfig.allowHints : difficulty === 'easy';
  
  return {
    fragmentCount,
    corruptionRate,
    patternLength,
    showTimestamps,
    allowHints
  };
};