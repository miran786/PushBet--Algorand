# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision
**Campus Vitality Protocol (CVP)** is a decentralized trust layer for student life, built on Algorand and powered by AI. It gamifies and verifies student activities (Fitness, Commute, Lending) to build an on-chain **Reputation Score**. It aims to solve the lack of trust and manual verification in campus systems by using AI as an oracle and blockchain for immutable reputation.

## Goals
1. **Decentralized Reputation**: Create a "Trust Score" (Soulbound Token) based on verified actions.
2. **AI Oracle Layer**: Integrate MediaPipe (Fitness), Gemini Vision (Commute), and Coco-SSD (Lending) for real-world verification.
3. **Algorand Integration**: Use Smart Contracts, Atomic Transfers, and Box Storage for trustless interactions.
4. **Campus Utility**: Enable zero-collateral borrowing and peer-to-peer marketplace based on trust scores.

## Non-Goals (Out of Scope)
- Full mainnet deployment (Hackathon focus is Testnet).
- Complex governance token experiments beyond the "Trust Score".
- Hardware integration beyond standard webcams/phones.

## Constraints
- **Time**: Hackathon submission deadline.
- **Tech**: Must use Algorand Testnet.
- **Platform**: Web-based application (React/Vite).

## Success Criteria
- [x] Fitness feature with MediaPipe implemented.
- [x] Commute Smart Contract deployed and verified (App ID: 755411305).
- [ ] Asset Lending Smart Contract deployed and verified.
- [ ] Trust Score contract linked to all features.
- [ ] Comprehensive system testing completed.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| PyTeal Contracts | Must-have | Trust, Commute, Lending, Marketplace |
| React Frontend | Must-have | Vite, Tailwind, ShadCN UI |
| AI Integration | Must-have | TensorFlow.js, MediaPipe, Google GenAI |
| Wallet Connection | Must-have | Pera, Defly, Kibisis |

---

*Last updated: 2026-02-12*
