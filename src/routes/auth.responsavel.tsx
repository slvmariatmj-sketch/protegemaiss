import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AuthShell } from "@/components/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { portalLogin } from "@/lib/portal-auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/responsavel")({
  head: () => ({ meta: [{ title: "Acesso dos Responsáveis — Protege Mais" }] }),
  component: ParentAuth,
});

function ParentAuth() {
  const nav = useNavigate();
  const login = useServerFn(portalLogin);
  const [reg, setReg] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ data: { registration_number: reg, cpf, kind: "parent" } });
      localStorage.setItem("portal_token", res.token);
      localStorage.setItem("portal_kind", "parent");
      toast.success(`Bem-vindo(a)! Acompanhando ${res.student.full_name}.`);
      nav({ to: "/portal/responsavel" });
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Acesso dos Responsáveis" subtitle="Acompanhe o desempenho do seu(sua) filho(a).">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="reg">Número de matrícula do aluno</Label>
          <Input id="reg" value={reg} onChange={(e) => setReg(e.target.value)} required maxLength={50} placeholder="Ex.: 2026-0042" />
        </div>
        <div>
          <Label htmlFor="cpf">Seu CPF <span className="text-xs text-muted-foreground">(opcional)</span></Label>
          <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} maxLength={20} placeholder="000.000.000-00" />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-[var(--brand-navy)] hover:bg-[var(--brand-navy-deep)]">
          {loading ? "Validando..." : "Entrar"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          É da equipe escolar? <Link to="/auth/equipe" className="underline">Acesso da equipe</Link>
        </p>
      </form>
    </AuthShell>
  );
}