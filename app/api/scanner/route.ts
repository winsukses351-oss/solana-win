import { NextResponse } from 'next/server';

// Mematikan cache Next.js / Vercel secara permanen agar data selalu realtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Ambil data pasar Solana realtime dari DexScreener
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/search?q=solana',
      {
        cache: 'no-store', // Mematikan internal cache Next.js
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gagal mengambil data dari DexScreener: ${response.statusText}`);
    }

    const data = await response.json();
    const pairs = data.pairs || [];

    // Format 15 token/pair teratas
    const formattedTokens = pairs.slice(0, 15).map((pair: any) => {
      const createdAt = pair.pairCreatedAt ? new Date(pair.pairCreatedAt) : new Date();
      const now = new Date();
      const ageMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      let ageDisplay = `${ageMinutes}m`;
      if (ageMinutes >= 60) {
        const hours = Math.floor(ageMinutes / 60);
        const mins = ageMinutes % 60;
        ageDisplay = `${hours}h ${mins}m`;
      }

      return {
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        address: pair.baseToken?.address || '',
        priceUsd: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(6)}` : '$0.000000',
        age: ageDisplay,
        url: pair.url || 'https://dexscreener.com/solana',
      };
    });

    const nowString = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return NextResponse.json(
      {
        success: true,
        updatedAt: nowString,
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
        error: error.message || 'Terjadi kesalahan pada server scanner.',
        updatedAt: new Date().toLocaleTimeString('id-ID'),
        tokens: [],
      },
      { status: 500 }
    );
  }
}
