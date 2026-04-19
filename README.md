# ChainSteps

Decentralized milestone-based escrow system for trustless service contracts on Ethereum.

## Overview

ChainSteps enables clients and freelancers to create escrow contracts with milestone-based payment verification. Funds are locked on-chain and released incrementally as milestones are completed and approved — no trust required.

## Tech Stack

- **Smart Contract**: Solidity 0.8.28, Hardhat, OpenZeppelin 5.6
- **Blockchain**: Ethereum Sepolia testnet
- **Backend**: Node.js, Express.js, ethers.js v6
- **Frontend**: Next.js, TypeScript, Tailwind CSS, MetaMask

## Deployed Contract

Sepolia testnet: `0xD518149F0b1e50E3486C32A295809a65BFF40DE0`

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- Sepolia testnet ETH

### Smart Contract
```bash
npm install
npx hardhat compile
npx hardhat test
```

### Backend
```bash
cd backend && npm install && npm run dev
```

### Frontend
```bash
cd frontend && npm install && npm run dev
```

## Project Structure

```
├── contracts/          # Solidity smart contract
├── test/               # Contract tests (52 tests)
├── scripts/            # Deployment script
├── backend/            # Express.js API server (read-only + IPFS upload)
│   └── src/
│       ├── routes/     # API endpoints
│       ├── services/   # Web3 (reads), IPFS (Pinata)
│       └── types/      # TypeScript types
├── frontend/           # Next.js dApp
│   └── src/
│       ├── app/        # Pages (dashboard, contracts, create, disputes)
│       ├── components/ # UI components
│       ├── hooks/      # React hooks (useWallet)
│       ├── lib/        # Contract client, API client, ABI
│       └── types/      # TypeScript types
└── design/             # Design reference files
```

## License

MIT