# Inventaire des permissions

Dernière vérification technique : 2026-08-24.

## Constat pour la PWA actuelle

Recherche exhaustive de `navigator.geolocation`, `getUserMedia`,
`Notification.requestPermission`, `navigator.vibrate`, `navigator.share`,
`navigator.clipboard`, `navigator.mediaDevices` dans `src/` :

| API                              | Utilisée ? | Où                                                                                                                                                                      | Nécessite une permission utilisateur ?                                                                                                                     |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navigator.vibrate`              | **Oui**    | `triman/features/game/game-client.tsx`, `purple/features/game/game-client.tsx`, `sans-le-dire/features/game/game-client.tsx`, `quoi-de-9/features/game/game-client.tsx` | Non — API de retour haptique sans prompt de permission sur les navigateurs qui la supportent (non disponible sur Safari iOS, appel silencieusement ignoré) |
| `navigator.geolocation`          | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |
| `getUserMedia` / caméra / micro  | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |
| `Notification.requestPermission` | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |
| `navigator.share`                | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |
| `navigator.clipboard`            | Non        | —                                                                                                                                                                       | —                                                                                                                                                          |

**Aucune permission navigateur nécessitant un prompt n'est demandée
aujourd'hui.** Le seul usage d'API sensible (`navigator.vibrate`) est un
retour haptique pur, sans permission associée dans les navigateurs actuels.

## Manifeste PWA (`public/manifest.webmanifest`)

Aucune permission déclarée — c'est un manifeste standard (nom, icônes,
couleurs, `display: "standalone"`, `orientation: "portrait-primary"`),
sans `permissions` ni capacité native demandée.

## Version Android Capacitor actuelle

Le manifeste final a été inspecté dans l'APK API 36 généré le 24 août 2026.
AntaVerse déclare explicitement une seule permission :

| Permission Android            | Origine                  | Prompt utilisateur ? | Justification                                                                                                                                                      |
| ----------------------------- | ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `android.permission.INTERNET` | Modèle Capacitor/WebView | Non                  | Capacité réseau standard de la WebView et accès éventuel aux pages légales/support publiques. Aucun appel applicatif ni SDK de collecte n'est présent aujourd'hui. |

Android ajoute aussi automatiquement au package une permission interne
spécifique à l'application (`com.antaverse.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`)
pour sécuriser ses receivers non exportés. Ce n'est pas une permission sensible
demandée à l'utilisateur ni un accès aux données de l'appareil.

Le manifeste ne demande ni caméra, ni micro, ni localisation, ni contacts,
ni photos/fichiers, ni notifications. Le trafic HTTP non chiffré est interdit,
la sauvegarde cloud/transfert des données locales est désactivée et la WebView
de production n'est pas débogable.

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
