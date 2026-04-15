# BUFS (Bugs, Unfinished, Fixes, Suggestions)

## Phase 4A - Project Setup & Design System

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
- **Status:** To Improve (not blocking)

**C. Wallet Connection State**
- **Issue:** Wallet placeholder shows "Not Connected" but no real wallet state management
- **Status:** Phase 4D (Wallet Integration) task