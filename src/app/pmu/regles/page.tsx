import { PageShell } from "@/games/pmu/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const steps = [
  ["Les quatre chevaux", "Retrouvez les As de cœur, carreau, trèfle et pique : chacun avance dans sa propre couleur."],
  ["Les paris", "Chaque joueur choisit entre 1 et 5 gorgées, puis les pose sur un seul cheval. Le pari est validé dès que les deux choix sont faits."],
  ["La course", "Le croupier tire les cartes une par une. La couleur fait avancer le cheval correspondant d’une case ; la valeur ne compte pas."],
  ["Les paliers", "Les cartes cachées ne sont pas des tours à terminer. Dès que les quatre chevaux ont atteint un même palier, la carte de ce palier est retournée ; le cheval de sa couleur recule immédiatement d’une case."],
  ["La victoire", "Le premier cheval à franchir la ligne d’arrivée gagne. La course peut donc se terminer avant que tous les paliers aient été révélés."],
];

export default function RulesPage() {
  return <PageShell><div className="setup-heading"><p className="eyebrow">PMU</p><h1>Comment jouer ?</h1><p>Une course simple à lancer, avec juste ce qu’il faut de retournements.</p></div><ol className="rules-list">{steps.map(([title, copy], index) => <li key={title}><span>{index + 1}</span><div><h2>{title}</h2><p>{copy}</p></div></li>)}</ol><h2 className="rules-subheading">À la fin</h2><ul className="rules-list"><li><span aria-hidden="true">×2</span><div><h2>Pari gagnant</h2><p>Distribuez deux fois votre mise gagnante.</p></div></li><li><span aria-hidden="true">1–5</span><div><h2>Pari perdant</h2><p>Prenez le nombre de gorgées choisi au départ.</p></div></li></ul><div className="rules-cta"><ButtonLink href="/pmu/joueurs">Lancer une partie</ButtonLink></div></PageShell>;
}
