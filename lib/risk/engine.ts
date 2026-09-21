import { prisma } from '../database/db';
import { getPublicKey } from '../solana/wallet';
import { solanaConnection } from '../solana/connection';

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
    const balance = await solanaConnection.getBalance(solanaConnection.getAccountInfo(getPublicKey()) as any);
    if (balance === null) {
        return { passed: false, reason: 'BLOCKED: Could not fetch wallet balance' };
    }
  } catch (e) {
    return { passed: false, reason: 'BLOCKED: RPC failure during risk check' };
  }

  return { passed: true, reason: 'PASS' };
}
