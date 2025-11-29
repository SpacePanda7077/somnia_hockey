# 🏒 Somnia Hockey

### **On-Chain Multiplayer Arcade Game Powered by Somnia Data Streams**

**Somnia Hockey** is a real-time, competitive arcade game that runs
directly on the blockchain.\
Using **Somnia Data Streams (SDS)**, the game broadcasts live match
events on-chain, enabling **trustless, verifiable, tamper-proof state
synchronization** between players.

Experience fast-paced gameplay enhanced by the transparency, fairness,
and automation of blockchain technology --- including **staked
matches**, **automated payouts**, and **verifiable leaderboards**.

---

## ✨ Features

### 🔒 Trustless Matchmaking & Payouts

Create or join matches with a staked entry fee.\
A Somnia smart contract handles **automated, verifiable reward
distribution** with no middlemen.

### 🧾 On-Chain Verifiability

Key match milestones and results are streamed on-chain via **Somnia Data
Streams**, creating an **auditable and tamper-proof gameplay history**.

### ⚡ Hybrid Real-Time Gameplay

Smooth WebSocket-based multiplayer networking combined with SDS for
critical on-chain updates --- delivering both **performance and
verifiability**.

### 🏅 Decentralized Leaderboards

Scores and rankings are powered by SDS, ensuring **transparent,
censorship-resistant leaderboards**.

### 🧩 Hackathon Prototype

A fully working demo integrating: - The Somnia Data Streams protocol\

- A Colyseus multiplayer backend\
- A smart-contract-based match lifecycle\
- A playable frontend arcade game

---

## 🧠 Why This Matters

**Somnia Hockey demonstrates the future of blockchain-native eSports.**\
It shows how real-time data streams can act as composable game
infrastructure --- enabling:

- Real-time, on-chain multiplayer coordination\
- Trustless matchmaking with automated payouts\
- Verifiable game states without sacrificing gameplay experience\
- Blockchain-backed transparency for competitive gaming

This project serves as a working blueprint for developers building
decentralized games or interactive dApps powered by live on-chain data.

---

## 🏆 Hackathon Submission

This prototype was built for the **Somnia Hackathon**, delivering:

- A playable multiplayer arcade experience\
- A Colyseus-powered real-time backend\
- Smart contracts for entry fees and rewards\
- SDS-driven match events and leaderboards\
- A complete on-chain match lifecycle

---

---

## Coming Soon ...

- More maps to diverse game play
- More Mode for more fun game play and replayability
- Live prediction Matches("players who dont want to play can bet on live game that are in progress ... ")
- and so mush more

## ⚙️ Setup & Installation

Follow these steps to run **Somnia Hockey** locally:

### 1. Clone the Repository

```bash
git clone https://github.com/SpacePanda7077/somnia_hockey
cd somnia_hockey
```

The project contains two folders:

    server/  → Colyseus backend
    client/  → Frontend game client

---

### 2. Install Dependencies

#### Backend (Server)

```bash
cd server
npm install
```

#### Frontend (Client)

```bash
cd ../client
yarn install
```

#### Change The Server Ennpoint to Your LocalHost

Go to the client -> Src -> network -> network.ts

change the -> export const client = new Client("https://somnia-hockey.onrender.com/") to -> export const client = new Client("http://localhost:2567");

---

### 3. Start the Backend Server

From the `server/` directory:

```bash
npm start
```

---

### 4. Start the Frontend Client

From the `client/` directory:

```bash
npm run dev
```

---

### 5. Launch the Game

Once the client is running, open the URL printed in the terminal (e.g.):

    http://localhost:8080

You're ready to play Somnia Hockey locally!
