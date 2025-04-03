// src/minigames/registry.ts
import { MinigameRegistry } from '../core/types';
import TerminalHacking from './TerminalHacking';
import QuantumDecryption from './QuantumDecryption';
import NeuralNetworkTraining from './NeuralNetworkTraining';
// Import other minigames as they are implemented

/**
 * Registry of all available minigames.
 * Each minigame must be registered here to be accessible in the library.
 */
export const minigames: MinigameRegistry = {
  terminalHacking: TerminalHacking,
  quantumDecryption: QuantumDecryption,
  neuralNetworkTraining: NeuralNetworkTraining,
  // Add other minigames here as they're implemented
};

/**
 * Helper function to get minigame names in a more readable format
 */
export const getReadableMinigameName = (gameId: string): string => {
  return gameId
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Registry info for client-side display
 */
export const minigameInfo = {
  terminalHacking: {
    name: "Terminal Hacking",
    description: "Hack into a system by finding the correct command hidden in terminal output",
    icon: "terminal"
  },
  quantumDecryption: {
    name: "Quantum Decryption",
    description: "Connect quantum particles to match the correct encryption pattern",
    icon: "atoms"
  },
  neuralNetworkTraining: {
    name: "Neural Network Training",
    description: "Train an AI by categorizing images into their correct categories",
    icon: "brain"
  }
};