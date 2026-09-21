import { NextResponse } from 'next/server';

// Wajib: Matikan cache Vercel agar data tidak tertahan
export const revalidate = 0;

const EXCLUDED_TOKENS = [
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
];

export async function GET() {
  try {
    const resProfiles = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    if (!resProfiles.ok) throw new Error('Gagal memuat profil');

    const profiles = await resProfiles.json();
    const solanaProfiles = Array.isArray(profiles)
      ? profiles.filter((p: any) => p.chainId === 'solana' && !EXCLUDED_TOKENS.includes(p.tokenAddress))
      : [];

    const addrs = solanaProfiles.slice(0, 10).map((p: any) => p.tokenAddress).join(',');
    if (!addrs) return NextResponse.json({ success: true, opportunities: [] });

    const resPairs = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addrs}`, {
      cache: 'no-store',
    });
    const dataPairs = await resPairs.json();
    const pairs = dataPairs.pairs || [];

    const opportunities = pairs
      .filter((p: any) => p.chainId === 'solana' && !EXCLUDED_TOKENS.includes(p.baseToken?.address))
      .map((p: any) => {
        const liquidity = p.liquidity?.usd || 0;
        const volume = p.volume?.h24 || 0;
        let score = 50;
        if (liquidity >= 1000) score += 25;
        if (volume >= 2000) score += 25;

        return {
          symbol: p.baseToken?.symbol || 'UNKNOWN',
          address: p.baseToken?.address,
          score: Math.min(score, 100),
          liquidity: `$${liquidity.toLocaleString()}`,
          marketCap: `$${(p.fdv || 0).toLocaleString()}`,
          price: p.priceUsd ? `$${parseFloat(p.priceUsd).toFixed(6)}` : '$0',
          url: p.url,
        };
      })
      .slice(0, 6);

    return NextResponse.json({ success: true, opportunities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, opportunities: [] }, { status: 500 });
  }
}
