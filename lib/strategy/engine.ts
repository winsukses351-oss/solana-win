export interface MarketData {
  address: string;
  priceUsd: number;
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
  buyTx24h: number;
  sellTx24h: number;
  pairAgeHours: number;
  marketCapUsd: number | null;
  holderCount: number | null;
  walletActivityScore: number | null;
  whaleActivityScore: number | null;
  historicalPriceM1: number | null;
}

export function evaluateStrategies(data: MarketData) {
  const scores = {
    momentum: 0,
    volumeSpike: 0,
    liquidity: 0,
    holderGrowth: 0,
    smartMoney: 0,
    whaleActivity: 0,
    breakout: 0,
    marketQuality: 0,
  };
  const reasons: string[] = [];

  // 1. MOMENTUM (Max 20)
  if (data.priceChange24h > 10 && data.buyTx24h > data.sellTx24h) {
    scores.momentum = Math.min(20, (data.priceChange24h / 5));
    reasons.push('Positive price momentum with buy pressure');
  }

  // 2. VOLUME SPIKE (Max 15)
  if (data.volume24h > data.liquidityUsd * 0.5) {
    scores.volumeSpike = Math.min(15, (data.volume24h / data.liquidityUsd) * 5);
    reasons.push('Abnormal volume compared to liquidity');
  }

  // 3. LIQUIDITY GROWTH (Max 15)
  if (data.liquidityUsd > 50000) {
    scores.liquidity = 15;
    reasons.push('Strong liquidity baseline');
  } else if (data.liquidityUsd > 10000) {
    scores.liquidity = 5;
  }

  // 4. HOLDER GROWTH (Max 10)
  if (data.holderCount && data.holderCount > 500) {
    scores.holderGrowth = Math.min(10, data.holderCount / 100);
    reasons.push('Healthy holder distribution');
  }

  // 5. SMART MONEY (Max 15)
  if (data.walletActivityScore) {
    scores.smartMoney = Math.min(15, data.walletActivityScore);
    reasons.push('Smart money wallet activity detected');
  }

  // 6. WHALE ACTIVITY (Max 10)
  if (data.whaleActivityScore) {
    scores.whaleActivity = Math.min(10, data.whaleActivityScore);
    reasons.push('Whale accumulation detected');
  }

  // 7. BREAKOUT (Max 10)
  if (data.historicalPriceM1 && data.priceUsd > data.historicalPriceM1 * 1.05) {
    scores.breakout = 10;
    reasons.push('Price breakout vs 1H baseline');
  }

  // Market Quality (Max 5)
  if (data.pairAgeHours > 24) {
    scores.marketQuality = 5;
    reasons.push('Established pair age');
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return { totalScore, scores, reasons };
}
