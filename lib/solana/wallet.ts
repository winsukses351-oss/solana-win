import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { env } from '../config/env';

export const getSigner = (): Keypair => {
  try {
    const decoded = bs58.decode(env.SIGNER_PRIVATE_KEY);
    return Keypair.fromSecretKey(decoded);
  } catch (error) {
    throw new Error('CRITICAL: Failed to load secure signer. Ensure SIGNER_PRIVATE_KEY is valid base58.');
  }
};

export const getPublicKey = (): string => {
  return getSigner().publicKey.toBase58();
};
