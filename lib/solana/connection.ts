import { Connection } from '@solana/web3.js';
import { env } from '../config/env';

const rpcUrl = env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export const solanaConnection = new Connection(rpcUrl, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});
