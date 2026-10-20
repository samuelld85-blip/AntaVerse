# Milo — mise en service du 20 octobre 2026

## Serveur Supabase

Projet : `xssknztcrujaqzwtqhdq` (Antaverse, eu-west-2), identique à la configuration publique de la PWA.

La migration `202610190001_sport_ai_quota.sql` a été appliquée dans une transaction via `supabase db query --linked --project-ref … --file …`, après vérification de l’absence des objets. Le projet existant avait été configuré manuellement et ne possédait pas de schéma `supabase_migrations`. Aucun historique de migrations ancien n’a été fabriqué ou réécrit. Avant une application ultérieure, vérifier les objets distants et ne pas rejouer ce SQL de création sur les tables présentes.

Les deux tables de quota existent, avec RLS active et sans droit de lecture pour `anon` ou `authenticated`. La RPC est exécutable par `service_role`, pas par les comptes ordinaires. Les sauvegardes et comptes existants ont été conservés.

La fonction `sport-assistant` est déployée et active. Son import map est configuré dans `supabase/config.toml` afin que le bundler Supabase résolve Zod. La passerelle JWT est désactivée pour cette fonction ; l’authentification réelle par `auth.getUser` reste obligatoire dans le handler.

La clé OpenRouter et la configuration d’origine ont été déposées dans les secrets Supabase. Les adresses du projet Vercel sont autorisées, y compris ses déploiements de branche, avec un joker limité au projet et à l’équipe. Aucune clé privée ne figure dans le code client ou le dépôt.

## Vérification réelle

Un compte de test jetable a servi à appeler la fonction hébergée, avec seulement les cinq séances fictives des exemples. Les appels ont traversé l’authentification Supabase, la réservation de quota, OpenRouter et la validation de la réponse.

- Préparation : HTTP 200, séance structurée de trois exercices.
- Import : HTTP 200, les deux exercices et réglages fournis sont conservés.
- Demande hors sport : HTTP 200, redirection fixe sans séance.
- Préflight depuis une adresse de déploiement Vercel : HTTP 204 et origine exacte renvoyée.
- Origine étrangère : HTTP 403 ; requête sans compte : HTTP 401.

Le compte jetable a été supprimé après vérification ; le contrôle en base confirme qu’il n’en reste aucun. Aucun carnet personnel n’a été utilisé dans ces essais.

Les parcours mobiles automatisés vérifient séparément le dialogue simplifié, le carnet complet (dont une séance de plus de 400 jours), l’import sans écran préalable, le démarrage réel sans séries déjà effectuées, les favoris, les erreurs et le retour du focus. La page de confidentialité conserve les informations sur les prestataires ; le dialogue ne contient plus de consentement, sélection de données, période ou texte documentaire.
