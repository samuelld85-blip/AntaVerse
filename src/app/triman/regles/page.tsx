import { PageShell } from "@/games/triman/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const steps = [
  [
    "Cherchez",
    "Lancez les dés à tour de rôle. Le premier à sortir un 3 (sur un dé ou en 1 + 2) devient le Triman.",
  ],
  [
    "Enchaînez",
    "À chaque lancer, toutes les règles déclenchées par les dés s’appliquent en même temps.",
  ],
  [
    "Relancez",
    "Tant qu’une règle se déclenche, vous relancez. Un lancer sans effet passe la main.",
  ],
  [
    "Recommencez",
    "Une fois le tour complet du Triman terminé, la recherche repart avec le joueur suivant.",
  ],
];

const rules = [
  ["3 ou 1 + 2", "Trouve (ou confirme) le Triman."],
  ["Triman en jeu", "Un dé montre 3, ou le total fait 3 : le Triman boit 1 gorgée."],
  ["Total 7", "Le joueur précédent boit 1 gorgée."],
  ["Total 9", "Le lanceur boit 1 gorgée."],
  ["Total 11", "Le joueur suivant boit 1 gorgée."],
  ["6 + 1", "1 doigt ! Tout le monde pose un doigt, le dernier boit 1 gorgée."],
  ["6 + 2", "2 doigts ! Tout le monde pose deux doigts, le dernier boit 2 gorgées."],
  ["6 + 3", "Poing ! Tout le monde pose le poing, le dernier boit 3 gorgées."],
  ["Double", "Le lanceur boit et distribue autant de gorgées que la valeur du double."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Triman</p>
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
      <h2 className="rules-subheading">Les règles en détail</h2>
      <ul className="rules-list">
        {rules.map(([title, copy]) => (
          <li key={title}>
            <span aria-hidden="true">🎲</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="rules-cta">
        <ButtonLink href="/triman/joueurs">Lancer une partie</ButtonLink>
      </div>
    </PageShell>
  );
}
