import { env } from '../config/env';

export async function getDexScreenerData(address: string) {
  try {
    const res = await fetch(`${env.DEXSCREENER_API_URL}/${address}`, {
      next: { revalidate: 10 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.pairs || json.pairs.length === 0) return null;
    const solPair = json.pairs.find((p: any) => p.chainId === 'solana');
    return solPair || null;
  } catch (e) {
    return null;
  }
}
