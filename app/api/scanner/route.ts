import { NextResponse } from 'next/server';

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
    // Ambil data dari dua endpoint sekaligus untuk memperkaya variasi token
    const [resLatest, resBoosts] = await Promise.allSettled([
      fetch('https://api.dexscreener.com/token-profiles/latest/v1', { cache: 'no-store' }),
      fetch('https://api.dexscreener.com/token-boosts/latest/v1', { cache: 'no-store' }),
    ]);

    let rawTokens: any[] = [];

    if (resLatest.status === 'fulfilled' && resLatest.value.ok) {
      const data = await resLatest.value.json();
      if (Array.isArray(data)) rawTokens.push(...data);
    }

    if (resBoosts.status === 'fulfilled' && resBoosts.value.ok) {
      const data = await resBoosts.value.json();
      if (Array.isArray(data)) rawTokens.push(...data);
    }

    // Filter khusus jaringan Solana & buang alamat SOL/USDC/USDT
    const solanaTokens = rawTokens.filter(
      (t: any, index, self) =>
        t.chainId === 'solana' &&
        !EXCLUDED_ADDRESSES.includes(t.tokenAddress) &&
        self.findIndex((item) => item.tokenAddress === t.tokenAddress) === index
    );

    const selectedAddresses = solanaTokens
      .map((t: any) => t.tokenAddress)
      .filter(Boolean)
      .slice(0, 15)
      .join(',');

    const timeNow = new Date().toLocaleTimeString('id-ID');

    if (!selectedAddresses) {
      return NextResponse.json({ success: true, tokens: [], updatedAt: timeNow });
    }

    // Ambil detail harga dan pairCreatedAt terbaru
    const pairsRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${selectedAddresses}`, {
      cache: 'no-store',
    });
    const pairsData = await pairsRes.json();
    const pairs = pairsData.pairs || [];

    const tokens = solanaTokens.slice(0, 15).map((profile: any) => {
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

    return NextResponse.json({
      success: true,
      updatedAt: timeNow,
      tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, tokens: [], updatedAt: new Date().toLocaleTimeString('id-ID') },
      { status: 500 }
    );
  }
}
