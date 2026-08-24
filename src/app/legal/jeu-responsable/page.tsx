import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Jeu responsable",
  description: "AntaVerse et l’alcool : jamais une obligation, toujours un choix.",
};

export default function ResponsiblePlayPage() {
  return (
    <LegalPageShell title="Jouez pour vous amuser, jamais pour vous mettre en danger">
      <p>
        AntaVerse est avant tout une collection de jeux de soirée. Certains modes utilisent les «
        gorgées » comme mécanique ludique, au même titre que des points dans un autre jeu. Aucune
        règle ne doit être interprétée comme une obligation de consommer de l’alcool.
      </p>

      <div className="legal-callout">
        <p>Quelques principes simples, valables à chaque partie :</p>
        <ul>
          <li>
            Une gorgée peut toujours être remplacée par une boisson sans alcool ou un autre gage.
          </li>
          <li>
            Chacun reste libre de refuser une action ou une consommation, sans avoir à se justifier.
          </li>
          <li>Ne jamais inciter quelqu’un à boire plus qu’il ou elle ne le souhaite.</li>
          <li>Arrêtez immédiatement le jeu si une personne ne se sent pas bien.</li>
          <li>Buvez de l’eau régulièrement pendant la soirée.</li>
          <li>Évitez toute consommation excessive.</li>
          <li>Ne conduisez jamais après avoir consommé de l’alcool.</li>
          <li>Respectez la législation locale relative à l’alcool.</li>
          <li>
            AntaVerse n’est destinée à aucune personne n’ayant pas l’âge légal de consommer de
            l’alcool dans son pays.
          </li>
        </ul>
      </div>

      <h2>Le rythme de la soirée reste un choix</h2>
      <p>
        Les règles de jeu ne remplacent jamais votre jugement. Ne jouez pas à une règle qui vous
        paraît excessive, ne laissez personne imposer une consommation et choisissez librement une
        alternative sans alcool ou un autre gage. Le rythme et l’intensité d’une soirée restent
        entre les mains des joueurs, pas de l’application.
      </p>

      <h2>Ce n’est pas un avis médical</h2>
      <p>
        Cette page donne des principes de bon sens pour un usage responsable des jeux d’AntaVerse ;
        elle ne constitue ni un avis médical, ni une information de santé publique. Si vous avez des
        questions sur votre consommation d’alcool, parlez-en à un professionnel de santé.
      </p>

      <h2>Besoin d’aide ?</h2>
      <p>
        En France, Alcool Info Service propose une écoute et des informations gratuites et anonymes
        : <a href="tel:0980980930">0 980 980 930</a> (appel non surtaxé) ou{" "}
        <a href="https://www.alcool-info-service.fr">alcool-info-service.fr</a>.
      </p>
    </LegalPageShell>
  );
}
