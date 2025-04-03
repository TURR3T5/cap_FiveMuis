export type CategoryType = 'animal' | 'person' | 'vehicle' | 'building' | 'nature' | 'tech';

export interface DataPoint {
  id: string;
  image: string; // URL or path to image (will use placeholders for FiveM)
  category: CategoryType;
  features: number[]; // Features represented as a vector
  difficulty: number; // 0-1, where 1 is most difficult to classify
}

export interface TrainingResult {
  accuracy: number; // 0-100
  speed: number; // Decisions per second
  mistakes: number;
}

export interface NeuralNetworkConfig {
  categories?: CategoryType[];
  dataPointCount?: number;
  timePerDecision?: number; // milliseconds
  difficultyMultiplier?: number; // 0.5-2.0
  showHelp?: boolean;
}