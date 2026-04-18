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
- Smart Contract: Solidity 0.8.28
- Off-Chain: Node.js API
- Storage: IPFS
- Frontend: Next.js + MetaMask integration
- Tooling: Hardhat 2.22, OpenZeppelin 5.6, TypeChain

## Phases
### Phase 1 (Week 1-2): Setup & Research ✅ COMPLETED
- [x] Install tools (Hardhat, MetaMask, VS Code)
- [x] Scaffold project structure
- [x] Finalize requirements
- [x] Initialize Hardhat with Solidity 0.8.28
- [x] Deploy initial escrow contract skeleton
- [x] Add .gitignore and .env.example

### Phase 2 (Week 3-6): Smart Contract ✅ COMPLETED
- [x] Complete milestone logic (createEscrow, addMilestone, fundEscrow)
- [x] Implement dispute timeout mechanism
- [x] Add freelancer/client approval flow
- [x] Implement dispute resolution with arbitrator
- [x] Deploy to Sepolia testnet
- [x] Write comprehensive contract tests (>90% coverage)

### Phase 3 (Week 7-9): Backend ✅ COMPLETED
- [x] API with Express.js
- [x] Web3 integration for contract calls (read + write operations)
- [x] IPFS file upload for milestone evidence
- [x] Notification system

### Phase 4 (Week 10-12): Frontend
#### Phase 4A: Project Setup & Design System ✅ COMPLETED
- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind with design system colors (slate palette, cyan accents)
- [x] Set up typography (Space Grotesk + Inter fonts)
- [x] Build reusable glass-card, sidebar, and layout components
- [x] Create navigation shell (sidebar + top bar)
- [ ] **Layout bugs pending fix** (see `design/BUFS.md`)

#### Phase 4B: Dashboard & Contracts List ✅ COMPLETED
- [x] Dashboard overview (stats cards: Total Locked, Active Contracts, Pending Milestones)
- [x] Active escrow contracts grid with glass-card style
- [x] "My Contracts" ledger table with filters (All/As Client/As Freelancer)
- [x] Contract row components with role badges and status indicators

#### Phase 4C: Create Escrow & Milestone Management ✅ COMPLETED
- [x] Multi-step escrow creation wizard (Parties → Milestones → Review → Deploy)
- [x] Add/edit/delete milestones with ETH amounts
- [x] Contract detail view with milestone funding
- [x] "Create New" card with + icon placeholder

#### Phase 4D: Milestone Details & Wallet Integration ✅ COMPLETED
- [x] Vertical stepper timeline (Released → In Review → Funded → Unfunded)
- [x] Approve & Pay / Initiate Dispute action buttons
- [x] Evidence links panel with IPFS upload
- [x] MetaMask wallet connection (connect, switch network, sign transactions)

#### Phase 4E: Core Pages ✅ COMPLETED
- [x] /contracts (My Contracts / Ledger) page with filter tabs, metric cards, table, pagination
- [x] /contracts/[id] (Contract Detail) page with milestone timeline, evidence panel, participants
- [x] /create (New Escrow) page with vertical stepper layout, summary card, deploy button
- [ ] /disputes page (TICKET-006 — still missing)

### Phase 5 (Week 13-14): Testing
- [ ] E2E testing
- [ ] Bug fixes
- [ ] Performance optimization

### Phase 6 (Week 15-16): Delivery
- [ ] Documentation (50+ pages)
- [ ] Video demo
- [ ] Presentation

## Success Metrics
✅ Functional: Deployed contract + working UI
✅ Technical: Coverage >90%
✅ Doc: Full report + UML diagrams

## Current Progress
**Phase 4E Complete** — All core frontend pages implemented:
- `/contracts` — Ledger page with filter tabs, metric cards, contract table, pagination
- `/contracts/[id]` — Contract detail with vertical milestone timeline, evidence panel, participants sidebar
- `/create` — New escrow wizard with vertical stepper layout, summary card, deploy button
- Dashboard contract clicks now navigate to `/contracts/[id]`
- Homepage Connect Wallet now redirects to dashboard on connect
- Remaining: `/disputes` page (TICKET-006), layout bugs, mobile responsiveness, design compliance
- Sepolia testnet contract: 0x7b2D41F3A7592c55CB73502ddECf8F84289e9021
