import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/portal-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { getPortalData } from "@/lib/portal-auth.functions";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/portal/aluno")({
  ssr: false,
  head: () => ({ meta: [{ title: "Meu Painel — Protege Mais" }] }),
  component: StudentPortal,
});

function StudentPortal() {
  return <PortalView kind="student" />;
}

export function PortalView({ kind }: { kind: "student" | "parent" }) {
  const nav = useNavigate();
  const fetcher = useServerFn(getPortalData);
  const [data, setData] = useState<Awaited<ReturnType<typeof getPortalData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    const storedKind = localStorage.getItem("portal_kind");
    if (!token || storedKind !== kind) {
      nav({ to: kind === "student" ? "/auth/aluno" : "/auth/responsavel" });
      return;
    }
    fetcher({ data: { token } })
      .then(setData)
      .catch((e) => {
        toast.error(e.message ?? "Sessão expirada.");
        localStorage.removeItem("portal_token");
        nav({ to: kind === "student" ? "/auth/aluno" : "/auth/responsavel" });
      })
      .finally(() => setLoading(false));
  }, [fetcher, kind, nav]);

  function logout() {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_kind");
    nav({ to: "/" });
  }

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando...</div>;
  if (!data) return null;

  const s = data.student;
  const grade = Number(s.performance_grade ?? 0);

  return (
    <PortalShell
      title={kind === "student" ? `Olá, ${s.full_name}` : `Acompanhamento de ${s.full_name}`}
      subtitle={kind === "student" ? "Portal do Aluno" : "Portal do Responsável"}
      onLogout={logout}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Matrícula</p>
          <p className="mt-1 text-lg font-semibold">{s.registration_number}</p>
          <p className="mt-3 text-xs text-muted-foreground">Série / Turno</p>
          <p className="text-sm font-medium">{s.grade} · {s.shift}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Desempenho</p>
          <p className="mt-1 text-3xl font-bold text-[var(--brand-navy)]">{grade.toFixed(1)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.performance_notes ?? "Sem observações."}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Faltas registradas</p>
          <p className="mt-1 text-3xl font-bold text-[var(--brand-navy)]">{data.absences}</p>
          <p className="mt-1 text-xs text-muted-foreground">Últimos 60 registros</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold">Ocorrências</h3>
          <ul className="mt-3 space-y-3">
            {data.occurrences.length === 0 && <li className="text-sm text-muted-foreground">Sem ocorrências registradas.</li>}
            {data.occurrences.slice(0, 8).map((o) => (
              <li key={o.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{o.title}</p>
                  <Badge variant={o.type === "elogio" ? "secondary" : "default"}>{o.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold">Comunicados</h3>
          <ul className="mt-3 space-y-3">
            {data.communications.length === 0 && <li className="text-sm text-muted-foreground">Sem comunicados.</li>}
            {data.communications.slice(0, 6).map((c) => (
              <li key={c.id} className="rounded-lg border border-border p-3">
                <p className="font-medium text-sm">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>


      <div className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-[var(--brand-navy)]" />
          <div>
            <p className="font-semibold">Precisa relatar algo de forma segura?</p>
            <p className="text-sm text-muted-foreground">Use o canal de denúncia anônima. Sua identidade não é registrada.</p>
          </div>
        </div>
        <Button asChild className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy-deep)]">
          <Link to="/denuncia">Abrir denúncia</Link>
        </Button>
      </div>
    </PortalShell>
  );
}