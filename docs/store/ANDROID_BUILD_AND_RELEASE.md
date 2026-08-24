# Android — build Windows et publication Google Play

> Document opérationnel à utiliser uniquement lors d'une demande explicite de
> travail Android ou de publication Google Play. Les commandes et tests Android
> ne font pas partie de la validation courante du projet.

Dernière vérification technique : 2026-08-24.

## État actuel

AntaVerse utilise Capacitor 8 avec un projet Android natif dans `android/`.
L'application publiée contient directement l'export statique Next.js : elle
ne charge pas le site Vercel et reste jouable sans connexion Internet.

- application ID : `com.antaverse.app` ;
- version : `1.0.0` (`versionCode 1`) ;
- Android minimum : API 24 (Android 7.0) ;
- compile/target SDK : API 36 ;
- format de publication : Android App Bundle (`.aab`) ;
- permission déclarée par AntaVerse : `android.permission.INTERNET` seulement ;
- sauvegarde cloud/transfert des parties locales : désactivés ;
- trafic HTTP non chiffré : interdit ;
- débogage de la WebView en production : désactivé ;
- orientation : portrait.

Le 24 août 2026, le projet a été compilé avec succès sous Windows, installé
sur un émulateur API 36, démarré réseau coupé, puis testé jusqu'au lancement
d'une partie de Quoi de 9. Un AAB release signé par une clé éphémère a aussi
été construit et vérifié (25,01 Mio). Cet AAB de test est supprimé
automatiquement et ne peut pas être soumis par erreur.

## Modifications futures et nouveaux jeux

Il n'existe aucune liste Android de jeux ou de routes à maintenir. La commande
suivante reconstruit l'application web, découvre automatiquement toutes les
routes et ressources exportées, les copie dans Android, puis compare les 564
fichiers actuels octet par octet :

```powershell
npm run android:check
```

Après une modification de jeu, l'ajout d'un jeu, d'une route, d'une image ou
d'une question, relancer cette commande suffit. Le projet Android ne doit être
modifié que pour un changement réellement natif : identifiant, version,
permission, plugin Capacitor, icône ou splash screen.

La source haute définition de l'icône se trouve dans `resources/icon.png`.
Les déclinaisons Android générées sont versionnées dans
`android/app/src/main/res/`. L'outil de génération ponctuel n'est pas conservé
comme dépendance du projet, car sa version actuelle introduit des vulnérabilités
de build inutiles une fois les assets produits ; utiliser l'Asset Studio
d'Android Studio lors d'un futur changement d'identité visuelle.

Le Service Worker reste actif sur Vercel/PWA, mais est désactivé dans
l'application Capacitor : les fichiers y sont déjà embarqués et ne sont donc
pas dupliqués dans le cache de la WebView.

## Environnement Windows

Installé sur cette machine :

- Microsoft OpenJDK 21 ;
- Android Studio 2026.1.3.7 ;
- Android SDK Platform 36 et Build Tools 36 ;
- Platform Tools / ADB et Android Emulator ;
- image Google APIs x86_64 API 36 ;
- émulateur `AntaVerse_API_36`.

Les variables utilisateur `JAVA_HOME`, `ANDROID_HOME` et `ANDROID_SDK_ROOT`
ont été définies. Ouvrir un nouveau terminal si un terminal ancien ne les voit
pas encore. Le lanceur `scripts/run-android-gradle.mjs` choisit de lui-même un
JDK compatible (17 à 24) et le SDK standard sous Windows.

Le dépôt demande Node 22 (`package.json`).

## Commandes utiles

```powershell
# Build web frais + synchronisation Capacitor
npm run android:sync

# Même opération avec contrôle exhaustif du contenu et de la configuration
npm run android:check

# APK de développement installable localement
npm run android:apk:debug

# Tests Java locaux
npm run android:test:native

# Test instrumenté, avec un émulateur ou appareil déjà connecté
npm run android:test:device

# Test complet d'un AAB release signé par une clé jetable, puis suppression
npm run android:test:bundle

# Ouvrir le projet dans Android Studio
npm run android:open
```

L'APK debug se trouve dans
`android/app/build/outputs/apk/debug/app-debug.apk`.

## Identifiant et versions

`com.antaverse.app` est maintenant l'identifiant technique du projet. Il faut
confirmer sa disponibilité et le choix définitif dans la Play Console **avant
le premier téléversement**. Une fois une application publiée, son package name
ne peut plus être changé : un autre identifiant serait considéré comme une
nouvelle application.

Pour chaque version envoyée à Google Play :

1. augmenter `versionCode` dans `android/app/build.gradle` ;
2. mettre `versionName` au même numéro que `version` dans `package.json` ;
3. lancer `npm run android:check` ;
4. lancer les tests pertinents ;
5. construire l'AAB signé.

`versionCode` doit toujours être strictement supérieur à celui de la version
précédemment envoyée, y compris pour une piste de test.

## Créer la vraie clé d'upload

Cette opération doit être faite une seule fois, quand l'identité de l'éditeur
et l'identifiant `com.antaverse.app` sont confirmés :

```powershell
New-Item -ItemType Directory -Path android/keystores -Force
& "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v `
  -keystore android/keystores/antaverse-upload.jks `
  -alias antaverse-upload `
  -keyalg RSA -keysize 4096 -validity 10000
Copy-Item android/keystore.properties.example android/keystore.properties
```

`keytool` demande les mots de passe sans les inscrire dans l'historique. Il
faut ensuite remplacer les valeurs `CHANGE_ME` dans
`android/keystore.properties`. Ces deux fichiers sont ignorés par Git.

Sauvegarder la clé et ses mots de passe dans deux emplacements chiffrés et
contrôlés par l'éditeur. Avec Play App Signing, cette clé devient la clé
d'upload ; Google conserve la clé de signature distribuée. Perdre une clé
d'upload reste récupérable via une procédure Google, mais retarde les mises à
jour.

Pour un build automatisé, les mêmes secrets peuvent être fournis sans fichier
via `ANTAVERSE_ANDROID_KEYSTORE_FILE`,
`ANTAVERSE_ANDROID_KEYSTORE_PASSWORD`, `ANTAVERSE_ANDROID_KEY_ALIAS` et
`ANTAVERSE_ANDROID_KEY_PASSWORD`.

## Construire l'AAB publiable

```powershell
npm run android:bundle
```

La commande refuse de continuer si la clé ou un mot de passe manque, reconstruit
toujours le dernier état web, contrôle le manifeste, les versions, les assets
et chaque fichier embarqué, puis produit :

`android/app/build/outputs/bundle/release/app-release.aab`

Ne jamais téléverser un APK debug ni l'AAB produit par
`npm run android:test:bundle`.

## Dernières étapes dans Google Play Console

Ces étapes exigent le compte et l'identité réelle de l'éditeur ; elles ne
peuvent pas être réalisées depuis le dépôt :

1. créer/vérifier le compte développeur Google Play ;
2. créer l'application avec le nom AntaVerse et confirmer
   `com.antaverse.app` ;
3. activer Play App Signing et téléverser l'AAB signé par la clé d'upload ;
4. commencer par la piste de test interne ;
5. remplir la fiche, les coordonnées, l'URL HTTPS publique de confidentialité,
   Data Safety, la publicité, App Access, Target Audience et le questionnaire
   IARC ;
6. fournir icône, feature graphic et captures d'écran réelles ;
7. corriger les points alcool recensés dans
   `docs/compliance/ALCOHOL_STORE_AUDIT.md` avant la production ;
8. tester au moins un téléphone Android réel, puis promouvoir la release.

Références officielles :

- Capacitor : https://capacitorjs.com/docs
- signature et Play App Signing :
  https://developer.android.com/studio/publish/app-signing
- téléversement d'un App Bundle :
  https://developer.android.com/studio/publish/upload-bundle
- exigence target API :
  https://support.google.com/googleplay/android-developer/answer/11926878
- Data Safety :
  https://support.google.com/googleplay/android-developer/answer/10787469
