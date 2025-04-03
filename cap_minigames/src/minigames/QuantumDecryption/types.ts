export type QuantumParticleType = 'alpha' | 'beta' | 'gamma' | 'delta';
export type QuantumParticleState = 'entangled' | 'superposition' | 'collapsed';

export interface QuantumParticle {
  id: string;
  type: QuantumParticleType;
  state: QuantumParticleState;
  position: { x: number; y: number };
  rotation: number;
}

export interface QuantumPattern {
  particles: QuantumParticle[];
  connections: [string, string][];
}

export interface QuantumDecryptionConfig {
  gridSize?: number;
  particleCount?: number;
  requiredConnections?: number;
  particleTypes?: QuantumParticleType[];
  showHints?: boolean;
}