import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(context: any) {
  const { data, error } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
  if (error || !data) throw new Error("Acesso restrito à equipe.");
}

export const deleteAnonymousReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
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