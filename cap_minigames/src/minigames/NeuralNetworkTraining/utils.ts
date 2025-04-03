// src/minigames/NeuralNetworkTraining/utils.ts
import { calculateDifficulty } from '../../core/utils';
import { CategoryType, DataPoint, NeuralNetworkConfig } from './types';
import { shuffleArray } from '../../core/utils';

// Define sample images for each category (placeholders)
const categoryImageSets: Record<CategoryType, string[]> = {
  animal: [
    'animal-dog', 'animal-cat', 'animal-horse', 'animal-bird', 
    'animal-fish', 'animal-rabbit', 'animal-lion', 'animal-tiger'
  ],
  person: [
    'person-man', 'person-woman', 'person-child', 'person-group', 
    'person-runner', 'person-worker', 'person-doctor', 'person-artist'
  ],
  vehicle: [
    'vehicle-car', 'vehicle-truck', 'vehicle-bike', 'vehicle-bus', 
    'vehicle-train', 'vehicle-boat', 'vehicle-plane', 'vehicle-helicopter'
  ],
  building: [
    'building-house', 'building-apartment', 'building-skyscraper', 'building-store', 
    'building-factory', 'building-office', 'building-church', 'building-school'
  ],
  nature: [
    'nature-mountain', 'nature-forest', 'nature-river', 'nature-beach', 
    'nature-field', 'nature-flower', 'nature-sky', 'nature-sunset'
  ],
  tech: [
    'tech-computer', 'tech-phone', 'tech-tv', 'tech-camera', 
    'tech-robot', 'tech-drone', 'tech-gadget', 'tech-circuit'
  ]
};

// Feature vector descriptions for reference (not used in game)
const featureDescriptions: string[] = [
  'Size (small to large)',
  'Movement (stationary to fast)',
  'Color Vibrancy (muted to vibrant)',
  'Shape Complexity (simple to complex)',
  'Texture (smooth to rough)',
  'Symmetry (asymmetric to symmetric)',
  'Natural vs. Artificial'
];

// Generate random feature vector (7 dimensions)
const generateFeatureVector = (category: CategoryType, difficulty: number): number[] => {
  // Base feature vectors for different categories
  const baseFeatures: Record<CategoryType, number[]> = {
    animal: [0.7, 0.8, 0.6, 0.7, 0.8, 0.7, 0.9],
    person: [0.6, 0.7, 0.5, 0.9, 0.3, 0.8, 0.1],
    vehicle: [0.8, 0.6, 0.7, 0.5, 0.2, 0.7, 0.1],
    building: [0.9, 0.1, 0.5, 0.8, 0.6, 0.8, 0.0],
    nature: [0.7, 0.3, 0.9, 0.7, 0.8, 0.5, 1.0],
    tech: [0.4, 0.1, 0.5, 0.9, 0.2, 0.9, 0.0]
  };
  
  // Get base feature vector for the category
  const base = baseFeatures[category];
  
  // Add randomization based on difficulty
  // Higher difficulty = more ambiguous features
  return base.map(value => {
    // Calculate deviation range based on difficulty
    const deviation = difficulty * 0.5;
    // Add random deviation to the base value
    let newValue = value + (Math.random() * 2 - 1) * deviation;
    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, newValue));
  });
};

// Generate data points for the game
export const generateDataPoints = (
  count: number,
  categories: CategoryType[],
  difficultyMultiplier: number = 1.0
): DataPoint[] => {
  const dataPoints: DataPoint[] = [];
  
  // Ensure even distribution across categories
  const pointsPerCategory = Math.ceil(count / categories.length);
  
  categories.forEach(category => {
    const categoryImages = [...categoryImageSets[category]];
    
    for (let i = 0; i < pointsPerCategory && dataPoints.length < count; i++) {
      // Get random image from the category
      const imageIndex = i % categoryImages.length;
      
      // Calculate base difficulty (increases towards the end)
      const baseDifficulty = (i / pointsPerCategory) * 0.5 + 0.2;
      
      // Apply difficulty multiplier (capped at 0-1)
      const finalDifficulty = Math.min(1, Math.max(0, baseDifficulty * difficultyMultiplier));
      
      dataPoints.push({
        id: `${category}-${i}`,
        image: categoryImages[imageIndex],
        category,
        features: generateFeatureVector(category, finalDifficulty),
        difficulty: finalDifficulty
      });
    }
  });
  
  // Shuffle and return the requested count
  return shuffleArray(dataPoints).slice(0, count);
};

// Get images for each category
export const getCategoryPlaceholderImage = (category: CategoryType, size: number = 64): string => {
  const colors: Record<CategoryType, string> = {
    animal: '#8BC34A', // Light Green
    person: '#FF9800', // Orange
    vehicle: '#2196F3', // Blue
    building: '#9C27B0', // Purple
    nature: '#4CAF50', // Green
    tech: '#F44336'    // Red
  };
  
  const icons: Record<CategoryType, string> = {
    animal: '🐾',
    person: '👤',
    vehicle: '🚗',
    building: '🏢',
    nature: '🌲',
    tech: '💻'
  };
  
  return `/api/placeholder/${size}/${size}?text=${icons[category]}&bg=${colors[category].replace('#', '')}`;
};

// Calculate accuracy based on correct answers
export const calculateAccuracy = (
  total: number,
  correct: number
): number => {
  if (total === 0) return 0;
  return (correct / total) * 100;
};

// Get help text for neural network training
export const getHelpText = (categories: CategoryType[]): string => {
  let text = 'Neural Network Training Guide:\n\n';
  
  text += 'Your task is to train the AI by correctly categorizing images.\n';
  text += 'Each image belongs to one of the following categories:\n\n';
  
  categories.forEach(category => {
    text += `- ${category.charAt(0).toUpperCase() + category.slice(1)}: `;
    
    switch(category) {
      case 'animal':
        text += 'Living creatures like dogs, cats, birds, etc.\n';
        break;
      case 'person':
        text += 'Human individuals or groups of people.\n';
        break;
      case 'vehicle':
        text += 'Transportation devices like cars, bikes, planes, etc.\n';
        break;
      case 'building':
        text += 'Structures like houses, offices, factories, etc.\n';
        break;
      case 'nature':
        text += 'Natural elements like mountains, forests, rivers, etc.\n';
        break;
      case 'tech':
        text += 'Electronic devices or technology items.\n';
        break;
    }
  });
  
  text += '\nClick on the correct category button for each image as quickly as possible.\n';
  text += 'Both speed and accuracy are important for successful training.\n';
  
  return text;
};

// Generate configuration for Neural Network Training
export const generateNeuralNetworkConfig = (
  difficulty: 'easy' | 'medium' | 'hard',
  customConfig?: NeuralNetworkConfig
): NeuralNetworkConfig => {
  // Default categories
  const allCategories: CategoryType[] = ['animal', 'person', 'vehicle', 'building', 'nature', 'tech'];
  
  // Determine how many categories to use based on difficulty
  const categoryCounts = {
    easy: 3,
    medium: 4,
    hard: 6
  };
  
  // Calculate points based on difficulty
  const dataPointCount = calculateDifficulty(15, difficulty);
  
  // Time per decision in ms
  const timePerDecision = {
    easy: 5000,
    medium: 4000,
    hard: 3000
  };
  
  // Difficulty multiplier
  const difficultyMultiplier = {
    easy: 0.7,
    medium: 1.0,
    hard: 1.3
  };
  
  // Generate the config
  const config: NeuralNetworkConfig = {
    categories: customConfig?.categories || 
      shuffleArray([...allCategories]).slice(0, categoryCounts[difficulty]),
    dataPointCount: customConfig?.dataPointCount || dataPointCount,
    timePerDecision: customConfig?.timePerDecision || timePerDecision[difficulty],
    difficultyMultiplier: customConfig?.difficultyMultiplier || difficultyMultiplier[difficulty],
    showHelp: customConfig?.showHelp !== undefined ? customConfig.showHelp : difficulty === 'easy'
  };
  
  return config;
};