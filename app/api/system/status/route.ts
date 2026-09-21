import { NextResponse } from 'next/server';
import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function GET() {
  try {
    const privateKey = process.env.SIGNER_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

    let walletAddress = null;
    let walletBalance = 0;
    let walletStatus = 'KOSONG';
    let rpcStatus = 'ERROR';

    if (privateKey) {
      try {
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        walletAddress = keypair.publicKey.toString();
        walletStatus = 'READY';

        const connection = new Connection(rpcUrl, 'confirmed');
        const balance = await connection.getBalance(keypair.publicKey);
        walletBalance = balance / 1e9;
        rpcStatus = 'READY';
      } catch (e) {
        console.error('Error wallet/RPC:', e);
        walletStatus = 'INVALID_KEY';
      }
    }

    return NextResponse.json({
      network: 'Solana Mainnet',
      rpcStatus,
      tradingStatus: walletStatus === 'READY' ? 'READY' : 'BLOCKED',
      walletStatus,
      walletAddress,
      walletBalanceSol: walletBalance,
    });
  } catch (error) {
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}
