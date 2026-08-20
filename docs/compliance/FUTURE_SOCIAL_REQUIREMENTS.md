# Exigences futures — fonctionnalités sociales / UGC

**Statut aujourd'hui : non applicable.** Recherche dans le code confirmée :
aucune fonctionnalité de compte, profil, photo, commentaire, post,
messagerie ou contenu généré par les utilisateurs (UGC) n'existe dans
AntaVerse. Ce document ne décrit rien d'implémenté — il prépare une
décision future.

## Pourquoi ce document existe maintenant

Apple exige explicitement, pour tout service intégrant du contenu généré
par les utilisateurs ou une fonction sociale, des mécanismes de filtrage,
de signalement et de blocage (App Review Guidelines §1.2). Si AntaVerse
évolue un jour vers des photos, commentaires, profils, messagerie, soirées
partagées ou tout autre contenu utilisateur, **il faudra prévoir avant leur
lancement** :

- des conditions communautaires spécifiques (au-delà des CGU générales) ;
- une modération (humaine, automatisée, ou hybride) ;
- un mécanisme de signalement accessible depuis chaque contenu concerné ;
- un filtrage des contenus interdits (a minima à la publication) ;
- un mécanisme de blocage d'un autre utilisateur ;
- un contact support dédié à la modération, distinct ou non du support
  général ;
- un processus de retrait de contenu, avec délai de traitement raisonnable ;
- des règles de respect du droit d'auteur pour tout contenu tiers uploadé ;
- une mise à jour de la politique de confidentialité pour couvrir ces
  nouveaux traitements de données ;
- une protection renforcée des mineurs si l'âge des utilisateurs n'est pas
  vérifiable de façon fiable.

## Ne pas construire cela maintenant

Rien de ce qui précède ne doit être implémenté tant qu'aucune
fonctionnalité sociale/UGC concrète n'est décidée. Ce document sert de
checklist à ressortir **avant** de commencer un tel chantier, pas de
spécification à implémenter aujourd'hui.

---

## Annexe — gabarit interne "Community Guidelines" (non publié)

Brouillon à réutiliser le jour où des fonctionnalités sociales apparaissent.
**Ne pas publier tel quel aujourd'hui** : il ne s'applique à aucune
fonctionnalité actuelle d'AntaVerse.

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
