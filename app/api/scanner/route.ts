import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana', {
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) throw new Error('Gagal mengambil data pasar');

    const data = await response.json();
    const pairs = data.pairs || [];

    const solanaPairs = pairs
      .filter((p: any) => p.chainId === 'solana' && p.liquidity?.usd)
      .map((p: any) => {
        const liquidity = p.liquidity?.usd || 0;
        const volume24h = p.volume?.h24 || 0;
        
        let score = 50;
        if (liquidity > 10000) score += 20;
        if (liquidity > 50000) score += 15;
        if (volume24h > 5000) score += 15;

        return {
          id: p.pairAddress,
          symbol: p.baseToken?.symbol || 'UNKNOWN',
          name: p.baseToken?.name || 'Unknown Token',
          address: p.baseToken?.address,
          pairAddress: p.pairAddress,
          priceUsd: p.priceUsd ? `$${parseFloat(p.priceUsd).toFixed(6)}` : '$0',
          liquidityUsd: liquidity,
          volume24h: volume24h,
          score: Math.min(score, 100),
          url: p.url,
        };
      })
      .slice(0, 10);

    return NextResponse.json({ success: true, tokens: solanaPairs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, tokens: [] }, { status: 500 });
  }
}
