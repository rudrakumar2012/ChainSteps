"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface MobileNavContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) throw new Error("useMobileNav must be used within AppShell");
  return context;
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => setMobileOpen((prev) => !prev);
  const close = () => setMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <MobileNavContext.Provider value={{ isOpen: mobileOpen, toggle, close }}>
      <div className="min-h-screen bg-surface">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={close}
          />
        )}

        {/* Sidebar — always visible on lg+, slide-in drawer on mobile */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 transition-transform duration-300
            lg:translate-x-0 lg:block
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar onNavClick={close} />
        </div>

        <TopBar />

        <main className="ml-0 lg:ml-64 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-12 min-h-screen">
          {children}
        </main>
      </div>
    </MobileNavContext.Provider>
  );
}