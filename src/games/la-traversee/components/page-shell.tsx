import type { ReactNode } from "react";
import { PageShell as SharedPageShell } from "@/games/shared/components/page-shell";
import { Brand } from "./brand";

export function PageShell({ children }: { children: ReactNode }) {
  return <SharedPageShell homeHref="/la-traversee" brand={<Brand compact />}>{children}</SharedPageShell>;
}
