import { PageShell } from "@/games/roulette-du-chaos/components/page-shell";
import { CATEGORIES } from "@/games/roulette-du-chaos/lib/game/wheel";
import { ButtonLink } from "@/games/shared/components/ui";

const steps = [
  ["Tournez", "Le joueur actif tourne la roue. Elle s'arrête toute seule sur une catégorie."],
  [
    "Découvrez",
    "Un événement de cette catégorie s'affiche : distribution, défi, duel, règle collective…",
  ],
  [
    "Résolvez",
    "Choisissez des cibles, un camp, ou lancez le mini-jeu demandé — tout se joue sur ce téléphone.",
  ],
  ["Passez la main", "Une fois le résultat annoncé, c’est au joueur suivant de tourner la roue."],
];

const miniGames = [
  ["Duel de réflexes", "Le premier à toucher sa zone après le signal gagne."],
  ["Fais-le dire", "En 20 secondes, fais prononcer un mot à ton adversaire sans le dire toi-même."],
  ["Chaîne débile", "Répétez la suite de gestes puis ajoutez-en un. Le premier qui oublie perd."],
  ["Chrono commun", "Arrêtez un chrono caché le plus près possible de 5 secondes."],
  ["Pierre-feuille-ciseaux", "Jouez en vrai, l’appli enregistre le vainqueur désigné."],
  ["Plus ou moins", "Devinez si le prochain tirage sera plus grand ou plus petit."],
  ["Nombre secret", "Devinez le nombre le plus proche du tirage caché."],
  ["Estimation éclair", "Le plus proche de la bonne réponse l’emporte."],
  ["Tap Battle", "Le plus de touches en 5 secondes gagne."],
  ["Rouge ou noir", "Prédisez la couleur qui va sortir."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Roulette du Chaos</p>
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

      <h2 className="rules-subheading">Les 8 catégories de la roue</h2>
      <ul className="rules-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <span aria-hidden="true">{category.icon}</span>
            <div>
              <h2>{category.label}</h2>
              <p>{category.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="rules-subheading">Les mini-jeux</h2>
      <p>
        Certains événements lancent un duel ou un défi express. L’appli donne la consigne et guide
        les étapes ; les joueurs peuvent aussi répondre ou faire un geste autour du téléphone.
      </p>
      <ul className="rules-list">
        {miniGames.map(([title, copy]) => (
          <li key={title}>
            <span aria-hidden="true">🎮</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="rules-subheading">Bon à savoir</h2>
      <ul className="rules-list">
        <li>
          <span aria-hidden="true">🍹</span>
          <div>
            <h2>Les « gorgées »</h2>
            <p>
              Une gorgée, c’est n’importe quelle petite pénalité que le groupe choisit — une gorgée
              de boisson, un gage, un point négatif. Rien n’est obligatoire.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">📜</span>
          <div>
            <h2>Les règles temporaires</h2>
            <p>
              Les contraintes absurdes restent actives plusieurs tours de table et peuvent se
              cumuler, jusqu’à quatre. Ouvrez le compteur de règles pour les relire et repérer les
              oublis.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">🕵️</span>
          <div>
            <h2>Les missions secrètes</h2>
            <p>
              Seul le joueur désigné lit sa mission sur le téléphone. Il tente de la réussir pendant
              les tours suivants, puis révèle sa réussite. Un autre joueur peut annoncer son soupçon
              : le détenteur de la mission vérifie en privé si l’accusation est juste.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">🪄</span>
          <div>
            <h2>L’objet maudit</h2>
            <p>
              Faites circuler discrètement l’objet indiqué. À la fin du compte à rebours, l’appli
              demande qui le possède et révèle la conséquence.
            </p>
          </div>
        </li>
      </ul>

      <div className="rules-cta">
        <ButtonLink href="/roulette-du-chaos/joueurs">Lancer une partie</ButtonLink>
      </div>
    </PageShell>
  );
}
