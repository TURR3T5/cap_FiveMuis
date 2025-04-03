import { SignalReceiver, TargetSignal, SignalTriangulationConfig } from './types';

export const generateReceivers = (
  count: number,
  minFreq: number,
  maxFreq: number
): SignalReceiver[] => {
  const receivers: SignalReceiver[] = [];
  const colors = ['#FF5555', '#55FF55', '#5555FF', '#FFAA55', '#FF55FF', '#55FFFF'];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const distanceFromCenter = 40;
    
    receivers.push({
      id: `receiver-${i}`,
      position: {
        x: 50 + Math.cos(angle) * distanceFromCenter,
        y: 50 + Math.sin(angle) * distanceFromCenter
      },
      frequency: minFreq + Math.floor(Math.random() * (maxFreq - minFreq)),
      range: 30 + Math.random() * 20,
      color: colors[i % colors.length]
    });
  }
  
  return receivers;
};

export const generateTargetSignal = (
  receivers: SignalReceiver[],
  minFreq: number,
  maxFreq: number
): TargetSignal => {
  const x = 20 + Math.random() * 60;
  const y = 20 + Math.random() * 60;
  
  const frequencies = receivers.map(receiver => {
    const distanceToTarget = Math.sqrt(
      Math.pow(receiver.position.x - x, 2) + 
      Math.pow(receiver.position.y - y, 2)
    );
    
    const baseFreq = receiver.frequency;
    const frequencyOffset = Math.floor(distanceToTarget / 2);
    
    return Math.max(minFreq, Math.min(maxFreq, baseFreq - frequencyOffset));
  });
  
  return {
    position: { x, y },
    frequencies
  };
};

export const calculateSignalStrength = (
  receiverPosition: { x: number; y: number },
  targetPosition: { x: number; y: number },
  receiverFrequency: number,
  targetFrequency: number,
  range: number,
  sensitivity: number = 1.0
): number => {
  const distance = Math.sqrt(
    Math.pow(receiverPosition.x - targetPosition.x, 2) + 
    Math.pow(receiverPosition.y - targetPosition.y, 2)
  );
  
  if (distance > range) return 0;
  
  const frequencyDifference = Math.abs(receiverFrequency - targetFrequency);
  const frequencyFactor = Math.max(0, 1 - frequencyDifference / 15);
  
  const distanceFactor = Math.max(0, 1 - distance / range);
  
  return Math.pow(frequencyFactor * distanceFactor, sensitivity);
};

export const calculateIntersectionAccuracy = (
  userPosition: { x: number; y: number },
  targetPosition: { x: number; y: number }
): number => {
  const distance = Math.sqrt(
    Math.pow(userPosition.x - targetPosition.x, 2) + 
    Math.pow(userPosition.y - targetPosition.y, 2)
  );
  
  const maxDistance = Math.sqrt(2 * 100 * 100);
  return Math.max(0, 100 - (distance / maxDistance) * 100);
};

export const generateSignalTriangulationConfig = (
  difficulty: 'easy' | 'medium' | 'hard',
  customConfig?: SignalTriangulationConfig
): SignalTriangulationConfig => {
  const receiverCount = customConfig?.receiverCount || 
    (difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5);
  
  const minFrequency = customConfig?.minFrequency || 60;
  const maxFrequency = customConfig?.maxFrequency || 160;
  
  const sensitivity = customConfig?.sensitivity || 
    (difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1.2 : 1.6);
  
  const targetPrecision = customConfig?.targetPrecision ||
    (difficulty === 'easy' ? 85 : difficulty === 'medium' ? 90 : 95);
  
  const showGuides = customConfig?.showGuides !== undefined ? 
    customConfig.showGuides : difficulty === 'easy';
  
  return {
    receiverCount,
    minFrequency,
    maxFrequency,
    sensitivity,
    targetPrecision,
    showGuides
  };
};