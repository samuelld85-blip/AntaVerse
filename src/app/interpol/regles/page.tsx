import { PageShell } from "@/games/interpol/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";
import { TOTAL_ROUNDS } from "@/games/interpol/lib/game/engine";

const steps = [
  ["Ajoutez les joueurs", "Le premier de la liste commence comme maître du jeu."],
  [
    "Le maître découvre la charge",
    "Seul·e, le maître du jeu regarde le portrait et la charge réelle associée, puis confirme quand il ou elle a mémorisé.",
  ],
  [
    "Le portrait devient public",
    "Le téléphone est posé ou montré à tous : chacun voit le portrait, mais la charge reste connue du seul maître du jeu.",
  ],
  [
    "On enquête à l’oral",
    "À tour de rôle, les autres joueurs posent une question ou proposent librement une charge. Le maître du jeu répond et juge à voix haute — l’application ne valide rien automatiquement.",
  ],
  [
    "Le maître du jeu passe la main",
    "Dès qu’un joueur trouve, le maître du jeu le sélectionne dans l’application : sa victoire est enregistrée et il devient le nouveau maître du jeu.",
  ],
  ["Fin de partie", `Après ${TOTAL_ROUNDS} manches, le classement final s’affiche selon le nombre de manches trouvées par chacun.`],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading"><p className="eyebrow">Interpol</p><h1>Comment jouer ?</h1></div>
      <ol className="rules-list">
        {steps.map(([title, copy], index) => (
          <li key={title}><span>{index + 1}</span><div><h2>{title}</h2><p>{copy}</p></div></li>
        ))}
      </ol>
      <h2 className="rules-subheading">Les portraits</h2>
      <ul className="rules-list">
        <li>
          <span aria-hidden="true">ⓘ</span>
          <div>
            <h2>De vraies notices publiques</h2>
            <p>
              Les portraits et les charges viennent de vraies notices rouges Interpol, publiques et
              officielles. Chaque manche gagnée révèle un lien vers la notice d’origine.
            </p>
          </div>
        </li>
      </ul>
      <div className="rules-cta"><ButtonLink href="/interpol/joueurs">Lancer une partie</ButtonLink></div>
    </PageShell>
  );
}
