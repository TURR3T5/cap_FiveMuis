import { calculateDifficulty, shuffleArray } from '../../core/utils';
import { QuantumParticle, QuantumParticleType, QuantumPattern } from './types';

export const generateQuantumParticles = (
  count: number,
  gridSize: number,
  types: QuantumParticleType[] = ['alpha', 'beta', 'gamma', 'delta']
): QuantumParticle[] => {
  const particles: QuantumParticle[] = [];
  const states = ['entangled', 'superposition', 'collapsed'] as const;
  
  // Create a grid of possible positions
  const positions: Array<{ x: number; y: number }> = [];
  const cellSize = 100 / (gridSize + 1);
  
  for (let x = 1; x <= gridSize; x++) {
    for (let y = 1; y <= gridSize; y++) {
      positions.push({ 
        x: x * cellSize, 
        y: y * cellSize 
      });
    }
  }
  
  // Shuffle positions
  const shuffledPositions = shuffleArray(positions);
  
  // Generate particles
  for (let i = 0; i < Math.min(count, shuffledPositions.length); i++) {
    particles.push({
      id: `particle-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      state: states[Math.floor(Math.random() * states.length)],
      position: shuffledPositions[i],
      rotation: Math.floor(Math.random() * 360)
    });
  }
  
  return particles;
};

export const generateTargetPattern = (
  particles: QuantumParticle[],
  connectionCount: number
): QuantumPattern => {
  const connections: [string, string][] = [];
  const particleIds = particles.map(p => p.id);
  
  // Ensure we don't try to make more connections than possible
  const maxConnections = Math.min(
    connectionCount,
    Math.floor(particleIds.length * (particleIds.length - 1) / 2)
  );
  
  // Generate random connections
  while (connections.length < maxConnections) {
    const idx1 = Math.floor(Math.random() * particleIds.length);
    let idx2 = Math.floor(Math.random() * particleIds.length);
    
    // Ensure we don't connect a particle to itself
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * particleIds.length);
    }
    
    const connection: [string, string] = [particleIds[idx1], particleIds[idx2]].sort() as [string, string];
    
    // Check if this connection already exists
    const exists = connections.some(
      ([a, b]) => a === connection[0] && b === connection[1]
    );
    
    if (!exists) {
      connections.push(connection);
    }
  }
  
  return {
    particles,
    connections
  };
};

export const calculatePatternSimilarity = (
  userPattern: QuantumPattern,
  targetPattern: QuantumPattern
): number => {
  const targetConnections = targetPattern.connections;
  const userConnections = userPattern.connections;
  
  // Count correct connections
  const correctConnections = userConnections.filter(([a, b]) => 
    targetConnections.some(([c, d]) => 
      (a === c && b === d) || (a === d && b === c)
    )
  ).length;
  
  // Calculate similarity percentage
  return targetConnections.length > 0
    ? (correctConnections / targetConnections.length) * 100
    : 0;
};