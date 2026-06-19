import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ProtegeLogo } from "@/components/protege-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { submitAnonymousReport, uploadReportImage } from "@/lib/reports.functions";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/denuncia")({
  head: () => ({ meta: [{ title: "Denúncia Anônima — Protege Mais" }] }),
  component: ReportPage,
});

const categories = ["Bullying", "Violência", "Assédio", "Drogas", "Discriminação", "Outro"];

function ReportPage() {
  const submit = useServerFn(submitAnonymousReport);
  const upload = useServerFn(uploadReportImage);
  const [category, setCategory] = useState(categories[0]);
  const [reporterName, setReporterName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function fileToBase64(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let imagePath: string | null = null;
      if (file) {
        if (file.size > 8 * 1024 * 1024) throw new Error("Imagem maior que 8MB.");
        const contentBase64 = await fileToBase64(file);
        const res = await upload({ data: { filename: file.name, contentBase64, contentType: file.type } });
        imagePath = res.path;
      }
      await submit({ data: { category, reporter_name: reporterName.trim(), message, image_path: imagePath } });
      setDone(true);
      toast.success("Denúncia enviada com segurança.");
    } catch (err: any) {
      toast.error(err.message ?? "Não foi possível enviar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="border-b bg-[var(--brand-navy)] text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <div className="flex items-center gap-2">
            <ProtegeLogo className="h-8 w-8" />
            <span className="text-sm font-semibold">Canal de Denúncia</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <Card className="p-6 md:p-8">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-lg bg-[var(--brand-navy)] p-2 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Denúncia Anônima</h1>
              <p className="text-sm text-muted-foreground">
                Sua identidade não é coletada. Apenas a equipe da escola acessa este conteúdo.
              </p>
            </div>
          </div>

          {done ? (
            <div className="rounded-lg border border-[var(--brand-navy)]/30 bg-[var(--brand-navy)]/5 p-6 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-[var(--brand-navy)]" />
              <p className="mt-3 font-semibold">Denúncia recebida com segurança.</p>
              <p className="mt-1 text-sm text-muted-foreground">A equipe escolar vai analisar e tomar as providências.</p>
              <Button asChild className="mt-5 bg-[var(--brand-navy)]"><Link to="/">Voltar ao início</Link></Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" required value={reporterName} onChange={(e) => setReporterName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <Label htmlFor="cat">Categoria</Label>
                <select
                  id="cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="msg">Descreva o ocorrido</Label>
                <Textarea id="msg" required minLength={10} maxLength={4000} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Conte com o máximo de detalhes possível. Local, horário, pessoas envolvidas..." />
              </div>
              <div>
                <Label htmlFor="img">Anexar imagem (opcional)</Label>
                <Input id="img" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou similar. Máximo 8MB.</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[var(--brand-navy)] hover:bg-[var(--brand-navy-deep)]">
                {loading ? "Enviando..." : "Enviar denúncia"}
              </Button>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}