# Decentralized Milestone-Based Escrow System

## Project Vision
* Trustless escrow for service contracts
* Milestone verification mechanism
* On-chain/off-chain dispute resolution
* Scalable with ≤$0.10 per milestone
* User-friendly web UI

## High-Level Architecture
```
+-------------------+       +---------------------------+       +-------------------+
|   Front-End UI    | <---> |  API/Off-Chain Service  | <---> |  Smart-Contract   |
| (React/Flutter)  |       |  (Node.js/Go)          |       |  (Solidity/EVM)    |
+-------------------+       +---------------------------+       +-------------------+
                               ^            ^
                               |            |
         IPFS/Filecoin       Chainlink/Oracles
```

## Technology Stack
- Blockchain: Ethereum + Sepolia (testnet)
- Smart Contract: Solidity 0.8.x
- Off-Chain: Node.js API
- Storage: IPFS
- Frontend: React + MetaMask integration

## Phases
### Phase 1 (Week 1-2): Setup & Research
- Install tools (Hardhat, MetaMask, VS Code)
- Scaffold project structure
- Finalize requirements

### Phase 2 (Week 3-6): Smart Contract
- Implement escrow contract
- Milestone milestone logic
- Dispute timeout mechanism
- Sepolia deployment

### Phase 3 (Week 7-9): Backend
- API with Express.js
- Web3 integration
- IPFS file upload

### Phase 4 (Week 10-12): Frontend
- React UI components
- Wallet connection
- Contract dashboard

### Phase 5 (Week 13-14): Testing
- E2E testing
- Bug fixes
- Performance optimization

### Phase 6 (Week 15-16): Delivery
- Documentation (50+ pages)
- Video demo
- Presentation

## Success Metrics
✅ Functional: Deployed contract + working UI
✅ Technical: Coverage >90%
✅ Doc: Full report + UML diagrams