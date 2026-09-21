import { NextResponse } from 'next/server';

// Mematikan cache otomatis Next.js/Vercel agar data selalu segar
export const revalidate = 0;

const EXCLUDED_ADDRESSES = [
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
];

function formatAge(timestampMs: number | null): string {
  if (!timestampMs) return 'N/A';
  const diffMinutes = Math.floor((Date.now() - timestampMs) / (1000 * 60));
  if (diffMinutes < 1) return '< 1m';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export async function GET() {
  try {
    // Ambil token/pool profil terbaru di jaringan Solana
    const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    if (!response.ok) throw new Error('Gagal mengambil data dari DexScreener');

    const profiles = await response.json();

    const solanaProfiles = Array.isArray(profiles) 
      ? profiles.filter((p: any) => p.chainId === 'solana' && !EXCLUDED_ADDRESSES.includes(p.tokenAddress))
      : [];

    const tokenAddresses = solanaProfiles.slice(0, 10).map((p: any) => p.tokenAddress).join(',');

    if (!tokenAddresses) {
      return NextResponse.json({ success: true, tokens: [] });
    }

    // Ambil detail harga dan timestamp pembutan pair
    const pairsRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses}`, {
      cache: 'no-store',
    });
    const pairsData = await pairsRes.json();
    const pairs = pairsData.pairs || [];

    const tokens = solanaProfiles.slice(0, 10).map((profile: any) => {
      const pair = pairs.find((p: any) => p.baseToken?.address === profile.tokenAddress) || {};
      const createdAt = pair.pairCreatedAt || null;

      return {
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        address: profile.tokenAddress,
        priceUsd: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(6)}` : '$0',
        age: formatAge(createdAt),
        url: pair.url || profile.url || `https://dexscreener.com/solana/${profile.tokenAddress}`,
      };
    });

    return NextResponse.json({ success: true, tokens });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, tokens: [] }, { status: 500 });
  }
}
