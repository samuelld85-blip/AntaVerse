import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TodoValue } from "@/components/legal/todo-value";
import { legalConfig } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Support",
  description: "Contacter le support AntaVerse, et accéder à la confidentialité, aux CGU et au jeu responsable.",
};

export default function SupportPage() {
  return (
    <LegalPageShell title="Support" backHref="/" backLabel="Tous les jeux">
      <p>
        AntaVerse est éditée par une petite équipe. Pour toute question, bug, ou suggestion,
        écrivez-nous — nous lisons chaque message.
      </p>

      <h2>Contact</h2>
      <p>
        Email support :{" "}
        <TodoValue value={legalConfig.supportEmail} label="adresse de support à renseigner avant publication" />
      </p>

      <h2>Questions fréquentes</h2>
      <dl className="legal-faq">
        <dt>AntaVerse fonctionne-t-elle sans connexion Internet ?</dt>
        <dd>
          Oui, une fois installée ou déjà chargée une première fois : AntaVerse est une
          application web progressive (PWA) qui met en cache les jeux pour un usage hors ligne.
        </dd>
        <dt>Mes parties sont-elles sauvegardées ?</dt>
        <dd>
          Oui, localement sur votre appareil, pour reprendre une partie en cours. Voir la{" "}
          <a href="/legal/confidentialite">politique de confidentialité</a> pour le détail.
        </dd>
        <dt>Comment supprimer mes données ?</dt>
        <dd>
          Depuis la page{" "}
          <a href="/legal/confidentialite">confidentialité</a>, un bouton « Effacer mes données
          locales » supprime toutes les parties et préférences enregistrées sur cet appareil.
        </dd>
        <dt>Comment installer AntaVerse sur mon téléphone ?</dt>
        <dd>
          Consultez la <a href="/installer">page d’installation</a>.
        </dd>
      </dl>

      <h2>Autres documents</h2>
      <p>
        <a href="/legal/confidentialite">Politique de confidentialité</a> ·{" "}
        <a href="/legal/mentions-legales">Mentions légales</a> ·{" "}
        <a href="/legal/conditions-utilisation">Conditions générales d’utilisation</a> ·{" "}
        <a href="/legal/jeu-responsable">Jeu responsable</a>
      </p>
    </LegalPageShell>
  );
}
