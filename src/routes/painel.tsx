import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProtegeLogo } from "@/components/protege-logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogOut, Plus, Users, Megaphone, CalendarDays, ShieldAlert, BookOpenCheck, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/painel")({
  ssr: false,
  head: () => ({ meta: [{ title: "Painel da Equipe — Protege Mais" }] }),
  component: StaffPanel,
});

type Student = {
  id: string; full_name: string; registration_number: string; cpf: string;
  grade: string; shift: string; guardian_name: string | null; guardian_cpf: string | null;
  performance_grade: number | null; performance_notes: string | null;
};

function StaffPanel() {
  const nav = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { nav({ to: "/auth/equipe" }); return; }
      setUserEmail(data.user.email ?? null);
      setChecking(false);
    });
  }, [nav]);

  async function logout() {
    await supabase.auth.signOut();
    nav({ to: "/" });
  }

  if (checking) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-[var(--brand-navy)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <ProtegeLogo className="h-9 w-9" />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">PROTEGE MAIS</p>
              <p className="text-[10px] uppercase tracking-widest text-white/70">Painel da Equipe</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/70 sm:inline">{userEmail}</span>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-white/25 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Tabs defaultValue="alunos" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="alunos" className="h-14 rounded-xl border border-border bg-card text-sm font-medium shadow-sm data-[state=active]:border-[var(--brand-navy)] data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white"><Users className="mr-2 h-4 w-4" />Alunos</TabsTrigger>
            <TabsTrigger value="ocorrencias" className="h-14 rounded-xl border border-border bg-card text-sm font-medium shadow-sm data-[state=active]:border-[var(--brand-navy)] data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white"><BookOpenCheck className="mr-2 h-4 w-4" />Ocorrências</TabsTrigger>
            <TabsTrigger value="faltas" className="h-14 rounded-xl border border-border bg-card text-sm font-medium shadow-sm data-[state=active]:border-[var(--brand-navy)] data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white"><ClipboardList className="mr-2 h-4 w-4" />Faltas</TabsTrigger>
            <TabsTrigger value="comunicados" className="h-14 rounded-xl border border-border bg-card text-sm font-medium shadow-sm data-[state=active]:border-[var(--brand-navy)] data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white"><Megaphone className="mr-2 h-4 w-4" />Comunicados</TabsTrigger>
            <TabsTrigger value="eventos" className="h-14 rounded-xl border border-border bg-card text-sm font-medium shadow-sm data-[state=active]:border-[var(--brand-navy)] data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white"><CalendarDays className="mr-2 h-4 w-4" />Eventos</TabsTrigger>
            <TabsTrigger value="denuncias" className="h-14 rounded-xl border border-border bg-card text-sm font-medium shadow-sm data-[state=active]:border-[var(--brand-navy)] data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white"><ShieldAlert className="mr-2 h-4 w-4" />Denúncias</TabsTrigger>
          </TabsList>

          <TabsContent value="alunos" className="mt-8"><SectionHeader icon={Users} title="Alunos" subtitle="Cadastro e listagem por série e turno." /><StudentsTab /></TabsContent>
          <TabsContent value="ocorrencias" className="mt-8"><SectionHeader icon={BookOpenCheck} title="Ocorrências & Indisciplinas" subtitle="Registre acontecimentos relevantes da rotina escolar." /><OccurrencesTab /></TabsContent>
          <TabsContent value="faltas" className="mt-8"><SectionHeader icon={ClipboardList} title="Faltas & Presenças" subtitle="Controle diário de frequência dos alunos." /><AttendanceTab /></TabsContent>
          <TabsContent value="comunicados" className="mt-8"><SectionHeader icon={Megaphone} title="Comunicados" subtitle="Publique avisos para equipe, responsáveis e alunos." /><CommunicationsTab /></TabsContent>
          <TabsContent value="eventos" className="mt-8"><SectionHeader icon={CalendarDays} title="Eventos da escola" subtitle="Agenda de atividades, reuniões e datas importantes." /><EventsTab /></TabsContent>
          <TabsContent value="denuncias" className="mt-8"><SectionHeader icon={ShieldAlert} title="Denúncias anônimas" subtitle="Acompanhe e atualize relatos recebidos." /><ReportsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--brand-navy)] text-white shadow-md">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)]">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/* ---------------- Students ---------------- */
function StudentsTab() {
  const [list, setList] = useState<Student[]>([]);
  const [grade, setGrade] = useState<string>("all");
  const [shift, setShift] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    let q = supabase.from("students").select("*").order("grade").order("full_name");
    if (grade !== "all") q = q.eq("grade", grade);
    if (shift !== "all") q = q.eq("shift", shift);
    const { data, error } = await q;
    if (error) toast.error(error.message); else setList(data as Student[]);
  }, [grade, shift]);

  useEffect(() => { load(); }, [load]);

  const grades = Array.from(new Set(list.map((s) => s.grade))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label>Série</Label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">Todas</option>
            {grades.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <Label>Turno</Label>
          <select value={shift} onChange={(e) => setShift(e.target.value)} className="mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">Todos</option>
            <option value="manhã">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
            <option value="integral">Integral</option>
          </select>
        </div>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy-deep)]"><Plus className="mr-1 h-4 w-4" />Novo aluno</Button>
            </DialogTrigger>
            <StudentDialog onSaved={() => { setOpen(false); load(); }} />
          </Dialog>
        </div>
      </div>

      {Object.entries(groupBy(list, (s) => `${s.grade} — ${cap(s.shift)}`)).map(([key, items]) => (
        <Card key={key} className="p-5">
          <h3 className="mb-3 font-semibold">{key} <span className="ml-2 text-xs text-muted-foreground">({items.length})</span></h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <div key={s.id} className="rounded-lg border border-border bg-background p-3">
                <p className="font-medium">{s.full_name}</p>
                <p className="text-xs text-muted-foreground">Mat. {s.registration_number} · CPF {s.cpf}</p>
                <p className="mt-1 text-xs">Resp.: {s.guardian_name ?? "—"}</p>
                <p className="mt-1 text-xs">Nota: <span className="font-semibold">{Number(s.performance_grade ?? 0).toFixed(1)}</span></p>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aluno cadastrado.</p>}
    </div>
  );
}

function StudentDialog({ onSaved }: { onSaved: () => void }) {
  const [f, setF] = useState({ full_name: "", registration_number: "", cpf: "", grade: "", shift: "manhã", guardian_name: "", guardian_cpf: "", performance_grade: "0", performance_notes: "" });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    const { error } = await supabase.from("students").insert({
      full_name: f.full_name, registration_number: f.registration_number, cpf: f.cpf,
      grade: f.grade, shift: f.shift, guardian_name: f.guardian_name || null,
      guardian_cpf: f.guardian_cpf || null, performance_grade: Number(f.performance_grade) || 0,
      performance_notes: f.performance_notes || null,
    });
    if (error) toast.error(error.message); else { toast.success("Aluno cadastrado."); onSaved(); }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Novo aluno</DialogTitle></DialogHeader>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nome completo" className="md:col-span-2"><Input value={f.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
        <Field label="Matrícula"><Input value={f.registration_number} onChange={(e) => set("registration_number", e.target.value)} /></Field>
        <Field label="CPF do aluno"><Input value={f.cpf} onChange={(e) => set("cpf", e.target.value)} /></Field>
        <Field label="Série"><Input value={f.grade} onChange={(e) => set("grade", e.target.value)} placeholder="Ex.: 9º ano A" /></Field>
        <Field label="Turno">
          <select value={f.shift} onChange={(e) => set("shift", e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="manhã">Manhã</option><option value="tarde">Tarde</option><option value="noite">Noite</option><option value="integral">Integral</option>
          </select>
        </Field>
        <Field label="Nome do responsável"><Input value={f.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} /></Field>
        <Field label="CPF do responsável"><Input value={f.guardian_cpf} onChange={(e) => set("guardian_cpf", e.target.value)} /></Field>
        <Field label="Nota geral"><Input type="number" step="0.1" value={f.performance_grade} onChange={(e) => set("performance_grade", e.target.value)} /></Field>
        <Field label="Observações de desempenho" className="md:col-span-2"><Textarea rows={2} value={f.performance_notes} onChange={(e) => set("performance_notes", e.target.value)} /></Field>
      </div>
      <DialogFooter><Button onClick={save} className="bg-[var(--brand-navy)]">Salvar</Button></DialogFooter>
    </DialogContent>
  );
}

/* ---------------- Occurrences ---------------- */
function OccurrencesTab() {
  const [list, setList] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from("occurrences").select("*, students(full_name, grade, shift)").order("created_at", { ascending: false }).limit(100),
      supabase.from("students").select("id, full_name, registration_number, cpf, grade, shift, guardian_name, guardian_cpf, performance_grade, performance_notes").order("full_name"),
    ]);
    if (a.data) setList(a.data);
    if (b.data) setStudents(b.data as Student[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[var(--brand-navy)]"><Plus className="mr-1 h-4 w-4" />Registrar</Button></DialogTrigger>
          <OccurrenceDialog students={students} onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <Card className="p-0">
        <ul className="divide-y">
          {list.length === 0 && <li className="p-5 text-sm text-muted-foreground">Nenhum registro.</li>}
          {list.map((o) => (
            <li key={o.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{o.title} <Badge className="ml-2">{o.type}</Badge></p>
                  <p className="text-xs text-muted-foreground">{o.students?.full_name} · {o.students?.grade} · {o.students?.shift}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <p className="mt-2 text-sm">{o.description}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function OccurrenceDialog({ students, onSaved }: { students: Student[]; onSaved: () => void }) {
  const [f, setF] = useState({ student_id: students[0]?.id ?? "", type: "ocorrencia", title: "", description: "" });
  async function save() {
    if (!f.student_id) return toast.error("Cadastre um aluno antes.");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("occurrences").insert({ ...f, created_by: u.user?.id });
    if (error) toast.error(error.message); else { toast.success("Ocorrência registrada."); onSaved(); }
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nova ocorrência</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <Field label="Aluno">
          <select value={f.student_id} onChange={(e) => setF({ ...f, student_id: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} — {s.grade} {s.shift}</option>)}
          </select>
        </Field>
        <Field label="Tipo">
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="ocorrencia">Ocorrência</option>
            <option value="indisciplina">Indisciplina</option>
            <option value="elogio">Elogio</option>
          </select>
        </Field>
        <Field label="Título"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Descrição"><Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </div>
      <DialogFooter><Button onClick={save} className="bg-[var(--brand-navy)]">Salvar</Button></DialogFooter>
    </DialogContent>
  );
}

/* ---------------- Attendance ---------------- */
function AttendanceTab() {
  const [list, setList] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from("attendance").select("*, students(full_name, grade, shift)").order("date", { ascending: false }).limit(100),
      supabase.from("students").select("id, full_name, registration_number, cpf, grade, shift, guardian_name, guardian_cpf, performance_grade, performance_notes").order("full_name"),
    ]);
    if (a.data) setList(a.data);
    if (b.data) setStudents(b.data as Student[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[var(--brand-navy)]"><Plus className="mr-1 h-4 w-4" />Registrar</Button></DialogTrigger>
          <AttendanceDialog students={students} onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <Card className="p-0">
        <ul className="divide-y">
          {list.length === 0 && <li className="p-5 text-sm text-muted-foreground">Nenhum registro.</li>}
          {list.map((a) => (
            <li key={a.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{a.students?.full_name} <Badge className="ml-2">{a.status}</Badge></p>
                <p className="text-xs text-muted-foreground">{a.students?.grade} · {a.students?.shift}</p>
                {a.notes && <p className="mt-1 text-sm">{a.notes}</p>}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("pt-BR")}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
function AttendanceDialog({ students, onSaved }: { students: Student[]; onSaved: () => void }) {
  const [f, setF] = useState({ student_id: students[0]?.id ?? "", date: new Date().toISOString().slice(0, 10), status: "falta", notes: "" });
  async function save() {
    if (!f.student_id) return toast.error("Cadastre um aluno antes.");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("attendance").insert({ ...f, created_by: u.user?.id });
    if (error) toast.error(error.message); else { toast.success("Registrado."); onSaved(); }
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Registrar presença/falta</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <Field label="Aluno">
          <select value={f.student_id} onChange={(e) => setF({ ...f, student_id: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} — {s.grade}</option>)}
          </select>
        </Field>
        <Field label="Data"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Situação">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="falta">Falta</option><option value="presenca">Presença</option>
            <option value="atraso">Atraso</option><option value="justificada">Falta justificada</option>
          </select>
        </Field>
        <Field label="Observações"><Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      </div>
      <DialogFooter><Button onClick={save} className="bg-[var(--brand-navy)]">Salvar</Button></DialogFooter>
    </DialogContent>
  );
}

/* ---------------- Communications ---------------- */
function CommunicationsTab() {
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    const { data } = await supabase.from("communications").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setList(data);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[var(--brand-navy)]"><Plus className="mr-1 h-4 w-4" />Novo comunicado</Button></DialogTrigger>
          <CommunicationDialog onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum comunicado.</p>}
        {list.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{c.title}</p>
              <Badge variant="secondary">{c.audience}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{c.content}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("pt-BR")}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
function CommunicationDialog({ onSaved }: { onSaved: () => void }) {
  const [f, setF] = useState({ title: "", content: "", audience: "all" });
  async function save() {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("communications").insert({ ...f, created_by: u.user?.id });
    if (error) toast.error(error.message); else { toast.success("Comunicado publicado."); onSaved(); }
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Novo comunicado</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <Field label="Título"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Para">
          <select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">Todos</option><option value="staff">Equipe</option>
            <option value="parents">Responsáveis</option><option value="students">Alunos</option>
          </select>
        </Field>
        <Field label="Mensagem"><Textarea rows={5} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} /></Field>
      </div>
      <DialogFooter><Button onClick={save} className="bg-[var(--brand-navy)]">Publicar</Button></DialogFooter>
    </DialogContent>
  );
}

/* ---------------- Events ---------------- */
function EventsTab() {
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    const { data } = await supabase.from("school_events").select("*").order("event_date", { ascending: true }).limit(50);
    if (data) setList(data);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[var(--brand-navy)]"><Plus className="mr-1 h-4 w-4" />Novo evento</Button></DialogTrigger>
          <EventDialog onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum evento.</p>}
        {list.map((e) => (
          <Card key={e.id} className="p-4">
            <p className="font-semibold">{e.title}</p>
            <p className="text-xs text-muted-foreground">{new Date(e.event_date).toLocaleString("pt-BR")}{e.location ? ` · ${e.location}` : ""}</p>
            {e.description && <p className="mt-2 text-sm">{e.description}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
function EventDialog({ onSaved }: { onSaved: () => void }) {
  const [f, setF] = useState({ title: "", description: "", location: "", event_date: "" });
  async function save() {
    if (!f.event_date) return toast.error("Informe a data.");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("school_events").insert({
      title: f.title, description: f.description || null, location: f.location || null,
      event_date: new Date(f.event_date).toISOString(), created_by: u.user?.id,
    });
    if (error) toast.error(error.message); else { toast.success("Evento criado."); onSaved(); }
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Novo evento</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <Field label="Título"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Data e hora"><Input type="datetime-local" value={f.event_date} onChange={(e) => setF({ ...f, event_date: e.target.value })} /></Field>
        <Field label="Local"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        <Field label="Descrição"><Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </div>
      <DialogFooter><Button onClick={save} className="bg-[var(--brand-navy)]">Salvar</Button></DialogFooter>
    </DialogContent>
  );
}

/* ---------------- Anonymous reports ---------------- */
function ReportsTab() {
  const [list, setList] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("anonymous_reports").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) toast.error(error.message); else setList(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("anonymous_reports").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Atualizado."); load(); }
  }

  async function openImage(path: string) {
    const { data, error } = await supabase.storage.from("report-images").createSignedUrl(path, 300);
    if (error || !data) return toast.error("Não foi possível abrir a imagem.");
    window.open(data.signedUrl, "_blank");
  }

  return (
    <Card className="p-0">
      <ul className="divide-y">
        {list.length === 0 && <li className="p-5 text-sm text-muted-foreground">Nenhuma denúncia recebida.</li>}
        {list.map((r) => (
          <li key={r.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge>{r.category}</Badge>
                <Badge variant="secondary">{r.status}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex gap-2">
                {r.image_url && <Button size="sm" variant="outline" onClick={() => openImage(r.image_url)}>Ver anexo</Button>}
                <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                  <option value="novo">Novo</option>
                  <option value="em_analise">Em análise</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-sm">{r.message}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------------- helpers ---------------- */
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label>{label}</Label><div className="mt-1">{children}</div></div>;
}
function groupBy<T>(arr: T[], key: (t: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => { const k = key(item); (acc[k] ||= []).push(item); return acc; }, {} as Record<string, T[]>);
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }