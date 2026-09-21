import { env } from '../config/env';

export async function getBirdeyeTokenData(address: string) {
  try {
    const res = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${address}`, {
      headers: { 'X-API-KEY': env.BIRDEYE_API_KEY },
      next: { revalidate: 10 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;
    return json.data;
  } catch (e) {
    return null;
  }
}
