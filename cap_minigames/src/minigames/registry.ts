import { MinigameRegistry } from '../core/types';
import TerminalHacking from './TerminalHacking';
import QuantumDecryption from './QuantumDecryption';
import NeuralNetworkTraining from './NeuralNetworkTraining';
import SignalTriangulation from './SignalTriangulation';
import MemoryFragmentSequencing from './MemoryFragmentSequencing';
import BiometricOverride from './BiometricOverride';

export const minigames: MinigameRegistry = {
  terminalHacking: TerminalHacking,
  quantumDecryption: QuantumDecryption,
  neuralNetworkTraining: NeuralNetworkTraining,
  signalTriangulation: SignalTriangulation,
  memoryFragmentSequencing: MemoryFragmentSequencing,
  biometricOverride: BiometricOverride,
};