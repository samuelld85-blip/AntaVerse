# Mise en service des comptes Sport

Le code reste une application web statique Next.js sur Vercel. Aucun Play Store,
APK, chantier Capacitor ou serveur Next.js n’est nécessaire. Google et Apple
utilisent OAuth web et reviennent à `/sport/compte/`.

Le dépôt ne contient pas d’identifiants Supabase ni de comptes fournisseurs.
Un build sans configuration fonctionne localement et indique que les comptes
ne sont pas encore disponibles. Les boutons OAuth ne sont affichés que lorsque
le fournisseur est activé dans les paramètres publics du serveur Supabase.

## 1. Créer le projet Supabase

Créer un projet sur Supabase, choisir sa région (préférer une région UE pour ce
public), conserver son mot de passe de base de données dans un gestionnaire de
mots de passe. Exécuter `supabase/migrations/202609060001_accounts_social.sql`
dans SQL Editor, ou `supabase link` puis `supabase db push` depuis le CLI.
La migration ne contient aucun secret. Elle crée les tables, politiques RLS,
RPC de sauvegarde atomique, versions et file de notifications.

Dans Authentication > URL Configuration :

- Site URL : l’origine Vercel de production, avec un domaine stable.
- Redirect URLs : `https://VOTRE-DOMAINE/sport/compte/` et
  `https://VOTRE-DOMAINE/sport/compte/?recovery=1`.
- Ajouter les URL localhost correspondantes si nécessaire. Éviter les jokers
  autorisant n’importe quel domaine de prévisualisation.

Dans Authentication > Providers > Email : activer Email et les inscriptions,
**désactiver Confirm email**, mot de passe minimum 8 caractères. Vérifier que
l’inscription retourne immédiatement une session. `supabase/config.toml` règle
le serveur local ainsi ; il ne modifie pas à lui seul le projet hébergé.

Configurer un SMTP de production dans Supabase pour les e-mails de récupération.
Le service e-mail de test Supabase est limité et ne remplace pas cette étape.
Même sans confirmation à l’inscription, l’adresse doit être correcte pour
récupérer un mot de passe perdu.

## 2. Google et Apple uniquement

Google : créer un client OAuth **Application web** dans Google Cloud, configurer
le consentement, ajouter les origines Vercel autorisées et l’URL de callback
indiquée dans Supabase (`https://REF.supabase.co/auth/v1/callback`). Saisir le
client ID et son secret dans Supabase > Google, activer le fournisseur. Les
restrictions utilisateurs test du consentement doivent être levées/configurées
avant de partager à tous les amis.

Apple : configurer Sign in with Apple pour le Web dans le compte Apple Developer,
un Services ID, le domaine et le même callback Supabase ; enregistrer le client
ID et le secret signé dans Supabase > Apple. Le secret Apple doit être renouvelé
avant expiration (au plus six mois). Ce prérequis Apple est distinct d’une
publication App Store. Si le fournisseur n’est pas encore configuré, son bouton
n’apparaît pas ; cela n’est pas considéré comme une connexion Apple validée.

Références : [Google](https://supabase.com/docs/guides/auth/social-login/auth-google),
[Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple),
[mots de passe](https://supabase.com/docs/guides/auth/passwords).

## 3. Variables Vercel et locales

Renseigner dans `.env.local` (ignoré par Git), puis dans Vercel :

```
NEXT_PUBLIC_SUPABASE_URL=https://REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=clé_publique_du_projet
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=clé_VAPID_publique
```

Ces variables sont intégrées au build statique : reconstruire et redéployer
après modification. **Ne jamais mettre la clé service_role, un secret OAuth,
un mot de passe de base ou la clé VAPID privée dans NEXT_PUBLIC ou le client.**
Les jeux hors Sport n’initialisent pas Supabase.

## 4. Notifications web

Générer une paire VAPID avec `npx web-push generate-vapid-keys` dans un terminal
privé. Conserver la clé privée dans le gestionnaire de secrets. Dans Supabase
Edge Function Secrets, définir :

- `WEB_PUSH_PUBLIC_KEY` et `WEB_PUSH_PRIVATE_KEY` ;
- `WEB_PUSH_SUBJECT=mailto:ADRESSE-DE-CONTACT` ;
- `PUSH_WORKER_SECRET` : secret aléatoire long, indépendant des clés précédentes.

Déployer `supabase functions deploy send-session-push`. Le JWT de passerelle est
désactivé dans la configuration **parce que la fonction vérifie son secret de
worker**. Elle refuse toute requête sans ce secret ; ne pas l’appeler depuis le
navigateur. Supabase fournit les variables serveur SUPABASE_URL et
SUPABASE_SERVICE_ROLE_KEY à la fonction.

Dans Supabase Vault, créer `antaverse_push_url` avec l’URL complète de la
fonction et `antaverse_push_secret` avec la même valeur que PUSH_WORKER_SECRET.
Exécuter `supabase/schedule-push.sql` pour lancer la file chaque minute. Le
planificateur pg_cron et pg_net doivent être disponibles. Vérifier les exécutions
dans Cron et les résultats Edge Functions. Après 5 tentatives infructueuses,
un job reste à diagnostiquer avant purge après 7 jours ; ne pas le déclarer livré.

Le client demande la permission seulement après le bouton Social. Sur iPhone,
il faut iOS 16.4+ et l’application ajoutée à l’écran d’accueil. Sur un navigateur
compatible Android/desktop, la notification web utilise le service worker.
Les déconnexions retirent l’abonnement de cet appareil. Les autres appareils
gardent leurs préférences. Le destinataire doit toujours être ami à l’envoi.

Une séance nouvelle déclenche un événement unique. Une édition ou une restauration
de la même séance n’envoie pas de nouveau push. L’import initial ne déclenche pas
une rafale de notifications. Les séances hors ligne sont annoncées à la prochaine
synchronisation si leur fin est postérieure à la sauvegarde précédente.

## 5. Modèle et garanties

- Seul le carnet Sport est envoyé. Une copie locale reste disponible hors ligne.
- Un compte possède sa ligne `backups` et les dix révisions précédentes.
- La comparaison de révision côté serveur empêche l’écrasement concurrent. Un
  conflit demande de choisir le carnet local ou distant, avec export possible.
- La dernière version synchronisée sert de base à la réconciliation après une
  coupure. Un stockage local illisible bloque l’envoi au lieu d’envoyer un carnet vide.
- Les copies locales sont isolées par compte lors des changements d’utilisateur.
- La liste publique aux utilisateurs connectés contient seulement les pseudos/IDs.
- Une demande d’ami doit être acceptée par son destinataire. Seul l’historique
  terminé est partagé, jamais le carnet complet, les favoris ou la séance active.
- `sport_sessions` suit les corrections et suppressions de l’historique lors de
  la sauvegarde. Retirer un ami révoque immédiatement son accès serveur.
- Supprimer le compte cascade vers ses sauvegardes, relations et abonnements.

## 6. Vérification réelle avant activation

Tests locaux : `npx vitest run src/sport/cloud src/sport/model.test.ts` exécute
les règles de réconciliation et **la migration SQL réelle dans PostgreSQL PGlite**
avec des rôles distincts pour contrôler RLS, versions, amitiés et file push.
Ces tests ne valident pas à eux seuls le Supabase hébergé, SMTP, OAuth ou la
livraison des notifications sur un téléphone.

`npx deno test --allow-env --config supabase/functions/deno.json supabase/functions/send-session-push/index.test.ts`
vérifie aussi le worker push avec des transports simulés : secret requis,
message de séance, amitié toujours active, refus des endpoints arbitraires et
suppression des abonnements expirés. Aucun push réel n’est envoyé par ces tests.

`npx playwright test --config=playwright.sport-cloud.config.ts` vérifie les
écrans mobiles et l’export/import dans Chromium et WebKit sur l’export statique.

Sur le projet configuré, vérifier avec deux comptes A/B et un troisième C :

1. Création e-mail sans confirmation et pseudo unique (y compris casse).
2. Google puis Apple sur le domaine Vercel, annulation et retour OAuth.
3. Mot de passe oublié, e-mail reçu, ouverture et changement effectif.
4. Séance enregistrée sur A ; effacement des données navigateur ; reconnexion
   et restauration de l’historique, favoris et séance active.
5. Modification hors ligne puis retour réseau ; conflit de deux appareils,
   conservation/export des versions ; changement A/B sans mélange de carnets.
6. A ajoute B, B accepte ; historique visible ; C ne peut pas lire les séances
   par appel direct. Retrait d’ami puis refus effectif de lecture.
7. B active les push, A termine une nouvelle séance ; réception écran fermé sur
   Android et iPhone installé, clic vers Historique. A corrige la séance : pas
   de seconde notification. Refus de permission et désactivation vérifiés.
8. Suppression du compte et contrôle des cascades en base.

Ne pas annoncer ces points validés tant que les services n’ont pas été configurés
et ces scénarios exécutés réellement.
