import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { env } from '../config/env';

export const getSigner = (): Keypair => {
  try {
    if (!env.SIGNER_PRIVATE_KEY) {
      throw new Error('Private key not configured');
    }
    const decoded = bs58.decode(env.SIGNER_PRIVATE_KEY);
    return Keypair.fromSecretKey(decoded);
  } catch (error) {
    throw new Error('CRITICAL: Failed to load secure signer. Ensure SIGNER_PRIVATE_KEY is valid base58.');
  }
};

export const getPublicKey = (): string | null => {
  try {
    if (!env.SIGNER_PRIVATE_KEY) return null;
    return getSigner().publicKey.toBase58();
  } catch (error) {
    return null;
  }
};
