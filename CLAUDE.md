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
- `PLAN.md` - Full project plan

## Tech Stack
- Hardhat 2.22, Solidity 0.8.28, OpenZeppelin 5.6
- Ethereum Sepolia testnet
- Next.js (frontend), Node.js (backend) - planned

## Current Phase
Phase 2 complete. Next: Phase 3 (Backend).

## Deployed Contract
Sepolia testnet: `0x7b2D41F3A7592c55CB73502ddECf8F84289e9021`

## Important Notes
- Hardhat config uses `.cjs` extension (ESM project with CommonJS config)
- OpenZeppelin v5 moved ReentrancyGuard to `utils/ReentrancyGuard.sol`
- Tests use default import: `import pkg from "hardhat"; const { ethers } = pkg;`
- Use `npx hardhat compile` to compile contracts
- Use `npx hardhat test` to run tests
