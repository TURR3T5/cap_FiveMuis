export type BiometricType = 'fingerprint' | 'retina' | 'facial';

export interface BiometricPattern {
  id: string;
  type: BiometricType;
  path: string[];
  nodes: string[];
  minPatternLength: number;
  complexity: number;
  color: string;
}

export interface BiometricOverrideConfig {
  patternTypes?: BiometricType[];
  patternCount?: number;
  complexity?: number;
  showGuides?: boolean;
  allowRetry?: boolean;
}