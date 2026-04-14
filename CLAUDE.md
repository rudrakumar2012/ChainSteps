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
Phase 3 (Backend) - Part A complete. Next: Phase 3 Part B.

## Backend Structure
```
backend/
├── src/
│   ├── index.ts        # Express server (port 3001)
│   ├── config/         # Environment config
│   ├── routes/         # API routes
│   ├── services/       # Web3 service
│   └── types/          # TypeScript types
```

## API Endpoints (GET - read operations)
| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /escrow/:id` | Get escrow details |
| `GET /escrow/:id/milestone/:milestoneId` | Get milestone details |
| `GET /escrow/:id/timeout` | Get remaining approval timeout |

## Running Backend
```bash
cd backend && npm install && npm run dev
```

## Deployed Contract
Sepolia testnet: `0x7b2D41F3A7592c55CB73502ddECf8F84289e9021`

## Important Notes
- Hardhat config uses `.cjs` extension (ESM project with CommonJS config)
- OpenZeppelin v5 moved ReentrancyGuard to `utils/ReentrancyGuard.sol`
- Tests use default import: `import pkg from "hardhat"; const { ethers } = pkg;`
- Use `npx hardhat compile` to compile contracts
- Use `npx hardhat test` to run tests
