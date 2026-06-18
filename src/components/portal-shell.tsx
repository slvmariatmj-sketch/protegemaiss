import { Link } from "@tanstack/react-router";
import { ProtegeLogo } from "./protege-logo";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

export function PortalShell({
  title,
  subtitle,
  onLogout,
  children,
}: {
  title: string;
  subtitle?: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-[var(--brand-navy)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <ProtegeLogo className="h-9 w-9" />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">PROTEGE MAIS</p>
              <p className="text-[10px] uppercase tracking-widest text-white/70">{subtitle ?? "Portal"}</p>
            </div>
          </Link>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-md border border-white/25 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}