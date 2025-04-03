import { MinigameRegistry } from '../core/types';
import TerminalHacking from './TerminalHacking';
import QuantumDecryption from './QuantumDecryption';
import SignalTriangulation from './SignalTriangulation';
import MemoryFragmentSequencing from './MemoryFragmentSequencing';
import BiometricOverride from './BiometricOverride';
import BlockchainVerification from './BlockchainVerification';

export const minigames: MinigameRegistry = {
  terminalHacking: TerminalHacking,
  quantumDecryption: QuantumDecryption,
  signalTriangulation: SignalTriangulation,
  memoryFragmentSequencing: MemoryFragmentSequencing,
  biometricOverride: BiometricOverride,
  blockchainVerification: BlockchainVerification,
};