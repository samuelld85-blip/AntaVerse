import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

const LEGAL_LINKS = [
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/mentions-legales", label: "Mentions légales" },
  { href: "/legal/conditions-utilisation", label: "CGU" },
  { href: "/legal/jeu-responsable", label: "Jeu responsable" },
  { href: "/support", label: "Support" },
] as const;

export function LegalPageShell({
  title,
  intro,
  backHref = "/legal",
  backLabel = "Informations & support",
  children,
}: {
  title: string;
  intro?: ReactNode;
  backHref?: Route;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <main className="launcher-shell legal-shell">
      <Link href={backHref} className="launcher-back">
        ← {backLabel}
      </Link>
      <h1 className="legal-title">{title}</h1>
      {intro ? <div className="legal-intro">{intro}</div> : null}
      <div className="legal-content">{children}</div>
      <nav className="legal-nav" aria-label="Documents légaux">
        {LEGAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
