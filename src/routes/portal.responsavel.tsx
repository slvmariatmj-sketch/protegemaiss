import { createFileRoute } from "@tanstack/react-router";
import { PortalView } from "./portal.aluno";

export const Route = createFileRoute("/portal/responsavel")({
  ssr: false,
  head: () => ({ meta: [{ title: "Portal do Responsável — Protege Mais" }] }),
  component: () => <PortalView kind="parent" />,
});