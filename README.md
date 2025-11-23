🏒 Somnia Hockey — On-Chain Multiplayer Arcade Game Powered by Somnia Data Streams

Somnia Hockey is a real-time, competitive arcade game that runs entirely on the blockchain using Somnia Data Streams (SDS) to stream live match events and maintain trustless state synchronization between players.

The project combines fast-paced gameplay with on-chain verifiability, enabling players to create matches, join lobbies, stake tokens, and compete for real rewards — all transparently recorded on Somnia.

🚀 How It Works
1. Create a Match (On-Chain Bet Setup)

A player begins by entering the amount they want to stake as the entry fee.
When they click Create Match, the backend publishes a new game match to the blockchain using Somnia Data Streams, making it visible globally and verifiable by anyone.

This creates a public on-chain match listing.

2. Find & Join a Match (Decentralized Lobbying)

Another player can click Find Match to discover all active matches streamed through SDS.
Once they join:

The backend creates a new on-chain lobby on the Somnia blockchain

Both players receive an on-chain request to pay the entry fee

After payment confirmation, the game begins

This ensures trustless matchmaking where the backend cannot cheat or manipulate match entries.

3. Real-Time Gameplay (WebSockets + SDS)

The match runs with traditional game networking (WebSockets/Colyseus), while key milestones and state updates are streamed to the blockchain via SDS for transparency.

This hybrid approach gives:

Smooth gameplay

Tamper-proof match records

A provable, verifiable match timeline

4. End of Match (Winner Selection & Rewards)

When the game ends:

The backend validates the result

The winner is determined and written to SDS Leaderboards

A WebSocket event is triggered for the winner to claim their reward

Funds are distributed directly through the Somnia smart contract

The entire lifecycle — matchmaking, entry fees, gameplay events, score updates, and reward claiming — is cryptographically verifiable.

🧠 Why This Matters

Somnia Hockey demonstrates how gaming + blockchain can go beyond NFTs and payments by using live data streams as composable game infrastructure.

It shows:

Real-time multiplayer on-chain coordination

Trustless matchmaking and payouts

On-chain leaderboards powered by SDS

Verifiable game state without sacrificing performance

A template for future blockchain-native eSports titles

🎯 Key Features

Somnia Data Streams integration for match creation, state sync, and leaderboards

On-chain betting system where users create or join matches with entry fees

Automatic on-chain lobby creation for verified 1v1 battles

Real-time gameplay via WebSocket networking (Colyseus)

Automated reward distribution after match validation

Verifiable match results and transparent scoring

🏆 What We Built for the Hackathon

Somnia Hockey is a fully functional demo that combines:

A playable multiplayer arcade game

Backend server with lobby logic + WebSocket networking

Smart contract system managing entry fees and rewards

SDS-powered match feed + leaderboard

On-chain match lifecycle from creation → gameplay → payout
🔧 Setup & Installation

Follow these steps to run Somnia Hockey locally.

1. Clone the Repository
git clone https://github.com/SpacePanda7077/somnia_hockey
cd somnia-hockey


The repo contains two folders:

server/ — the Colyseus backend

client/ — the game frontend

2. Install Dependencies

Before running anything, install Node modules in both folders.

Backend (Server)
cd server
npm install

Frontend (Client)
cd ../client
yarn install

3. Start the Server

Inside the server/ directory:

npm start


This launches the Colyseus backend that handles matchmaking, lobbies, SDS updates, and WebSocket connections.

4. Start the Client

Inside the client/ directory:

npm run dev


This starts the development server so you can open the game in your browser.

5. Open the Game

Once the client is running, open the URL printed in your terminal.
open game with link : http://localhost:8080
