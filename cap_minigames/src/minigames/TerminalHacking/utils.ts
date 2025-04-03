import { calculateDifficulty, generateRandomString, randomFromArray, shuffleArray } from '../../core/utils';

export const generateCommandSet = (difficulty: 'easy' | 'medium' | 'hard'): string[] => {
  const baseCommands = [
    'access', 'bypass', 'connect', 'decrypt', 'enumerate',
    'force', 'grant', 'hook', 'inject', 'kill',
    'load', 'mount', 'nullify', 'override', 'ping',
    'query', 'root', 'sync', 'trace', 'unlock',
    'validate', 'write', 'xfer', 'yield', 'zap'
  ];
  
  const advancedCommands = [
    'sys.override', 'net.bypass', 'kernel.access', 'auth.break',
    'ssh.exploit', 'firewall.disable', 'proxy.tunnel', 'port.scan',
    'memory.dump', 'buffer.overflow', 'hash.crack', 'token.steal'
  ];
  
  const numCommands = calculateDifficulty(6, difficulty);
  const pool = difficulty === 'easy' ? baseCommands : [...baseCommands, ...advancedCommands];
  
  return shuffleArray(pool).slice(0, numCommands);
};

export const generateCodePattern = (
  difficulty: 'easy' | 'medium' | 'hard',
  length: number = 4
): string => {
  const chars = '0123456789ABCDEF';
  const patternLength = calculateDifficulty(length, difficulty);
  return generateRandomString(patternLength, chars);
};

export const generateTerminalOutput = (
  commandSet: string[],
  targetCommand: string
): string => {
  const outputs = [
    `System vulnerable at endpoint: use '${targetCommand}' to exploit`,
    `Security hole detected: '${targetCommand}' can bypass protections`,
    `Backdoor found: '${targetCommand}' will grant access`,
    `Protocol weakness identified: '${targetCommand}' to penetrate defenses`
  ];
  
  const irrelevantOutputs = [
    'Connection established to remote server',
    'Scanning network for vulnerabilities...',
    'Firewall rules analyzed',
    'Authentication protocols identified',
    'System architecture mapped',
    'Encryption levels detected: AES-256',
    'Server response time: 42ms',
    'User accounts enumerated'
  ];
  
  let output = `SECURITY TERMINAL v3.4.2\n=======================\n\n`;
  output += `Available commands:\n${commandSet.join('\n')}\n\n`;
  output += shuffleArray([...irrelevantOutputs, randomFromArray(outputs)]).join('\n\n');
  
  return output;
};