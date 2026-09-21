import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mengambil profil token/pool terbaru di jaringan Solana via DexScreener
    const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    
    if (!response.ok) throw new Error('Gagal mengambil data dari DexScreener');

    const data = await response.json();
    
    // Filter khusus token di rantai Solana
    const solanaTokens = Array.isArray(data) 
      ? data.filter((item: any) => item.chainId === 'solana').slice(0, 10)
      : [];

    return NextResponse.json({ success: true, tokens: solanaTokens });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, tokens: [] }, { status: 500 });
  }
}
