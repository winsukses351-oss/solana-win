import { NextResponse } from 'next/server';
import { solanaConnection } from '@/lib/solana/connection';
import { getPublicKey } from '@/lib/solana/wallet';
import { prisma } from '@/lib/database/db';

export async function GET() {
  try {
    let rpcStatus = 'NOT CONFIGURED';
    let walletStatus = 'NOT CONFIGURED';
    let walletBalanceSol = 0;

    try {
      const version = await solanaConnection.getVersion();
      if (version) rpcStatus = 'READY';
    } catch (e) {}

    try {
      const pubkey = getPublicKey();
      if (pubkey) {
        walletStatus = 'READY';
        const bal = await solanaConnection.getBalance(solanaConnection.getAccountInfo(pubkey) as any);
        walletBalanceSol = (bal || 0) / 1e9;
      }
    } catch (e) {}

    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });

    return NextResponse.json({
      network: 'SOLANA MAINNET',
      rpcStatus,
      walletStatus,
      walletAddress: walletStatus === 'READY' ? getPublicKey() : null,
      walletBalanceSol,
      tradingStatus: settings?.tradingEnabled ? 'READY' : 'BLOCKED',
      killSwitch: settings?.killSwitch || false
    });
  } catch (error) {
    return NextResponse.json({ error: 'System check failed' }, { status: 500 });
  }
}
