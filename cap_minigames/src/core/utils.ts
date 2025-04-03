export const randomFromArray = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };
  
  export const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  export const generateRandomString = (length: number, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };
  
  export const calculateDifficulty = (
    baseValue: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): number => {
    const multipliers = {
      easy: 0.7,
      medium: 1.0,
      hard: 1.5,
    };
    return Math.round(baseValue * multipliers[difficulty]);
  };