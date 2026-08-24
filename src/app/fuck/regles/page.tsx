import { PageShell } from "@/games/fuck/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const steps = [
  ["Installez-vous", "Entrez les joueurs dans l’ordre. Le premier devient le dealer."],
  ["Révélez", "Le dealer regarde seul la carte tirée et annonce à voix haute la valeur à deviner."],
  ["Devinez deux fois", "Le joueur désigné propose une valeur. Le dealer répond « plus » ou « moins », puis le joueur fait sa deuxième proposition."],
  ["Comptez l’écart", "La différence entre la carte et la deuxième proposition correspond au nombre de gorgées, à appliquer en vrai autour de la table."],
  ["Décidez", "Le dealer indique si la manche est gagnée ou échouée, puis la cible suivante est désignée dans l’ordre."],
  ["Passez le rôle", "Après trois victoires d’affilée, le dealer actuel choisit le nouveau dealer parmi tous les autres joueurs."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading"><p className="eyebrow">Fuck</p><h1>Comment jouer ?</h1></div>
      <ol className="rules-list">
        {steps.map(([title, copy], index) => (
          <li key={title}><span>{index + 1}</span><div><h2>{title}</h2><p>{copy}</p></div></li>
        ))}
      </ol>
      <h2 className="rules-subheading">Le paquet</h2>
      <ul className="rules-list">
        <li><span aria-hidden="true">52</span><div><h2>Un jeu classique</h2><p>Les 52 cartes sont mélangées au début. Chaque carte dévoilée est conservée dans l’historique et ne revient pas dans la partie.</p></div></li>
        <li><span aria-hidden="true">♠</span><div><h2>Le dealer voit la carte</h2><p>L’application ne compare pas les propositions : le dealer gère les indices oralement et révèle la carte sur le téléphone.</p></div></li>
        <li><span aria-hidden="true">3</span><div><h2>Trois victoires</h2><p>Une défaite remet la série du dealer à zéro. À trois victoires consécutives, le dealer actuel désigne son successeur.</p></div></li>
      </ul>
      <div className="rules-cta"><ButtonLink href="/fuck/joueurs">Lancer une partie</ButtonLink></div>
    </PageShell>
  );
}
