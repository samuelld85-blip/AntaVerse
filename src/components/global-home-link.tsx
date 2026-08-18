import Link from "next/link";

export function GlobalHomeLink({ label = "Tous les jeux" }: { label?: string }) {
  return (
    <Link href="/" className="global-home-link" aria-label="Revenir à l’accueil AntaVerse">
      <span aria-hidden="true">⌂</span>
      <span>{label}</span>
    </Link>
  );
}
