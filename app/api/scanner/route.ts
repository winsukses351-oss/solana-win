import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WSOL_ADDRESS = 'So11111111111111111111111111111111111111112';
const EXCLUDED_ADDRESSES = [
  WSOL_ADDRESS,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
];

function formatAge(timestampMs: number | null): string {
  if (!timestampMs) return 'N/A';
  const diffMinutes = Math.floor((Date.now() - timestampMs) / (1000 * 60));
  if (diffMinutes < 1) return '< 1m';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ${diffMinutes % 60}m`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export async function GET() {
  const timeNow = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  try {
    // 1. Ambil token profiles terbaru di DexScreener
    const profilesRes = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    let addressesStr = '';

    if (profilesRes.ok) {
      const profiles = await profilesRes.json();
      if (Array.isArray(profiles)) {
        const solanaProfiles = profiles.filter(
          (p: any) => p.chainId === 'solana' && !EXCLUDED_ADDRESSES.includes(p.tokenAddress)
        );
        addressesStr = solanaProfiles.slice(0, 20).map((p: any) => p.tokenAddress).join(',');
      }
    }

    // Fallback jika profiles kosong
    let pairs: any[] = [];
    if (addressesStr) {
      const pairsRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addressesStr}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (pairsRes.ok) {
        const pairsData = await pairsRes.json();
        pairs = pairsData.pairs || [];
      }
    }

    // Jika masih tidak ada data, cari query 'pump' di Solana
    if (pairs.length === 0) {
      const searchRes = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        pairs = (searchData.pairs || []).filter((p: any) => p.chainId === 'solana');
      }
    }

    // 2. Olah data pair & tentukan token asli (Bukan SOL/USDC)
    const formattedTokens: any[] = [];
    const seenAddresses = new Set<string>();

    for (const pair of pairs) {
      // Deteksi apakah baseToken adalah SOL/Stablecoin. Jika ya, gunakan quoteToken
      let targetToken = pair.baseToken;
      if (!targetToken || EXCLUDED_ADDRESSES.includes(targetToken.address)) {
        targetToken = pair.quoteToken;
      }

      // Pastikan target token valid dan bukan SOL/USDC/USDT
      if (
        !targetToken ||
        !targetToken.address ||
        EXCLUDED_ADDRESSES.includes(targetToken.address) ||
        targetToken.symbol?.toUpperCase() === 'SOL'
      ) {
        continue;
      }

      // Hindari duplikat token
      if (seenAddresses.has(targetToken.address)) {
        continue;
      }
      seenAddresses.add(targetToken.address);

      formattedTokens.push({
        symbol: targetToken.symbol || 'UNKNOWN',
        name: targetToken.name || 'Unknown Token',
        address: targetToken.address,
        priceUsd: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(6)}` : '$0.000000',
        age: formatAge(pair.pairCreatedAt || null),
        url: pair.url || `https://dexscreener.com/solana/${targetToken.address}`,
      });

      if (formattedTokens.length >= 15) break;
    }

    return NextResponse.json(
      {
        success: true,
        updatedAt: timeNow,
        tokensCount: formattedTokens.length,
        tokens: formattedTokens,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        updatedAt: timeNow,
        error: error.message || 'Terjadi kesalahan pada pemindaian server.',
        tokens: [],
      },
      { status: 500 }
    );
  }
}
