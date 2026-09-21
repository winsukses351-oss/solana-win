import { env } from '../config/env';

export async function getJupiterQuote(inputMint: string, outputMint: string, amount: number, slippageBps: number) {
  try {
    const res = await fetch(
      `${env.JUPITER_API_URL}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getJupiterSwapTransaction(quoteResponse: any, userPublicKey: string) {
  try {
    const res = await fetch(`${env.JUPITER_API_URL}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.swapTransaction;
  } catch (e) {
    return null;
  }
}
