# Packaging natif — décision et état

Dernière mise à jour : 2026-08-24. La décision Android est prise : Capacitor
8 est intégré et le build statique est embarqué dans le projet `android/`.
La PWA Vercel continue d'exister en parallèle. iOS n'est pas traité dans ce
chantier.

## Point de départ technique réel

- Static export, `trailingSlash: true`, images non optimisées côté build
  (`images: { unoptimized: true }`) — cohérent avec un hébergement statique
  pur, sans serveur Next au runtime.
- PWA installable : `public/manifest.webmanifest` valide (icônes 192/512 +
  maskable, `display: "standalone"`), Service Worker fonctionnel
  (`public/sw.js`) avec cache applicatif et repli hors ligne
  (`offline.html`).
- Aucune dépendance à une API serveur, ce qui simplifie n'importe quelle
  option de packaging (pas de backend à répliquer ou exposer différemment).

## Options pour iOS

- **Wrapper natif (Capacitor ou équivalent)** : embarque le build statique
  dans une WebView native, expose un vrai bundle iOS (`.ipa`) avec accès
  aux API natives si besoin plus tard (notifications push, partage natif,
  etc.). Effort de mise en place modéré ; maintenance continue à prévoir
  (mise à jour du wrapper, gestion des certificats/provisioning). Compatible
  avec l'app-shell PWA existante sans réécriture.
- **PWA directe** : Apple ne propose pas d'équivalent officiel des Trusted
  Web Activities d'Android pour publier une PWA telle quelle sur l'App
  Store — un wrapper reste nécessaire pour une distribution via l'App Store
  iOS.

## Options pour Android

- **Wrapper natif (Capacitor ou équivalent)** : mêmes avantages/contraintes
  que pour iOS, un seul wrapper pouvant cibler les deux plateformes.
- **Trusted Web Activity (TWA)** : ouvre la PWA existante dans une vue
  plein écran sans chrome navigateur, packagée comme app Android légère.
  Effort de mise en place plus faible qu'un wrapper complet, mais accès
  limité aux API natives au-delà de ce que le Web expose déjà — pertinent
  si aucune fonctionnalité native au-delà de la PWA actuelle n'est prévue.

## Comparatif synthétique

| Critère                            | Wrapper natif (Capacitor)                | TWA (Android uniquement)             |
| ---------------------------------- | ---------------------------------------- | ------------------------------------ |
| Effort de mise en place            | Modéré                                   | Faible                               |
| Accès API natives                  | Oui, extensible                          | Limité à ce que le Web expose        |
| Fonctionnement hors ligne          | Hérité du Service Worker existant        | Hérité du Service Worker existant    |
| Maintenance                        | Continue (mise à jour wrapper, stores)   | Plus faible                          |
| Compatibilité avec la PWA actuelle | Totale, aucune réécriture requise        | Totale, aucune réécriture requise    |
| Couvre iOS + Android               | Oui                                      | Non — Android seulement              |
| Revue store                        | Soumise aux deux revues (Apple + Google) | Soumise à la revue Google uniquement |

## Règle Apple "minimum functionality"

Apple rejette une app qui seraient un simple site web encapsulé sans valeur
ajoutée applicative (App Review Guidelines §4.2). AntaVerse dispose déjà
d'arguments réels en sa faveur : fonctionnement hors ligne complet via
Service Worker, état de partie persistant (localStorage/IndexedDB),
interactions tactiles riches (mini-jeux à réflexe, animations de cartes),
et une expérience pensée mobile-first plutôt qu'un site desktop redimensionné.
Cela dit, **seule la revue Apple elle-même tranchera** au moment de la
soumission — ce document ne peut pas garantir une acceptation.

## État d'implémentation

Le projet Android, les assets, la signature externalisée, les tests Windows
et le pipeline AAB sont maintenant implémentés. Voir
`docs/store/ANDROID_BUILD_AND_RELEASE.md`. Aucun projet Xcode/iOS n'a été
créé.
