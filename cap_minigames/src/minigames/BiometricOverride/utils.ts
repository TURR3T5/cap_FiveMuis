import { BiometricPattern, BiometricType, BiometricOverrideConfig } from './types';

export const generateGridPoints = (gridSize: number): string[] => {
  const points: string[] = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      points.push(`${x},${y}`);
    }
  }
  return points;
};

export const generateBiometricPattern = (
  type: BiometricType,
  gridSize: number,
  complexity: number
): BiometricPattern => {
  const nodes = generateGridPoints(gridSize);
  const patternColors = {
    fingerprint: '#e74c3c',
    retina: '#3498db',
    facial: '#2ecc71',
    palm: '#f39c12',
    voice: '#9b59b6'
  };

  const path = generatePatternPath(nodes, type, complexity, gridSize);

  return {
    id: `${type}-${Date.now()}`,
    type,
    path,
    nodes,
    minPatternLength: Math.max(3, Math.floor(gridSize * complexity * 0.5)),
    complexity,
    color: patternColors[type]
  };
};

export const generatePatternPath = (
  _nodes: string[],
  type: BiometricType,
  complexity: number,
  gridSize: number
): string[] => {
  const patternPath: string[] = [];
  const centerPoint = `${Math.floor(gridSize/2)},${Math.floor(gridSize/2)}`;

  patternPath.push(centerPoint);

  const patternLength = Math.floor(gridSize * complexity * 1.5) + 3;

  switch(type) {
    case 'fingerprint':

        generateFingerprintPattern(patternPath, gridSize, patternLength);
      break;
    case 'retina':

      generateCircularPattern(patternPath, gridSize, patternLength);
      break;
    case 'facial':

      generateSymmetricalPattern(patternPath, gridSize, patternLength);
      break;
    case 'palm':

      generateLinearPattern(patternPath, gridSize, patternLength);
      break;
    case 'voice':

      generateWavePattern(patternPath, gridSize, patternLength);
      break;
  }

  return removeDuplicatePoints(patternPath);
};

const generateFingerprintPattern = (
    patternPath: string[],
    gridSize: number,
    length: number
  ) => {

    const startPoint = patternPath[0];
    patternPath.length = 0;
    patternPath.push(startPoint);

    const [startX, startY] = getCurrentPosition(startPoint);

    const pattern = [
      [startX, startY],         
      [startX+1, startY],       
      [startX+2, startY],       
      [startX+3, startY+1],     
      [startX+3, startY+2],     
      [startX+2, startY+3],     
      [startX+1, startY+3],     
      [startX, startY+3],       
      [startX-1, startY+3],     
      [startX-2, startY+2],     
      [startX-2, startY+1],     
      [startX-2, startY],       
      [startX-1, startY-1],     
      [startX, startY-1],       
      [startX+1, startY-2],     
      [startX+1, startY-3],     
      [startX, startY-3],       
      [startX-1, startY-2],     
      [startX-2, startY-1],     
      [startX-3, startY],       
      [startX-3, startY+1]      
    ];

    for (const [x, y] of pattern) {
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        patternPath.push(`${x},${y}`);
      }
    }

    if (patternPath.length < length) {
      let angle = 0;
      let radius = 1;

      while (patternPath.length < length) {
        angle += 0.6;
        radius += 0.1;

        const x = Math.floor(startX + radius * Math.cos(angle));
        const y = Math.floor(startY + radius * Math.sin(angle));

        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          const point = `${x},${y}`;
          if (!patternPath.includes(point)) {
            patternPath.push(point);
          }
        }

        if (angle > Math.PI * 8) break;
      }
    }
};

const generateCircularPattern = (
  patternPath: string[],
  gridSize: number,
  length: number
) => {
  let [centerX, centerY] = getCurrentPosition(patternPath[0]);
  let radius = 1;

  while (patternPath.length < length) {

    for (let angle = 0; angle < 360; angle += 45) {
      if (patternPath.length >= length) break;

      const radian = angle * Math.PI / 180;
      const x = Math.round(centerX + radius * Math.cos(radian));
      const y = Math.round(centerY + radius * Math.sin(radian));

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        patternPath.push(`${x},${y}`);
      }
    }

    radius++;
    if (radius > gridSize) break;
  }
};

const generateSymmetricalPattern = (
  patternPath: string[],
  gridSize: number,
  length: number
) => {
  let [centerX, centerY] = getCurrentPosition(patternPath[0]);

  while (patternPath.length < length) {

    const offsetX = Math.floor(Math.random() * 3) - 1;
    const offsetY = Math.floor(Math.random() * 3) - 1;

    const x1 = centerX + offsetX;
    const y1 = centerY + offsetY;

    const x2 = centerX - offsetX;
    const y2 = centerY - offsetY;

    if (x1 >= 0 && x1 < gridSize && y1 >= 0 && y1 < gridSize) {
      patternPath.push(`${x1},${y1}`);
    }

    if (patternPath.length < length && x2 >= 0 && x2 < gridSize && y2 >= 0 && y2 < gridSize) {
      patternPath.push(`${x2},${y2}`);
    }

    if (Math.random() < 0.3) {
      centerX = Math.max(1, Math.min(centerX + Math.floor(Math.random() * 3) - 1, gridSize - 2));
      centerY = Math.max(1, Math.min(centerY + Math.floor(Math.random() * 3) - 1, gridSize - 2));
    }
  }
};

const generateLinearPattern = (
  patternPath: string[],
  gridSize: number,
  length: number
) => {
  let [x, y] = getCurrentPosition(patternPath[patternPath.length - 1]);

  const direction = Math.floor(Math.random() * 4);
  const mainDirections = [[0, 1], [1, 0], [0, -1], [-1, 0]]; 
  let [dx, dy] = mainDirections[direction];

  while (patternPath.length < length) {
    x += dx;
    y += dy;

    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      [dx, dy] = [dy, -dx]; 
      x = Math.max(0, Math.min(x, gridSize - 1));
      y = Math.max(0, Math.min(y, gridSize - 1));
    }

    patternPath.push(`${x},${y}`);

    if (Math.random() < 0.2 && patternPath.length < length - 3) {
      addBranch(patternPath, x, y, gridSize, Math.min(3, length - patternPath.length));
    }
  }
};

const addBranch = (
  patternPath: string[],
  startX: number,
  startY: number,
  gridSize: number,
  branchLength: number
) => {
  let x = startX;
  let y = startY;
  const direction = Math.floor(Math.random() * 4);
  const branchDirections = [[0, 1], [1, 0], [0, -1], [-1, 0]]; 
  let [dx, dy] = branchDirections[direction];

  for (let i = 0; i < branchLength; i++) {
    x += dx;
    y += dy;

    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) break;

    patternPath.push(`${x},${y}`);
  }
};

const generateWavePattern = (
  patternPath: string[],
  gridSize: number,
  length: number
) => {
  let [x, y] = getCurrentPosition(patternPath[patternPath.length - 1]);
  const isHorizontal = Math.random() < 0.5;
  let amplitude = 1 + Math.floor(Math.random() * Math.min(3, gridSize / 2));

  if (isHorizontal) {

    for (let i = 1; patternPath.length < length; i++) {
      x = Math.min(gridSize - 1, x + 1);
      y = centerY + Math.round(amplitude * Math.sin(i * Math.PI / 4));

      y = Math.max(0, Math.min(y, gridSize - 1));

      patternPath.push(`${x},${y}`);

      if (x >= gridSize - 1) {
        x = 0;
        amplitude = Math.max(1, Math.min(amplitude + (Math.random() < 0.5 ? 1 : -1), gridSize / 2));
      }
    }
  } else {

    for (let i = 1; patternPath.length < length; i++) {
      y = Math.min(gridSize - 1, y + 1);
      x = centerX + Math.round(amplitude * Math.sin(i * Math.PI / 4));

      x = Math.max(0, Math.min(x, gridSize - 1));

      patternPath.push(`${x},${y}`);

      if (y >= gridSize - 1) {
        y = 0;
        amplitude = Math.max(1, Math.min(amplitude + (Math.random() < 0.5 ? 1 : -1), gridSize / 2));
      }
    }
  }
};

const getCurrentPosition = (point: string): [number, number] => {
  const [x, y] = point.split(',').map(Number);
  return [x, y];
};

const centerX = 4;
const centerY = 4;

const removeDuplicatePoints = (points: string[]): string[] => {
  return [...new Set(points)];
};

export const calculatePatternSimilarity = (
  userPattern: string[],
  targetPattern: string[]
): number => {
  if (userPattern.length === 0) return 0;

  const targetPoints = targetPattern.map(p => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });

  const userPoints = userPattern.map(p => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });

  let matchedPoints = 0;

  for (const targetPoint of targetPoints) {
    const pointMatched = userPoints.some(up => 
      up.x === targetPoint.x && up.y === targetPoint.y
    );

    if (pointMatched) {
      matchedPoints++;
    }
  }

  const targetCoverage = (matchedPoints / targetPoints.length) * 100;

  const precisionPenalty = Math.max(0, userPoints.length - targetPoints.length) * 2;

  return Math.max(0, Math.min(100, targetCoverage - precisionPenalty));
};

export const generateBiometricOverrideConfig = (
  difficulty: 'easy' | 'medium' | 'hard',
  customConfig?: BiometricOverrideConfig
): BiometricOverrideConfig => {
  const patternCount = customConfig?.patternCount || 
    (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);

  const complexity = customConfig?.complexity || 
    (difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.6 : 0.8);

  const allTypes: BiometricType[] = ['fingerprint', 'retina', 'facial', 'palm', 'voice'];

  const patternTypes = customConfig?.patternTypes || 
    allTypes.slice(0, patternCount);

  const showGuides = customConfig?.showGuides !== undefined ? 
    customConfig.showGuides : difficulty === 'easy';

  const allowRetry = customConfig?.allowRetry !== undefined ? 
    customConfig.allowRetry : difficulty === 'easy';

  return {
    patternTypes,
    patternCount,
    complexity,
    showGuides,
    allowRetry
  };
};