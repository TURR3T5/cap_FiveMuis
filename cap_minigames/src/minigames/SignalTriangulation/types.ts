export interface SignalReceiver {
    id: string;
    position: { x: number; y: number };
    frequency: number;
    range: number;
    color: string;
  }
  
  export interface TargetSignal {
    position: { x: number; y: number };
    frequencies: number[];
  }
  
  export interface SignalTriangulationConfig {
    receiverCount?: number; 
    minFrequency?: number;
    maxFrequency?: number;
    sensitivity?: number;
    targetPrecision?: number;
    showGuides?: boolean;
  }