import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertReportManager(context: any) {
  const { data, error } = await context.supabase.rpc("can_view_reports", { _user_id: context.userId });
  if (error || !data) throw new Error("Acesso restrito a diretores, pedagogos e coordenadores.");
}

async function assertStaff(context: any) {
  const { data, error } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
  if (error || !data) throw new Error("Acesso restrito à equipe.");
}

export const deleteAnonymousReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertReportManager(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("anonymous_reports").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir a denúncia.");
    return { ok: true };
  });

export const listRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [staffRes, studentsRes] = await Promise.all([
      supabaseAdmin.from("user_roles").select("id, user_id, role, full_name, created_at").order("created_at", { ascending: false }),
      supabaseAdmin.from("students").select("id, full_name, registration_number, grade, shift, guardian_name, created_at").order("created_at", { ascending: false }),
    ]);
    if (staffRes.error) throw new Error("Falha ao listar equipe.");
    if (studentsRes.error) throw new Error("Falha ao listar alunos.");

    // Fetch emails via Auth Admin API
    const emailsByUser = new Map<string, string>();
    try {
      const uniq = Array.from(new Set((staffRes.data ?? []).map((r: any) => r.user_id)));
      await Promise.all(
        uniq.map(async (uid) => {
          const { data } = await supabaseAdmin.auth.admin.getUserById(uid);
          if (data?.user?.email) emailsByUser.set(uid, data.user.email);
        })
      );
    } catch {
      /* ignore email lookup failures */
    }

    return {
      staff: (staffRes.data ?? []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        full_name: r.full_name,
        role: r.role,
        email: emailsByUser.get(r.user_id) ?? null,
        created_at: r.created_at,
      })),
      students: studentsRes.data ?? [],
    };
  });
export const revealReporterCpf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [d, c] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "director" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "coordinator" }),
    ]);
    if (!d.data && !c.data) throw new Error("Apenas diretores e coordenadores podem revelar o CPF.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("anonymous_reports").select("reporter_cpf").eq("id", data.id).single();
    if (error) throw new Error("Não foi possível revelar o CPF.");
    return { cpf: row?.reporter_cpf ?? null };
  });

async function assertDirector(context: any) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "director" });
  if (error || !data) throw new Error("Apenas diretores podem aprovar cadastros.");
}

export const listPendingStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertDirector(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, full_name, created_at")
      .eq("approved", false)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Não foi possível carregar os pedidos.");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emails = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? ""]));
    return (data ?? []).map((r) => ({ ...r, email: emails.get(r.user_id) ?? "" }));
  });

const roleEnum = z.enum(["teacher", "coordinator", "director", "pedagogue"]);

export const approveStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), role: roleEnum }).parse(input))
  .handler(async ({ data, context }) => {
    await assertDirector(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .update({ role: data.role, approved: true })
      .eq("id", data.id)
      .eq("approved", false);
    if (error) throw new Error("Não foi possível aprovar.");
    return { ok: true };
  });

export const rejectStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertDirector(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles").delete().eq("id", data.id).eq("approved", false);
    if (error) throw new Error("Não foi possível recusar.");
    return { ok: true };
  });
