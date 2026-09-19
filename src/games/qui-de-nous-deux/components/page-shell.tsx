import { PageShell as SharedPageShell } from "@/games/shared/components/page-shell";
import { Brand } from "./brand";
import type { ReactNode } from "react";
import type { Route } from "next";

export function PageShell({ children }: { children: ReactNode }) {
  return <SharedPageShell homeHref={"/qui-de-nous-deux" as Route} brand={<Brand compact />}>{children}</SharedPageShell>;
}
