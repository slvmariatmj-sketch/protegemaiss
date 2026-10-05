import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const loginSchema = z.object({
  registration_number: z.string().trim().min(1).max(50),
  cpf: z.string().trim().max(20).optional().default(""),
  kind: z.enum(["parent", "student"]),
});

export const portalLogin = createServerFn({ method: "POST" })
  .inputValidator((input) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { signPortalToken } = await import("./portal-token.server");

    const reg = data.registration_number.trim();
    const cpf = onlyDigits(data.cpf);

    const { data: student, error } = await supabaseAdmin
      .from("students")
      .select("id, full_name, cpf, guardian_cpf, registration_number, grade, shift")
      .eq("registration_number", reg)
      .maybeSingle();

    if (error) throw new Error("Erro ao validar matrícula.");
    if (!student) throw new Error("Matrícula ou CPF inválidos.");

    const studentCpf = onlyDigits(student.cpf ?? "");
    const guardianCpf = onlyDigits(student.guardian_cpf ?? "");

    // CPF é opcional: só validamos quando o aluno tem CPF cadastrado E o
    // usuário informou um. Cadastros simplificados (sem CPF) usam apenas matrícula.
    if (data.kind === "student" && studentCpf && cpf && studentCpf !== cpf) {
      throw new Error("Matrícula ou CPF inválidos.");
    }
    if (data.kind === "parent" && guardianCpf && cpf && guardianCpf !== cpf) {
      throw new Error("Matrícula ou CPF do responsável inválidos.");
    }

    const token = signPortalToken({
      sid: student.id,
      kind: data.kind,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });

    return {
      token,
      student: {
        id: student.id,
        full_name: student.full_name,
        registration_number: student.registration_number,
        grade: student.grade,
        shift: student.shift,
      },
    };
  });

const tokenSchema = z.object({ token: z.string().min(10) });

export const getPortalData = createServerFn({ method: "POST" })
  .inputValidator((input) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyPortalToken } = await import("./portal-token.server");

    const payload = verifyPortalToken(data.token);
    if (!payload) throw new Error("Sessão expirada. Faça login novamente.");

    const [studentRes, occRes, attRes, commRes] = await Promise.all([
      supabaseAdmin.from("students").select("*").eq("id", payload.sid).maybeSingle(),
      supabaseAdmin
        .from("occurrences")
        .select("*")
        .eq("student_id", payload.sid)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("attendance")
        .select("*")
        .eq("student_id", payload.sid)
        .order("date", { ascending: false })
        .limit(60),
      supabaseAdmin
        .from("communications")
        .select("*")
        .in("audience", ["all", payload.kind === "parent" ? "parents" : "students"])
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (!studentRes.data) throw new Error("Aluno não encontrado.");

    const absences = (attRes.data ?? []).filter((a) => a.status === "falta").length;

    return {
      kind: payload.kind,
      student: studentRes.data,
      occurrences: occRes.data ?? [],
      attendance: attRes.data ?? [],
      absences,
      communications: commRes.data ?? [],
    };
  });