import { prisma } from '../database/db';
import { getPublicKey } from '../solana/wallet';
import { solanaConnection } from '../solana/connection';
import { PublicKey } from '@solana/web3.js';

export async function runRiskChecks(tokenAddress: string, score: number, liquidityUsd: number, settings: any) {
  if (settings.killSwitch) {
    return { passed: false, reason: 'BLOCKED: Kill switch is active' };
  }
  
  if (!settings.tradingEnabled) {
    return { passed: false, reason: 'BLOCKED: Trading is disabled' };
  }

  if (score < settings.minScore) {
    return { passed: false, reason: `BLOCKED: Score ${score} below minimum ${settings.minScore}` };
  }

  if (liquidityUsd < settings.minLiquidityUsd) {
    return { passed: false, reason: `BLOCKED: Liquidity ${liquidityUsd} below minimum ${settings.minLiquidityUsd}` };
  }

  const openPositionsCount = await prisma.position.count({ where: { status: 'OPEN' } });
  if (openPositionsCount >= settings.maxOpenPositions) {
    return { passed: false, reason: 'BLOCKED: Max open positions reached' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysTrades = await prisma.trade.findMany({
    where: { timestamp: { gte: today }, status: 'CONFIRMED' }
  });
  
  const dailyPnl = todaysTrades.reduce((acc, trade) => acc + (trade.pnlUsd || 0), 0);
  if (settings.maxDailyLossUsd && dailyPnl <= -Math.abs(settings.maxDailyLossUsd)) {
    return { passed: false, reason: 'BLOCKED: Max daily loss USD reached' };
  }

  try {
    const pubkeyStr = getPublicKey();
    if (!pubkeyStr) {
      return { passed: false, reason: 'BLOCKED: Wallet not configured' };
    }
    const pubkeyObj = new PublicKey(pubkeyStr);
    const balance = await solanaConnection.getBalance(pubkeyObj);
    if (balance === null || balance === undefined) {
        return { passed: false, reason: 'BLOCKED: Could not fetch wallet balance' };
    }
  } catch (e) {
    return { passed: false, reason: 'BLOCKED: RPC failure during risk check' };
  }

  return { passed: true, reason: 'PASS' };
}
