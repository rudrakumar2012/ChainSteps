# ChainSteps UI/UX Audit Report

## High Severity Issues

1. **Touch targets systematically below 44px minimum** — Button `sm` (28px), `md` (36px), disconnect buttons (32px), delete/close buttons (32px), filter buttons (32px) all fail WCAG touch target guidelines. Affects: `Button.tsx:37-38`, `ConnectButton.tsx:80`, `MilestonesStep.tsx:139`, `EvidencePanel.tsx:150`, `WalletChooserModal.tsx:48`, `TransactionToast.tsx:72-74`

2. **No focus trap in modals** — Mobile sidebar and WalletChooserModal lack focus trapping, so keyboard focus escapes behind the overlay. Violates WCAG. (`AppShell.tsx`, `WalletChooserModal.tsx`)

3. **Missing ARIA on WalletChooserModal** — No `role="dialog"` or `aria-modal="true"`, so screen readers can't identify it as a modal. (`WalletChooserModal.tsx:35-42`)

4. **ProgressBar lacks ARIA attributes** — Missing `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. (`ProgressBar.tsx:20-25`)

5. **No `prefers-reduced-motion` support** — BlockchainCube, pulse animations, and framer-motion transitions all run regardless of motion preferences. (`BlockchainCube.tsx`, `globals.css`)

6. **Contracts page table not mobile-friendly** — Full table with `px-8` padding and no card-based alternative view. Nearly unusable on small screens. (`contracts/page.tsx:141-232`)

7. **Create page step indicator hidden on mobile** — `hidden md:block` means mobile users have zero visual indication of which step they're on. (`create/page.tsx:223`)

8. **Range sliders touch-unfriendly** — Native `<input type="range">` thumbs are too small for touch. Affects dispute resolution sliders. (`contracts/[id]/page.tsx:557-563`, `disputes/page.tsx:267-276`)

9. **MilestonesStep form overflows on narrow screens** — `flex items-end gap-4` with fixed `w-32` amount input doesn't wrap. (`MilestonesStep.tsx:62`)

10. **ReviewStep parties grid `grid-cols-3` not responsive** — Three columns of address data unreadable on narrow screens. (`ReviewStep.tsx:33`)

---

## Medium Severity Issues

| # | Issue | Location |
|---|-------|----------|
| 1 | GlassCard `p-6` padding too generous for 320px screens | `GlassCard.tsx:22-24` |
| 2 | Multiple `text-[10px]` / `text-[9px]` below readable font sizes | `StatusBadge.tsx:73`, `Sidebar.tsx:74,79,86`, `page.tsx:29` |
| 3 | Z-index conflicts — Header, Sidebar, Toasts, Modal all at `z-50` | `HomeHeader.tsx:41`, `AppShell.tsx:48-56`, `ToastContainer.tsx:11` |
| 4 | HomeHeader mobile nav items ~28px touch height | `HomeHeader.tsx:98` |
| 5 | ContractsLedger table rows lack keyboard accessibility | `ContractsLedger.tsx:108-113` |
| 6 | No screen reader text on loading/error spinners | `dashboard/page.tsx:34-38`, `contracts/[id]/page.tsx:49-52` |
| 7 | EvidencePanel drop zone lacks drag feedback and keyboard access | `EvidencePanel.tsx:59,110-112` |
| 8 | Toasts positioned bottom-right; should be bottom-centered on mobile | `ToastContainer.tsx:11` |
| 9 | `hover:scale` / `hover:shadow` create sticky states on touch | `ContractRow.tsx:30`, `StatsCard.tsx:25`, `GlassCard.tsx:15-17` |
| 10 | SSR hydration mismatch risk in BlockchainCube (`isMobile` state) | `BlockchainCube.tsx:46-52` |
| 11 | Form cards `p-8` too tight on 320px screens | `create/page.tsx:290,303,315` |
| 12 | `h-screen` doesn't account for mobile browser dynamic viewport | `Sidebar.tsx:30` |
| 13 | No close button inside mobile sidebar | `Sidebar.tsx` |
| 14 | `ghost` Button variant references undefined `surface-variant` color | `Button.tsx:31` |
| 15 | Hamburger button 40x40px, below 44px minimum | `TopBar.tsx:20` |
| 16 | Notifications hidden on mobile (`hidden sm:flex`) | `TopBar.tsx:38` |
| 17 | Cancel Escrow button touch target too small | `contracts/[id]/page.tsx:338,348` |
| 18 | "View Contract" button ~80x30px, below touch minimum | `disputes/page.tsx:243` |

---

## Low Severity Issues

| # | Issue | Location |
|---|-------|----------|
| 1 | Custom scrollbar 4px too thin for hybrid touch devices | `globals.css:110-113` |
| 2 | `pulse-glow` animates `box-shadow` (GPU-heavy on mobile) | `globals.css:150-157` |
| 3 | Orbital node `w-3 h-3` adds visual noise on mobile | `BlockchainCube.tsx:123` |
| 4 | Dashboard grid skips `sm:grid-cols-2` breakpoint | `Dashboard.tsx:20` |
| 5 | `truncate` on addresses may not show enough characters | `ReviewStep.tsx:39,46,54` |
| 6 | No skip-to-content link on homepage | `page.tsx` |
| 7 | ConnectButton disconnect missing `aria-label` | `ConnectButton.tsx:78-84` |
| 8 | EvidencePanel file name `max-w-[200px]` not responsive | `EvidencePanel.tsx:140,204` |
| 9 | Timeline connector fixed `h-12` may misalign with varying card heights | `MilestoneTimeline.tsx:78` |
| 10 | ContractsGrid skips `md:grid-cols-2` breakpoint | `ContractsGrid.tsx:31` |