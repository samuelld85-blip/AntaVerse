import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TodoValue } from "@/components/legal/todo-value";
import { legalConfig } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Identité de l’éditeur d’AntaVerse, hébergement et propriété intellectuelle.",
};

export default function LegalNoticePage() {
  return (
    <LegalPageShell title="Mentions légales">
      <p className="legal-meta">
        Version {legalConfig.policyVersion} —{" "}
        <TodoValue value={legalConfig.policyEffectiveDate} label="date à renseigner avant publication" />.
      </p>

      <h2>Éditeur</h2>
      <ul className="legal-identity">
        <li>
          Nom / dénomination : <TodoValue value={legalConfig.legalPublisherName} />
        </li>
        <li>
          Nom commercial : <TodoValue value={legalConfig.commercialName} />
        </li>
        <li>
          Statut juridique : <TodoValue value={legalConfig.legalForm} />
        </li>
        <li>
          SIREN : <TodoValue value={legalConfig.siren} />
        </li>
        <li>
          SIRET : <TodoValue value={legalConfig.siret} />
        </li>
        <li>
          Numéro de TVA intracommunautaire : <TodoValue value={legalConfig.vatNumber} />
        </li>
        <li>
          Adresse : <TodoValue value={legalConfig.address} />
        </li>
        <li>
          Pays : <TodoValue value={legalConfig.country} />
        </li>
        <li>
          Contact : <TodoValue value={legalConfig.supportEmail} />
        </li>
        <li>
          Directeur de la publication : <TodoValue value={legalConfig.publicationDirector} />
        </li>
      </ul>
      <p className="legal-note">
        Les obligations exactes (numéro d’immatriculation, mention du directeur de publication,
        etc.) dépendent du statut juridique réel de l’éditeur — voir{" "}
        <code>docs/compliance/PUBLISHER_INFO_REQUIRED.md</code>. Ne pas supposer une forme
        sociétaire si l’éditeur est une personne physique / entreprise individuelle.
      </p>

      <h2>Hébergement</h2>
      <ul className="legal-identity">
        <li>Hébergeur : {legalConfig.hostName}</li>
        <li>
          Adresse : <TodoValue value={legalConfig.hostAddress} label="à vérifier sur vercel.com/legal avant publication" />
        </li>
        <li>
          Contact : <TodoValue value={legalConfig.hostContact} label="à vérifier sur vercel.com/legal avant publication" />
        </li>
      </ul>
      <p className="legal-note">
        L’identité et l’adresse officielles de l’hébergeur évoluent parfois ; elles doivent être
        revérifiées sur le site de l’hébergeur au moment de la publication plutôt que d’être
        recopiées ici de mémoire.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le nom « AntaVerse », les logos, les identités visuelles des jeux, l’interface, les
        textes des jeux (questions, cartes, règles) ainsi que le code source de l’application
        sont la propriété de l’éditeur d’AntaVerse ou lui sont concédés sous licence, sauf
        mention contraire. Toute reproduction ou représentation, totale ou partielle, sans
        autorisation, est interdite.
      </p>
      <p>
        AntaVerse peut mentionner des marques ou noms tiers (par exemple, des noms de jeux de
        cartes classiques du domaine public) à titre purement descriptif ; ces mentions
        n’impliquent aucune affiliation. Voir{" "}
        <code>docs/compliance/IP_CHECKLIST.md</code> pour le détail des vérifications à mener
        avant commercialisation.
      </p>
    </LegalPageShell>
  );
}
