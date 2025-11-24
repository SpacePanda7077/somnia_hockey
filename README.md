🏒 Somnia Hockey
On-Chain Multiplayer Arcade Game
Somnia Hockey is a real-time, competitive arcade game that runs entirely on the blockchain. It uses Somnia Data Streams (SDS) to broadcast live match events and ensure trustless, verifiable state synchronization between players.
Experience fast-paced gameplay with the security of on-chain verification. Players can stake tokens, compete for rewards, and engage in a transparent, multiplayer eSports experience.
✨ Features
Trustless Matchmaking and Payouts: Create matches with a staked entry fee and join lobbies with transparent, automated reward distribution managed by a Somnia smart contract.
On-Chain Verifiability: Key match milestones and results are streamed to the blockchain via SDS, creating a tamper-proof, verifiable record of all gameplay.
Real-Time Hybrid Gameplay: Combines traditional game networking (WebSockets) for smooth performance with SDS for critical on-chain updates, offering the best of both worlds.
Decentralized Leaderboards: SDS powers an on-chain leaderboard, ensuring verifiable scores and rankings.
Hackathon Prototype: A fully functional demo showcasing the integration of gaming logic, a Colyseus backend, and Somnia Data Streams.
🧠 Why this Matters
Somnia Hockey is a blueprint for the future of blockchain-native eSports, proving that live data streams can serve as composable game infrastructure. It demonstrates:
Real-time multiplayer coordination on-chain.
Trustless matchmaking and automated payouts.
The use of SDS for verifiable game state without sacrificing performance.
🏆 Hackathon Submission
This project was built for the Somnia hackathon and represents a fully functional proof-of-concept for:
A playable multiplayer arcade game.
A backend server managing lobbies and WebSocket connections.
A smart contract system for entry fees and rewards.
An SDS-powered match feed and leaderboard.
An end-to-end on-chain match lifecycle.
⚙️ Setup and Installation
Follow these steps to run Somnia Hockey locally.

git clone https://github.com/SpacePanda7077/somnia_hockey
cd somnia-hockey
The repository contains two main folders: server/ (the Colyseus backend) and client/ (the game frontend).

Install dependencies
Navigate into each folder and install the required Node modules.
Backend (Server)

cd server
npm install

Frontend (Client)

cd ../client
yarn install

Start the server
From the server/ directory, launch the backend.

npm start

Start the client
From the client/ directory, start the development server.

npm run dev

Open the game
Once the client is running, navigate to the URL printed in your terminal (e.g., http://localhost:8080) to play the game.
