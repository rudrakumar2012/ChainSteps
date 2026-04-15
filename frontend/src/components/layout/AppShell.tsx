import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <TopBar />
      <main className="ml-64 pt-24 px-8 pb-12">{children}</main>
    </div>
  );
}