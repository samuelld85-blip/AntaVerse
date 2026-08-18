import { PageShell } from "@/games/quoi-de-9/components/page-shell";
import { ButtonLink } from "@/games/quoi-de-9/components/ui";

const rules = [
  ["Passe", "L’équipe adverse garde le téléphone et voit les réponses."],
  ["Choisis", "Décidez d’utiliser un joker, puis choisissez la difficulté."],
  ["Joue", "Une équipe répond pendant que l’autre valide chaque bonne réponse."],
  ["Alterne", "Consultez le score, échangez les rôles et recommencez."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-text)]">
          En 30 secondes
        </p>
        <h1 className="display-face mt-3 text-6xl leading-[0.88]">Comment jouer ?</h1>
      </div>
      <ol className="grid gap-3">
        {rules.map(([title, copy], index) => (
          <li key={title} className="glass-panel flex gap-4 rounded-3xl p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-black">
              {index + 1}
            </span>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{copy}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-8">
        <ButtonLink href="/quoi-de-9/creer">On lance une partie</ButtonLink>
      </div>
    </PageShell>
  );
}
