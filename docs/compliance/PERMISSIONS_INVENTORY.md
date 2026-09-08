# Inventaire des permissions

Dernière vérification technique : 2026-09-08.

## Constat pour la PWA actuelle

Recherche exhaustive de `navigator.geolocation`, `getUserMedia`,
`Notification.requestPermission`, `navigator.vibrate`, `navigator.share`,
`navigator.clipboard`, `navigator.mediaDevices` dans `src/` :

| API                              | Utilisée ? | Où                                                                                                                                                                      | Nécessite une permission utilisateur ?                                                                                                                     |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navigator.vibrate`              | **Oui**    | `triman/features/game/game-client.tsx`, `purple/features/game/game-client.tsx`, `sans-le-dire/features/game/game-client.tsx`, `quoi-de-9/features/game/game-client.tsx` | Non — API de retour haptique sans prompt de permission sur les navigateurs qui la supportent (non disponible sur Safari iOS, appel silencieusement ignoré) |
| `navigator.geolocation`          | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |
| `getUserMedia` / caméra / micro  | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |
| `Notification.requestPermission` | **Oui** | `src/lib/web-timer-notification.ts` (chrono de repos, local) **et** `src/sport/cloud/push.ts` (notifications d'amis Sport, via Web Push) | Oui — deux usages distincts, chacun demandé à un geste explicite : (1) au toucher sur « Démarrer le chrono » pour afficher le repos actif localement ; (2) au toucher sur le bouton d'activation dans Social, pour recevoir « un ami a terminé une séance » |
| `PushManager.subscribe` / `pushManager` | **Oui** | `src/sport/cloud/push.ts` | Oui — hérite de la permission Notifications ci-dessus. Crée un abonnement Web Push (endpoint + clés) enregistré dans Supabase pour la couche compte Sport. Refusé volontairement dans la coquille native Capacitor |
| `navigator.share`                | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |
| `navigator.clipboard`            | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |

La permission de notification a **deux usages**, chacun déclenché par un
geste explicite de l'utilisateur, jamais au lancement :

1. **Chrono de repos (local, tous les usages Sport)** — au toucher sur
   « Démarrer le chrono », pour rendre le repos actif visible hors de
   l'application. Aucun serveur, aucun abonnement.
2. **Notifications d'amis (couche compte Sport, optionnelle)** — au toucher
   sur le bouton d'activation dans Social. Crée un abonnement Web Push
   (`PushManager.subscribe`) dont l'endpoint et les clés sont enregistrés
   dans `public.push_subscriptions` (Supabase). L'edge function
   `send-session-push` envoie ensuite une notification quand un ami termine
   une séance (pseudo + « séance terminée », sans détail d'exercice).
   Désactivable dans Social, à la déconnexion, ou dans les réglages du
   navigateur. `push.ts` refuse cette activation dans la coquille native
   Capacitor (Web Push = PWA installée uniquement).

L'autre usage d'API sensible (`navigator.vibrate`) est un retour haptique
pur, sans permission associée dans les navigateurs actuels.

## Manifeste PWA (`public/manifest.webmanifest`)

Aucune permission déclarée — c'est un manifeste standard (nom, icônes,
couleurs, `display: "standalone"`, `orientation: "portrait-primary"`),
sans `permissions` ni capacité native demandée.

## Version Android Capacitor actuelle

Le manifeste final déclare deux permissions :

| Permission Android            | Origine                  | Prompt utilisateur ? | Justification                                                                                                                                                      |
| ----------------------------- | ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `android.permission.INTERNET` | Modèle Capacitor/WebView | Non                  | Capacité réseau standard de la WebView et accès éventuel aux pages légales/support publiques. Aucun appel applicatif ni SDK de collecte n'est présent aujourd'hui. |
| `android.permission.POST_NOTIFICATIONS` | Chronomètre système (`AntaverseTimerPlugin`) | Oui, au premier démarrage d’un chrono | Afficher le compte à rebours dans la barre d’état et le volet des notifications ; aucun contenu distant ni suivi n’est associé. |

Android ajoute aussi automatiquement au package une permission interne
spécifique à l'application (`com.antaverse.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`)
pour sécuriser ses receivers non exportés. Ce n'est pas une permission sensible
demandée à l'utilisateur ni un accès aux données de l'appareil.

Le manifeste ne demande ni caméra, ni micro, ni localisation, ni contacts,
ni photos/fichiers. Dans la coquille native, `POST_NOTIFICATIONS` ne sert
qu’au chronomètre local : `src/sport/cloud/push.ts` refuse d’activer les
notifications d’amis dans Capacitor, donc aucun abonnement Web Push n’y est
créé. Le trafic HTTP non chiffré est interdit, la sauvegarde cloud/transfert
des données locales est désactivée et la WebView de production n'est pas
débogable.

## Principe pour les futures capacités natives

**Ne demander aucune permission qui n'est pas indispensable à une
fonctionnalité réellement utilisée.** Si un wrapper natif (voir
`docs/store/NATIVE_PACKAGING_OPTIONS.md`) ajoute l'accès à une API
nécessitant une permission native (caméra, photos, notifications push,
micro, localisation, contacts), ce document devra être mis à jour avec :

- la permission exacte demandée (ex. `NSCameraUsageDescription` sur iOS,
  permission Android correspondante) ;
- la fonctionnalité précise qui la justifie ;
- un texte de permission simple et compréhensible pour l'utilisateur,
  expliquant pourquoi elle est demandée au moment où elle l'est (pas au
  lancement de l'app).

Aujourd'hui, aucune de ces permissions sensibles n'est nécessaire : rien dans
le code actuel n'en a besoin. Le script `android:verify` échoue volontairement
si une nouvelle permission est ajoutée sans réaudit de ce document.
