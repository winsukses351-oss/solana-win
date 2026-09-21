import { prisma } from '../database/db';

export async function calculatePositionSize(settings: any, currentWalletBalanceUsd: number) {
  let equityBase = settings.startingCapitalUsd;

  if (settings.compoundingEnabled) {
    const realizedPnl = await prisma.trade.aggregate({
      _sum: { pnlUsd: true },
      where: { status: 'CONFIRMED' }
    });
    const totalPnl = realizedPnl._sum.pnlUsd || 0;
    
    // Calculate real compounding equity (starting capital + total realized PnL)
    const realEquity = settings.startingCapitalUsd + totalPnl;
    
    // Protect against negative equity calculations, fallback to actual wallet balance if lower
    equityBase = Math.max(0, Math.min(realEquity, currentWalletBalanceUsd));
  }

  let positionSizeUsd = equityBase * (settings.riskPerTradePercent / 100);

  if (settings.maxPositionUsd && positionSizeUsd > settings.maxPositionUsd) {
    positionSizeUsd = settings.maxPositionUsd;
  }

  const absoluteMaxPercentUsd = equityBase * (settings.maxPositionPercent / 100);
  if (positionSizeUsd > absoluteMaxPercentUsd) {
    positionSizeUsd = absoluteMaxPercentUsd;
  }

  if (positionSizeUsd > currentWalletBalanceUsd) {
    positionSizeUsd = currentWalletBalanceUsd * 0.95; // Leave room for gas
  }

  return Math.max(0, positionSizeUsd);
}
