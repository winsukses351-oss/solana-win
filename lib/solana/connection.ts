import { Connection } from '@solana/web3.js';
import { env } from '../config/env';

export const solanaConnection = new Connection(env.SOLANA_RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});
