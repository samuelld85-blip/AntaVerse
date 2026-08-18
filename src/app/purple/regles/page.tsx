import { PageShell } from "@/games/purple/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const rules = [
  [
    "Devinez",
    "Rouge, Noir, Violet (2 cartes), Double violet (4 cartes) ou Skubrum (3 cartes) : chaque bouton tire directement les cartes du paquet.",
  ],
  [
    "Le pot grimpe",
    "Chaque carte réussie ajoute 1 gorgée au pot commun, partagé par toute la table.",
  ],
  [
    "3 avant de passer",
    "Réussissez au moins 3 cartes pendant votre manche pour avoir le droit de passer la main sans rien boire.",
  ],
  [
    "L’échec se paie",
    "Une carte ratée fait boire tout le pot au joueur en cours. Le pot retombe à 0 et il rejoue aussitôt.",
  ],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Purple</p>
        <h1>Comment jouer ?</h1>
      </div>
      <ol className="rules-list">
        {rules.map(([title, copy], index) => (
          <li key={title}>
            <span>{index + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="rules-cta">
        <ButtonLink href="/purple/joueurs">Lancer une partie</ButtonLink>
      </div>
    </PageShell>
  );
}
