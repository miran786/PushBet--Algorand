# Phase 6 Research: AI-Governed Marketplace

## Vision
A limitless, AI-governed marketplace where students describe any need (e.g. "find my lost keys", "need 2024 notes"), and Gemini AI dynamically builds the smart contract terms and verifies proof before Algorand automatically releases payment.

## Current State Analysis

### Existing Marketplace (`Marketplace.tsx` — 525 lines)
- Traditional NFT buy/sell model with fixed item listings
- Gemini AI used only for price negotiation chat
- MintAndList → Buy → Delist flow via Algorand smart contract boxes
- Mock data fallback when no real listings exist
- App ID: 755412952 (deployed marketplace_contract)

### Existing Smart Contract (`marketplace_contract.py`)
- PyTEAL-based, version 8 (box storage)
- Operations: list (asset → app), buy (payment → seller, asset → buyer), delist
- Box layout: [Seller 32 bytes][Price 8 bytes]

### What Needs to Change
The current model is a **product marketplace** (list item → buy item). The new model is a **need-based marketplace** where:
1. A student **posts a need** (text description, reward amount)
2. Another student **accepts** the need and provides proof
3. Gemini AI **verifies** the proof matches the need
4. Smart contract **releases payment** automatically

## Architecture Decision

### Approach: Backend-Mediated AI Verification
- **Frontend**: Chat-based UI where students describe needs and submit proof
- **Backend**: New `/api/marketplace` routes to store needs in MongoDB  
- **AI Layer**: Gemini verifies proof images/descriptions against original need
- **Smart Contract**: Escrow pattern — requester locks ALGO, AI verification triggers release
- **No new PyTEAL contract needed**: Reuse the existing escrow pattern from asset lending, or use simple payment transactions with backend-mediated AI approval

### Why Not Fully On-Chain AI?
- Gemini API calls can't happen on-chain
- The AI verification is the "oracle" — it runs server-side and triggers payout
- This is the standard pattern for AI+blockchain (oracle model)

## Key Decisions
1. **MongoDB for state** — store needs, claims, messages in MongoDB
2. **Payment via Algorand** — escrow ALGO via payment txn to backend-controlled address, release on AI verification
3. **Gemini for proof verification** — analyze submitted photos/descriptions against original need
4. **Chat-first UX** — student types what they need, AI helps clarify, creates the "contract"

## Risk Assessment
- LOW: UI rewrite (known patterns)
- LOW: Backend routes (Express + MongoDB, established patterns)
- MEDIUM: AI proof verification accuracy (mitigate with confidence thresholds)
- LOW: Algorand payment (simple payment txns, no complex TEAL needed)
