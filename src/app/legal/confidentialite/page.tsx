import type { Metadata } from "next";
import { ClearLocalDataButton } from "@/components/legal/clear-local-data-button";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TodoValue } from "@/components/legal/todo-value";
import { legalConfig } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Ce qu’AntaVerse stocke, où, pourquoi, et vos droits.",
};
export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Politique de confidentialité">
      <p className="legal-meta">
        Version {legalConfig.policyVersion} —{" "}
        <TodoValue
          value={legalConfig.policyEffectiveDate}
          label="date à renseigner avant publication"
        />
        .
      </p>
      <div className="legal-callout">
        <p>
          Les jeux d’ambiance fonctionnent localement. Dans Sport uniquement, un compte facultatif
          permet de sauvegarder le carnet en ligne, de retrouver des amis et de recevoir des
          notifications. AntaVerse n’intègre pas de publicité ni d’analyse d’audience.
        </p>
      </div>
      <h2>1. Responsable et contact</h2>
      <p>
        AntaVerse est éditée par{" "}
        <TodoValue
          value={legalConfig.legalPublisherName}
          label="identité de l’éditeur à renseigner avant publication"
        />
        . Pour vos données :{" "}
        <TodoValue
          value={legalConfig.privacyEmail}
          label="adresse de contact vie privée à renseigner avant publication"
        />
        .
      </p>
      <h2>2. Données utilisées</h2>
      <p>
        Les jeux conservent les prénoms, équipes, réponses, scores et parties nécessaires à leur
        fonctionnement. Ces données ne sont pas envoyées à la sauvegarde Sport.
      </p>
      <p>
        Sport conserve les séances datées, exercices, séries, matériel, charges, répétitions et
        favoris. Sans compte, ce carnet reste sur votre appareil. Avec un compte, il est aussi
        sauvegardé chez Supabase.
      </p>
      <p>
        Le compte Sport utilise un e-mail et un mot de passe, ou Google ou Apple, et un pseudo
        choisi par vous. Supabase gère l’authentification ; le mot de passe n’est jamais inclus dans
        les sauvegardes. Le pseudo et l’identifiant public sont visibles dans la liste des joueurs
        Sport connectés, sans e-mail.
      </p>
      <p>
        Les demandes d’amis et amitiés sont enregistrées en ligne. Seuls les amis acceptés peuvent
        consulter vos séances terminées : titre, date, exercices, charges et répétitions. La séance
        active et les favoris restent privés. Retirer un ami révoque son accès serveur.
      </p>
      <h2 id="stockage-local">3. Stockage local</h2>
      <ul>
        <li>
          localStorage : parties des jeux concernés, carnet Sport, session de connexion et copies du
          carnet par compte.
        </li>
        <li>IndexedDB : partie Quoi de 9, avec repli local si nécessaire.</li>
        <li>sessionStorage : noms d’équipes Sans le dire pendant la session.</li>
        <li>
          Cache du service worker : fichiers de l’application pour le fonctionnement hors ligne.
        </li>
      </ul>
      <p>
        Effacer les données locales ne supprime pas le compte Sport ni sa sauvegarde en ligne,
        récupérable après reconnexion.
      </p>
      <ClearLocalDataButton />
      <p>
        Vous pouvez aussi effacer les données du site depuis les réglages du navigateur. Pour
        supprimer le compte et ses données en ligne, utilisez{" "}
        <a href="/sport/compte/">Mon compte Sport</a>.
      </p>
      <h2>4. Finalités</h2>
      <p>
        Ces données permettent de jouer, reprendre une partie ou une séance, conserver le carnet et
        fonctionner hors ligne. Le compte Sport permet la sauvegarde et la récupération sur un autre
        appareil. Les amitiés servent au partage de séances demandé par les utilisateurs.
      </p>
      <h2>5. Notifications</h2>
      <p>
        Les notifications sont facultatives et nécessitent l’autorisation du navigateur sur chaque
        appareil. Elles indiquent le pseudo d’un ami et la fin d’une séance, sans détail des
        exercices. Un abonnement push technique est enregistré pour l’appareil. Vous pouvez le
        désactiver dans Social ou dans les réglages du navigateur. La déconnexion retire
        l’abonnement de cet appareil lorsqu’il est accessible.
      </p>
      <h2>6. Destinataires</h2>
      <p>
        {legalConfig.hostName} héberge le site et peut traiter les journaux techniques nécessaires à
        sa distribution. Supabase fournit les comptes et la base Sport. Google ou Apple
        interviennent si vous choisissez leur connexion. Les services push du navigateur acheminent
        les notifications autorisées. Vos amis acceptés reçoivent les informations décrites
        ci-dessus.
      </p>
      <h2>7. Hébergement et transferts</h2>
      <p>
        La région de la base Sport est choisie à la création du projet Supabase. L’hébergement web,
        les connexions sociales et les push peuvent utiliser des infrastructures internationales.
        L’éditeur doit renseigner la région retenue et vérifier les garanties contractuelles des
        prestataires avant activation du service en production.
      </p>
      <h2>8. Conservation</h2>
      <p>
        Les données locales restent jusqu’à effacement. Le compte Sport et ses données en ligne
        restent jusqu’à suppression du compte. Les dix versions précédentes du carnet permettent une
        restauration. Les tâches push sont purgées après sept jours par le service d’envoi ; les
        identifiants des séances déjà annoncées restent pour éviter les doublons. Les journaux
        d’infrastructure suivent les politiques des prestataires.
      </p>
      <h2>9. Vos droits et contrôles</h2>
      <p>
        Mon compte Sport permet d’exporter le carnet, modifier le pseudo et supprimer le compte, ses
        sauvegardes, amitiés et abonnements. L’historique permet de corriger ou supprimer une séance
        ; ces changements sont transmis lors de la synchronisation.
      </p>
      <p>
        Contactez l’éditeur pour les demandes d’accès, rectification, effacement, limitation,
        opposition et portabilité prévues par la réglementation applicable. Les données des jeux
        d’ambiance restées sur votre appareil ne sont pas détenues par l’éditeur.
      </p>
      <h2>10. Réclamation</h2>
      <p>
        Vous pouvez saisir l’autorité de contrôle compétente, notamment la{" "}
        <a href="https://www.cnil.fr">CNIL</a>
        si l’éditeur relève de la France.
      </p>
      <h2>11. Public</h2>
      <p>
        Les jeux d’ambiance s’adressent aux adultes et jeunes adultes ; certains font référence à
        l’alcool. Le compte Sport est distinct de ces jeux. AntaVerse ne collecte pas
        intentionnellement de données auprès de jeunes enfants.
      </p>
      <h2>12. Sécurité</h2>
      <p>
        Le site utilise HTTPS. Les secrets serveur restent hors du navigateur. Les règles de base
        isolent les comptes et contrôlent les amitiés avant de partager les séances. Aucune mesure
        ne garantit une protection absolue.
      </p>
      <h2>13. Traceurs</h2>
      <p>
        Le stockage sert au fonctionnement, à la connexion et à la reprise du carnet, sans mesure
        d’audience ni publicité. Les connexions Google et Apple suivent aussi les politiques de ces
        fournisseurs.
      </p>
      <h2 id="evolution">14. Évolution</h2>
      <p>
        Cette politique doit être complétée avec les informations de l’éditeur et des prestataires
        réellement configurés avant activation du service en ligne.
      </p>
    </LegalPageShell>
  );
}
