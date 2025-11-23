// lib/chain.ts
import { defineChain } from "viem";
import "dotenv";
export const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  network: "somnia-testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL] },
    public: { http: [process.env.RPC_URL] },
  },
} as const);
