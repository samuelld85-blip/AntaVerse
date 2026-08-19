import { PageShell } from "@/games/palmier/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const steps = [
  ["Secouez", "Le joueur actif secoue le palmier. Une carte tombe aussitôt du feuillage."],
  [
    "Découvrez",
    "La carte se révèle — sa valeur détermine la règle, sa couleur est purement décorative.",
  ],
  [
    "Appliquez",
    "Lisez la règle et appliquez-la en vrai autour de la table. Pas de saisie dans l'appli.",
  ],
  [
    "Passez la main",
    "Appuyez sur Continuer. C'est au joueur suivant de secouer le palmier.",
  ],
  [
    "Les Rois",
    "Chaque Roi fait vaciller le palmier. Le 4ème Roi le fait tomber — et c'est cul sec.",
  ],
];

const cardRules = [
  ["2", "Distribue", "Distribue 4 gorgées comme tu veux."],
  ["3", "Pour toi", "Bois 3 gorgées."],
  ["4", "Front", "Tout le monde touche son front — le dernier boit 2 gorgées."],
  ["5", "Maître du pouce", "Tu peux poser ton pouce sur la table à tout moment — les autres imitent, le dernier boit 2 gorgées."],
  ["6", "Binôme", "Choisis un partenaire : quand l'un boit, l'autre boit 1 gorgée en plus."],
  ["7", "Dans ma valise / Catégorie", "Rouge (♥♦) : mémorisez les objets dans l'ordre. Noir (♠♣) : choisissez une catégorie, donnez des réponses à tour de rôle."],
  ["8", "Catégorie", "Choisissez une catégorie, donnez des réponses à tour de rôle."],
  ["9", "Je n'ai jamais / Rime", "Rouge (♥♦) : « Je n'ai jamais… » — ceux qui l'ont fait boivent 1 gorgée. Noir (♠♣) : rimez avec le mot précédent, sans répéter ni bloquer."],
  ["10", "Je n'ai jamais", "Ceux qui ont fait ce que tu n'as jamais fait boivent 1 gorgée."],
  ["J", "Nouvelle règle", "Invente une règle pour tout le groupe."],
  ["Q", "Maître des questions", "Si quelqu'un répond à ta question, il boit 1 gorgée."],
  ["K", "Roi du Palmier", "Le palmier vacille de plus en plus. Le 4ème Roi = CUL SEC."],
  ["A", "Cascade", "Tout le monde boit en cascade, dans l'ordre."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Palmier</p>
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

      <h2 className="rules-subheading">Les 13 valeurs</h2>
      <ul className="rules-list">
        {cardRules.map(([value, title, copy]) => (
          <li key={value}>
            <span aria-hidden="true">{value}</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="rules-subheading">La chute</h2>
      <ul className="rules-list">
        <li>
          <span aria-hidden="true">👑</span>
          <div>
            <h2>Les Rois</h2>
            <p>
              Chaque Roi fait monter la tension. 1er Roi : le palmier commence à bouger.
              2e : il devient instable. 3e : il est sur le point de tomber.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">🌴</span>
          <div>
            <h2>Le 4ème Roi</h2>
            <p>
              Celui qui tire le dernier Roi fait tomber le palmier. La sanction : finir son verre cul sec.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">🌱</span>
          <div>
            <h2>On replante</h2>
            <p>
              Le palmier se replante et la partie continue avec les cartes restantes — sans rebattre
              le jeu, sans redonner les cartes déjà tirées.
            </p>
          </div>
        </li>
      </ul>

      <h2 className="rules-subheading">Bon à savoir</h2>
      <ul className="rules-list">
        <li>
          <span aria-hidden="true">🃏</span>
          <div>
            <h2>Un vrai jeu de 52 cartes</h2>
            <p>
              L'appli mélange un jeu de 52 cartes au départ. Chaque carte n'apparaît qu'une fois par
              partie. La couleur (♠ ♥ ♦ ♣) est décorative — seule la valeur compte.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">🍹</span>
          <div>
            <h2>Les « gorgées »</h2>
            <p>
              Une gorgée, c'est n'importe quelle petite pénalité que le groupe choisit. Rien n'est
              obligatoire.
            </p>
          </div>
        </li>
      </ul>

      <div className="rules-cta">
        <ButtonLink href="/palmier/joueurs">Planter le palmier</ButtonLink>
      </div>
    </PageShell>
  );
}
