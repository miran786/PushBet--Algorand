# 🚀 PushBet: The AI-Powered Campus Lifestyle Protocol
### Built on Algorand | Powered by Gemini & TensorFlow

> **Hackathon Submission:** "Hackseries-2" (Algorand Track)
> **Goal:** Gamify campus life with verifiable on-chain actions.

PushBet is a decentralized platform that uses **AI Vision** and **Geolocation** to verify real-world actions (Fitness, Commute, Asset Lending) and reward students on the Algorand Blockchain.

---

## 🌟 Key Features

### 1. 🏋️ Fitness Arena (Push-Up Battles)
- **Concept**: Prove your reps to earn rewards.
- **Tech**: **MediaPipe AI** tracks body pose and counts push-ups in real-time via webcam.
- **On-Chain**: Smart Contract escrows the stake. Winner takes all.

### 2. 🚌 Commute Pool (Ride Sharing)
- **Concept**: Sustainable travel verification.
- **Tech**: **Gemini AI Vision** verifies you are inside a vehicle/bus. **Geolocation** tracks arrival at campus.
- **On-Chain**: Riders deposit collateral; Smart Contract releases payment to Driver upon verified arrival.
- **Testnet App ID**: `755284243`

### 3. 📦 Asset Lending (Trustless Borrowing)
- **Concept**: Borrow campus equipment (Laptops, Lab Kits) instantly.
- **Tech**: **Coco-SSD (TensorFlow)** verifies the item is returned in good condition via camera scan.
- **On-Chain**: Borrowers lock collateral (ALGO). It is automatically refunded when the AI confirms the return.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS, Framer Motion |
| **Blockchain** | Algorand (Testnet), AlgoSDK, PyTeal Smart Contracts |
| **Wallet** | Pera Wallet Connect, Defly, Kibisis |
| **AI Models** | MediaPipe (Pose), Coco-SSD (Object Detection), Gemini Flash 1.5 (Vision) |
| **Maps** | Leaflet, OpenStreetMap |

---

## 🚀 Quick Start (For Judges)

### Prerequisites
- **Node.js** (v18+)
- **Algorand Wallet** (Pera Mobile App recommended) connected to **TestNet**.
- **TestNet ALGO**: Get free funds from the [Algorand Dispenser](https://bank.testnet.algorand.network/).

### 1. Clone & Install
```bash
git clone https://github.com/miran786/PushBet--Algorand.git
cd PushBet--Algorand
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
# Optional: Get a free key from Google AI Studio for Commute Verification
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 3. Run the App
```bash
npm run dev
```
Open **http://localhost:5173** (or the port shown in terminal).

---

## 🧪 How to Test (Demo Flow)

### A. Commute Pool (Ride Sharing)
1. Go to **"Commute Arena"**.
2. Connect your Wallet (TestNet).
3. Click **"Create Student Account"** (this opts you into the contract).
4. Select **"I Need a Ride"** (Rider).
5. Choose a Driver from the list.
6. Click **"Start Trip"** (Signs a 1 ALGO transaction).
7. Once "active", click **"Verify Arrival"**.
8. Take a photo (or show an image of a bus/car interior). **Gemini AI** will verify it.
9. Upon success, the trip ends and the driver is paid on-chain!

### B. Asset Lending
1. Go to **"Asset Arena"**.
2. Switch to **"Lender Mode"** (top right).
3. Click **"Scan Item"** and point camera at a common object (Cell Phone, Laptop, Bottle).
4. AI will detect and verify the object.
5. Confirm the return on-chain to release the borrower's collateral.

### C. Fitness
1. Go to **"Arena"**.
2. Click **"Place Stake"**.
3. Perform push-ups in front of the camera.
4. Watch the rep counter go up!

---

## 📜 Smart Contracts

| Contract | Testnet App ID | Description |
| :--- | :--- | :--- |
| **Commute** | `755284243` | Handles ride escrow, driver registry, and payouts. |
| **Asset** | *(Deployed per item)* | Manages collateral lock and return logic. |

---

## 🤝 Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

### License
MIT
