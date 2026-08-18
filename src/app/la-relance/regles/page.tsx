import { PageShell } from "@/games/la-relance/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const rules = [
  ["Choisissez", "Sélectionnez un thème pour lancer la partie."],
  ["Répondez", "À tour de rôle, trouvez une réponse liée au thème."],
  ["Continuez", "La partie se poursuit jusqu’à épuisement des idées."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">La Relance</p>
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
        <ButtonLink href="/la-relance/equipes">Lancer une partie</ButtonLink>
      </div>
    </PageShell>
  );
}
