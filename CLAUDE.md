# ChainSteps - Project Context

## Project Overview
A decentralized milestone-based escrow system for trustless service contracts on Ethereum.

## Repository
https://github.com/rudrakumar2012/ChainSteps

## Key Files
- `contracts/DecentralizedMilestoneEscrow.sol` - Main smart contract
- `hardhat.config.cjs` - Hardhat configuration
- `test/Escrow.ts` - Contract tests (46 tests)
- `scripts/deploy.ts` - Deployment script
- `backend/` - Express.js API server
- `PLAN.md` - Full project plan

## Tech Stack
- Hardhat 2.22, Solidity 0.8.28, OpenZeppelin 5.6
- Ethereum Sepolia testnet
- Next.js (frontend), Node.js/Express (backend)
- ethers.js v6 for Web3

## Current Phase
Phase 4 (Frontend) COMPLETED — All phases 4A through 4E done. All core pages + mobile responsive + UX fixes done. Remaining: design compliance (018-020), code quality (021-024). Next: Phase 5 (Testing).

## Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css      # Design system (colors, typography)
│   │   ├── layout.tsx      # Root layout with fonts
│   │   ├── page.tsx        # Homepage (landing page)
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Dashboard home (moved from root)
│   │   ├── contracts/
│   │   │   ├── page.tsx    # My Contracts / Ledger page
│   │   │   └── [id]/
│   │   │       └── page.tsx # Contract detail (milestone timeline, evidence)
│   │   ├── create/
│   │   │   └── page.tsx    # New escrow wizard (vertical stepper)
│   │   └── disputes/
│   │       └── page.tsx    # Dispute resolution page
│   ├── components/
│   │   ├── ui/             # GlassCard, Button, StatusBadge, ProgressBar
│   │   ├── layout/         # Sidebar, TopBar, AppShell (with WalletProvider)
│   │   ├── homepage/       # HomeHeader, Hero, FeatureGrid, HowItWorks, TrustIndicators
│   │   ├── dashboard/      # Dashboard, StatsCard
│   │   ├── contracts/      # ContractRow, ContractsGrid, ContractsLedger, ContractDetail, CreateNewCard
│   │   ├── create/         # EscrowWizard, PartiesStep, MilestonesStep, ReviewStep
│   │   ├── milestone/       # MilestoneTimeline
│   │   ├── evidence/        # EvidencePanel
│   │   └── wallet/         # WalletProvider, ConnectButton
│   ├── hooks/              # useWallet
│   └── types/              # Escrow, Milestone, EscrowState, CreateEscrowFormData
```

## Design System
- "The Architectural Ledger" - dark fintech theme
- Surface: #0b1326, Primary: #4cd7f6, Secondary: #4edea3
- Typography: Space Grotesk (headlines), Inter (body)
- See `design/BUFS.md` for layout bugs pending fix

## Backend Structure
```
backend/
├── src/
│   ├── index.ts        # Express server (port 3001)
│   ├── config/         # Environment config
│   ├── routes/         # API routes
│   ├── services/       # Web3, IPFS, notifications
│   └── types/          # TypeScript types
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/escrow/:id` | Get escrow details |
| GET | `/escrow/:id/milestone/:milestoneId` | Get milestone details |
| GET | `/escrow/:id/timeout` | Get approval timeout |
| POST | `/escrow` | Create new escrow |
| POST | `/escrow/:id/milestone` | Add milestone |
| POST | `/escrow/:id/fund` | Fund escrow |
| POST | `/escrow/:id/complete` | Complete milestone |
| POST | `/escrow/:id/approve` | Approve milestone |
| POST | `/escrow/:id/dispute` | Raise dispute |
| POST | `/escrow/:id/resolve` | Resolve dispute |
| POST | `/escrow/:id/evidence` | Upload to IPFS |

## Running Backend
```bash
cd backend && npm install && npm run dev
```

## Deployed Contract
Sepolia testnet: `0x7b2D41F3A7592c55CB73502ddECf8F84289e9021`

## Important Notes
- Hardhat config uses `.cjs` extension (ESM project with CommonJS config)
- OpenZeppelin v5 moved ReentrancyGuard to `utils/ReentrancyGuard.sol`
- Tests use default import: `import pkg from 'hardhat'; const { ethers } = pkg;`
- Use `npx hardhat compile` to compile contracts
- Use `npx hardhat test` to run tests
