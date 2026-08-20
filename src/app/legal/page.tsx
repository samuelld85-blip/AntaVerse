import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informations & support",
  description: "Confidentialité, mentions légales, conditions d’utilisation, jeu responsable et support d’AntaVerse.",
};

const SECTIONS = [
  {
    href: "/legal/confidentialite",
    title: "Confidentialité",
    description: "Quelles données AntaVerse utilise, où elles vivent, et vos droits.",
  },
  {
    href: "/legal/mentions-legales",
    title: "Mentions légales",
    description: "Identité de l’éditeur, hébergement, propriété intellectuelle.",
  },
  {
    href: "/legal/conditions-utilisation",
    title: "Conditions générales d’utilisation",
    description: "Les règles d’usage de l’application.",
  },
  {
    href: "/legal/jeu-responsable",
    title: "Jeu responsable",
    description: "Notre position sur les jeux à gorgées et la consommation d’alcool.",
  },
  {
    href: "/support",
    title: "Support",
    description: "Une question, un bug, un mot à nous dire ? Contactez-nous.",
  },
] as const;

export default function LegalHubPage() {
  return (
    <main className="launcher-shell legal-shell">
      <Link href="/" className="launcher-back">
        ← Tous les jeux
      </Link>
      <p className="launcher-eyebrow">AntaVerse</p>
      <h1 className="legal-title">Informations &amp; support</h1>
      <p className="legal-hub-intro">
        Confidentialité, mentions légales, conditions d’utilisation, jeu responsable et support —
        tout ce qui n’est pas un jeu, rassemblé ici.
      </p>
      <ul className="legal-hub-list">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <Link href={section.href} className="legal-hub-card">
              <strong>{section.title}</strong>
              <span>{section.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
