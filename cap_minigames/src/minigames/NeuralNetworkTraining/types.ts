export type CategoryType = 'animal' | 'person' | 'vehicle' | 'building' | 'nature' | 'tech';

export interface DataPoint {
  id: string;
  image: string; 
  category: CategoryType;
  features: number[]; 
  difficulty: number; 
}

export interface TrainingResult {
  accuracy: number; 
  speed: number; 
  mistakes: number;
}

export interface NeuralNetworkConfig {
  categories?: CategoryType[];
  dataPointCount?: number;
  timePerDecision?: number; 
  difficultyMultiplier?: number; 
  showHelp?: boolean;
}