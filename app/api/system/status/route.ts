import { NextResponse } from 'next/server';
import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function GET() {
  try {
    // Membaca Environment Variables dari Vercel
    const privateKey = process.env.SIGNER_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

    let walletAddress = null;
    let walletBalance = 0;
    let walletStatus = 'KOSONG';
    let rpcStatus = 'ERROR';

    // Proses pengecekan dompet (Wallet)
    if (privateKey) {
      try {
        // Menerjemahkan Private Key
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        walletAddress = keypair.publicKey.toString();
        walletStatus = 'READY';

        // Menghubungkan ke Jaringan Solana & Cek Saldo
        const connection = new Connection(rpcUrl, 'confirmed');
        const balance = await connection.getBalance(keypair.publicKey);
        walletBalance = balance / 1e9; // Konversi dari lamports ke SOL
        rpcStatus = 'READY';
      } catch (e) {
        console.error("Gagal membaca wallet atau koneksi:", e);
        walletStatus = 'ERROR_INVALID_KEY';
      }
    }

    // Mengirimkan data kembali ke Dashboard
    return NextResponse.json({
      network: 'Solana Mainnet',
      rpcStatus: rpcStatus,
      tradingStatus: walletStatus === 'READY' ? 'READY' : 'BLOCKED',
      walletStatus: walletStatus,
      walletAddress: walletAddress,
      walletBalanceSol: walletBalance,
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}
