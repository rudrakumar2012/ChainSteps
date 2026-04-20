# ChainSteps — Decentralized Milestone-Based Escrow

> A plain-language guide for developers, product professionals, and educators.

---

## What Is This Project?

ChainSteps is a **smart-contract-powered escrow system** for service contracts. A client hires a freelancer, defines milestones, locks payment in advance, and releases it as each milestone is completed and approved — all without trusting either party.

Think of it as **PayPal milestone payments, but running on Ethereum** — no company in the middle, just code.

---

## The Step-by-Step Flow

### Parties

| Role | What they do |
|---|---|
| **Client** | Creates the escrow, defines milestones, funds it, approves completed work |
| **Freelancer** | Does the work, marks milestones complete, can claim auto-release after timeout, raises disputes |
| **Arbitrator** | Resolves disputes by splitting milestone funds between client and freelancer |

### Lifecycle

1. **Create** — Client calls `createEscrow(freelancer, arbitrator)`. Arbitrator is **required** and cannot be the client or freelancer.
2. **Add Milestones** — Client adds milestones with descriptions and ETH amounts.
3. **Fund** — Client sends ETH to lock in the contract. State changes from Created → Active.
4. **Complete** — Freelancer marks the current milestone as done. A 7-day approval timer starts.
5. **Approve or Claim** — Client approves (funds released immediately), or freelancer can claim after 7 days if client ghosts.
6. **Repeat** — Next milestone becomes active. When all are done, escrow is Completed.

### Dispute Flow

Either party can raise a dispute on the current milestone after completion:

1. **Raise dispute** — Requires a **0.001 ETH bond** (discourages frivolous disputes). State changes to Disputed.
2. **Evidence period** — 24-hour minimum before the arbitrator can resolve. Both parties submit evidence off-chain (IPFS).
3. **Resolve** — Arbitrator calls `resolveDispute(escrowId, clientPercent)`. Bond goes to the winning party (client if `clientPercent > 50`, freelancer otherwise).
4. **Expire** — If the arbitrator doesn't act within **30 days**, anyone can call `expireDispute` to release funds and bond to the freelancer.

---

## Contract States

| State | Meaning |
|---|---|
| **Created** | Escrow exists, milestones defined, not funded yet |
| **Active** | Funded and in progress |
| **Disputed** | A milestone was contested; arbitrator must resolve |
| **Completed** | All milestones done; all funds released |
| **Cancelled** | Client cancelled before funding |

---

## Security Features

| Feature | Why |
|---|---|
| Required arbitrator | Prevents client from being their own judge |
| Dispute bond (0.001 ETH) | Discourages bad-faith disputes |
| 24-hour evidence period | Gives both parties time to present evidence before resolution |
| 30-day dispute expiry | Prevents funds from being locked forever if arbitrator is inactive |
| 7-day auto-claim | Freelancer can claim payment if client ghosts after milestone completion |
| No client cancel after funding | Protects freelancer from unilateral withdrawal |

---

## Key Contract Functions

| Function | Who Calls It | What It Does |
|---|---|---|
| `createEscrow()` | Client | Creates new escrow (requires valid arbitrator) |
| `addMilestone()` | Client | Adds a milestone |
| `fundEscrow()` | Client (sends ETH) | Funds escrow, activates it |
| `completeMilestone()` | Freelancer | Submits current milestone work |
| `approveMilestone()` | Client | Releases milestone funds to freelancer |
| `claimMilestone()` | Freelancer | Auto-claims after 7-day timeout |
| `raiseDispute()` | Client or Freelancer | Disputes milestone (requires 0.001 ETH bond) |
| `resolveDispute()` | Arbitrator | Splits funds (after 24h evidence period) |
| `expireDispute()` | Anyone | Releases funds to freelancer after 30 days of arbitrator inaction |

---

## For Developers

- Contract: ~320 lines, Solidity 0.8.28, OpenZeppelin ReentrancyGuard
- Tests: 70 tests covering all functions and edge cases
- Backend: Express.js (port 3001), read-only + IPFS uploads
- Frontend: Next.js with MetaMask wallet integration

---

## For Product Professionals

| Feature | ChainSteps | PayPal | Upwork |
|---|---|---|---|
| Fees | ~$0.10/milestone (gas) | 3–5% + fixed | 10% |
| Trustless | Yes (smart contract) | No | Partial |
| Auto-release on timeout | Yes (7 days) | No | No |
| Dispute resolution | On-chain, 24h evidence period | Dispute center | Mediation |
| Arbitrator inactivity | 30-day auto-expiry | N/A | N/A |
| Dispute bond | 0.001 ETH | No | No |