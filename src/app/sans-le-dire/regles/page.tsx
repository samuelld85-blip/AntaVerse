import { PageShell } from "@/games/sans-le-dire/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const rules = [
  ["Découvrez", "Un mot à faire deviner apparaît à l’écran."],
  ["Faites deviner", "Décrivez le mot sans prononcer les mots interdits."],
  ["Marquez", "L’équipe gagne un point quand le mot est trouvé."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Sans le dire</p>
        <h1>Comment jouer ?</h1>
      </div>
      <ol className="rules-list">
        {rules.map(([title, copy], index) => (
          <li key={title} className="glass-panel">
            <span>{index + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="rules-cta">
        <ButtonLink href="/sans-le-dire/equipes">Lancer une partie</ButtonLink>
      </div>
    </PageShell>
  );
}
