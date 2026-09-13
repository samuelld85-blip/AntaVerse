import { PageShell } from "@/games/bac-enchaine/components/page-shell";
import { ButtonLink } from "@/games/shared/components/ui";

const steps = [
  ["Lisez", "Une catégorie et une lettre apparaissent. Le joueur indiqué commence."],
  ["Enchaînez", "À tour de rôle, chacun donne une réponse différente à voix haute."],
  ["Validez", "La personne qui tient le téléphone touche le nom du joueur si sa réponse est bonne."],
  ["Recommencez", "Passez à la manche suivante. Le joueur qui commence tourne à chaque fois."],
];

export default function RulesPage() {
  return (
    <PageShell>
      <div className="setup-heading">
        <p className="eyebrow">Bac Enchaîné</p>
        <h1>Comment jouer ?</h1>
      </div>
      <ol className="rules-list">
        {steps.map(([title, copy], index) => (
          <li key={title}>
            <span>{index + 1}</span>
            <div><h2>{title}</h2><p>{copy}</p></div>
          </li>
        ))}
      </ol>
      <ul className="rules-list bac-rules-extra">
        <li><span aria-hidden="true">+1</span><div><h2>Une réponse validée</h2><p>Chaque bonne réponse rapporte un point. Une réponse oubliée ne rapporte rien.</p></div></li>
        <li><span aria-hidden="true">↺</span><div><h2>Une erreur se corrige</h2><p>Retouchez un joueur validé pour annuler le point si vous avez tapé trop vite.</p></div></li>
      </ul>
      <div className="rules-cta"><ButtonLink href="/bac-enchaine/joueurs">Lancer une partie</ButtonLink></div>
    </PageShell>
  );
}
