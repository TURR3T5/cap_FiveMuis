import { calculateDifficulty } from '../../core/utils';
import { CategoryType, DataPoint, NeuralNetworkConfig } from './types';
import { shuffleArray } from '../../core/utils';

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

const featureDescriptions: string[] = [
  'Size (small to large)',
  'Movement (stationary to fast)',
  'Color Vibrancy (muted to vibrant)',
  'Shape Complexity (simple to complex)',
  'Texture (smooth to rough)',
  'Symmetry (asymmetric to symmetric)',
  'Natural vs. Artificial'
];

const generateFeatureVector = (category: CategoryType, difficulty: number): number[] => {

  const baseFeatures: Record<CategoryType, number[]> = {
    animal: [0.7, 0.8, 0.6, 0.7, 0.8, 0.7, 0.9],
    person: [0.6, 0.7, 0.5, 0.9, 0.3, 0.8, 0.1],
    vehicle: [0.8, 0.6, 0.7, 0.5, 0.2, 0.7, 0.1],
    building: [0.9, 0.1, 0.5, 0.8, 0.6, 0.8, 0.0],
    nature: [0.7, 0.3, 0.9, 0.7, 0.8, 0.5, 1.0],
    tech: [0.4, 0.1, 0.5, 0.9, 0.2, 0.9, 0.0]
  };

  const base = baseFeatures[category];

  return base.map(value => {

    const deviation = difficulty * 0.5;

    let newValue = value + (Math.random() * 2 - 1) * deviation;

    return Math.max(0, Math.min(1, newValue));
  });
};

export const generateDataPoints = (
  count: number,
  categories: CategoryType[],
  difficultyMultiplier: number = 1.0
): DataPoint[] => {
  const dataPoints: DataPoint[] = [];

  const pointsPerCategory = Math.ceil(count / categories.length);

  categories.forEach(category => {
    const categoryImages = [...categoryImageSets[category]];

    for (let i = 0; i < pointsPerCategory && dataPoints.length < count; i++) {

      const imageIndex = i % categoryImages.length;

      const baseDifficulty = (i / pointsPerCategory) * 0.5 + 0.2;

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

  return shuffleArray(dataPoints).slice(0, count);
};

export const getCategoryPlaceholderImage = (category: CategoryType, size: number = 64): string => {
  const colors: Record<CategoryType, string> = {
    animal: '#8BC34A', 
    person: '#FF9800', 
    vehicle: '#2196F3', 
    building: '#9C27B0', 
    nature: '#4CAF50', 
    tech: '#F44336'    
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

export const calculateAccuracy = (
  total: number,
  correct: number
): number => {
  if (total === 0) return 0;
  return (correct / total) * 100;
};

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

export const generateNeuralNetworkConfig = (
  difficulty: 'easy' | 'medium' | 'hard',
  customConfig?: NeuralNetworkConfig
): NeuralNetworkConfig => {

  const allCategories: CategoryType[] = ['animal', 'person', 'vehicle', 'building', 'nature', 'tech'];

  const categoryCounts = {
    easy: 3,
    medium: 4,
    hard: 6
  };

  const dataPointCount = calculateDifficulty(15, difficulty);

  const timePerDecision = {
    easy: 5000,
    medium: 4000,
    hard: 3000
  };

  const difficultyMultiplier = {
    easy: 0.7,
    medium: 1.0,
    hard: 1.3
  };

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