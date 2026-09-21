import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
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
  const timeNow = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  console.log(`[${timeNow}] [SCANNER API] Memulai pemindaian...`);

  try {
    const res = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!res.ok) {
      console.error(`[${timeNow}] [SCANNER API] DexScreener Profiles Error: HTTP ${res.status}`);
      return NextResponse.json({
        success: false,
        updatedAt: timeNow,
        error: `DexScreener Profiles Error HTTP ${res.status}`,
        tokens: [],
      });
    }

    const profiles = await res.json();
    
    const solanaProfiles = Array.isArray(profiles)
      ? profiles.filter((p: any) => p.chainId === 'solana' && !EXCLUDED_ADDRESSES.includes(p.tokenAddress))
      : [];

    console.log(`[${timeNow}] [SCANNER API] Ditemukan ${solanaProfiles.length} profil token Solana.`);

    const addresses = solanaProfiles.slice(0, 15).map((p: any) => p.tokenAddress).join(',');

    if (!addresses) {
      return NextResponse.json({
        success: true,
        updatedAt: timeNow,
        tokens: [],
        message: 'Tidak ada token Solana baru dari endpoint profil.',
      });
    }

    const pairsRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!pairsRes.ok) {
      console.error(`[${timeNow}] [SCANNER API] DexScreener Pairs Error: HTTP ${pairsRes.status}`);
      return NextResponse.json({
        success: false,
        updatedAt: timeNow,
        error: `DexScreener Pairs Error HTTP ${pairsRes.status}`,
        tokens: [],
      });
    }

    const pairsData = await pairsRes.json();
    const pairs = pairsData.pairs || [];

    const tokens = solanaProfiles.slice(0, 15).map((profile: any) => {
      const pair = pairs.find((p: any) => p.baseToken?.address === profile.tokenAddress) || {};
      return {
        symbol: pair.baseToken?.symbol || profile.tokenAddress.slice(0, 6),
        name: pair.baseToken?.name || 'Unknown Token',
        address: profile.tokenAddress,
        priceUsd: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(6)}` : '$0',
        age: formatAge(pair.pairCreatedAt || null),
        url: pair.url || profile.url || `https://dexscreener.com/solana/${profile.tokenAddress}`,
      };
    });

    console.log(`[${timeNow}] [SCANNER API] Sukses memproses ${tokens.length} token.`);

    return NextResponse.json({
      success: true,
      updatedAt: timeNow,
      tokensCount: tokens.length,
      tokens,
    });
  } catch (error: any) {
    console.error(`[${timeNow}] [SCANNER API] Exception error:`, error.message);
    return NextResponse.json({
      success: false,
      updatedAt: timeNow,
      error: error.message || 'Koneksi terputus',
      tokens: [],
    });
  }
}
