// lib/clients.ts
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaTestnet } from "./chain";

const RPC = process.env.RPC_URL as string;
const PK = ("0x" + process.env.PRIVATE_KEY) as `0x${string}`;

export const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(RPC),
});
export const walletClient = createWalletClient({
  account: privateKeyToAccount(PK),
  chain: somniaTestnet,
  transport: http(RPC),
});
