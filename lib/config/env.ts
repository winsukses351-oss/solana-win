import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SOLANA_RPC_URL: z.string().url(),
  SIGNER_PRIVATE_KEY: z.string().min(87),
  BIRDEYE_API_KEY: z.string().min(1),
  DEXSCREENER_API_URL: z.string().url().default('https://api.dexscreener.com/latest/dex/tokens'),
  JUPITER_API_URL: z.string().url().default('https://quote-api.jup.ag/v6'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('CRITICAL: Invalid environment variables', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
