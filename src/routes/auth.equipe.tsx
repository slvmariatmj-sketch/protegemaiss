import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/equipe")({
  head: () => ({ meta: [{ title: "Acesso da Equipe — Protege Mais" }] }),
  component: StaffAuth,
});

function StaffAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"coordinator" | "teacher" | "director" | "pedagogue">("teacher");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/painel" },
        });
        if (error) throw error;
        // Garante sessão para que o RLS permita o insert (user_id = auth.uid())
        let userId = data.session?.user.id ?? null;
        if (!data.session) {
          const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            toast.success("Cadastro criado. Confirme seu e-mail e faça login para concluir.");
            setMode("login");
            return;
          }
          userId = signIn.user?.id ?? null;
        }
        if (userId) {
          const { error: roleErr } = await supabase
            .from("user_roles")
            .upsert({ user_id: userId, role, full_name: name }, { onConflict: "user_id,role" });
          if (roleErr) throw roleErr;
        }
        toast.success("Conta criada e equipe vinculada.");
        navigate({ to: "/painel" });
      } else {
        const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Se a conta antiga ficou sem papel (cadastro anterior bugado), grava agora
        if (signIn.user) {
          const u = signIn.user;
          // Em segundo plano: não bloqueia a entrada
          void supabase
            .from("user_roles")
            .select("id")
            .eq("user_id", u.id)
            .maybeSingle()
            .then(({ data: existing }) => {
              if (!existing) {
                void supabase.from("user_roles").insert({
                  user_id: u.id,
                  role: "teacher",
                  full_name: u.email ?? "Equipe",
                });
              }
            });
        }
        toast.success("Bem-vindo(a)!");
        navigate({ to: "/painel" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={mode === "login" ? "Acesso da Equipe" : "Cadastro da Equipe"}
      subtitle="Coordenadores, professores, diretores e pedagogos."
    >
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="teacher">Professor(a)</option>
                <option value="coordinator">Coordenador(a)</option>
                <option value="director">Diretor(a)</option>
                <option value="pedagogue">Pedagogo(a)</option>
              </select>
            </div>
          </>
        )}
        <div>
          <Label htmlFor="email">E-mail institucional</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-[var(--brand-navy)] hover:bg-[var(--brand-navy-deep)]">
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "Primeiro acesso? Criar conta" : "Já tenho conta — entrar"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Você é responsável ou aluno?{" "}
          <Link to="/auth/responsavel" className="underline">Acesso de responsáveis</Link>
          {" · "}
          <Link to="/auth/aluno" className="underline">Acesso de alunos</Link>
        </p>
      </form>
    </AuthShell>
  );
}