import { PageShell } from "@/games/pifometre/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const rules = [
  ["Choisissez", "Avant de lancer, choisissez le mode rapide (réponses à l’oral) ou tour par tour (estimations privées dans le téléphone)."],
  ["Répondez", "En mode rapide, tout le monde annonce son nombre dans la vraie vie. En tour par tour, chacun saisit son estimation sans regarder les précédentes."],
  ["Révélez", "Le bouton affiche la réponse exacte, son unité et une source. L’application ne calcule pas qui est le plus proche."],
  ["Distribuez", "Choisissez « plus proche » pour +1 ou « réponse exacte » pour +2, puis cliquez sur le joueur concerné."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Le Pifomètre</p>
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
        <ButtonLink href="/pifometre/joueurs">Lancer une partie</ButtonLink>
      </div>
    </PageShell>
  );
}
