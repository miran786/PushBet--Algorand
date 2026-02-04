# Campus Vitality Protocol (CVP)
### Built on Algorand | Powered by AI

A decentralized, AI-verified platform for enhancing campus life. From fitness challenges to civic cleanliness and ride-sharing, CVP uses Blockchain to ensure transparency and accountability.

## Features

### 1. Fitness Arena (Push-Up Battles)
- **Concept**: Compete in 1v1 push-up contests.
- **Tech**: React Webcam + Computer Vision (planned).
- **Crypto**: Stake ALGO, Winner takes all (Escrow Smart Contract).

### 2. Civic Sense (Cleanliness AI)
- **Concept**: Maintain campus empathy by keeping rooms clean.
- **Tech**: Vision AI (Gemini/OpenAI) analyzes photos.
- **Crypto**: Automatic micro-payouts for verified cleanliness.

### 3. Asset Lending (Accountability)
- **Concept**: Borrow equipment (Projectors, Speakers) without paperwork.
- **Tech**: QR Code Scanner.
- **Crypto**: Smart Contract collateral (5 ALGO) locked until return.

### 4. Commute Pool (Transport)
- **Concept**: Verify carpooling/commute to campus.
- **Tech**: Geolocation API + Distance Checking.
- **Crypto**: Auto-reimbursement upon arrival at VIT Pune coordinates.

## Tech Stack
- **Frontend**: Vite + React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **Blockchain**: Algorand (Testnet), PyTeal Smart Contracts, Pera Wallet Connect
- **AI**: Vision API Integration

## Getting Started

### 1. Install Dependencies
```bash
# Client
cd .
npm install

# Server
cd server
npm install
```

### 2. Configure Environment
Create `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/miran_db
PORT=8000
REFEREE_MNEMONIC="YOUR_ALGORAND_WALLET_MNEMONIC"
ALGORAND_APP_ID=0
```

### 3. Run Application
```bash
# Terminal 1: Client
npm run dev

# Terminal 2: Server
cd server
npm run dev
```

## Smart Contract
The Escrow logic is defined in `algorand/contract.py`.
