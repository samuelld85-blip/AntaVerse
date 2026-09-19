import { ButtonLink } from "@/games/shared/components/ui";
import { PageShell } from "@/games/qui-de-nous-deux/components/page-shell";
import type { Route } from "next";

const rules = [
  ["Formez les équipes", "Une équipe se place dos à dos. L’équipe poseuse de questions garde le téléphone et lit les questions."],
  ["Répondez sans vous concerter", "À la question « qui de vous deux… ? », chacun désigne A ou B en même temps. Le minuteur vous laisse 15, 20 ou 30 secondes."],
  ["Tranchez", "Les poseurs regardent les deux réponses : même personne = +1 pour le duo ; réponses différentes = +1 pour les poseurs."],
  ["Enchaînez", "Le téléphone reste dans les mains des poseurs. À la fin du nombre de questions choisi, le meilleur score gagne."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Qui de nous deux ?</p>
        <h1>Comment jouer ?</h1>
      </div>
      <ol className="rules-list qndd-rules-list">
        {rules.map(([title, copy], index) => (
          <li key={title}><span>{index + 1}</span><div><h2>{title}</h2><p>{copy}</p></div></li>
        ))}
      </ol>
      <div className="rules-cta"><ButtonLink href={"/qui-de-nous-deux/joueurs" as Route}>Lancer une partie</ButtonLink></div>
    </PageShell>
  );
}
