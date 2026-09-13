import { PageShell } from "@/games/ethnoguessr/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";
import { ROUND_COUNT } from "@/games/ethnoguessr/lib/game/engine";

const steps = [
  [
    "Observe",
    "Chaque manche affiche deux vraies personnes nées dans le même pays : un homme et une femme. Regarde aussi longtemps que tu veux.",
  ],
  [
    "Réponds",
    "Appuie sur « Je réponds » pour passer à la carte du monde. Les deux photos restent visibles en miniature — touche-les pour les revoir en grand.",
  ],
  [
    "Place ta réponse",
    "Touche la carte à l'endroit où tu penses que se situe la zone d'origine du duo, ou utilise la recherche pour sauter directement à un pays.",
  ],
  [
    "Découvre ton score",
    "Valide ta réponse pour voir la bonne localisation, la distance qui vous sépare, et les points gagnés.",
  ],
];

const scoreBands = [
  ["5", "Pays correct, ou vraiment frontalier — dur à réussir."],
  ["4", "Pays très proche de la bonne réponse."],
  ["3", "Même région géographique."],
  ["2", "Région voisine."],
  ["1", "Loin, mais une estimation cohérente."],
  ["0", "À l'autre bout du monde."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">EthnoGuessr</p>
        <h1>Comment jouer ?</h1>
      </div>
      <ol className="rules-list">
        {steps.map(([title, copy], index) => (
          <li key={title}>
            <span>{index + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="rules-subheading">Le score</h2>
      <p className="round-instruction">
        {ROUND_COUNT} manches, de 0 à 5 points chacune, selon la distance à vol d&apos;oiseau entre
        ta réponse et la bonne localisation.
      </p>
      <ul className="rules-list">
        {scoreBands.map(([points, copy]) => (
          <li key={points}>
            <span aria-hidden="true">{points}</span>
            <div>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="rules-subheading">Bon à savoir</h2>
      <ul className="rules-list">
        <li>
          <span aria-hidden="true">📷</span>
          <div>
            <h2>De vraies photos, pas des célébrités</h2>
            <p>
              Les deux personnes de chaque manche sont réelles, avec une photo sous licence
              libre (Wikimedia Commons — crédit affiché après ta réponse). Elles sont
              volontairement peu connues : le but est de deviner à partir du visage, pas de
              reconnaître quelqu&apos;un.{" "}
              <a href="/games/ethnoguessr/CREDITS.md" target="_blank" rel="noopener noreferrer">
                Voir tous les crédits photo
              </a>
              .
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">🎭</span>
          <div>
            <h2>Un jeu, pas un outil de classification</h2>
            <p>
              EthnoGuessr ne prétend pas déterminer l&apos;ethnie réelle d&apos;une personne à
              partir de son apparence — c&apos;est un jeu de géographie et de culture.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">🧑‍🤝‍🧑</span>
          <div>
            <h2>Un jeu individuel</h2>
            <p>Pas de tour par tour : tu joues seul, à ton rythme, sur ton téléphone.</p>
          </div>
        </li>
      </ul>

      <div className="rules-cta">
        <ButtonLink href="/ethnoguessr/partie">Jouer</ButtonLink>
      </div>
    </PageShell>
  );
}
