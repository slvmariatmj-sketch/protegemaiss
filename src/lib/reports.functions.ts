import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  category: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(4000),
  reporter_name: z.string().trim().max(120).optional().nullable(),
  reporter_cpf: z.string().trim().regex(/^\d{11}$/, "CPF deve ter 11 dígitos (somente números)."),
  image_path: z.string().trim().max(300).optional().nullable(),
});

export const submitAnonymousReport = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("anonymous_reports").insert({
      category: data.category,
      message: data.message,
      reporter_name: data.reporter_name?.trim() || null,
      reporter_cpf: data.reporter_cpf,
      image_url: data.image_path ?? null,
    });
    if (error) throw new Error("Não foi possível enviar a denúncia.");
    return { ok: true };
  });

const uploadSchema = z.object({
  filename: z.string().min(1).max(120),
  contentBase64: z.string().min(1),
  contentType: z.string().min(1).max(120),
});

export const uploadReportImage = createServerFn({ method: "POST" })
  .inputValidator((input) => uploadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const buffer = Buffer.from(data.contentBase64, "base64");
    if (buffer.byteLength > 8 * 1024 * 1024) throw new Error("Imagem muito grande (máx 8MB).");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const { error } = await supabaseAdmin.storage
      .from("report-images")
      .upload(path, buffer, { contentType: data.contentType, upsert: false });
    if (error) throw new Error("Falha ao enviar imagem.");
    return { path };
  });