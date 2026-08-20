import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TodoValue } from "@/components/legal/todo-value";
import { legalConfig } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation",
  description: "Les règles d’usage d’AntaVerse, en clair et sans jargon inutile.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPageShell title="Conditions générales d’utilisation d’AntaVerse">
      <p className="legal-meta">
        Version {legalConfig.policyVersion} —{" "}
        <TodoValue value={legalConfig.policyEffectiveDate} label="date à renseigner avant publication" />.
      </p>

      <h2>Objet</h2>
      <p>
        AntaVerse est une application de divertissement proposant plusieurs jeux destinés à être
        utilisés dans un contexte social, entre amis ou en famille. Les présentes conditions
        régissent l’usage de l’application.
      </p>

      <h2>Acceptation</h2>
      <p>L’utilisation de l’application implique l’acceptation des présentes conditions.</p>

      <h2>Utilisation autorisée</h2>
      <p>En utilisant AntaVerse, vous vous engagez à ne pas :</p>
      <ul>
        <li>détourner l’application de son usage prévu de façon abusive ;</li>
        <li>tenter de compromettre la sécurité ou le fonctionnement de l’application ;</li>
        <li>porter atteinte aux droits de propriété intellectuelle décrits dans les mentions légales.</li>
      </ul>

      <h2>Jeu et responsabilité</h2>
      <p>
        Les utilisateurs restent seuls responsables de leurs décisions et du contexte dans lequel
        ils utilisent les jeux — y compris du choix de qui joue, où, et dans quelles
        circonstances.
      </p>

      <h2>Consommation d’alcool</h2>
      <p>
        Certains jeux d’AntaVerse utilisent des « gorgées » comme mécanique ludique, au même
        titre que des points ou des gages. Aucune règle du jeu n’oblige à consommer réellement de
        l’alcool : une gorgée peut toujours être remplacée par une boisson sans alcool ou un
        autre gage librement choisi par le groupe. AntaVerse n’encourage ni l’ivresse, ni la
        consommation excessive, ni une quelconque compétition de consommation, et n’est destinée
        à aucune personne n’ayant pas l’âge légal de consommer de l’alcool dans son pays. Voir la
        page dédiée : <a href="/legal/jeu-responsable">Jeu responsable</a>.
      </p>

      <h2>Disponibilité</h2>
      <p>
        AntaVerse est fournie « en l’état », sans garantie de disponibilité permanente ou
        ininterrompue. Les jeux, règles, contenus et fonctionnalités peuvent évoluer au fil des
        mises à jour.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque, les logos, l’interface, les textes et les contenus des jeux restent la
        propriété de l’éditeur ou de ses ayants droit, comme précisé dans les{" "}
        <a href="/legal/mentions-legales">mentions légales</a>. AntaVerse ne revendique aucun
        droit sur des éléments tiers qu’elle ne détient pas.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Dans la mesure permise par la loi applicable, l’éditeur ne saurait être tenu responsable
        des dommages indirects résultant de l’utilisation de l’application, ni des conséquences
        d’un usage des jeux contraire aux recommandations de la page{" "}
        <a href="/legal/jeu-responsable">Jeu responsable</a>. Rien dans ces conditions n’a pour
        effet d’exclure une responsabilité que la loi rendrait impossible à écarter.
      </p>

      <h2>Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit applicable au lieu d’établissement de
        l’éditeur — <TodoValue value={legalConfig.country} /> — sous réserve des dispositions
        impératives protectrices dont bénéficient les consommateurs dans leur pays de résidence.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question sur ces conditions :{" "}
        <TodoValue value={legalConfig.supportEmail} label="adresse de support à renseigner avant publication" />, ou
        via la page <a href="/support">Support</a>.
      </p>
    </LegalPageShell>
  );
}
