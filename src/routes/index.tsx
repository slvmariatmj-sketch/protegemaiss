import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtegeLogo } from "@/components/protege-logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, ShieldAlert, Briefcase, Megaphone, CalendarDays, BookOpenCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const accesses = [
  {
    to: "/auth/equipe",
    title: "Equipe Escolar",
    desc: "Coordenadores, professores, diretores e pedagogos. Acesso com e-mail institucional.",
    icon: Briefcase,
  },
  {
    to: "/auth/responsavel",
    title: "Responsáveis",
    desc: "Acompanhe seu(sua) filho(a). Acesso com matrícula e CPF do responsável.",
    icon: Users,
  },
  {
    to: "/auth/aluno",
    title: "Alunos",
    desc: "Veja seu desempenho, ocorrências e comunicados. Acesso com matrícula e CPF.",
    icon: GraduationCap,
  },
] as const;

const features = [
  { icon: BookOpenCheck, title: "Ocorrências e indisciplinas", desc: "Registro detalhado por aluno, série e turno." },
  { icon: CalendarDays, title: "Faltas e eventos", desc: "Controle de presença e calendário escolar." },
  { icon: Megaphone, title: "Comunicados oficiais", desc: "Mensagens segmentadas para equipe, pais ou alunos." },
  { icon: ShieldAlert, title: "Denúncia anônima", desc: "Canal seguro com anexo de imagens, sem identificação." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.005_240)] text-foreground">
      <header className="border-b border-border/60 bg-[var(--brand-navy)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <ProtegeLogo className="h-16 w-auto" />
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-navy)] to-[var(--brand-navy-deep)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
              Defendendo sua integridade todo dia
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              A gestão escolar segura e organizada para toda a comunidade.
            </h1>
            <p className="mt-5 max-w-lg text-white/80">
              Registre ocorrências, faltas, comunicados e eventos. Pais e alunos acompanham o desempenho em tempo real.
              Um canal anônimo protege quem precisa falar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-[var(--brand-navy)] hover:bg-white/90">
                <Link to="/auth/equipe">Acesso da equipe</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link to="/denuncia">Denúncia anônima</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-3xl bg-white/5 p-10 ring-1 ring-white/10 backdrop-blur">
              <ProtegeLogo className="h-56 w-56" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-2xl font-bold text-foreground">Escolha seu acesso</h2>
        <p className="mt-1 text-sm text-muted-foreground">Três portas, uma plataforma. Cada perfil vê o que importa.</p>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {accesses.map((a) => (
            <Link key={a.to} to={a.to} className="group">
              <Card className="h-full border-border/70 p-6 transition hover:-translate-y-0.5 hover:border-[var(--brand-navy)] hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-navy)] text-white">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
                <p className="mt-4 text-sm font-medium text-[var(--brand-navy)] group-hover:underline">Entrar →</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-2xl font-bold">O que a plataforma faz</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border/70 bg-card p-5">
                <f.icon className="h-6 w-6 text-[var(--brand-navy)]" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-[var(--brand-navy-deep)] py-8 text-center text-sm text-white/70">
        <ProtegeLogo className="mx-auto mb-3 h-12 w-12" />
        Protege Mais © {new Date().getFullYear()} — Defendendo sua integridade todo dia.
      </footer>
    </div>
  );
}
