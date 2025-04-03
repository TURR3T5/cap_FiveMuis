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
    `[VULNERABILITY SCAN] Found security breach. The '${targetCommand}' command can exploit this vulnerability.`,
    `[SYSTEM ANALYSIS] Security protocol weakness detected. Try '${targetCommand}' to bypass.`,
    `[NETWORK LOG] Unpatched backdoor found. Use '${targetCommand}' to gain access.`,
    `[SECURITY REPORT] System vulnerable to '${targetCommand}' exploit.`
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
  
  let output = `Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n\n`;
  output += `C:\\hack> scan --target system --verbose\n\n`;
  output += `SYSTEM SCAN RESULTS:\n`;
  output += shuffleArray([...irrelevantOutputs, randomFromArray(outputs)]).join('\n\n');
  output += `\n\n`;
  output += `C:\\hack> cmdlist\n\n`;
  output += `Available commands:\n`;
  output += commandSet.join('\n');
  output += `\n\n`;
  output += `Type 'help' for more information or 'exit' to cancel\n\n`;
  
  return output;
};