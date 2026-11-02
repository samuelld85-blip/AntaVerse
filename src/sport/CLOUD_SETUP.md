# Mise en service des comptes Sport

Le code reste une application web statique Next.js sur Vercel. Aucun Play Store,
APK, chantier Capacitor ou serveur Next.js n’est nécessaire. Google et Apple
utilisent OAuth web et reviennent à `/sport/compte/`.

Le dépôt ne contient pas d’identifiants Supabase ni de comptes fournisseurs.
Un build sans configuration fonctionne localement et indique que les comptes
ne sont pas encore disponibles. Exécuter les migrations `supabase/migrations/`
dans l’ordre (numérique). Les boutons OAuth ne sont affichés que lorsque
le fournisseur est activé dans les paramètres publics du serveur Supabase.

## 1. Créer le projet Supabase

Créer un projet sur Supabase, choisir sa région (préférer une région UE pour ce
public), conserver son mot de passe de base de données dans un gestionnaire de
mots de passe. Exécuter les fichiers `supabase/migrations/*.sql` dans l’ordre numérique
dans SQL Editor, ou `supabase link` puis `supabase db push` depuis le CLI.
Les migrations ne contiennent aucun secret. Elles créent les tables, politiques
RLS, RPC de sauvegarde atomique, versions, file de notifications, ainsi que les
mentions « j’aime » et commentaires sur les séances partagées.

Dans Authentication > URL Configuration :

- Site URL : `https://antaverse.vercel.app`
- Redirect URLs :
  - `https://antaverse.vercel.app/sport/compte/`
  - `https://antaverse.vercel.app/sport/compte/?recovery=1`
  - `http://localhost:3000/sport/compte/`
  - `http://localhost:3000/sport/compte/?recovery=1`
- Éviter les jokers autorisant n’importe quel domaine de prévisualisation. En
  conséquence, la connexion ne fonctionne que sur l’URL de production et en
  local : les déploiements de prévisualisation Vercel
  (`antaverse-git-…vercel.app`) ont une origine différente et sont refusés.

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
le consentement, ajouter les origines JavaScript autorisées
(`https://antaverse.vercel.app` et `http://localhost:3000`) et l’URL de callback
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
il faut iOS/iPadOS 16.4+ et le site ajouté à l’écran d’accueil ; la permission doit
être demandée depuis cette application web installée. Sur Android/desktop, utilisez
un navigateur compatible ; la notification web utilise le service worker.
La version native Capacitor du dépôt n’est pas encore un client de push distant :
le bouton Social y refuse volontairement l’activation, tandis que la permission
Android actuellement déclarée sert au minuteur local. Pour des notifications d’amis
dans les applications natives publiées, il faudra ajouter le plugin Push Notifications,
configurer APNs côté iOS et Firebase Cloud Messaging côté Android, puis adapter le
stockage des tokens et l’Edge Function. Cette voie nécessite aussi la configuration
manuelle des comptes Apple Developer et Firebase ; elle est distincte du Web Push.
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
  écart d’au moins une séance terminée entre l’appareil et la sauvegarde ouvre un
  choix (carnet de l’appareil ou version en ligne) sans bloquer l’appli ; sinon le
  carnet local prime. « Garder ma version locale » relit la révision et réessaie
  en cas d’écriture concurrente.
- Un appareil vidé (stockage effacé) récupère toujours le carnet en ligne et
  n’envoie jamais de carnet vide par-dessus les données du cloud. Un stockage
  local illisible bloque l’envoi au lieu d’envoyer un carnet vide.
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
5. Modification hors ligne puis retour réseau ; écart d’une séance entre deux
   appareils : le choix s’affiche et chaque bouton fonctionne ; modification sans
   écart : le carnet local est renvoyé ; changement A/B sans mélange de carnets.
6. A ajoute B, B accepte ; historique visible ; C ne peut pas lire les séances
   par appel direct. Retrait d’ami puis refus effectif de lecture.
7. B active les push, A termine une nouvelle séance ; réception écran fermé sur
   Android et iPhone installé, clic vers Historique. A corrige la séance : pas
   de seconde notification. Refus de permission et désactivation vérifiés.
8. Suppression du compte et contrôle des cascades en base.

Ne pas annoncer ces points validés tant que les services n’ont pas été configurés
et ces scénarios exécutés réellement.

## 7. Assistant Sport (optionnel)

Pour le développement local, `supabase/functions/.env.example` décrit les
variables attendues. Le fichier réel `supabase/functions/.env` est ignoré par
Git et chargé par le runtime Edge local ; il ne fait pas partie du build PWA.
La configuration locale des secrets ne configure pas le projet hébergé.

Le catalogue serveur est généré depuis `src/sport/catalog.ts` avec
`npm run sport:ai:catalog`. Le build vérifie sa concordance avec
`npm run sport:ai:catalog:check` ; ne pas éditer directement le JSON généré.

Appliquer la migration `supabase/migrations/202610190001_sport_ai_quota.sql`
au projet Supabase, puis déployer la fonction :

```
supabase functions deploy sport-assistant --no-verify-jwt
```

`verify_jwt=false` est intentionnel : le handler appelle `auth.getUser` avec le
jeton reçu et refuse toute requête non authentifiée. Dans Supabase Dashboard →
Edge Functions → Secrets, définir `OPENROUTER_API_KEY` (secret privé, jamais
dans le dépôt, la conversation ou une variable `NEXT_PUBLIC_*`) et
`SPORT_AI_ALLOWED_ORIGINS`, liste séparée par des virgules d’origines exactes
autorisées, par exemple `https://antaverse.vercel.app,http://localhost:3000`.
Pour les déploiements du même projet Vercel, une entrée explicite telle que
`https://antaverse-*-sam-f305.vercel.app` autorise ses adresses de branche et de
déploiement. Le joker est limité à un seul label de nom d’hôte, pour ce projet et
cette équipe ; il n’autorise ni autre domaine, ni HTTP, ni port arbitraire.
Ne pas inclure de chemins ni de barre oblique finale. Saisir la clé directement
dans le tableau de bord, sans la passer en argument de commande ou l’écrire dans
un fichier versionné.

### Repères et limites de Milo

Milo est le coach IA de Sport. Ses repères éditoriaux pour l’entraînement
général sont définis dans
[`supabase/functions/_shared/coach-knowledge.json`](../../supabase/functions/_shared/coach-knowledge.json),
version `2026-10-20`, avec des sources ACSM, NSCA et HHS. Ce JSON est maintenu
manuellement et doit être revérifié lors de ses mises à jour ; il ne déclenche
aucune recherche web en direct. Le catalogue des exercices suit un pipeline
distinct, généré depuis `src/sport/catalog.ts`.

Le serveur demande au modèle de classer chaque demande comme liée à
l’entraînement, hors sujet ou médicale. Pour les demandes hors sujet ou
médicales, le serveur remplace la réponse générée par une redirection fixe sans
séance. La classification et la génération se font dans le même appel : la
demande est transmise au fournisseur. La classification étant produite par un modèle,
elle n’offre pas de garantie absolue. Milo ne prétend pas avoir de diplôme ni
fournir un avis médical.

Les limites par défaut sont 20 requêtes par utilisateur et par jour, 100 au
total par jour et 3 par minute et utilisateur. Elles peuvent être ajustées via
les secrets Edge Function `SPORT_AI_USER_DAILY_LIMIT`,
`SPORT_AI_GLOBAL_DAILY_LIMIT` et `SPORT_AI_MINUTE_LIMIT` (entiers positifs).
La RPC atomique `consume_sport_ai_quota` enregistre uniquement l’UUID, le jour,
le compteur et la fenêtre minute, jamais les prompts ni les réponses. Elle
supprime les compteurs de plus de 7 jours au fil des appels. La suppression
d’un compte supprime aussi ses compteurs. Ne pas créer de journal applicatif
contenant le texte, l’en-tête d’authentification ou la clé fournisseur.

Dans OpenRouter, restreindre la clé au modèle requis et activer le refus de
collecte fournisseur (`data_collection: deny`) et le routage ZDR
(`zdr: true`). Ces contrôles limitent les fournisseurs admissibles selon leurs
réglages déclarés ; ils ne garantissent ni localisation UE ni absence absolue
de traitement/rétention chez l’intermédiaire. Revoir les politiques courantes
d’[OpenRouter](https://openrouter.ai/privacy/) et du
[fournisseur de modèle](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/)
avant la mise en service et périodiquement.

Les boutons contextuels de préparation, relecture et progression déclenchent
leur demande au toucher. L’import ouvre un champ de texte puis transmet le
programme avec un seul envoi de l’utilisateur. L’assistant n’est pas appelé
depuis les pages sans action correspondante. La préparation n’exige pas de
case de consentement ou de partage de l’historique ; les détails de traitement
et les destinataires sont exposés dans `/legal/confidentialite`.

Le contexte transmis comprend toutes les séances terminées de l’utilisateur,
y compris les anciennes, toutes les séries terminées de ces séances et les
statistiques calculées depuis le carnet. Il ne comprend pas le carnet complet :
les noms, e-mails, pseudos, commentaires, photos et données d’amis sont exclus.
Les exercices, identifiants utiles, dates, équipement, charges et répétitions
peuvent être transmis. Le texte saisi peut lui-même contenir des informations
personnelles. Le modèle n’a aucun accès à la base de données et n’utilise aucun
outil. Le corps de requête est limité à 2 000 000 octets ; une demande qui
dépasse cette limite est rejetée avec une erreur visible, sans suppression
silencieuse de séances ou de séries.

Si `OPENROUTER_API_KEY` n’est pas configurée, l’interface indique que
l’assistant est indisponible après la demande ; aucun appel au fournisseur ni
coût modèle n’est engagé. Pour chaque mise en service ou changement de
configuration, exécuter les tests avec transport simulé, confirmer les origines
autorisées, les limites et le nettoyage des compteurs, puis suivre
[`docs/sport-ai-evaluation.md`](../../docs/sport-ai-evaluation.md). Les tests
automatisés ne doivent jamais contacter OpenRouter. La fonction n’est pas
utilisable sans clé valide.

Voir aussi la [revue produit Milo](../../docs/sport-ai-product-review.md) et les
[exemples d’évaluation](../../docs/examples/sport-ai-beginner.md).
