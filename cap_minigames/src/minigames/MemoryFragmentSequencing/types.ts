export interface MemoryFragment {
    id: string;
    index: number;  
    timestamp: number;
    dataPattern: string;
    corruptionLevel: number; 
    content: string;
    color: string;
}

export interface MemorySequencingConfig {
  fragmentCount?: number;
  corruptionRate?: number;
  patternLength?: number;
  showTimestamps?: boolean;
  allowHints?: boolean;
}