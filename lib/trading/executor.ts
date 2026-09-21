import { VersionedTransaction } from '@solana/web3.js';
import { solanaConnection } from '../solana/connection';
import { getSigner } from '../solana/wallet';

export async function executeSwap(swapTransactionBase64: string): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    const signer = getSigner();
    
    const swapTransactionBuf = Buffer.from(swapTransactionBase64, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    transaction.sign([signer]);
    
    const latestBlockhash = await solanaConnection.getLatestBlockhash();
    
    const signature = await solanaConnection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3
    });
    
    const confirmation = await solanaConnection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, 'confirmed');
    
    if (confirmation.value.err) {
      return { success: false, error: 'FAILED: Transaction confirmed but resulted in error' };
    }
    
    return { success: true, signature };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
