import { NextResponse } from 'next/server';

// Memaksa Next.js dan Vercel untuk TIDAK Meng-cache API Route ini
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Memanggil API DexScreener untuk token terbaru di Solana
    const response = await fetch(
      'https://api.dexscreener.com/token-profiles/latest/v1',
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store', // Memaksa request selalu fresh
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const rawData = await response.json();

    // Filter khusus token di jaringan Solana
    const solanaTokens = Array.isArray(rawData)
      ? rawData.filter((item: any) => item.chainId === 'solana')
      : [];

    // Format data agar aman diproses di Frontend
    const formattedTokens = solanaTokens.slice(0, 15).map((item: any) => ({
      symbol: item.tokenAddress ? item.tokenAddress.slice(0, 6).toUpperCase() : 'UNKNOWN',
      name: item.tokenAddress || 'Solana Token',
      age: 'Baru',
      price: item.priceUsd ? `$${parseFloat(item.priceUsd).toFixed(6)}` : '$0.000000',
      address: item.tokenAddress || '',
      url: item.url || `https://dexscreener.com/solana/${item.tokenAddress}`,
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      data: formattedTokens,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error("Error fetching scanner data:", error);
    
    // Kembalikan response fallback agar frontend tidak crash
    return NextResponse.json({
      success: false,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      error: error.message || 'Gagal mengambil data',
      data: [],
    }, { status: 500 });
  }
}
