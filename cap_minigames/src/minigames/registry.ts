import { MinigameRegistry } from '../core/types';
import TerminalHacking from './TerminalHacking';
import SignalTriangulation from './SignalTriangulation';
import MemoryFragmentSequencing from './MemoryFragmentSequencing';
import BlockchainVerification from './BlockchainVerification';

export const minigames: MinigameRegistry = {
  terminalHacking: TerminalHacking,
  signalTriangulation: SignalTriangulation,
  memoryFragmentSequencing: MemoryFragmentSequencing,
  blockchainVerification: BlockchainVerification,
};