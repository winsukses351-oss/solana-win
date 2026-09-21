export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || '',
  SIGNER_PRIVATE_KEY: process.env.SIGNER_PRIVATE_KEY || '',
  BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY || '',
  DEXSCREENER_API_URL: process.env.DEXSCREENER_API_URL || 'https://api.dexscreener.com/latest/dex/tokens',
  JUPITER_API_URL: process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',
};
