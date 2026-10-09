import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/redefinir-senha")({
  head: () => ({ meta: [{ title: "Redefinir senha — Protege Mais" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    // O link do e-mail traz o token na URL; o Supabase cria a sessão de recuperação.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setTimeout(() => setReady((r) => r), 0);
    });
    const timer = setTimeout(() => {
      setReady((r) => {
        if (!r) setInvalid(true);
        return r;
      });
    }, 4000);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha redefinida com sucesso! Faça login com a nova senha.");
      navigate({ to: "/auth/equipe" });
    } catch (err: any) {
      toast.error(err.message ?? "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Redefinir senha" subtitle="Crie uma nova senha para acessar o painel da equipe.">
      {invalid && !ready ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Link inválido ou expirado. Solicite um novo link de recuperação na tela de login.
          </p>
          <Link to="/auth/equipe" className="text-sm underline text-foreground">
            Voltar para o login
          </Link>
        </div>
      ) : !ready ? (
        <p className="text-sm text-muted-foreground">Validando link de recuperação...</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[var(--brand-navy)] hover:bg-[var(--brand-navy-deep)]">
            {loading ? "Aguarde..." : "Salvar nova senha"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
