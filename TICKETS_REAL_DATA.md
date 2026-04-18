# Real Data Integration — Phased Tickets

Each phase = one commit checkpoint. Phases build sequentially.

---

## Phase 1: Foundation — Types, Contract Client, API Client ✅ DONE

### TICKET-RD-01: Update frontend types for real data ✅
**Files:** `frontend/src/types/index.ts`
- Add `ContractEscrow` type matching raw contract response (disputeTimeout, arbitrator fields)
- Add `TransactionStatus` type (`idle | pending | confirmed | failed` + txHash)
- Add `Dispute` type derived from disputed escrows
- Add `cancelEscrow` / `claimMilestone` to `CreateEscrowFormData`-related action types
- Keep existing types backward-compatible (pages still use mock data until Phase 3)

### TICKET-RD-02: Create contract client layer ✅
**Files:** `frontend/src/lib/provider.ts`, `frontend/src/lib/contract.ts`
- `provider.ts` — Get ethers `BrowserProvider` from `window.ethereum`, memoized singleton
- `contract.ts` — Load ABI from compiled artifacts (copy minimal ABI JSON to `frontend/src/lib/abi.json`), create typed read/write helpers wrapping the contract instance at the deployed address
- Export: `getReadContract()`, `getWriteContract()`, `CONTRACT_ADDRESS`
- Export typed wrappers: `fetchEscrow(id)`, `fetchMilestone(escrowId, index)`, `fetchMilestoneCount(escrowId)`

### TICKET-RD-03: Create backend API client ✅
**File:** `frontend/src/lib/api.ts`
- Simple fetch wrapper with base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)
- Typed response helpers for: `uploadEvidence()`, `healthCheck()`
- Error handling with typed error responses

---

## Phase 2: Data Layer — Hooks + Backend Endpoints ✅ DONE

### TICKET-RD-04: Create data hooks ✅
**Files:** `frontend/src/hooks/useEscrows.ts`, `frontend/src/hooks/useEscrowDetail.ts`, `frontend/src/hooks/useDashboard.ts`
- `useEscrows(address?)` — Fetch all escrows by iterating `escrowCreators` mapping + `getEscrow`. Loading/error states, auto-refresh on new blocks.
- `useEscrowDetail(id)` — Fetch escrow + all milestones in parallel. Loading/error states.
- `useDashboard(address?)` — Aggregate stats from escrow list (totalLocked, activeCount, pendingMilestones).
- All hooks return `{ data, loading, error, refetch }`

### TICKET-RD-05: Add missing backend endpoints ✅
**Files:** `backend/src/routes/escrow.ts`, `backend/src/services/web3.ts`
- `GET /escrow` — List all escrows (iterate on-chain, cache results, `?address=` filter)
- `GET /escrow/:id/milestones` — Return all milestones for an escrow in one call
- `POST /escrow/:id/cancel` — Cancel escrow (delegates to `cancelEscrow`)
- `POST /escrow/:id/claim` — Claim milestone after timeout
- Add `cancelEscrow` to web3.ts service (read ABI + write wrapper)
- Add `getAllEscrows` to web3.ts (iterate `escrowCreators` mapping)

---

## Phase 3: Wire Read Pages — Replace Mock Data

### TICKET-RD-06: Wire dashboard page to real data
**File:** `frontend/src/app/dashboard/page.tsx`
- Replace `mockStats` + `mockEscrows` with `useDashboard()` + `useEscrows()`
- Show loading skeleton while fetching
- Show empty state when no escrows
- Filter escrows by connected wallet address

### TICKET-RD-07: Wire contracts page to real data
**File:** `frontend/src/app/contracts/page.tsx`
- Replace `mockEscrows` with `useEscrows()` filtered by client/freelancer
- Show loading state
- Wire filter tabs (All / As Client / As Freelancer) to real data

### TICKET-RD-08: Wire contract detail page to real data
**File:** `frontend/src/app/contracts/[id]/page.tsx`
- Replace `getMockEscrow()` + `mockMilestones` with `useEscrowDetail(id)`
- Show loading skeleton
- Wire milestone actions (onFund, onCompleteMilestone, etc.) — stub handlers for now, Phase 4 implements them

### TICKET-RD-09: Wire disputes page to real data
**File:** `frontend/src/app/disputes/page.tsx`
- Replace `mockDisputes` with filtering `useEscrows()` for disputed state
- Build `Dispute` objects from on-chain escrow + milestone data
- Show loading state

---

## Phase 4: Write Operations — MetaMask Transactions

### TICKET-RD-10: Implement contract write helpers
**File:** `frontend/src/lib/contract.ts` (extend)
- Add write wrappers: `createEscrowContract(freelancer, arbitrator)`, `addMilestoneContract(escrowId, desc, amount)`, `fundEscrowContract(escrowId, amount)`, `completeMilestoneContract(escrowId)`, `approveMilestoneContract(escrowId)`, `raiseDisputeContract(escrowId)`, `resolveDisputeContract(escrowId, clientPercent)`, `claimMilestoneContract(escrowId)`, `cancelEscrowContract(escrowId)`
- Each returns `{ hash, wait }` so callers can track tx lifecycle

### TICKET-RD-11: Wire create escrow flow
**File:** `frontend/src/app/create/page.tsx`
- Replace `console.log("Deploying")` with real multi-step tx flow:
  1. `createEscrow` → get escrowId from event
  2. `addMilestone` × N
  3. `fundEscrow` with total value
- Show MetaMask confirm → pending → confirmed states
- Redirect to contract detail on success

### TICKET-RD-12: Wire contract actions (fund, complete, approve, dispute, claim, cancel)
**Files:** `frontend/src/app/contracts/[id]/page.tsx`, `frontend/src/app/disputes/page.tsx`
- Wire all action handlers from TICKET-RD-08 stubs to real MetaMask transactions
- Each action: show pending state → send tx → wait receipt → refetch data → toast
- Dispute resolution: `resolveDispute` with clientPercent slider for arbitrator

---

## Phase 5: UX Polish — Transaction Feedback

### TICKET-RD-13: Transaction toast notifications
**Files:** `frontend/src/components/ui/TransactionToast.tsx`, `frontend/src/lib/tx-context.tsx`
- Create `TransactionProvider` context to track pending/confirmed/failed txs globally
- Toast shows: pending spinner → confirmed checkmark with Etherscan link → failed X with retry
- Auto-dismiss on success, persist on failure
- Integrate with all write operations from Phase 4

---

## Commit Checkpoints

| Phase | Tickets | What's working after commit |
|-------|---------|---------------------------|
| 1 | RD-01, 02, 03 | Contract reads work from frontend, types aligned, API client ready | ✅ |
| 2 | RD-04, 05 | Data hooks fetch real on-chain data, backend can list escrows | ✅ |
| 3 | RD-06, 07, 08, 09 | All pages show real data (reads), no more mock data |
| 4 | RD-10, 11, 12 | Full write flow — create escrows, fund, approve, dispute, claim, cancel |
| 5 | RD-13 | Polished tx feedback with toasts and Etherscan links |