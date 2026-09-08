# Fonctionnalités sociales / UGC — exigences

Dernière vérification technique : 2026-09-08.

**Statut : partiellement applicable depuis 2026-09.** La couche compte Sport
cloud (`src/sport/cloud/`, optionnelle) a introduit les premières
fonctionnalités sociales et le premier contenu généré par les utilisateurs.
Les jeux d'ambiance, eux, restent sans compte ni social.

## Ce qui existe aujourd'hui (module Sport, avec compte)

- **Comptes et profils** : e-mail/mot de passe ou Google/Apple, pseudo
  public (`public.profiles`). La liste des joueurs Sport connectés (pseudo +
  id, sans e-mail) est visible par tout utilisateur connecté.
- **Amis** : demandes d'amitié à accepter (`public.friendships`).
- **Partage de séances** : un ami accepté peut consulter les séances
  **terminées** d'un ami (titre, date, exercices, charges, répétitions).
  Séance active et favoris restent privés.
- **UGC — réactions et commentaires** : un ami accepté peut « aimer » une
  séance (`public.session_likes`) et laisser un commentaire de 1 à 500
  caractères (`public.session_comments`).
- **Notifications** : Web Push « @pseudo vient de terminer une séance »
  entre amis, opt-in par appareil.

Contrôles déjà en place : RLS stricte (seuls les amis acceptés voient une
séance ou peuvent y réagir) ; l'auteur peut supprimer son commentaire ; le
**propriétaire de la séance peut retirer tout commentaire** laissé sur ses
séances (modération de son propre fil) ; retirer un ami révoque l'accès
serveur immédiatement ; supprimer une séance ou le compte efface en cascade
réactions et commentaires ; la politique `/legal/confidentialite` couvre ces
traitements ; le contenu des notifications ne divulgue aucun détail
d'exercice.

## Ce qui reste à faire AVANT une soumission store

Apple exige, pour tout service intégrant de l'UGC ou une fonction sociale,
des mécanismes de filtrage, de signalement et de blocage (App Review
Guidelines §1.2) ; Google a des exigences équivalentes. Manquent encore :

- **Signalement** d'un commentaire ou d'un utilisateur, accessible depuis le
  contenu concerné (aucun mécanisme aujourd'hui) ;
- **Blocage** d'un autre utilisateur (au-delà du simple retrait d'ami) ;
- **Filtrage/modération** des commentaires interdits (a minima à la
  publication) — aujourd'hui seule une limite de longueur existe ;
- **Conditions communautaires** spécifiques (voir le gabarit en annexe) et
  un **processus de retrait** avec délai raisonnable ;
- un **contact de modération** identifié (peut être le support général) ;
- **protection renforcée des mineurs** — le compte Sport ne vérifie pas
  l'âge ; décider si un âge minimum est requis et comment il est contrôlé ;
- vérifier que la **classification d'âge** (`AGE_RATING.md`) tient compte de
  l'interaction sociale non modérée ;
- confirmer que les déclarations store (`APPLE_PRIVACY_DECLARATION.md`,
  `GOOGLE_DATA_SAFETY.md`) listent bien l'UGC et les identifiants.

Tant que ces éléments manquent, **ne pas soumettre aux stores une build où
la couche compte Sport est activée**. La PWA installée n'est pas soumise à
la revue store, mais ces mêmes obligations restent pertinentes sur le plan
légal (RGPD, responsabilité éditeur) dès que le social est en production.

---

## Annexe — gabarit interne "Community Guidelines" (non publié)

Brouillon à adapter et publier au moment où les commentaires d'amis
deviennent un service en production ouvert au-delà d'un cercle de test.
**Ne pas publier tel quel** : à ajuster au périmètre réel (commentaires sur
séances Sport entre amis acceptés) et à lier depuis les CGU et la politique
de confidentialité en vigueur.

Structure suggérée pour de futures règles communautaires, interdisant
notamment :

- le harcèlement et les menaces envers un autre utilisateur ;
- les propos haineux ou discriminatoires (origine, religion, genre,
  orientation, handicap, etc.) ;
- le contenu pornographique ou l'exploitation sexuelle, en particulier de
  mineurs (tolérance zéro absolue sur ce point) ;
- l'incitation ou la représentation de violence illégale ;
- le contenu à caractère criminel (vente de substances illégales, fraude,
  etc.) ;
- la violation de droits d'auteur ou de propriété intellectuelle tierce ;
- le doxxing (publication d'informations personnelles d'autrui sans
  consentement) ;
- le spam et les comportements automatisés abusifs.

Ce gabarit devra être adapté aux fonctionnalités réellement construites
(un mécanisme de signalement n'a de sens qu'une fois qu'il existe un
contenu à signaler), revu avant publication, et lié depuis la politique de
confidentialité et les CGU en vigueur à ce moment-là.
