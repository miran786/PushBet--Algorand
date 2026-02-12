# 🚀 Campus Vitality Protocol (CVP)
### The Decentralized Trust Layer for Student Life
**Built on Algorand | Powered by AI | Verified by Community**

> **Hackathon Submission:** "Hackspiration '26"
> **Tracks:** AI & Automation + Future of Finance
> **Vision:** A trustless, self-governing ecosystem for campus life.

CVP is not just an app; it is a **Decentralized Protocol** that gamifies and verifies student activities (Fitness, Commute, Lending) to build an on-chain **Reputation Score**.

---

## 🏆 Evaluation Criteria Mapping (Why We Win)

### 1. Technical Implementation & Code Quality
*   **AI Integration:** We utilize **MediaPipe** (Pose Detection), **Gemini Vision 1.5** (Context Analysis), and **Coco-SSD** (Object Detection) to create a robust "Oracle Layer" that feeds real-world data to the blockchain.
*   **Smart Contracts:** Written in **PyTeal**, utilizing advanced features like Inner Transactions and Local State for reputation tracking.
*   **Frontend:** A responsive, modern React application with real-time feedback loops.

### 2. Effective Use of Algorand Features
We don't just use Algorand for payments; we leverage its unique capabilities:
*   **Atomic Transfers:** Used in our **Marketplace** to ensure trustless P2P trading (Payment + Asset Transfer happen together or not at all).
*   **Box Storage:** Used to store the **Global Order Book** and complex validation data directly on-chain.
*   **State Proofs (Planned):** Designed to export the "Trust Score" as a cross-chain identity proof.
*   **Low Latency (3.3s):** Essential for "Real-Time" verification in the Fitness Arena.

### 3. Relevance to Problem Statement
*   **Problem:** "Lack of trust, manual verification, and data tampering" in campus systems.
*   **Solution:** CVP removes the "manual verifier".
    *   *Did you clean your room?* AI verifies it.
    *   *Did you return the laptop?* AI scans it.
    *   *Are you a good student?* Your on-chain **Trust Score** proves it immutably.

### 4. Feasibility & Scalability
*   **Feasibility:** The prototype works *today* on Testnet. It uses standard webcams and existing phones—no hardware cost.
*   **Scalability:**
    *   **Phase 1 (VIT Pune):** Pilot with Gym & Hostel.
    *   **Phase 2 (Inter-College):** "Hostel Leagues" where colleges compete on fitness/eco-scores.
    *   **Phase 3 (National):** The "Trust Score" becomes a standard hiring metric for integrity.

---

## 💡 The Core Innovation: "Trust Score Protocol"

Most campus apps are isolated silos. CVP unifies them into a single **On-Chain Identity**.

**1. The "Trust Score" (Soulbound Token):**
*   Every verified action mints **Trust Points** to your profile.
*   **High Trust Score = Real Utility:**
    *   **Zero-Collateral Borrowing:** If Trust > 90, borrow expensive lab equipment without locking 5 ALGO.
    *   **Validator Status:** Top-tier students become "Human Oracles" to verify others.

**2. The "Student Validator Node" (Decentralized AI):**
*   **Hybrid Verification:** AI (Gemini/TensorFlow) does the first pass.
*   **Human Consensus:** For edge cases, top-ranking students verify claims (e.g., "Is this room actually clean?").

---

## 🔥 Innovations (Why We Win)

### 1. **Zero-Collateral DeFi (Based on AI Reputation)**
We solve the "Over-collateralization" problem in DeFi. Instead of locking assets, students stake their **Reputation**.
*   **Tech:** Our Lending Contract reads the **Local State (Trust Score)** from the Trust Protocol.
*   **Logic:** `If Trust_Score > 50: Collateral = 0`. This is true **Identity-Based DeFi**.

### 2. **"Proof of Burn" Tokenomics**
Turn sweat into a deflationary asset.
*   **Mechanism:** AI verifies pushups -> Mints `$BURN` tokens.
*   **Utility:** Tokens must be *burned* to redeem campus rewards, creating a circular economy.

### 3. **Atomic Marketplace (Zero-Risk Trading)**
A trustless P2P exchange for textbooks and equipment.
*   **Tech:** Uses **Algorand Atomic Transfers**.
*   **Innovation:** The Payment and Asset Transfer happen in the *same* atomic group. It is mathematically impossible to get scammed.

### 4. **Cross-Chain Identity (State Proofs)**
Your reputation travels with you.
*   **Tech:** **Algorand State Proofs (ASP)**.
*   **Future:** Export your high Trust Score as a cryptographic proof to get loans on Ethereum or Solana.

### 5. **Hyper-Local Crowd-Staking (The Canteen DAO)**
Allow students to crowd-fund campus infrastructure directly.
*   **Scenario:** "We want a new Coffee Machine." Students stake ALGO; funds stream to vendor only when target is met.
*   **Algorand Feature:** **LogicSigs (Smart Signatures)**. The machine has its own wallet that only dispenses coffee to NFT contributors.

---

## 💎 Key Features & Tracks

### 🧘 Track 2: AI & Automation
#### **A. Fitness Arena (Proof of Workout)**
*   **Tech:** **MediaPipe AI** tracks body pose in real-time.
*   **Action:** Counts push-ups via webcam.
*   **Result:** Mints "Strength" metadata to your profile.

#### **B. Commute Pool (Proof of Eco-Travel)**
*   **Tech:** **Gemini AI Vision** + **Geolocation**.
*   **Action:** Verifies you are sharing a ride (bus/carpool) to campus.
*   **Result:** Smart Contract releases payout to driver & mints "Eco" points.
*   **Testnet App ID:** `755297342`

#### **C. Asset Lending (Trustless Borrowing)**
*   **Tech:** **Coco-SSD (TensorFlow)** object detection.
*   **Action:** Verifies item condition upon return (Laptop, Phone).
*   **Result:** Auto-refunds collateral.

### 💰 Track 1: Future of Finance
#### **D. Atomic Marketplace**
*   **Tech:** **Algorand Atomic Transfers**.
*   **Action:** Peer-to-peer trading of campus goods.
*   **Testnet App ID:** `755297353`

#### **E. Hyper-Local Crowd-Staking (The Canteen DAO)**
Allow students to crowd-fund campus infrastructure directly.
*   **Scenario:** "We want a new Coffee Machine." Students stake ALGO; funds stream to vendor only when target is met.
*   **Algorand Feature:** **LogicSigs (Smart Signatures)**. The machine has its own wallet that only dispenses coffee to NFT contributors.

---

## 🏗️ Architecture

```mermaid
graph TD
    User[Student Wallet] -->|Signs Txn| App[CAMPUS VITALITY PROTOCOL]
    
    subgraph "AI Verification Layer"
        App -->|Video Stream| MediaPipe[Fitness AI]
        App -->|Image Upload| Gemini[Commute AI]
        App -->|Object Scan| TensorFlow[Lending AI]
    end
    
    subgraph "Algorand Blockchain (Testnet)"
        MediaPipe -->|Verified Data| SC_Fit[Fitness Contract]
        Gemini -->|Verified Data| SC_Com[Commute Contract]
        TensorFlow -->|Verified Data| SC_Lend[Lending Contract]
        
        SC_Fit -->|Update State| Trust[Trust Score Contract]
        SC_Com -->|Update State| Trust
        SC_Lend -->|Read/Update| Trust
        
        Trust -->|Gatekeeper| SC_Lend
    end
```

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

### 3. Database Setup (MongoDB)
This project uses **MongoDB** for user data and leaderboards.
You can run it easily using **Docker**:
```powershell
docker start miran_mongo
```
*Note: If the container doesn't exist, create it:*
```powershell
docker run -d -p 27017:27017 --name miran_mongo mongo:latest
```

### 3. Run the App
```bash
npm run dev
```
Open **http://localhost:5174** (or the port shown in terminal).

---

## 🧪 How to Test (Demo Flow)

1.  **Commute:** Go to "Commute Arena" -> "Create Student Account" -> "I Need a Ride" -> "Start Trip" -> "Verify Arrival" (Gemini AI).
2.  **Lending:** Go to "Asset Arena" -> "Borrow Item". If your Trust Score is high (simulated), collateral is 0 ALGO!
3.  **Profile:** Go to "Profile" (Sidebar) to see your **Dynamic Identity NFT**.

---

## 📜 Smart Contracts

| Contract | Testnet App ID | Description |
| :--- | :--- | :--- |
| **Trust Score** | `755297339` | Stores User Reputation (Local State). |
| **Commute** | `755297342` | Handles ride escrow & payouts. |
| **Marketplace** | `755297353` | P2P Trading via Atomic Transfers. |

---

### License
MIT
