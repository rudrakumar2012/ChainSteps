# ChainSteps - Project Context

## Project Overview
A decentralized milestone-based escrow system for trustless service contracts on Ethereum.

## Repository
https://github.com/rudrakumar2012/ChainSteps

## Key Files
- `contracts/DecentralizedMilestoneEscrow.sol` - Main smart contract
- `hardhat.config.cjs` - Hardhat configuration
- `test/Escrow.ts` - Contract tests (52 tests)
- `scripts/deploy.ts` - Deployment script (replaces CONTRACT_ADDRESS in .env.local)
- `backend/` - Express.js API server
- `EXPLANATION.md` - Project explanation (for submission/report)

## Tech Stack
- Hardhat 2.22, Solidity 0.8.28, OpenZeppelin 5.6
- Ethereum Sepolia testnet
- Next.js (frontend), Node.js/Express (backend)
- ethers.js v6 for Web3

## Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css      # Design system (colors, typography)
│   │   ├── layout.tsx      # Root layout with fonts
│   │   ├── page.tsx        # Homepage (landing page)
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Dashboard home
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
│   │   ├── homepage/       # HomeHeader, Hero, FeatureGrid, HowItWorks, TrustIndicators, BlockchainCube, HomepageStatsProvider
│   │   ├── dashboard/      # Dashboard, StatsCard
│   │   ├── contracts/      # ContractRow, ContractsGrid, ContractsLedger, ContractDetail, CreateNewCard
│   │   ├── create/         # EscrowWizard, PartiesStep, MilestonesStep, ReviewStep
│   │   ├── milestone/       # MilestoneTimeline
│   │   ├── evidence/        # EvidencePanel
│   │   ├── tx/             # TransactionProvider, TransactionToast, ToastContainer
│   │   └── wallet/         # WalletProvider, ConnectButton
│   ├── hooks/              # useWallet, useEscrows, useEscrowDetail, useDashboard, useHomepageStats
│   ├── lib/                # provider.ts, contract.ts (TxHandle), api.ts, abi.json, utils.ts
│   └── types/              # Escrow, Milestone, EscrowState, TransactionStatus, Dispute
```

## Design System
- "The Architectural Ledger" - dark fintech theme
- Surface: #0b1326, Primary: #4cd7f6, Secondary: #4edea3
- Typography: Space Grotesk (headlines), Inter (body)

## Backend Structure
```
backend/
├── src/
│   ├── index.ts        # Express server (port 3001)
│   ├── config/         # Environment config
│   ├── routes/         # API routes (write endpoints return 410 Gone, only reads + evidence upload active)
│   ├── services/       # Web3 (reads), IPFS (Pinata), notifications
│   └── types/          # TypeScript types
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/escrow` | List all escrows (optional `?address=` filter) |
| GET | `/escrow/:id` | Get escrow details |
| GET | `/escrow/:id/milestone/:milestoneId` | Get milestone details |
| GET | `/escrow/:id/milestones` | Get all milestones for an escrow |
| GET | `/escrow/:id/timeout` | Get approval timeout |
| POST | `/escrow/:id/evidence` | Upload to IPFS (Pinata) |

All other POST endpoints return 410 Gone — frontend uses MetaMask directly.

## Running Backend
```bash
cd backend && npm install && npm run dev
```

## Deployed Contract
Sepolia testnet: `0xD518149F0b1e50E3486C32A295809a65BFF40DE0`

## Important Notes
- Hardhat config uses `.cjs` extension (ESM project with CommonJS config)
- OpenZeppelin v5 moved ReentrancyGuard to `utils/ReentrancyGuard.sol`
- Tests use default import: `import pkg from 'hardhat'; const { ethers } = pkg;`
- Use `npx hardhat compile` to compile contracts
- Use `npx hardhat test` to run tests (52 tests)
- IPFS uploads require `PINATA_JWT` in backend `.env`