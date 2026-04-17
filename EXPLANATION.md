# ChainSteps — Decentralized Milestone-Based Escrow

> A plain-language guide for developers, product professionals, and educators approaching this project for the first time.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Why Does It Exist?](#2-why-does-it-exist)
3. [How It Works: The Step-by-Step Flow](#3-how-it-works-the-step-by-step-flow)
4. [A Real-World Example](#4-a-real-world-example)
5. [The Contract States](#5-the-contract-states)
6. [Handling Disputes](#6-handling-disputes)
7. [Key Design Decisions](#7-key-design-decisions)
8. [For Developers](#8-for-developers)
9. [For Product Professionals](#9-for-product-professionals)
10. [For Educators](#10-for-educators)

---

## 1. What Is This Project?

ChainSteps is a **smart-contract-powered escrow system** for service contracts. It allows a client to hire a freelancer (or contractor), break the work into milestones, lock payment in advance, and release it only as each milestone is completed and approved — all without needing to trust either party.

Think of it as **PayPal milestone payments, but running on Ethereum** — no company in the middle, just code.

---

## 2. Why Does It Exist

### The Core Problem in Freelance/Service Work

Traditional service contracts have a fundamental trust gap:

```
Client's fear:  "I'll pay, then the freelancer will disappear."
Freelancer's fear: "I'll do the work, then the client will ghost me."
```

Existing solutions (PayPal, Upwork escrow, etc.) solve this by acting as a **trusted intermediary**. They hold the money and release it when both parties agree. But that means:
- They take fees (3–10%)
- They can freeze accounts
- You depend on their rules and dispute process
- They can be slow, opaque, or biased

ChainSteps replaces the intermediary with **code running on Ethereum**. The contract enforces the rules automatically. No company can freeze your escrow. The terms are transparent and immutable.

### What Makes It Different from a Simple Token Escrow?

You mentioned you've done token-buying escrow before. That's a useful comparison:

| | Token Swap Escrow | ChainSteps Escrow |
|---|---|---|
| **Purpose** | Atomic swap: fiat → tokens | Ongoing service: work → payment over time |
| **Releases** | One step, all at once | Multiple steps, milestone by milestone |
| **Verification** | On-chain (token balances are visible to the blockchain) | Off-chain (humans decide if the work is done) |
| **Trust model** | Blockchain verifies balances automatically | Smart contract only moves money; humans verify work |
| **Duration** | Minutes | Days or weeks |

The critical insight: **the blockchain can't see your work.** If you hire someone to "build a website," the blockchain has no way to know if the HTML is good or bad. ChainSteps bridges this gap by having humans (client + arbitrator) verify work off-chain, while the smart contract handles the money movement.

---

## 3. How It Works: The Step-by-Step Flow

### Parties Involved

| Role | What they do |
|---|---|
| **Client** | Creates the escrow, defines milestones, funds it, approves completed work |
| **Freelancer** | Does the work, marks milestones complete, can claim auto-release after timeout, raises disputes |
| **Arbitrator** | Steps in when there's a dispute; splits the milestone funds between client and freelancer |

---

### The Lifecycle of One Milestone

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE ESCROW                                                │
│                                                                     │
│  Client calls createEscrow(freelancerAddress, arbitratorAddress)    │
│                                                                     │
│  - Escrow is created with a "Created" state                         │
│  - No money is in it yet                                            │
│  - Milestones haven't been added yet                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: ADD MILESTONES                                               │
│                                                                     │
│  Client calls addMilestone(escrowId, "Build homepage", 0.5 ETH)     │
│              addMilestone(escrowId, "Build API",     1.0 ETH)       │
│              addMilestone(escrowId, "Deploy to prod", 0.5 ETH)      │
│                                                                     │
│  - Each milestone has a description and an ETH amount               │
│  - Total = 2.0 ETH                                                  │
│  - Escrow is still in "Created" state                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: FUND ESCROW                                                  │
│                                                                     │
│  Client sends 2.0 ETH to fundEscrow(escrowId)                       │
│                                                                     │
│  - The ETH sits in the smart contract, locked                        │
│  - Escrow state changes: Created → Active                           │
│  - Nobody can touch this money except via contract rules            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: FREELANCER COMPLETES THE WORK                               │
│                                                                     │
│  Freelancer finishes "Build homepage"                               │
│  Freelancer calls completeMilestone(escrowId)                       │
│                                                                     │
│  - Milestone is marked as "submitted"                                │
│  - A 7-day countdown starts (dispute timeout)                       │
│  - Client now has 7 days to review and approve                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
              ┌──────────────┴──────────────┐
              ↓                              ↓
┌─────────────────────────┐    ┌─────────────────────────┐
│ SCENARIO A: CLIENT      │    │ SCENARIO B: CLIENT      │
│ APPROVES                │    │ GHOSTS / IGNORES        │
│                         │    │                         │
│ Client calls            │    │ 7 days pass             │
│ approveMilestone()      │    │                         │
│                         │    │ Freelancer calls        │
│ → 0.5 ETH sent to       │    │ claimMilestone()        │
│   freelancer instantly  │    │                         │
│                         │    │ → 0.5 ETH auto-released │
│ Move to next milestone  │    │   to freelancer          │
└─────────────────────────┘    └─────────────────────────┘
              ↓                              ↓
              └──────────────┬──────────────┘
                             ↓
              ┌─────────────────────────────┐
              │ SCENARIO C: DISPUTE         │
              │                             │
              │ If work is contested:       │
              │   Freelancer calls          │
              │   raiseDispute(escrowId)    │
              │   Escrow state → Disputed   │
              │                             │
              │ Arbitrator reviews evidence │
              │ (IPFS files, messages)     │
              │                             │
              │ Arbitrator calls            │
              │ resolveDispute(escrowId,    │
              │   clientPercent)            │
              │                             │
              │ e.g. clientPercent = 40     │
              │ → Client gets 40% back      │
              │ → Freelancer gets 60%       │
              │ Escrow state → Active       │
              └─────────────────────────────┘
```

---

## 4. A Real-World Example

### Scenario: Hiring a Web Developer

**You** (Client) want to hire **Alex** (Freelancer) to build a website for **3 ETH total**.

You break it into three milestones:

| Milestone | Work Description | Payment |
|---|---|---|
| 1 | Homepage design mockup | 0.5 ETH |
| 2 | Build all pages (frontend + backend) | 2.0 ETH |
| 3 | Deploy to production | 0.5 ETH |

**Week 1:**
- You create the escrow with Alex's address and your own address as arbitrator (or a mutually agreed third party)
- You add the 3 milestones
- You fund 3.0 ETH into the contract

**Week 2:** Alex delivers the homepage mockup. You review it. You're happy. You approve → Alex gets 0.5 ETH immediately.

**Week 3:** Alex builds the full app. You review it and approve → Alex gets 2.0 ETH immediately.

**Week 4:** Alex deploys. You check the live site, approve → Alex gets the final 0.5 ETH.

**All done. Escrow state = Completed. Total: 3 ETH paid, all milestones verified.**

### The Ghosting Scenario

Same as above, but after milestone 2, you disappear and stop responding.

- Alex submits milestone 3 work via `completeMilestone()`
- You have 7 days to approve
- You don't respond
- After 7 days, Alex calls `claimMilestone()` → final 0.5 ETH auto-releases to Alex

Alex isn't dependent on your goodwill to get paid.

### The Dispute Scenario

Same as above, but after milestone 2, you receive the work but say "it's low quality, I'm not paying."

- Alex calls `raiseDispute()` — state becomes Disputed
- Both of you upload evidence to IPFS (screenshots, messages, code commits)
- You as arbitrator review and decide: "Client's concerns are partially valid. Split 60/40."
- You call `resolveDispute(escrowId, 40)` — 40% goes to client, 60% to freelancer
- Escrow returns to Active state (or Completed if it was the last milestone)

---

## 5. The Contract States

```
┌──────────┐   fundEscrow()    ┌─────────┐
│ Created  │ ───────────────→ │  Active │
└──────────┘                   └────┬────┘
                                     │
          ┌──────────────┐           │
          │              │           │ raiseDispute()
          ↓              │           ↓
    ┌───────────┐         │     ┌───────────┐
    │ Completed │         │     │ Disputed  │
    └───────────┘         │     └─────┬─────┘
                           │           │
                           │  resolveDispute() → Active (or Completed)
                           │
cancelEscrow() (only       │  (if last milestone: Completed)
before funding)
```

| State | Meaning |
|---|---|
| **Created** | Escrow exists, milestones defined, but not funded yet |
| **Active** | Funded and in progress; milestones can be completed and approved |
| **Disputed** | A milestone was contested; arbitrator must resolve |
| **Completed** | All milestones done; all funds released |
| **Cancelled** | Client cancelled before funding; escrow is dead |

---

## 6. Handling Disputes

The dispute system is the most nuanced part of the contract. Here's how it works:

1. **Who can raise a dispute?** Only the freelancer, and only on the current (incomplete) milestone.
2. **What triggers a dispute?** The freelancer submits work (`completeMilestone()`), but the client refuses to approve without a valid reason — or the client is unresponsive and the freelancer believes the work was done correctly.
3. **What does the arbitrator do?** They review off-chain evidence (IPFS-hosted files, messages, screenshots) submitted by both parties.
4. **What can the arbitrator decide?** They call `resolveDispute(escrowId, clientPercent)` where `clientPercent` is 0–100:
   - `clientPercent = 0` → all funds to freelancer
   - `clientPercent = 100` → all funds back to client
   - `clientPercent = 40` → 40% client, 60% freelancer

**Note on evidence:** The contract itself doesn't store evidence on-chain (too expensive). The backend uploads files to IPFS and stores the IPFS hash, which both parties can reference in a dispute.

---

## 7. Key Design Decisions

### 7.1 Client Funds First

The client must fund the escrow before any work begins. This means:
- The freelancer knows the money is there (no "I'll pay you later" risk)
- The smart contract holds it, so the client can't rug the freelancer

### 7.2 No Direct Client Cancel After Funding

Once the escrow is funded, the client cannot unilaterally cancel and reclaim funds. This protects the freelancer. The only ways to exit a funded escrow are:
- All milestones approved → Completed
- Dispute raised and resolved → funds split
- (The contract doesn't support a mutual cancel, though this could be added)

### 7.3 Auto-Release After 7 Days (No Ghosting)

If the freelancer submits work and the client goes silent, the freelancer can claim the funds after 7 days via `claimMilestone()`. This prevents clients from holding work hostage by simply not responding.

### 7.4 Arbitrator is Configurable

When creating an escrow, the client specifies an arbitrator. This could be:
- The client themselves (for trust-based small jobs)
- A mutually agreed third party
- A professional dispute resolution service

### 7.5 One Milestone Active at a Time

Only the current milestone (index `currentMilestone`) can be in progress. The next milestone can't start until the previous one is approved or claimed. This keeps the flow sequential and clear.

---

## 8. For Developers

### Smart Contract Architecture

The contract (`contracts/DecentralizedMilestoneEscrow.sol`) is a single, self-contained Solidity contract using:

- **Solidity 0.8.28** — modern, with built-in overflow/underflow protection
- **OpenZeppelin ReentrancyGuard** — prevents reentrancy attacks on `approveMilestone`, `claimMilestone`, and `resolveDispute`
- **No external dependencies** — no price oracles, no Chainlink, no external token integrations

### Key Contract Functions

| Function | Who Calls It | What It Does |
|---|---|---|
| `createEscrow()` | Client | Creates new escrow |
| `addMilestone()` | Client | Adds a milestone |
| `fundEscrow()` | Client (sends ETH) | Funds escrow, activates it |
| `completeMilestone()` | Freelancer | Submits current milestone work |
| `approveMilestone()` | Client | Releases milestone funds to freelancer |
| `claimMilestone()` | Freelancer | Auto-claims after 7-day timeout |
| `raiseDispute()` | Freelancer | Puts escrow into Disputed state |
| `resolveDispute()` | Arbitrator | Splits funds and resumes escrow |

### State Variables (On-Chain)

```
Escrow[] public escrows
  - client: address
  - freelancer: address
  - milestones: Milestone[]  (array)
  - state: enum (Created/Active/Disputed/Completed/Cancelled)
  - currentMilestone: uint256
  - disputeTimeout: uint256
  - arbitrator: address
  - totalAmount: uint256
```

### IPFS Integration (Off-Chain)

Evidence files (screenshots, documents) are stored on IPFS via the backend API (`POST /escrow/:id/evidence`). The IPFS hash is stored off-chain in the backend database — the contract only receives ETH, not files.

### Deployment

- **Network:** Ethereum Sepolia testnet
- **Contract address:** `0x7b2D41F3A7592c55CB73502ddECf8F84289e9021`
- **Deploy script:** `scripts/deploy.ts`

### Testing

Tests are in `test/Escrow.ts` (46 tests) covering happy paths and edge cases for all major functions.

### Backend API

The Express.js backend (port 3001) wraps contract calls and provides off-chain storage/IPFS:

```
GET  /escrow/:id
GET  /escrow/:id/milestone/:milestoneId
POST /escrow                    (create)
POST /escrow/:id/fund           (fund)
POST /escrow/:id/complete       (completeMilestone)
POST /escrow/:id/approve        (approveMilestone)
POST /escrow/:id/dispute        (raiseDispute)
POST /escrow/:id/resolve        (resolveDispute)
POST /escrow/:id/evidence       (IPFS upload)
```

### Frontend

Next.js frontend with MetaMask wallet integration. Key flows:
- **Dashboard:** View all escrows, stats (total locked, active contracts, pending milestones)
- **Create Escrow Wizard:** 3-step wizard (Parties → Milestones → Review → Deploy)
- **Contract Detail:** Milestone timeline, approve/pay buttons, dispute buttons
- **Wallet:** MetaMask connect, network switch to Sepolia, transaction signing

---

## 9. For Product Professionals

### Target Use Cases

1. **Freelance service contracts** — Design, development, writing, consulting
2. **Agency-client relationships** — Longer-term projects with phased delivery
3. **Team collaborations** — When trust is lower and an intermediary is desired but traditional escrow is too expensive or slow

### Cost Model

- **On-chain costs:** One transaction per action (create, fund, complete, approve, dispute, resolve). On Sepolia testnet these are near-zero; on mainnet, gas costs would be ~50k–200k gas per transaction, which at 20 gwei is roughly $0.05–$0.50 per action.
- **Backend costs:** IPFS storage (pinned files, ~$0.005–$0.02 per file), node hosting (Express server)
- **Target:** ≤ $0.10 per milestone, as stated in the project goals

### Comparison to Alternatives

| Feature | ChainSteps | PayPal | Upwork |
|---|---|---|---|
| Fees | ~$0.10/milestone (gas only) | 3–5% + fixed | 10% |
| Trustless | Yes (smart contract) | No (PayPal holds funds) | Partial (Upwork holds) |
| Auto-release on timeout | Yes (7 days) | No | No |
| Dispute resolution | On-chain, programmable | Dispute center | Mediation |
| Cancel after funding | No (only dispute) | Yes (buyer protection) | Partial |

### Known Limitations

1. **Sequential milestones only** — next milestone can't start until the previous is approved. Parallel work streams would require separate escrows.
2. **No mutual cancellation** — once funded, client can't cancel unilaterally. Both parties must wait for the dispute process or complete all milestones.
3. **No partial releases** — a milestone is all-or-nothing. If a milestone has $1000 allocated, the entire $1000 goes to the freelancer on approval.
4. **Arbitrator trust** — the system trusts the arbitrator to be fair. If the arbitrator is colluding with one party, the other party has no on-chain recourse.

---

## 10. For Educators

### Teaching Blockchain/Solidity with ChainSteps

ChainSteps is an excellent capstone project for a Solidity course because it touches on many real-world concepts in a self-contained way:

#### Topics Covered

| Topic | Where It Appears |
|---|---|
| **Smart contract basics** | Single file, clear state machine |
| **Contract state management** | `enum State { Created, Active, ... }` |
| **Access control** | `onlyClient`, `onlyFreelancer`, `onlyArbitrator` modifiers |
| **Reentrancy protection** | OpenZeppelin's `ReentrancyGuard` on fund-release functions |
| **Events and indexing** | All state changes emit events for off-chain indexing |
| **Function modifiers** | `onlyClient`, `inState` for clean access control |
| **Payable functions** | `fundEscrow` receives ETH; `approveMilestone` sends ETH |
| **Arrays and structs** | `Escrow[]`, `Milestone` structs |
| **External calls and value transfer** | `payable(escrow.freelancer).transfer(amount)` |
| **Time-based logic** | `block.timestamp` + `DISPUTE_TIMEOUT = 7 days` |
| **Off-chain computation vs on-chain** | Dispute evidence stored in IPFS, not on-chain |
| **Multi-party contracts** | Client, freelancer, arbitrator with different permissions |

#### Suggested Learning Path

1. **Week 1–2:** Understand the problem — "How do you get two strangers to trust each other in a contract?" Discuss PayPal escrow, Upwork escrow, their fees and failure modes.
2. **Week 3–4:** Build a simple single-milestone escrow (fund, release, refund). This is the token-swap escrow model the project author was familiar with.
3. **Week 5:** Extend to multi-milestone — why is it harder? What can the contract verify vs not?
4. **Week 6–7:** Add dispute logic. Discuss arbitration, evidence, how to split funds fairly.
5. **Week 8:** Add timing logic (7-day timeout, auto-release).
6. **Week 9–10:** Build the backend (Express API wrapping contract calls, IPFS integration).
7. **Week 11–12:** Build the frontend (React + MetaMask).
8. **Week 13–14:** Testing and refinement.

#### Discussion Questions for Students

- Why does the client have to fund first? What happens if the freelancer funds instead?
- The contract has no way to verify if work is "good." How does it handle low-quality work?
- Why 7 days for the dispute timeout? What if it's too short? Too long?
- If the arbitrator is malicious, what can they do? What are the mitigations?
- Could this contract be upgraded? What would upgrading it mean for trust?

#### Code Complexity

- Contract: ~250 lines, single file, no external dependencies beyond OpenZeppelin
- Tests: 46 tests covering all functions and edge cases
- Backend: ~500 lines TypeScript, standard Express patterns
- Frontend: ~1500 lines React/TypeScript, standard component patterns

The contract itself is intentionally simple — it does one thing (escrow with milestones) and does it in a single file. This makes it easy to audit, easy to understand, and easy to extend.
