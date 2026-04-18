# ChainSteps Fullstack Audit — Fix Plan

## Context
A comprehensive audit of the smart contract, backend, and frontend revealed 6 Critical, 19 High, 30+ Medium, and 20+ Low issues. This plan focuses on the **fixable issues in the frontend and backend** — smart contract issues are documented but the contract is already deployed on Sepolia.

**Smart contract issues (noted but out of scope):** `delete` on struct corrupts storage (C-01), excess ETH permanently locked (C-02), client cannot dispute (C-03), backend signer identity problem (BC-01/02 — but frontend bypasses backend via MetaMask directly).

---

## Phase A: Crash Bugs (Critical) ✅ DONE

### A1. Fix Rules of Hooks violation in contract detail page ✅
**File:** `frontend/src/app/contracts/[id]/page.tsx`
**Problem:** `useState` hooks (lines 73-74) are called after conditional early returns (lines 44, 56). This violates React's Rules of Hooks and will crash React when the component transitions from loading to loaded.
**Fix:** Move ALL `useState` hooks to the TOP of the component, before any conditional returns. Move `isArbitrator`, `isClient`, `isFreelancer` derivations after the hooks but before early returns (or compute them conditionally).

### A2. Fix undefined variables in disputes page ✅
**File:** `frontend/src/app/disputes/page.tsx`
**Problem:** Lines ~249-268 reference `clientPercent`, `setClientPercent`, and `resolveError` which don't exist. The component has `clientPercents` (Record), `setClientPercents`, and `resolveErrors` (Record).
**Fix:** Replace `clientPercent` -> `getClientPercent(dispute.escrowId)`, `setClientPercent(...)` -> `setClientPercents(prev => ({...prev, [dispute.escrowId]: value}))`, `resolveError` -> `resolveErrors[dispute.escrowId]`.

### A3. Fix stale provider on chain switch ✅
**File:** `frontend/src/hooks/useWallet.ts`, `frontend/src/lib/provider.ts`
**Problem:** When user switches chains in MetaMask, `handleChainChanged` updates `chainId` but never calls `resetProvider()`. The cached `BrowserProvider` still targets the old network.
**Fix:** Call `resetProvider()` inside `handleChainChanged` handler. Also call it in `disconnect()`.

---

## Phase B: Data Correctness (High) ✅ DONE

### B1. Fix Sepolia RPC URL ✅
**File:** `frontend/src/lib/provider.ts:19`
**Problem:** Fallback `https://rpc.sepolia.org` is not a valid public RPC. Also in `useWallet.ts:138`, Infura URL has no API key.
**Fix:** Use a reliable public Sepolia RPC (e.g., `https://ethereum-sepolia-rpc.publicnode.com`). Update the `wallet_addEthereumChain` RPC URL to match.

### B2. Fix `getReadContract` requiring wallet ✅
**File:** `frontend/src/lib/contract.ts:8-11`
**Problem:** `getReadContract()` calls `getProvider()` which requires `window.ethereum`. All read operations fail without a connected wallet.
**Fix:** Make `getReadContract()` fall back to `getReadOnlyProvider()` when `window.ethereum` is unavailable. Or refactor all hooks to use the read-only provider for reads and only use the wallet provider for writes.

### B3. Fix `fetchEscrow` hardcoded ZeroAddress ✅
**File:** `frontend/src/lib/contract.ts:30-31`
**Problem:** `fetchEscrow()` hardcodes `arbitrator: ethers.ZeroAddress` and `disputeTimeout: "0"` instead of reading from the contract.
**Fix:** Update `fetchEscrow` to call both `contract.getEscrow(id)` and `contract.escrows(id)` to get all fields (like `fetchEscrowFull` does). Or remove `fetchEscrow` and use only `fetchEscrowFull`.

### B4. Add `Cancelled` state to `getEscrowStatus` + `StatusBadge` ✅
**Files:** `frontend/src/app/contracts/page.tsx`, `frontend/src/components/contracts/ContractRow.tsx`, `frontend/src/components/contracts/ContractsLedger.tsx`, `frontend/src/components/contracts/ContractDetail.tsx`, `frontend/src/components/ui/StatusBadge.tsx`
**Problem:** `EscrowState.Cancelled` (4) falls through to `default: "pending"` in all 4+ `getEscrowStatus` implementations. Cancelled escrows show as "Pending".
**Fix:** Add "cancelled" case to all `getEscrowStatus` functions and `StatusBadge` component. Extract to a single shared function in `lib/utils.ts` to eliminate duplication.

### B5. Fix `milestoneCompletionRate` overcounting ✅
**Files:** `frontend/src/hooks/useDashboard.ts:29`, `frontend/src/hooks/useHomepageStats.ts:38`
**Problem:** `completedMilestones` uses `e.currentMilestone` which is an index, not a count of approved milestones. For disputed/cancelled escrows this is wrong.
**Fix:** Only count completed milestones for `Completed` state escrows (where all milestones are done). Or skip the rate for non-active/completed escrows.

### B6. Fix `getDisputeStatus` always returning "under_review" ✅
**File:** `frontend/src/app/disputes/page.tsx:35-37`
**Problem:** The function always returns `"under_review"`, making the Resolved filter useless.
**Fix:** Check if the escrow state is `Completed` after dispute resolution (state returns to Active then can proceed to Completed). Since the contract doesn't have an explicit "dispute resolved" flag, use escrow state: if escrow was disputed but is now Active or Completed, the dispute is resolved.

### B7. Fix claim milestone button — no timeout check ✅
**File:** `frontend/src/app/contracts/[id]/page.tsx:330`
**Problem:** Claim button shows whenever milestone is completed+unapproved, but on-chain `claimMilestone` reverts if timeout hasn't passed. User gets confusing error.
**Fix:** Compare `milestone.approvalTimeout` (Unix timestamp) against current time. Disable the button and show a countdown if timeout hasn't passed.

---

## Phase C: UX & Accessibility (Medium)

### C1. Add keyboard accessibility to clickable divs
**Files:** `frontend/src/components/contracts/ContractRow.tsx`, `frontend/src/components/contracts/CreateNewCard.tsx`
**Fix:** Add `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space) to clickable divs.

### C2. Fix MilestoneTimeline state labels using icon font
**File:** `frontend/src/components/milestone/MilestoneTimeline.tsx:126-142`
**Problem:** Text like "Verified", "In Review" is wrapped in `material-symbols-outlined` class, rendering in the icon font.
**Fix:** Remove `material-symbols-outlined` from text spans. Keep it only on actual icon elements.

### C3. Add file size validation to EvidencePanel
**File:** `frontend/src/components/evidence/EvidencePanel.tsx:32-34`
**Problem:** No file size check despite UI saying "Max 10MB per file".
**Fix:** Add size check in `handleFileSelect` and `handleDrop`, reject files >10MB with error message.

### C4. Add wallet connection guard to create page
**File:** `frontend/src/app/create/page.tsx`
**Problem:** No guard when wallet is disconnected — user fills form then hits error.
**Fix:** Show a connect-wallet prompt when `!isConnected`, similar to dashboard guard.

### C5. Add self-address validation in create flow
**Files:** `frontend/src/components/create/PartiesStep.tsx`, `frontend/src/components/create/EscrowWizard.tsx`
**Fix:** Validate freelancer != connected address. Show error if same.

### C6. Fix cancel button — add confirmation ✅ (done in Phase A)
**File:** `frontend/src/app/contracts/[id]/page.tsx:317-327`
**Fix:** Add a `window.confirm("Are you sure? ...")` or inline confirmation step before cancelling.

### C7. Fix error clearing in EscrowWizard
**File:** `frontend/src/components/create/EscrowWizard.tsx:49-52`
**Problem:** `updateFormData` calls `setErrors({})` on every change, swallowing all validation errors.
**Fix:** Only clear errors for the field being changed, not all errors.

### C8. Add body scroll lock when mobile drawer is open
**File:** `frontend/src/components/layout/AppShell.tsx:35-39`
**Fix:** Apply `document.body.style.overflow = 'hidden'` when `mobileOpen` is true, restore on close.

### C9. Fix arbitrator role not shown in ContractsGrid
**File:** `frontend/src/components/contracts/ContractsGrid.tsx:36-44`
**Fix:** Add arbitrator check alongside client/freelancer in `currentRole` logic.

### C10. Fix BlockchainCube — auto-rotate and mouse-tilt conflict
**File:** `frontend/src/components/homepage/BlockchainCube.tsx:123-133`
**Fix:** Remove auto-rotate when mouse is hovering (pause the animation on hover), or use only one rotation source.

---

## Phase D: Code Quality & DRY (Low)

### D1. Extract shared utilities ✅ (done in Phase B — lib/utils.ts created)
- `truncateAddress()` (defined 7+ times) -> `frontend/src/lib/utils.ts`
- `getEscrowStatus()` (defined 4+ times) -> `frontend/src/lib/utils.ts`
- `isValidAddress()` (defined 3 times) -> `frontend/src/lib/utils.ts`
- Progress calculation -> shared helper

### D2. Fix duplicate `fetchAllEscrows` vs `fetchAllEscrowsPublic`
**File:** `frontend/src/lib/contract.ts`
**Fix:** Single function parameterized by provider type.

### D3. Fix `useHomepageStats` called twice (Hero + TrustIndicators)
**Fix:** Lift to parent page component or create a context to share the fetch.

### D4. Remove debug state leak on window
**File:** `frontend/src/components/wallet/WalletProvider.tsx:23-28`
**Fix:** Remove `(window as any).__walletDebug = wallet`.

### D5. Fix `buildDisputess` typo ✅ (fixed in Phase B — renamed to buildDisputes)
**File:** `frontend/src/app/disputes/page.tsx:21`
**Fix:** Rename to `buildDisputes`.

### D6. Replace `alert()` in useWallet with toast/modal
**File:** `frontend/src/hooks/useWallet.ts:115`

### D7. Fix hardcoded #0042 and gas estimate in create page
**File:** `frontend/src/app/create/page.tsx:160, 354`

### D8. Fix disconnect using `window.location.href` instead of router
**File:** `frontend/src/hooks/useWallet.ts:163-167`

---

## Phase E: Backend Cleanup (Medium)

### E1. Remove or deprecate backend write endpoints
**Problem:** Backend signs all transactions with a single private key, completely undermining contract access control. Frontend already bypasses backend via MetaMask.
**Fix:** Remove write routes or add clear deprecation comments. Keep only read endpoints (`GET /escrow`, `GET /escrow/:id`, `GET /health`).

### E2. Fix IPFS service using defunct Infura endpoint
**File:** `backend/src/services/ipfs.ts:8`
**Fix:** Switch to Pinata, Web3.Storage, or another active IPFS provider.

### E3. Add input validation to resolve-dispute route
**File:** `backend/src/routes/escrow.ts:185-189`
**Fix:** Validate `clientPercent` is a number between 0-100.

### E4. Fix deploy script appending to .env.local
**File:** `scripts/deploy.ts:15-17`
**Fix:** Read existing `.env.local`, replace `CONTRACT_ADDRESS=` line if present, then write.

---

## Verification

After implementing all phases:
1. `npx hardhat test` — all 46 existing tests pass
2. `cd frontend && npm run build` — no TypeScript or build errors
3. Manual checks:
   - Load homepage without wallet — stats should show (read-only provider works)
   - Connect wallet on wrong network — provider resets
   - Create escrow page without wallet — shows connect prompt
   - Open disputes page as arbitrator — resolve slider works, no crash
   - Cancel escrow — confirmation dialog appears
   - Navigate with keyboard only — contract rows are focusable/activatable
4. `cd backend && npm run dev` — health check passes, no write endpoints crash

---

## Implementation Order

Phase A -> B -> C -> D -> E (each phase committed and pushed before starting the next).
Within each phase, items are independent and can be done in any order.

---

## Smart Contract Issues (Out of Scope — Contract Deployed)

| ID | Severity | Issue |
|----|----------|-------|
| C-01 | Critical | `delete` on struct with dynamic array corrupts storage in `cancelEscrow` |
| C-02 | Critical | Excess ETH sent to `fundEscrow` is permanently locked |
| C-03 | Critical | Client has no way to dispute (only freelancer can `raiseDispute`) |
| H-01 | High | No check that client != freelancer (self-referencing escrow) |
| H-02 | High | Zero-amount milestones allowed (DoS/griefing vector) |
| H-04 | High | `payable().transfer()` has 2300 gas limit — fails for contract wallets |
| H-05 | High | Missing `DisputeResolved` event |
| M-01 | Medium | `escrowCreators` not cleared on cancellation |
| M-02 | Medium | `getApprovalTimeout` reverts for out-of-bounds milestone index |
| M-03 | Medium | `getEscrow` doesn't return `arbitrator` or `disputeTimeout` |
| M-04 | Medium | No upper bound on milestone count |
| M-05 | Medium | `disputeTimeout` field never set — always 0 |

## Backend Architecture Issues (Noted)

| ID | Severity | Issue |
|----|----------|-------|
| BC-01 | Critical | Backend signs ALL transactions with single private key — undermines access control |
| BC-02 | Critical | `createEscrow` always sets backend wallet as client |
| BH-04 | High | No authentication on any endpoint |
| BH-05 | High | IPFS service uses defunct Infura endpoint |
| XH-01 | High | Frontend (MetaMask) and backend (server wallet) paths conflict architecturally |