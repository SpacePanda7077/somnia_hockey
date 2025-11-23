import { defineChain } from "thirdweb";

// Replace these with the actual Somnia Testnet details and your chosen RPC URL
const SOMNIA_TESTNET_CHAIN_ID = 50312; // Chain ID for Somnia Shannon Testnet
const MY_CUSTOM_RPC_URL = "https://dream-rpc.somnia.network/"; // Example RPC

export const somniaTestnetCustomRPC = defineChain({
    // Required parameters
    id: SOMNIA_TESTNET_CHAIN_ID,

    // **CRITICAL: This is where you define your custom RPC URL**
    rpc: MY_CUSTOM_RPC_URL,

    // Optional (but recommended) metadata
    name: "Somnia Shannon Testnet (Custom RPC)",
    nativeCurrency: {
        name: "Somnia Test Token",
        symbol: "STT",
        decimals: 18,
    },
    blockExplorers: [
        {
            name: "Shannon Explorer",
            url: "https://shannon-explorer.somnia.network/",
        },
    ],
});
