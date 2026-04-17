# BUFS (Bugs, Unfinished, Fixes, Suggestions)

## Design Reference Files
- `design/chainsteps_dashboard/` - Current dashboard implementation
- `design/create_new_escrow/` - Create escrow wizard design
- `design/my_contracts/` - My Contracts / Ledger page design
- `design/milestone_details/` - Contract detail page design
- `design/chainsteps_protocol/DESIGN.md` - Design system documentation

---

## Phase 4A - Project Setup & Design System (Existing)

### Layout Issues (Found in Screenshot 2026-04-15 221648)

**1. Sidebar Height Conflict**
- **Issue:** Sidebar has both `h-screen` and `h-full` classes causing conflicting height constraints
- **File:** `frontend/src/components/layout/Sidebar.tsx`
- **Status:** To Fix
- **Fix:** Remove `h-full` and keep only `h-screen`

**2. TopBar Not Visible**
- **Issue:** TopBar component with Sepolia Network badge and Connect Wallet button is not appearing in viewport
- **File:** `frontend/src/components/layout/TopBar.tsx`
- **Status:** To Fix
- **Fix:** Check z-index stacking and ensure `ml-64` offset is correct for `w-[calc(100%-16rem)]`

**3. Content Area Not Filling Viewport**
- **Issue:** Main content area only takes visible viewport height instead of stretching full page. Dark background cuts off abruptly.
- **File:** `frontend/src/components/layout/AppShell.tsx`
- **Status:** To Fix
- **Fix:** Ensure main element has `min-h-screen` and content is properly contained

**4. Left Margin Constrained**
- **Issue:** "Protocol Overview" text appears too close to sidebar edge visually
- **File:** `frontend/src/app/page.tsx`
- **Status:** To Fix
- **Fix:** Review padding/margin on main content area (currently `ml-64 pt-24 px-8 pb-12`)

**5. Content Text Compressed**
- **Issue:** Heading and description look compressed, suggesting container width is too constrained
- **File:** `frontend/src/app/page.tsx`
- **Status:** To Fix
- **Fix:** Review `max-w-lg` on description and overall content wrapper width

### Suggested Improvements

**A. Add Material Symbols CDN**
- **Issue:** Icons may not render without Google Fonts Material Symbols import
- **Status:** Pending verification
- **Fix:** Add Material Symbols CSS link to layout

**B. Active Nav State**
- **Issue:** Nav items don't highlight current active route
- **File:** `frontend/src/components/layout/Sidebar.tsx`
- **Status:** ✅ DONE (TICKET-008)

**C. Wallet Connection State**
- **Issue:** Wallet placeholder shows "Not Connected" but no real wallet state management
- **Status:** Phase 4D (Wallet Integration) task

---

## PHASE 4B/C/D - MISSING PAGES (HIGH PRIORITY)

### Pages that need to be created based on design files:

**TICKET-001: Create Homepage (Landing Page)**
- **Issue:** No dedicated homepage exists. Current `page.tsx` IS the dashboard, not a landing page.
- **Design Reference:** NONE - needs to be created from scratch with Aceternity UI
- **File:** `frontend/src/app/page.tsx` (replace current dashboard) + `frontend/src/app/dashboard/page.tsx` (move dashboard)
- **Status:** ✅ DONE (Ticket-001)
- **Design Direction:** Use **Aceternity UI** for modern, pro look:
  - Hero section with animated gradient text "Trustless Escrow for Web3"
  - Feature cards with glassmorphism (BentoGrid layout)
  - How it works section with step-by-step flow diagram
  - Trust indicators / security badges
  - Call-to-action buttons (Connect Wallet, Launch App)
  - Animated sections, floating orbs, particle effects
- **Aceternity Components:** Hero, AnimatedGradientText, TracingButton, BentoGrid, FeatureCard, InfiniteScroll, FloatingNav
- **Wireframe:**
  ```
  ┌─────────────────────────────────────────────────────────┐
  │  [Navigation Bar - Logo + Connect Wallet]              │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │           ANIMATED GRADIENT TEXT                        │
  │           "Trustless Escrow for Web3"                   │
  │                                                         │
  │    [Get Started Button]    [View Demo Button]           │
  │                                                         │
  ├─────────────────────────────────────────────────────────┤
  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
  │  │Feature 1│ │Feature 2│ │Feature 3│ │Feature 4│         │
  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
  ├─────────────────────────────────────────────────────────┤
  │  HOW IT WORKS (Stepper)                                 │
  │  1. Create → 2. Fund → 3. Work → 4. Release             │
  ├─────────────────────────────────────────────────────────┤
  │  [Security Badge] [Trust Score] [Stats]                 │
  └─────────────────────────────────────────────────────────┘
  ```

**TICKET-002: Create Dashboard Page**
- **Issue:** Current dashboard content needs to move to `/dashboard` route
- **Design Reference:** `design/chainsteps_dashboard/code.html`
- **File:** `frontend/src/app/dashboard/page.tsx`
- **Status:** ✅ DONE (Ticket-002)
- **Components from design:**
  - Stats cards (Total Locked: 42.50 ETH, Active Contracts: 12, Pending Milestones: 08)
  - "Active Escrow Contracts" section header
  - Contract cards grid (3 columns on xl)
  - Recent Ledger Events table (transaction history)
  - Trust Ledger Ranking card
  - Create New Card (dashed border placeholder)
- **Note:** This is the page currently at `/` that needs to be moved

**TICKET-003: Create /contracts (My Contracts / Ledger) Page**
- **Issue:** Page linked in Sidebar but doesn't exist
- **Design Reference:** `design/my_contracts/code.html`
- **File:** `frontend/src/app/contracts/page.tsx`
- **Status:** MISSING - Needs Implementation
- **Components from design:**
  - Page header: "Ledger" (display font, 3.5rem) + "TRANSACTIONAL OVERVIEW & CONTRACTS" subtitle
  - Filter tabs: All / As Client / As Freelancer
  - 3 metric cards: Total Locked Value (14.85 ETH), Active Contracts (08), Success Rate (98.2%)
  - Contract table with columns: Project, Role, Total Value, Current Phase, Status, Actions
  - Role badges (Freelancer = tertiary, Client = cyan)
  - Status badges (Active = primary, Completed = secondary, Disputed = error)
  - Pagination footer
- **Table Features:**
  - Filter by role (All/Client/Freelancer)
  - Search and filter icons
  - Hover effects on rows
  - Action button (Details)
  - Pagination (1, 2, ...)

**TICKET-004: Create /contracts/[id] (Contract Detail) Page**
- **Issue:** Clicking contracts in dashboard has no destination
- **Design Reference:** `design/milestone_details/code.html`
- **File:** `frontend/src/app/contracts/[id]/page.tsx`
- **Status:** MISSING - Needs Implementation
- **Components from design:**
  - Breadcrumb: Contracts > Contract Name
  - Contract header: ID badge, title, description, total value
  - "Fully Funded" badge
  - Vertical stepper timeline with milestone states:
    - Released (green checkmark)
    - In Review (pulsing cyan with inner dot)
    - Funded (hollow ring)
    - Unfunded (hollow ring, dimmed)
  - Active milestone card has action buttons:
    - "Approve & Pay" (green, secondary)
    - "Initiate Dispute" (red, error)
  - Evidence panel (IPFS links)
  - Project participants sidebar
  - Contract progress bar (25%)
  - Security badge ("Secured by ChainSteps")
  - Header: "Active Path / My Contracts"

**TICKET-005: Create /create Page**
- **Issue:** Page linked in Sidebar but doesn't exist
- **Design Reference:** `design/create_new_escrow/code.html`
- **File:** `frontend/src/app/create/page.tsx`
- **Status:** MISSING - Needs Implementation
- **Components from design:**
  - Page header: "New Escrow #0042" with description
  - 3-step vertical stepper (Basic Info → Milestones → Review)
  - Step indicators with icons and connecting dashed lines
  - Active step highlighted with glow
  - Step content:
    - **Step 1 (Parties):** Client address input, Freelancer address input, Project title
    - **Step 2 (Milestones):** Dynamic milestone rows (description + ETH amount), Add Milestone button
    - **Step 3 (Review):** Summary card with total locked value, network fee, Deploy button
  - Glassmorphism cards with backdrop blur
  - Mobile bottom navigation (hamburger menu)

**TICKET-006: Create /disputes Page**
- **Issue:** Page linked in Sidebar but doesn't exist
- **Design Reference:** NONE - needs conceptual design
- **File:** `frontend/src/app/disputes/page.tsx`
- **Status:** MISSING - Needs Implementation
- **Proposed Components:**
  - Header: "Dispute Resolution"
  - List of contracts in dispute status
  - Dispute cards with:
    - Contract name and ID
    - Disputed milestone details
    - Dispute reason / evidence links
    - Status (Under Review / Resolved / Escalated)
  - Filter tabs: All / Under Review / Resolved
  - Resolution history timeline

---

## PHASE 4B/C/D - FRONTEND ISSUES (NEWLY IDENTIFIED)

### BROKEN NAVIGATION (HIGH PRIORITY)

**TICKET-007: Sidebar Uses `<a>` Instead of Next.js `<Link>`**
- **Issue:** All sidebar nav items use `<a href={item.href}>` causing full-page reloads instead of SPA navigation
- **File:** `frontend/src/components/layout/Sidebar.tsx:42-58`
- **Status:** ✅ DONE
- **Fix:** Replaced `<a href={...}>` with `<Link href={...}>` from `next/link`. Now uses client-side SPA navigation.
- **Impact:** Poor UX with full page reloads, defeats Next.js App Router benefits

**TICKET-008: Active Nav State Not Implemented**
- **Issue:** Nav items don't highlight current active route (no visual feedback)
- **File:** `frontend/src/components/layout/Sidebar.tsx`
- **Status:** ✅ DONE
- **Design Reference:** `design/chainsteps_dashboard/code.html:110` shows active state with `border-l-4 border-cyan-400 bg-gradient-to-r from-cyan-400/10`
- **Fix:** Used `usePathname()` from `next/navigation` to conditionally apply active styles (vertical accent bar + highlighted text)

### NON-WORKING CLICKABLES (HIGH PRIORITY)

**TICKET-009: "Mark Complete" Button Does Nothing**
- **Issue:** MilestoneTimeline's "Mark Complete" button has no `onClick` handler
- **File:** `frontend/src/components/milestone/MilestoneTimeline.tsx:148`
- **Status:** To Fix
- **Design Reference:** `design/milestone_details/code.html:214-221` shows client action buttons (Approve & Pay, Initiate Dispute)
- **Fix:** Add `onClick={() => onApprove?.(index)}` similar to the approve button. For freelancer role, add "Mark Complete" handler.
- **Note:** `currentAddress` prop is accepted but never used - could determine button visibility based on wallet address

**TICKET-010: handleContractClick is Incomplete TODO**
- **Issue:** Contract click handler only logs to console, doesn't navigate
- **File:** `frontend/src/app/page.tsx:66-69`
- **Status:** To Fix
- **Fix:** Add `router.push('/contracts/${escrow.id}')` or use Next.js navigation. Depends on TICKET-004.
- **Note:** Written as TODO comment: "Navigate to contract detail page"

**TICKET-011: Sidebar Wallet Section Not Clickable**
- **Issue:** Sidebar shows "Not Connected" / "Connect Wallet" but has no click handler to trigger wallet connection
- **File:** `frontend/src/components/layout/Sidebar.tsx:64-72`
- **Status:** To Fix
- **Design Reference:** Shows wallet avatar and "Verified User" badge
- **Fix:** Wrap in button or add onClick to trigger wallet connection flow. Should use `useWallet()` hook.

### DYNAMIC TAILWIND CLASSES (MEDIUM PRIORITY)

**TICKET-012: Dynamic Shadow Color in TopBar Won't Render**
- **Issue:** `shadow-[0_0_8px_${isSepolia ? "#4edea3" : "#ffb4ab"}]` uses template literal - Tailwind can't detect at compile time
- **File:** `frontend/src/components/layout/TopBar.tsx:18`
- **Status:** ✅ DONE
- **Fix:** Use static classes like `shadow-[0_0_8px_#4edea3]` and `shadow-[0_0_8px_#ffb4ab]` conditionally, or use inline style with dynamic value

**TICKET-013: Dynamic Border Classes in StatusBadge Won't Work**
- **Issue:** `border-${status}/20` generates invalid Tailwind classes (e.g., `border-active/20`)
- **File:** `frontend/src/components/ui/StatusBadge.tsx:50`
- **Status:** To Fix
- **Fix:** Use specific static classes per status: `border-primary/20` for active, `border-secondary/20` for completed, etc.

**TICKET-014: Dynamic Shadow Classes in StatusBadge Won't Work**
- **Issue:** `shadow-[0_0_5px_${config.dot.replace("bg-", "")}]` - Tailwind can't generate these at runtime
- **File:** `frontend/src/components/ui/StatusBadge.tsx:52`
- **Status:** To Fix
- **Fix:** Remove dynamic shadow or use inline style with computed value

### MOBILE RESPONSIVENESS (MEDIUM PRIORITY)

**TICKET-015: Sidebar Has No Mobile Adaptation**
- **Issue:** Sidebar uses fixed positioning with no hamburger menu or slide-out drawer for mobile
- **File:** `frontend/src/components/layout/Sidebar.tsx:19`
- **Design Reference:** `design/create_new_escrow/code.html:335-343` shows mobile bottom navigation with floating center "+" button
- **Status:** To Fix
- **Fix:** Add state for mobile sidebar open/closed, hamburger menu button in TopBar, responsive behavior

**TICKET-016: TopBar Width Calculation Breaks on Mobile**
- **Issue:** `w-[calc(100%-16rem)]` assumes sidebar always visible
- **File:** `frontend/src/components/layout/TopBar.tsx:11`
- **Status:** To Fix
- **Fix:** Use responsive classes - full width on mobile, calc width only on lg+

**TICKET-017: Main Content Area Not Mobile Responsive**
- **Issue:** `ml-64` fixed margin doesn't work on mobile screens
- **File:** `frontend/src/components/layout/AppShell.tsx:16`
- **Status:** To Fix
- **Fix:** Use responsive margins - `ml-0` on mobile, `ml-64` on lg+

### DESIGN SYSTEM COMPLIANCE (MEDIUM PRIORITY)

**TICKET-018: Missing Backdrop Blur on Glass Cards**
- **Issue:** Glass cards in design use `backdrop-filter: blur(12px)` but some components may not have it
- **File:** Various card components
- **Design Reference:** All design files use glassmorphism with `backdrop-filter: blur(12px)` and `background: rgba(23, 31, 51, 0.7)`
- **Status:** To Fix
- **Fix:** Ensure all glass cards use proper backdrop blur and semi-transparent backgrounds

**TICKET-019: Typography Hierarchy Not Followed**
- **Issue:** Display font (Space Grotesk) should be used for milestone amounts and high-level summaries
- **Design Reference:** `design/chainsteps_protocol/DESIGN.md` Section 3: Typography
- **Status:** To Fix
- **Fix:** Review and update typography - use `font-headline` (Space Grotesk) for display text, `font-body` (Inter) for body

**TICKET-020: No "No-Line" Rule Followed**
- **Issue:** Design system prohibits 1px borders for sectioning - use background shifts instead
- **Design Reference:** `design/chainsteps_protocol/DESIGN.md` Section 2: "The 'No-Line' Rule"
- **Status:** To Fix
- **Fix:** Replace divider lines with tonal background differences

### CODE QUALITY / LOGIC ISSUES (LOW PRIORITY)

**TICKET-021: Unused `currentAddress` Prop**
- **Issue:** `currentAddress?: string | null` declared in MilestoneTimeline props but never used
- **File:** `frontend/src/components/milestone/MilestoneTimeline.tsx:12`
- **Status:** To Fix
- **Fix:** Use `currentAddress` to determine button visibility or remove if truly not needed

**TICKET-022: Unused Import**
- **Issue:** `EscrowWithMilestones` imported but never used
- **File:** `frontend/src/components/contracts/ContractDetail.tsx:3`
- **Status:** To Fix
- **Fix:** Remove unused import

**TICKET-023: Inconsistent Status Colors**
- **Issue:** "funded" and "unfunded" status in StatusBadge use hardcoded slate colors instead of design system colors
- **File:** `frontend/src/components/ui/StatusBadge.tsx:32-42`
- **Status:** To Fix
- **Fix:** Update to use primary/secondary palette or proper semantic colors per design system

**TICKET-024: Division by Zero Fragility**
- **Issue:** Progress calculation checks `escrow.milestoneCount > 0` but pattern is fragile
- **File:** `frontend/src/components/contracts/ContractRow.tsx:38-40`, `ContractDetail.tsx:56-58`
- **Status:** To Fix
- **Fix:** Ensure check happens before any calculations, or use optional chaining

---

## SUGGESTIONS / ENHANCEMENTS

**SUGGEST-001: Add Aceternity UI Library**
- **Issue:** Frontend could benefit from Aceternity UI for modern, pro look especially on homepage
- **Files:** Would need to install `aceternity-ui` or similar component library
- **Status:** Enhancement
- **Note:** Required for TICKET-001 (Homepage) - use it for Hero, BentoGrid, TracingButton, InfiniteScroll, FloatingNav

**SUGGEST-002: Add Loading/Error States**
- **Issue:** No loading spinners or error states for async operations (wallet connect, contract loading)
- **Status:** Nice to Have

**SUGGEST-003: Add Empty States**
- **Issue:** No graceful empty states for empty contracts list, no milestones, etc.
- **Status:** Nice to Have

**SUGGEST-004: Add Pagination Component**
- **Issue:** My Contracts page design shows pagination but no component exists
- **File:** Would need `frontend/src/components/ui/Pagination.tsx`
- **Status:** Nice to Have
- **Design Reference:** `design/my_contracts/code.html:334-343`

**SUGGEST-005: Add Table Component**
- **Issue:** My Contracts page needs a data table with sorting and filtering
- **File:** Would need `frontend/src/components/ui/DataTable.tsx`
- **Status:** Nice to Have

---

## PRIORITY ORDER (Recommended Fix Sequence)

### Phase 1: Navigation & Structure
| Order | Ticket | Title | Status |
|-------|--------|-------|--------|
| 1 | TICKET-007 | Fix Sidebar navigation (use `<Link>`) | ✅ DONE |
| 2 | TICKET-008 | Add Active Nav State highlighting | ✅ DONE |
| 3 | TICKET-001 | Create Homepage with Aceternity UI | ✅ DONE |
| 4 | TICKET-002 | Move Dashboard to /dashboard | ✅ DONE |

### Phase 2: Core Pages
| Order | Ticket | Title | Blocking |
|-------|--------|-------|----------|
| 5 | TICKET-003 | Create /contracts page | None |
| 6 | TICKET-005 | Create /create page | None |
| 7 | TICKET-004 | Create /contracts/[id] page | TICKET-003 |
| 8 | TICKET-006 | Create /disputes page | None |

### Phase 3: Fix Broken Interactions
| Order | Ticket | Title | Blocking |
|-------|--------|-------|----------|
| 9 | TICKET-009 | Fix "Mark Complete" button | TICKET-004 |
| 10 | TICKET-010 | Fix handleContractClick navigation | TICKET-004 |
| 11 | TICKET-011 | Fix Sidebar wallet click | None |

### Phase 4: Styling & Mobile
| Order | Ticket | Title | Blocking |
|-------|--------|-------|----------|
| 12 | TICKET-012 | Fix TopBar dynamic shadow | ✅ DONE |
| 13 | TICKET-013 | Fix StatusBadge dynamic borders | None |
| 14 | TICKET-014 | Fix StatusBadge dynamic shadows | None |
| 15 | TICKET-015 | Add mobile sidebar | None |
| 16 | TICKET-016 | Fix TopBar mobile width | TICKET-015 |
| 17 | TICKET-017 | Fix AppShell mobile margin | TICKET-015 |

### Phase 5: Design System Compliance
| Order | Ticket | Title | Blocking |
|-------|--------|-------|----------|
| 18 | TICKET-018 | Add backdrop blur to glass cards | None |
| 19 | TICKET-019 | Fix typography hierarchy | None |
| 20 | TICKET-020 | Implement "No-Line" rule | None |

### Phase 6: Code Quality
| Order | Ticket | Title | Blocking |
|-------|--------|-------|----------|
| 21 | TICKET-021 | Remove unused prop / use currentAddress | None |
| 22 | TICKET-022 | Remove unused import | None |
| 23 | TICKET-023 | Fix inconsistent status colors | None |
| 24 | TICKET-024 | Fix division by zero | None |

---

## DESIGN FILES DETAIL

### design/chainsteps_dashboard/code.html
- Dashboard with stats (42.50 ETH locked, 12 contracts, 8 pending milestones)
- 3-column contract card grid
- Recent Ledger Events table (transactions)
- Trust Ledger Ranking card
- "Create New" dashed card

### design/create_new_escrow/code.html
- Multi-step wizard (3 steps)
- Vertical stepper with icons
- Glassmorphism cards
- Milestone rows with ETH inputs
- Summary card with deploy button
- Mobile bottom nav

### design/my_contracts/code.html
- "Ledger" header with subtitle
- Filter tabs (All / As Client / As Freelancer)
- 3 metric cards
- Contract table with sorting
- Pagination footer
- Role and status badges

### design/milestone_details/code.html
- Vertical milestone timeline (stepper)
- Status states: Released, In Review, Funded, Unfunded
- Action buttons for client (Approve & Pay, Initiate Dispute)
- Evidence panel (IPFS links)
- Project participants sidebar
- Security badge

### design/chainsteps_protocol/DESIGN.md
- "The Architectural Ledger" design system
- Surface hierarchy (no-line rule)
- Typography: Space Grotesk + Inter
- Elevation through light/opacity, not just shadows
- Component specifications

---

## NOTES

- **Aceternity UI**: https://ui.aceternity.com/ - provides modern components like Hero, BentoGrid, TracingButton, InfiniteScroll, FloatingNav
- All tickets should be verified after fix to ensure no regressions
- Some tickets are blocking others (noted in priority order)
- Design files are HTML mockups using Tailwind CDN - translate to Next.js/React
- Mobile responsiveness is critical for modern UX