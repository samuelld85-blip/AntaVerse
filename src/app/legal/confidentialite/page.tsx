import type { Metadata } from "next";
import { ClearLocalDataButton } from "@/components/legal/clear-local-data-button";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TodoValue } from "@/components/legal/todo-value";
import { legalConfig } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Ce qu’AntaVerse stocke, où, pourquoi, et vos droits sur ces informations.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Politique de confidentialité">
      <p className="legal-meta">
        Version {legalConfig.policyVersion} — en vigueur depuis{" "}
        <TodoValue value={legalConfig.policyEffectiveDate} label="date à renseigner avant publication" />.
        Ce document n’est pas un avis juridique et devra être revalidé avant toute soumission
        Apple App Store / Google Play (voir <a href="#evolution">§ Évolution</a>).
      </p>

      <div className="legal-callout">
        <p>
          <strong>En résumé :</strong> AntaVerse fonctionne principalement sur votre appareil.
          Les prénoms de joueurs, noms d’équipes et parties en cours sont stockés localement sur
          votre téléphone et ne sont jamais envoyés à l’éditeur d’AntaVerse. Aujourd’hui,
          AntaVerse n’intègre aucun outil d’analyse d’audience ni SDK tiers qui communiquerait
          avec un serveur.
        </p>
      </div>

      <h2>1. Qui est responsable de ce traitement</h2>
      <p>
        AntaVerse est éditée par{" "}
        <TodoValue value={legalConfig.legalPublisherName} label="identité de l’éditeur à renseigner avant publication" />.
        Pour toute question relative à la protection de vos données :{" "}
        <TodoValue value={legalConfig.privacyEmail} label="adresse de contact « vie privée » à renseigner avant publication" />.
      </p>

      <h2>2. Les données qu’AntaVerse utilise</h2>
      <p>
        Un inventaire technique détaillé est tenu à jour dans le dépôt du projet
        (<code>docs/compliance/DATA_INVENTORY.md</code>). Voici sa traduction en langage clair.
      </p>

      <h3>2.1 Informations saisies par vous</h3>
      <ul>
        <li>Prénoms des joueurs et joueuses que vous saisissez pour jouer.</li>
        <li>Noms d’équipes, dans les jeux qui en utilisent.</li>
        <li>Vos réponses et choix pendant une partie (ex. réponses à Quoi de 9, cartes de Purple).</li>
      </ul>
      <p>
        Ces informations sont fournies volontairement pour permettre une partie entre vous et vos
        proches. Elles ne sont ni des comptes, ni des identités vérifiées : rien n’empêche de
        jouer sous un pseudonyme.
      </p>

      <h3>2.2 Données de fonctionnement stockées localement</h3>
      <ul>
        <li>La partie en cours de chaque jeu, pour pouvoir la reprendre si vous quittez l’application.</li>
        <li>Votre préférence d’affichage (thème clair ou sombre).</li>
        <li>Dans Purple, votre préférence d’animation de révélation des cartes.</li>
      </ul>

      <h3>2.3 Ce qu’AntaVerse ne fait pas aujourd’hui</h3>
      <ul>
        <li>Pas de compte utilisateur, pas d’inscription, pas de mot de passe.</li>
        <li>Pas d’outil d’analyse d’audience (analytics), pas de publicité, pas de traceur tiers.</li>
        <li>Pas de serveur applicatif : AntaVerse est un site statique, aucune requête réseau n’est envoyée vers un serveur d’AntaVerse pendant que vous jouez.</li>
        <li>Aucune donnée saisie en jeu (prénoms, réponses, scores) n’est transmise à l’éditeur : elle reste sur votre appareil.</li>
      </ul>
      <p>
        Cette section sera mise à jour dès qu’une de ces affirmations changerait — par exemple si
        un outil de mesure d’audience ou un compte utilisateur était ajouté un jour.
      </p>

      <h2 id="stockage-local">3. Stockage local : le détail technique</h2>
      <p>
        AntaVerse est une application web progressive (PWA). Elle utilise trois mécanismes de
        stockage propres à votre navigateur, jamais un serveur distant :
      </p>
      <ul>
        <li>
          <strong>localStorage</strong> — une petite quantité de texte par jeu (partie en cours,
          thème, noms d’équipes).
        </li>
        <li>
          <strong>IndexedDB</strong> — utilisé uniquement par Quoi de 9 pour sauvegarder sa
          partie en cours, avec repli automatique sur localStorage si IndexedDB est indisponible.
        </li>
        <li>
          <strong>Cache du Service Worker</strong> — les fichiers de l’application (code, images,
          règles des jeux) sont mis en cache pour fonctionner hors connexion. Ce cache ne contient
          aucune donnée personnelle, seulement les fichiers de l’application elle-même.
        </li>
      </ul>
      <p>
        Toutes ces données restent sur votre appareil. Vous pouvez les supprimer à tout moment :
      </p>
      <ClearLocalDataButton />
      <p className="legal-note">
        Vous pouvez aussi supprimer ces données depuis les réglages de votre navigateur (« Effacer
        les données de site » pour AntaVerse), ou en désinstallant l’application si vous l’avez
        installée sur votre écran d’accueil.
      </p>

      <h2>4. Pourquoi ces données sont utilisées</h2>
      <ul>
        <li>Faire fonctionner les jeux (afficher les cartes, les tours, les scores).</li>
        <li>Reprendre une partie interrompue sans tout ressaisir.</li>
        <li>Mémoriser vos préférences d’affichage d’une session à l’autre.</li>
        <li>Permettre de jouer sans connexion Internet.</li>
      </ul>

      <h2>5. Base légale de chaque traitement</h2>
      <p>
        Le stockage local nécessaire au fonctionnement du jeu (sauvegarde de partie, préférence
        d’affichage) relève de l’exécution du service que vous demandez en ouvrant l’application
        — vous choisissez de jouer, AntaVerse a besoin de ce minimum technique pour le faire.
        Aujourd’hui, l’éditeur d’AntaVerse ne reçoit et ne traite lui-même aucune donnée
        personnelle : il n’y a donc pas de traitement supplémentaire à justifier par un
        consentement ou un intérêt légitime distinct.
      </p>

      <h2>6. Qui reçoit ces informations</h2>
      <p>
        Personne d’autre que vous, à une exception technique près : l’hébergement.
      </p>
      <ul>
        <li>
          <strong>{legalConfig.hostName}</strong>, hébergeur du site statique AntaVerse, traite
          nécessairement les journaux techniques de connexion (adresse IP, date/heure, page
          demandée) pour livrer les pages — comme tout hébergeur web. AntaVerse ne configure ni ne
          consulte ces journaux ; ils relèvent du fonctionnement standard de l’infrastructure
          d’hébergement, hors du contrôle direct de l’éditeur.
        </li>
      </ul>
      <p>
        Aucun autre prestataire, SDK ou service tiers ne reçoit de données aujourd’hui (voir{" "}
        <code>docs/compliance/THIRD_PARTY_SERVICES.md</code>).
      </p>

      <h2>7. Transferts hors Union européenne</h2>
      <p>
        L’hébergeur de la version statique d’AntaVerse peut opérer une infrastructure
        internationale. Les garanties applicables (clauses contractuelles types ou équivalent)
        dépendent des conditions contractuelles en vigueur au moment de la publication : à
        vérifier auprès de {legalConfig.hostName} avant mise en production commerciale.
      </p>

      <h2>8. Durées de conservation</h2>
      <ul>
        <li>Données locales (parties, préférences) : conservées sur votre appareil jusqu’à ce que vous les supprimiez, ou jusqu’à ce que votre navigateur les efface (ex. nettoyage automatique, réinstallation).</li>
        <li>Journaux techniques d’hébergement : selon la politique de rétention propre à {legalConfig.hostName}.</li>
      </ul>

      <h2>9. Vos droits</h2>
      <p>
        Le règlement général sur la protection des données vous reconnaît un droit d’accès, de
        rectification, d’effacement, de limitation, d’opposition et de portabilité sur vos
        données personnelles, ainsi que le droit de retirer un consentement à tout moment.
      </p>
      <p>
        <strong>Particularité d’AntaVerse :</strong> les données de jeu (prénoms, parties,
        préférences) ne sont jamais transmises à l’éditeur — elles restent uniquement sur votre
        appareil. L’éditeur ne peut donc ni vous les communiquer, ni les rectifier ou les
        supprimer pour vous : il ne les détient pas. C’est vous qui en gardez la maîtrise
        complète, via le bouton d’effacement ci-dessus ou les réglages de votre navigateur.
      </p>
      <p>
        Pour toute autre question sur vos droits :{" "}
        <TodoValue value={legalConfig.privacyEmail} label="adresse de contact « vie privée » à renseigner avant publication" />.
      </p>

      <h2>10. Réclamation</h2>
      <p>
        Vous pouvez introduire une réclamation auprès de l’autorité de contrôle compétente,
        notamment la Commission nationale de l’informatique et des libertés (CNIL) si l’éditeur
        relève de la France — <a href="https://www.cnil.fr">www.cnil.fr</a>.
      </p>

      <h2>11. Mineurs</h2>
      <p>
        AntaVerse n’est pas conçue pour être utilisée par de jeunes enfants : c’est une
        application de jeux d’ambiance pour adultes et jeunes adultes, dont certains modes font
        référence à la consommation d’alcool (voir{" "}
        <a href="/legal/jeu-responsable">Jeu responsable</a>). Elle ne collecte pas
        intentionnellement de données auprès de mineurs et ne propose aucun mécanisme
        d’inscription qui permettrait de le faire.
      </p>

      <h2>12. Sécurité</h2>
      <p>
        AntaVerse est servie exclusivement en HTTPS et ne contient aucun secret ni clé d’API côté
        client. N’étant reliée à aucun compte ni base de données serveur, la surface d’attaque
        applicative est limitée à votre propre appareil. Aucune mesure de sécurité ne peut
        garantir une protection absolue ; voir{" "}
        <code>docs/compliance/SECURITY_OVERVIEW.md</code> pour le détail technique.
      </p>

      <h2>13. Stockage terminal, cookies et traceurs</h2>
      <p>
        AntaVerse n’utilise pas de cookies. Elle utilise le stockage local du navigateur
        (localStorage, IndexedDB, cache du Service Worker) décrit au § 3, strictement pour faire
        fonctionner l’application que vous demandez à utiliser — pas à des fins de mesure
        d’audience, de publicité ou de traçage. En droit français et européen, ce type de
        stockage « strictement nécessaire au service demandé par l’utilisateur » est exempté du
        recueil d’un consentement préalable ; c’est pourquoi AntaVerse ne vous montre pas de
        bannière de consentement. Si des traceurs non essentiels (mesure d’audience, publicité)
        étaient ajoutés un jour, cette section serait revue et un recueil de consentement adapté
        serait mis en place avant leur activation.
      </p>

      <h2 id="evolution">14. Évolution de cette politique</h2>
      <p>
        Cette politique peut évoluer, notamment si de nouvelles fonctionnalités impliquent de
        nouveaux traitements de données. La version et la date en vigueur sont indiquées en haut
        de cette page.
      </p>
    </LegalPageShell>
  );
}
