import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana', {
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) throw new Error('Gagal memuat peluang');

    const data = await response.json();
    const pairs = data.pairs || [];

    const opportunities = pairs
      .filter((p: any) => p.chainId === 'solana' && (p.liquidity?.usd || 0) >= 2000)
      .map((p: any) => {
        const liquidity = p.liquidity?.usd || 0;
        const volume = p.volume?.h24 || 0;
        
        let score = 60;
        if (liquidity >= 10000) score += 20;
        if (volume >= 10000) score += 20;

        return {
          symbol: p.baseToken?.symbol || 'UNKNOWN',
          address: p.baseToken?.address,
          pairAddress: p.pairAddress,
          score: Math.min(score, 100),
          liquidity: `$${liquidity.toLocaleString()}`,
          marketCap: `$${(p.fdv || 0).toLocaleString()}`,
          price: p.priceUsd ? `$${parseFloat(p.priceUsd).toFixed(6)}` : '$0',
          url: p.url,
        };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6);

    return NextResponse.json({ success: true, opportunities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, opportunities: [] }, { status: 500 });
  }
}
