# Real Data Integration Plan

## Current State
- **Smart Contract**: Deployed on Sepolia (`0x7b2D41F3A7592c55CB73502ddECf8F84289e9021`)
- **Backend API**: Express server with read/write endpoints, but **custodial** (signs with server private key)
- **Frontend**: All pages built, all mock data, wallet connected via MetaMask

## Key Problems to Solve

1. **No "list escrows" endpoint** — Frontend can't fetch all escrows for dashboard/contracts page
2. **Backend is custodial** — Server signs all transactions with its own key, not the user's wallet. For a dApp, users must sign their own txs via MetaMask
3. **No combined escrow+milestones endpoint** — Frontend would need N+1 calls
4. **Missing API routes** — `cancelEscrow`, `claimMilestone` have no endpoints
5. **Evidence upload** expects base64 in JSON — doesn't work with standard file inputs
6. **Notifications** are dead code — never called from routes
7. **Type mismatches** between backend responses and frontend types

---

## Architecture Decision: Frontend → Contract (direct) + Backend (supplementary)

**Reads**: Frontend reads directly from the contract via `ethers.js` + MetaMask provider (free, instant, no backend needed)

**Writes**: Frontend sends transactions directly from the user's wallet via MetaMask (user signs, user pays gas) — backend NOT involved in writes

**Backend role**: IPFS uploads, notifications, and optional indexing/caching only

**Why not route writes through backend?** The backend signs with a server private key, meaning it would be the msg.sender — not the user. Only the actual client/freelancer can call contract write functions (modifier checks). A custodial backend cannot act on behalf of a connected wallet.

---

## Implementation Steps

### Step 1: Create Web3 Client Layer
**Files**: `frontend/src/lib/contract.ts`, `frontend/src/lib/provider.ts`

- Initialize ethers `BrowserProvider` from `window.ethereum`
- Load contract ABI from compiled artifacts
- Create typed contract instance with the deployed address
- Export helper functions for reads and writes

### Step 2: Create API Client for Backend
**File**: `frontend/src/lib/api.ts`

- Simple fetch wrapper for backend endpoints
- Base URL from env (`NEXT_PUBLIC_API_URL`, default `http://localhost:3001`)
- Error handling with typed responses
- Only for: IPFS evidence upload, notifications (future), health check

### Step 3: Create Data Hooks
**Files**: `frontend/src/hooks/useEscrows.ts`, `frontend/src/hooks/useEscrowDetail.ts`, `frontend/src/hooks/useDashboard.ts`

- `useEscrows()` — Fetch all escrows by iterating contract `escrows` array (use `escrowCreators` mapping + `getEscrow` for each). Or add a backend indexing endpoint.
- `useEscrowDetail(id)` — Fetch escrow + all milestones in one hook (parallel fetches)
- `useDashboard()` — Aggregate stats from escrow list (total locked, active count, pending milestones)
- All hooks: loading/error states, auto-refresh on new blocks, wallet-address-aware filtering

### Step 4: Add Missing Backend Endpoints
**File**: `backend/src/routes/escrow.ts`

- `GET /escrow` — List all escrows (iterate on-chain, cache results, support `?address=` filter)
- `POST /escrow/:id/cancel` — Cancel escrow (delegates to `cancelEscrow`)
- `POST /escrow/:id/claim` — Claim milestone after timeout
- Fix evidence upload to accept `multipart/form-data` (use `multer`)

**File**: `backend/src/routes/escrow.ts` (existing)

- Add `GET /escrow/:id/milestones` — Return all milestones for an escrow in one call (loop `getMilestone` 0..N-1)

### Step 5: Wire Frontend Pages to Real Data
Replace mock data in each page with hooks:

| Page | Replace | With |
|------|---------|------|
| `/dashboard` | `mockStats`, `mockEscrows` | `useDashboard()`, `useEscrows()` |
| `/contracts` | `mockEscrows` | `useEscrows()` with client/freelancer filter |
| `/contracts/[id]` | `getMockEscrow()`, `mockMilestones` | `useEscrowDetail(id)` |
| `/create` | `console.log("Deploying")` | Contract write: `createEscrow` → `addMilestone` × N → `fundEscrow` |
| `/disputes` | `mockDisputes` | Filter `useEscrows()` for disputed state + `useEscrowDetail` per dispute |

### Step 6: Wire Write Operations (MetaMask Transactions)

| Action | Contract Function | Called From |
|--------|------------------|------------|
| Create escrow | `createEscrow(freelancer, arbitrator)` | `/create` page |
| Add milestone | `addMilestone(escrowId, description, amount)` | `/create` page (step 2) |
| Fund escrow | `fundEscrow(escrowId)` with `msg.value` | Contract detail page |
| Mark complete | `completeMilestone(escrowId)` | Milestone timeline (freelancer) |
| Approve & pay | `approveMilestone(escrowId)` | Contract detail (client) |
| Raise dispute | `raiseDispute(escrowId)` | Contract detail |
| Resolve dispute | `resolveDispute(escrowId, clientPercent)` | Disputes page (arbitrator) |
| Claim after timeout | `claimMilestone(escrowId)` | Contract detail (freelancer) |
| Cancel escrow | `cancelEscrow(escrowId)` | Contract detail (client, Created state) |

Each write: show MetaMask confirm → wait for tx receipt → refresh data → toast notification

### Step 7: Update Frontend Types
**File**: `frontend/src/types/index.ts`

- Add `Dispute` type (derived from disputed escrows)
- Add `EscrowListItem` type with resolved project metadata
- Add `TransactionStatus` type for pending tx tracking
- Align `state` field with contract's `State` enum values

### Step 8: Add Transaction UI Feedback
**Files**: New component `frontend/src/components/ui/TransactionToast.tsx`

- Toast/notification system for pending/confirmed/failed transactions
- Show tx hash link to Sepolia Etherscan
- Auto-dismiss on success, persist on failure
- Integrate with write operations from Step 6

---

## Implementation Order

1. **Step 1** — Contract client layer (foundation)
2. **Step 2** — API client (simple, needed for IPFS)
3. **Step 3** — Data hooks (core data layer)
4. **Step 4** — Backend endpoint additions (enables escrow listing)
5. **Step 5** — Wire pages to hooks (replace mock data)
6. **Step 6** — Wire write operations (MetaMask transactions)
7. **Step 7** — Update types (cleanup)
8. **Step 8** — Transaction feedback (UX polish)

---

## Files to Create/Modify

### New Files
- `frontend/src/lib/contract.ts` — Contract ABI, address, typed instance
- `frontend/src/lib/api.ts` — Backend API client
- `frontend/src/hooks/useEscrows.ts` — List escrows hook
- `frontend/src/hooks/useEscrowDetail.ts` — Single escrow + milestones hook
- `frontend/src/hooks/useDashboard.ts` — Dashboard stats hook
- `frontend/src/components/ui/TransactionToast.tsx` — Tx feedback UI

### Modified Files
- `frontend/src/types/index.ts` — Updated types
- `frontend/src/app/dashboard/page.tsx` — Replace mock data
- `frontend/src/app/contracts/page.tsx` — Replace mock data
- `frontend/src/app/contracts/[id]/page.tsx` — Replace mock data
- `frontend/src/app/create/page.tsx` — Real deployment flow
- `frontend/src/app/disputes/page.tsx` — Real dispute data
- `backend/src/routes/escrow.ts` — Add listing + combined milestones + cancel/claim
- `backend/src/services/web3.ts` — Add `getAllEscrows` helper

### Environment Variables Needed
- `NEXT_PUBLIC_API_URL` — Backend URL (frontend)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — Deployed contract address (frontend, already known)
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` — Sepolia RPC for reads (frontend, optional — MetaMask provides this)