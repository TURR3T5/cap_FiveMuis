export interface BlockTransaction {
    id: string;
    sender: string;
    recipient: string;
    amount: number;
    timestamp: number;
    signature: string;
    valid?: boolean;
  }
  
  export interface Block {
    id: string;
    index: number;
    timestamp: number;
    previousHash: string;
    hash: string;
    transactions: BlockTransaction[];
    nonce: number;
    verified: boolean;
  }
  
  export interface BlockchainVerificationConfig {
    blockCount?: number;
    transactionsPerBlock?: number;
    corruptionRate?: number;
    requiredVerificationRate?: number;
    showHints?: boolean;
    autoVerify?: boolean;
  }