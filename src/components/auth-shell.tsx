import { Link } from "@tanstack/react-router";
import { ProtegeLogo } from "./protege-logo";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-deep)] p-10 text-white md:flex">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div>
          <ProtegeLogo className="h-32 w-32" />
          <h2 className="mt-6 text-3xl font-extrabold">PROTEGE MAIS</h2>
          <p className="mt-2 max-w-sm text-white/75">Defendendo sua integridade todo dia.</p>
        </div>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} Protege Mais</p>
      </div>
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:hidden">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}