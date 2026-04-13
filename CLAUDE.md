# ChainSteps - Project Context

## Project Overview
A decentralized milestone-based escrow system for trustless service contracts on Ethereum.

## Repository
https://github.com/rudrakumar2012/ChainSteps

## Key Files
- `contracts/DecentralizedMilestoneEscrow.sol` - Main smart contract
- `hardhat.config.cjs` - Hardhat configuration
- `test/Escrow.ts` - Contract tests
- `PLAN.md` - Full project plan

## Tech Stack
- Hardhat 2.22, Solidity 0.8.28, OpenZeppelin 5.6
- Ethereum Sepolia testnet
- React (frontend), Node.js (backend) - planned

## Current Phase
Phase 1 complete. Next: Phase 2 (Smart Contract development).

## Important Notes
- Hardhat config uses `.cjs` extension (ESM project with CommonJS config)
- OpenZeppelin v5 moved ReentrancyGuard to `utils/ReentrancyGuard.sol`
- Tests use default import: `import pkg from "hardhat"; const { ethers } = pkg;`
- Use `npx hardhat compile` to compile contracts
- Use `npx hardhat test` to run tests
