// One-off generator for the pre-integration review Excel (human audit of the
// 96 Roulette du Chaos rules + every content bank). Not part of the content
// pipeline — run manually, not wired into npm scripts.
import { readFileSync } from "node:fs";
import XLSX from "xlsx";

const banks = JSON.parse(readFileSync("scripts/_tmp-banks.json", "utf8"));
const intensityMap = JSON.parse(readFileSync("scripts/_tmp-intensity-map.json", "utf8"));

// ---------------------------------------------------------------------------
// 1) RULES AUDIT — one row per rule, as actually implemented in the codebase.
// ---------------------------------------------------------------------------

const RULES = [
  // --- DISTRIBUE ---
  ["DISTRIBUE","D1","Petit cadeau","Distribue 2 gorgées : à un seul joueur, ou 1 + 1 entre deux joueurs.","Distribution libre (texte)","OUI","NON","","freeDistributeEvent — pas de sélecteur de cible, narration seule ; le joueur répartit lui-même à la table."],
  ["DISTRIBUE","D2","Généreux","Distribue 3 gorgées comme tu veux.","Distribution libre (texte)","OUI","NON","",""],
  ["DISTRIBUE","D3","Grande tournée","Distribue 4 gorgées comme tu veux.","Distribution libre (texte)","OUI","NON","",""],
  ["DISTRIBUE","D4","Double cible","Choisis deux joueurs différents. Chacun reçoit 2 gorgées.","Narration table (auto-arbitré)","OUI","NON","","Le texte promet un choix de 2 joueurs mais la résolution est purement narrative — le sélecteur pickTargets(2,2) existant n'est pas branché ici. À valider : faut-il activer un vrai picker ?"],
  ["DISTRIBUE","D5","Voisinage","Choisis ton voisin de gauche ou de droite. Il ou elle reçoit 3 gorgées.","Sélecteur voisin (existant)","OUI","NON","",""],
  ["DISTRIBUE","D6","Rien de personnel","L'application choisit une victime au hasard. Elle reçoit 2 gorgées.","Cible aléatoire (existant)","OUI","NON","",""],
  ["DISTRIBUE","D7","Un pour chacun","Choisis trois joueurs différents. Chacun reçoit 1 gorgée.","Distribution libre (texte)","OUI","NON","","Même remarque que D4 : le picker à 3 cibles existant n'est pas branché, narration seule."],
  ["DISTRIBUE","D8","Tête-à-tête","Choisis un adversaire pour un pile ou face virtuel. Le perdant boit 2 gorgées.","Cible + pile ou face (existant)","OUI","NON","",""],
  ["DISTRIBUE","D9","La chaîne","Choisis un premier joueur qui boit 1 gorgée. Il désigne ensuite un autre joueur, puis ce joueur en désigne un troisième. Personne ne peut être choisi deux fois.","Cible unique + narration (NOUVEAU)","NON","NON","","Nouvelle règle. L'app ne capture que le 1er maillon (needTargets) ; les 2e et 3e maillons sont annoncés oralement à la table, non trackés par le moteur."],
  ["DISTRIBUE","D10","Tout sur un ou presque","Choisis : distribuer 4 gorgées à une seule personne, ou 5 gorgées réparties entre au moins trois joueurs.","Choix binaire (existant)","OUI","NON","",""],
  ["DISTRIBUE","D11","Passe le pouvoir","Choisis un joueur : il distribue 4 gorgées comme il veut, mais il n'a pas le droit de t'en donner.","Cible unique (existant)","OUI","NON","",""],
  ["DISTRIBUE","D12","Arrosage contrôlé","Distribue 5 gorgées comme tu veux, avec un maximum de 2 gorgées par personne.","Distribution libre (texte)","OUI","NON","","Le plafond de 2/personne est une consigne textuelle, non contrôlée par le moteur (personne ne peut « bloquer » un 3e gorgée)."],

  // --- SUBIS ---
  ["SUBIS","S1","Classique","Tu bois 2 gorgées.","Pénalité fixe (existant)","OUI","NON","",""],
  ["SUBIS","S2","Pas ton jour","Tu bois 3 gorgées.","Pénalité fixe (existant)","OUI","NON","",""],
  ["SUBIS","S3","Sale tour","Tu bois 4 gorgées.","Pénalité fixe (existant)","OUI","NON","",""],
  ["SUBIS","S4","Avec un ami","Choisis un joueur : vous buvez tous les deux 2 gorgées.","Narration table (auto-arbitré)","OUI","NON","","Le texte promet un choix de complice, la résolution est narrative (« désigne un complice ») — pas de picker branché, comme D4."],
  ["SUBIS","S5","Sauve-toi","Prends 3 gorgées maintenant, ou tente un défi Stop Timer pour t'en sortir.","Choix + mini-jeu solo (existant)","OUI","NON","",""],
  ["SUBIS","S6","Le voisin paie aussi","Tu bois 2 gorgées. Ton voisin de droite boit 1 gorgée.","Voisin calculé (existant)","OUI","NON","",""],
  ["SUBIS","S7","Vote de confiance","Le groupe vote à main levée : PARDON = tu ne bois rien ; CONDAMNATION = tu bois 3 gorgées. En cas d'égalité, tu bois 1.","Vote de groupe à 3 issues (existant)","OUI","NON","","Vote non individuel : un joueur tape le résultat constaté à main levée (comme pour Majorité)."],
  ["SUBIS","S8","Quitte ou double","Bois 2 gorgées maintenant, ou tente pile ou face : gagné = rien ; perdu = 4 gorgées.","Choix + pile ou face (existant)","OUI","NON","",""],
  ["SUBIS","S9","Confession express","L'application affiche une question personnelle ou épicée. Réponds honnêtement, ou bois 2 gorgées.","Question aléatoire + choix (existant)","OUI","OUI","confession-questions (CONFESSION_QUESTIONS)","« Répondre honnêtement » n'est pas vérifiable par l'app — le joueur déclare lui-même s'il a répondu."],
  ["SUBIS","S10","Le tribunal","L'application affiche une affirmation sur toi. Le groupe vote VRAI ou FAUX. Si la majorité vote VRAI, tu bois 2 ; sinon, les votants VRAI boivent 1.","Affirmation + vote de groupe (existant)","OUI","OUI","verdict-statements (VERDICT_STATEMENTS)","Le vote n'est pas capté joueur par joueur : un seul tap donne le résultat majoritaire constaté à table."],
  ["SUBIS","S11","Appel à un ami","Choisis un joueur. Il peut te sauver en buvant 1 gorgée. S'il refuse, tu bois 3 gorgées.","Cible + choix (existant)","OUI","NON","",""],
  ["SUBIS","S12","Mime ou sanction","L'application te donne un mot à faire deviner en 20 secondes sans parler. Réussi = rien ; raté = 3 gorgées.","Mot aléatoire + choix (existant)","OUI","OUI","mime-words (MIME_WORDS)","Aucun chrono affiché à l'écran pour les 20 secondes ; le succès/échec est déclaré par la table, pas mesuré. Candidat à un vrai compte à rebours si jugé utile."],

  // --- DUEL ---
  ["DUEL","DL1","Duel de réflexes","Choisis un adversaire pour un duel de réflexes.","Mini-jeu duel : Reflex (existant)","OUI","NON","",""],
  ["DUEL","DL2","Chrono commun","Choisis un adversaire : au plus près de 5 secondes.","Mini-jeu duel : Stop Timer (existant)","OUI","NON","",""],
  ["DUEL","DL3","Pierre-feuille-ciseaux","Choisis un adversaire pour un pierre-feuille-ciseaux.","Mini-jeu duel : RPS (existant)","OUI","NON","",""],
  ["DUEL","DL4","Plus ou moins","Choisis un adversaire pour un duel plus ou moins.","Mini-jeu duel : Plus/Moins (existant)","OUI","NON","",""],
  ["DUEL","DL5","Nombre secret","Choisis un adversaire pour deviner le nombre secret.","Mini-jeu duel : Nombre secret (existant)","OUI","NON","",""],
  ["DUEL","DL6","Estimation éclair","Choisis un adversaire pour un duel d'estimation.","Mini-jeu duel : Estimation (existant)","OUI","OUI","estimation-questions (ESTIMATION_QUESTIONS)","La banque est consommée dans le composant mini-jeu, pas dans le resolver de l'événement."],
  ["DUEL","DL7","Tap Battle","Choisis un adversaire pour un duel de vitesse.","Mini-jeu duel : Tap Battle (existant)","OUI","NON","",""],
  ["DUEL","DL8","Cible 50","Une jauge défile de 0 à 100. Chacun appuie une fois : le plus proche de 50 gagne. Le perdant boit 2.","Duel table (NOUVEAU, non instrumenté)","NON","NON","","AUCUN composant « jauge défilante » n'existe. Actuellement narration pure (l'app énonce la règle, la table s'auto-arbitre). Candidat fort pour un vrai mini-jeu (proche de Stop Timer visuellement)."],
  ["DUEL","DL9","Face à face","Choisis un adversaire. Regardez-vous sans détourner les yeux ni rire. Le premier qui craque boit 2.","Duel table (NOUVEAU, auto-arbitré)","NON","NON","","Concours de regard : intrinsèquement non détectable par l'app. Narration assumée, pas de mini-jeu prévu."],
  ["DUEL","DL10","Le 21","À tour de rôle, annoncez 1, 2 ou 3 nombres consécutifs en partant de 1. Celui qui prononce 21 perd et boit 2.","Duel table (NOUVEAU, auto-arbitré)","NON","NON","","Jeu de comptage verbal, auto-arbitré. Un mini-jeu numérique serait possible (l'app pourrait tracker le compte) mais n'existe pas actuellement."],
  ["DUEL","DL11","Mot en chaîne","L'application donne une catégorie. À tour de rôle, donnez une réponse différente en moins de 3 secondes. Répétition, erreur ou blanc = 2 gorgées.","Catégorie aléatoire + narration (NOUVEAU)","NON","OUI","chain-categories (CHAIN_CATEGORIES)","Pas de chrono 3 secondes affiché ; le jugement (répétition/erreur/blanc) est fait par la table."],
  ["DUEL","DL12","Ni oui ni non","Pendant 20 secondes, posez-vous des questions à tour de rôle. Le premier qui dit « oui » ou « non » boit 2.","Duel table (NOUVEAU, auto-arbitré)","NON","NON","","Pas de chrono 20 secondes affiché ; proche dans l'esprit de R2 (mots interdits) mais en duel."],

  // --- TOUS ---
  ["TOUS","T1","Santé","Tout le monde boit 1 gorgée.","Narration pure (existant)","OUI","NON","",""],
  ["TOUS","T2","Majorité","Le groupe vote à main levée entre deux options. La minorité boit.","Prompt aléatoire + vote 3 issues (existant)","OUI","OUI","majority-prompts (MAJORITY_PROMPTS)","Banque partagée avec T11 Camp contre camp (même structure de paire binaire)."],
  ["TOUS","T3","Le dernier","Au signal, le dernier à lever la main boit 2 gorgées.","Narration table (auto-arbitré)","OUI","NON","","Auto-arbitré par nature (détection de vitesse physique) — comportement voulu, pas une lacune."],
  ["TOUS","T4","Le doigt","3, 2, 1, pointez ! Le joueur le plus pointé du doigt boit.","Narration table (auto-arbitré)","OUI","NON","","Idem T3 : auto-arbitré par nature."],
  ["TOUS","T5","Tout le monde sauf...","L'application épargne un joueur au hasard. Tous les autres boivent 1 gorgée.","Cible aléatoire (existant)","OUI","NON","",""],
  ["TOUS","T6","Les extrêmes","L'application tire une caractéristique volontairement personnelle, gênante ou provocante : sexe, relations, alcool, drogues, argent, boulot, habitudes de soirée, etc. Le groupe désigne la personne qui correspond le plus ; elle boit 2.","Question aléatoire + désignation groupe (existant)","OUI","OUI","extreme-questions (EXTREME_QUESTIONS)","Remplace l'ancienne banque neutre « le/la plus jeune... » (spec v1) par des questions volontairement épicées, conformément au fichier Excel v2."],
  ["TOUS","T7","Nombre maudit","Tout le monde montre simultanément entre 0 et 5 doigts. L'application tire ensuite un nombre de 0 à 5 : ceux qui ont exactement ce nombre boivent 2 ; si personne ne l'a, le ou les plus proches boivent 1.","Hasard 0-5 + narration (existant)","OUI","NON","","Remplace l'ancien « Pair ou impair ». Le dénombrement des doigts est déclaratif (la table compare elle-même), pas saisi dans l'app."],
  ["TOUS","T8","Désignation","L'application affiche « Qui serait le plus susceptible de... ? ». 3, 2, 1 : tout le monde pointe. Le plus désigné boit 2.","Question aléatoire + désignation groupe (existant)","OUI","OUI","designation-prompts + spicy-designation-prompts","Pool combiné : fragments courts (existants, insérés dans le gabarit « Qui serait le plus susceptible de {x} ? ») + questions épicées complètes (nouvelles, déjà phrasées)."],
  ["TOUS","T9","Je n'ai jamais express","L'application affiche un « Je n'ai jamais... ». Tous ceux qui l'ont déjà fait boivent 1 gorgée.","Affirmation aléatoire (NOUVEAU)","NON","OUI","never-have-i-ever (NEVER_HAVE_I_EVER)","Mécanique nouvelle mais triviale (même schéma que T6/T8/F8) : aucune saisie, dénombrement déclaratif à table."],
  ["TOUS","T10","Tour de table","L'application donne une catégorie. En tournant autour de la table, chacun doit donner une réponse différente en moins de 3 secondes. Le premier qui bloque, répète ou se trompe boit 2.","Catégorie aléatoire + narration (NOUVEAU)","NON","OUI","chain-categories (CHAIN_CATEGORIES)","Banque partagée avec DL11. Pas de chrono affiché, jugement fait par la table."],
  ["TOUS","T11","Camp contre camp","L'application affiche une question ou opinion à deux choix. Tout le monde choisit simultanément un camp. La minorité boit 1 ; égalité parfaite = tout le monde boit 1.","Prompt aléatoire + vote 3 issues (NOUVEAU)","NON","OUI","majority-prompts (MAJORITY_PROMPTS)","Réutilise exactement la mécanique de T2 et la même banque — seule la mise en scène (« camps » simultanés vs vote main levée) et l'issue « égalité parfaite » diffèrent."],
  ["TOUS","T12","Estimation collective","L'application pose une question numérique. Chacun annonce une estimation. Le plus proche distribue 2 gorgées ; le plus éloigné boit 2.","Question numérique aléatoire (NOUVEAU)","NON","OUI","estimation-questions (ESTIMATION_QUESTIONS)","Réutilise la banque du mini-jeu Estimation éclair (DL6). L'app affiche la question et la réponse ; comparer les estimations de chacun au groupe est déclaratif (pas de saisie individuelle dans l'app)."],

  // --- CHOISIS ---
  ["CHOISIS","C1","Safe ou Risk","SAFE : distribue 1 gorgée. RISK : pile ou face pour distribuer 4, ou boire 3.","Choix + pile ou face (existant)","OUI","NON","",""],
  ["CHOISIS","C2","Pile ou double","Accepte 2 gorgées, ou tente ta chance : rien, ou 4 gorgées.","Choix + pile ou face (existant)","OUI","NON","",""],
  ["CHOISIS","C3","Toi ou lui","Choisis un adversaire, puis MOI (tu bois 1) ou LUI (il tente un défi Stop Timer).","Cible + choix + mini-jeu solo (existant)","OUI","NON","",""],
  ["CHOISIS","C4","Mystère A / B / C","Trois cartes face cachée : distribue 3, bois 2, ou rien. Choisis-en une.","Mystère 3 choix (existant)","OUI","NON","",""],
  ["CHOISIS","C5","Rouge ou noir","Devine la couleur d'une carte virtuelle. Bonne réponse : distribue 3. Sinon : bois 2.","Choix + hasard (existant)","OUI","NON","",""],
  ["CHOISIS","C6","Petit ou gros risque","Petit risque : distribue 2 ou bois 1. Gros risque : distribue 5 ou bois 4.","Choix + pile ou face (existant)","OUI","NON","",""],
  ["CHOISIS","C7","Moi ou nous","MOI : tu bois 2 seul. NOUS : tout le monde boit 1, toi inclus.","Choix binaire (existant)","OUI","NON","",""],
  ["CHOISIS","C8","Marché du chaos","Choisis un joueur. Deux effets sont cachés, l'un pour toi et l'autre pour lui. Décide qui reçoit la case A et qui reçoit la case B avant de révéler les effets.","Cible + choix + hasard caché (NOUVEAU)","NON","NON","","Logique métier nouvelle : la case gagnante (A ou B) n'est tirée qu'après que les deux joueurs ont choisi leur lettre — à faire valider humainement (risque de confusion sur le déroulé)."],
  ["CHOISIS","C9","Pacte ou trahison","Choisis un adversaire. Chacun choisit secrètement PACTE ou TRAHISON. Deux pactes : chacun distribue 2. Un seul trahit : il distribue 4 et l'autre boit 2. Deux trahisons : chacun boit 2.","Cible + narration (NOUVEAU, non instrumenté)","NON","NON","","IMPORTANT : décrit un choix simultané caché à 2 joueurs. L'app ne capture AUCUN choix réel — elle énonce la règle et laisse la table s'auto-arbitrer (poing fermé/main ouverte). Aucune mécanique de choix simultané caché n'existe dans le moteur actuel."],
  ["CHOISIS","C10","Vérité ou pénalité","Choisis : répondre honnêtement à une question épicée tirée par l'application, ou garder le silence et boire 2 gorgées.","Question aléatoire + choix (existant)","OUI","OUI","confession-questions (CONFESSION_QUESTIONS)","Banque partagée avec S9 Confession express."],
  ["CHOISIS","C11","Bouclier ou attaque","Choisis : distribuer 2 gorgées maintenant, ou gagner un bouclier qui annule jusqu'à 2 gorgées de ta prochaine pénalité avant ton prochain tour.","Choix + règle temporaire (NOUVEAU)","NON","NON","","IMPORTANT : le « bouclier » est stocké comme ActiveRule (texte affiché dans la bannière de règle) mais le moteur n'applique AUCUNE réduction automatique de la pénalité suivante — c'est purement déclaratif, les joueurs doivent l'appliquer eux-mêmes de mémoire."],
  ["CHOISIS","C12","Talent ou sécurité","SÉCURITÉ : distribue 2 gorgées. DÉFI : réussis un mini-défi pour en distribuer 5 ; en cas d'échec, bois 2.","Choix + mini-jeu solo (existant)","OUI","NON","",""],

  // --- DESTIN ---
  ["DESTIN","F1","Victime du destin","L'application choisit un joueur au hasard. Il ou elle boit 2 gorgées.","Cible aléatoire (existant)","OUI","NON","",""],
  ["DESTIN","F2","Duo maudit","L'application choisit deux joueurs au hasard. Ils boivent 1 gorgée chacun.","Cibles aléatoires distinctes (existant)","OUI","NON","",""],
  ["DESTIN","F3","Justice","Pile : c'est toi. Face : l'application choisit un autre joueur. 2 gorgées.","Hasard en cascade (existant)","OUI","NON","",""],
  ["DESTIN","F4","Duel imposé","L'application tire deux joueurs au sort pour un duel imposé. Le perdant boit 2 gorgées.","Cibles aléatoires + mini-jeu duel (existant)","OUI","NON","",""],
  ["DESTIN","F5","Dé du destin","1-2 : tu bois 2. 3-4 : rien. 5-6 : tu distribues 2.","Dé virtuel (existant)","OUI","NON","",""],
  ["DESTIN","F6","Cadeau tombé du ciel","L'application choisit un joueur au hasard : il ou elle distribue 3 gorgées.","Cible aléatoire (existant)","OUI","NON","",""],
  ["DESTIN","F7","Gauche ou droite","L'application tire au hasard un côté. Ce voisin boit 2 gorgées.","Hasard binaire + voisin calculé (existant)","OUI","NON","",""],
  ["DESTIN","F8","Destin collectif","L'application affiche une affirmation. Tous ceux qui correspondent lèvent la main : une seule personne = elle boit 2 ; plusieurs = elles boivent 1 chacune ; personne = le joueur actif boit 1.","Affirmation aléatoire (existant)","OUI","OUI","destiny-prompts (DESTINY_PROMPTS)","Le dénombrement des mains levées est déclaratif, non saisi dans l'app."],
  ["DESTIN","F9","La cascade","L'application choisit un joueur de départ et un sens. En suivant le cercle, un joueur sur deux boit 1 gorgée.","Calcul algorithmique (NOUVEAU)","NON","NON","","Nouvelle logique de parcours circulaire (un joueur sur deux à partir d'un point et d'un sens tirés au sort). Purement calculée, pas de bank."],
  ["DESTIN","F10","Bénédiction et malédiction","L'application choisit deux joueurs différents : l'un distribue 3 gorgées, l'autre boit 2.","Cibles aléatoires distinctes (existant)","OUI","NON","",""],
  ["DESTIN","F11","La moitié maudite","L'application sélectionne au hasard environ la moitié du groupe. Les joueurs sélectionnés boivent 1 gorgée.","Tirage indépendant par joueur (NOUVEAU)","NON","NON","","Mécanique nouvelle : un slot aléatoire par joueur (nombre de slots variable selon l'effectif). Cas limites (0 ou tous sélectionnés) repliés sur le joueur le plus « malchanceux » — logique à valider humainement."],
  ["DESTIN","F12","Dernier survivant","L'application élimine aléatoirement les joueurs un par un jusqu'à n'en laisser qu'un. Le survivant distribue 3 gorgées.","Cible aléatoire (existant, simplifié)","OUI","NON","","ÉCART TEXTE/IMPLÉMENTATION : le texte promet une élimination progressive affichée un par un ; l'implémentation actuelle tire directement un survivant final sans animer les éliminations intermédiaires."],

  // --- REGLE ---
  ["REGLE","R1","Plus de prénom","Jusqu'à ton prochain tour, personne ne peut dire le prénom d'un autre joueur.","Règle temporaire ownerNextTurn (existant)","OUI","NON","",""],
  ["REGLE","R2","Oui / Non","Jusqu'à ton prochain tour, les mots « oui » et « non » sont interdits.","Règle temporaire ownerNextTurn (existant)","OUI","NON","",""],
  ["REGLE","R3","Interdit de montrer","Jusqu'à ton prochain tour, pointer quelqu'un du doigt est interdit. Chaque infraction coûte 1 gorgée.","Règle temporaire ownerNextTurn (existant)","OUI","NON","","Remplace l'ancien R3 « Main faible » (retiré du fichier Excel v2)."],
  ["REGLE","R4","Monsieur / Madame","Jusqu'à ton prochain tour, on s'adresse aux autres en disant « Monsieur » ou « Madame » + prénom.","Règle temporaire ownerNextTurn (existant)","OUI","NON","",""],
  ["REGLE","R5","Pas de gros mot","Jusqu'à ton prochain tour (ou la première infraction) : pas de gros mot.","Règle temporaire firstViolation (existant)","OUI","NON","",""],
  ["REGLE","R6","Mot interdit","Un mot est tiré au sort. Le premier qui le prononce boit 1 gorgée, puis la règle se termine.","Mot aléatoire + règle firstViolation (existant)","OUI","OUI","forbidden-words (FORBIDDEN_WORDS)","",],
  ["REGLE","R7","Question interdite","Jusqu'à ton prochain tour : répondre directement à une question posée coûte 1 gorgée.","Règle temporaire ownerNextTurn (existant)","OUI","NON","",""],
  ["REGLE","R8","Téléphone interdit","Jusqu'à ton prochain tour, personne ne touche à son téléphone personnel. La première infraction coûte 1 gorgée.","Règle temporaire firstViolation (existant)","OUI","NON","","Remplace l'ancien R8 « Silence express » (expiry: timer, 30 s), retiré comme demandé. IMPORTANT : plus aucune des 96 règles n'utilise désormais expiry:\"timer\" — le chemin « minuteur » de la bannière de règle (RuleBanner : décompte, auto-clear à expiration) devient du code mort tant qu'aucune règle ne le déclenche. À garder, supprimer, ou réaffecter — décision produit à trancher."],
  ["REGLE","R9","Voix imposée","L'application tire une manière de parler simple (chuchoter, voix de robot, présentateur TV...). Jusqu'à ton prochain tour, la première personne qui oublie boit 1.","Style aléatoire + règle firstViolation (NOUVEAU)","NON","OUI","voice-styles (VOICE_STYLES)","Nouvelle règle mais mécanique identique à R6 (tirage + règle firstViolation)."],
  ["REGLE","R10","Pouce discret","Avant ton prochain tour, pose discrètement ton pouce sur la table quand tu veux. Tous doivent t'imiter : le dernier boit 2. La règle se termine aussitôt.","Règle temporaire firstViolation (existant)","OUI","NON","","Mécanique « signal discret propagé » entièrement auto-arbitrée à table, aucune détection possible côté app."],
  ["REGLE","R11","Pas de « je »","Jusqu'à ton prochain tour, « je » et « j' » sont interdits. Chaque infraction coûte 1 gorgée.","Règle temporaire ownerNextTurn (existant)","OUI","NON","",""],
  ["REGLE","R12","Signal secret","Avant ton prochain tour, touche discrètement ton nez ou ton oreille. Tous doivent reproduire le geste : le dernier boit 2. La règle se termine aussitôt.","Règle temporaire firstViolation (existant)","OUI","NON","","Même remarque que R10 : auto-arbitré, aucune détection possible."],

  // --- JACKPOT ---
  ["JACKPOT","J1","Jackpot","Tu distribues 5 gorgées comme tu veux.","Distribution libre (texte)","OUI","NON","",""],
  ["JACKPOT","J2","Super Jackpot","Distribue 6 gorgées entre au moins deux joueurs.","Distribution libre (texte)","OUI","NON","","Le « au moins deux joueurs » n'est pas contrôlé par le moteur (déclaratif)."],
  ["JACKPOT","J3","Banco","Distribue 4 gorgées sûres, ou tente le Banco : 8 gorgées si tu réussis, rien si tu échoues.","Choix + mini-jeu solo (existant)","OUI","NON","",""],
  ["JACKPOT","J4","Immunité royale","Distribue 4 gorgées et gagne une immunité : avant ton prochain tour, ta prochaine pénalité est réduite de 2 gorgées maximum.","Distribution + règle temporaire (NOUVEAU)","NON","NON","","Remplace l'ancien J4 « Jackpot gratuit ». Même limitation que C11 : l'immunité est déclarative (texte dans la bannière de règle), pas appliquée automatiquement par le moteur sur l'événement suivant."],
  ["JACKPOT","J5","Royal Duel","Choisis un adversaire. Le vainqueur distribue 5 gorgées comme il le souhaite.","Cible + mini-jeu duel (existant)","OUI","NON","",""],
  ["JACKPOT","J6","Braquage","Choisis trois cibles : elles reçoivent 2, 2 et 1 gorgée(s).","Distribution libre (texte)","OUI","NON","","Écart préexistant (avant cette intégration) : le texte promet une répartition précise 2/2/1, l'implémentation distribue 5 en texte libre sans forcer cette répartition."],
  ["JACKPOT","J7","Triple choix","Trois cartes cachées : distribue 7, distribue 4, ou rien. Choisis-en une.","Mystère 3 choix (existant)","OUI","NON","",""],
  ["JACKPOT","J8","Roi de la roulette","Choisis : distribuer 5 gorgées sûres, ou défier un joueur en Duel Royal. Si tu gagnes, distribue 9 ; si tu perds, bois 4.","Choix + cible + mini-jeu duel (existant)","OUI","NON","","Ancienne version tirait 2 duellistes parmi les autres joueurs (le joueur actif ne participait pas forcément) ; la version Excel v2 fait explicitement du joueur actif un des deux duellistes — corrigé en conséquence."],
  ["JACKPOT","J9","Le Patron","Distribue 8 gorgées comme tu veux, avec un maximum de 3 par personne.","Distribution libre (texte)","OUI","NON","","Plafond de 3/personne déclaratif, non contrôlé par le moteur (comme D12)."],
  ["JACKPOT","J10","Hold-up collectif","Tous les autres joueurs boivent 1 gorgée. Puis distribue 3 gorgées supplémentaires comme tu veux.","Narration + distribution libre (NOUVEAU)","NON","NON","",""],
  ["JACKPOT","J11","Couronnement","Choisis un co-roi ou une co-reine. Vous distribuez chacun 4 gorgées, sans pouvoir vous cibler l'un l'autre.","Cible unique (NOUVEAU)","NON","NON","","L'interdiction de se cibler mutuellement est déclarative, non contrôlée par le moteur."],
  ["JACKPOT","J12","Carte blanche","Distribue 4 gorgées puis invente une règle temporaire simple jusqu'à ton prochain tour, dans l'esprit de la catégorie REGLE.","Distribution + règle inventée (NOUVEAU)","NON","NON","","IMPORTANT : la règle réellement inventée par le joueur est décidée à l'oral ; l'app stocke un texte générique (« Règle inventée par X ») dans la bannière, pas le contenu réel de la règle inventée."],
];

const RULES_HEADER = [
  "Catégorie","ID","Titre","Description","Type de mécanique",
  "Mécanique déjà existante (OUI/NON)","Besoin banque de contenu (OUI/NON)",
  "Banque associée","Commentaire technique",
];

// ---------------------------------------------------------------------------
// 2) CONTENT BANK SHEETS
// ---------------------------------------------------------------------------

function intensityFor(text, fallback) {
  return intensityMap[text] ?? fallback;
}

// -- Estimation questions (numeric) --
const estimationRows = banks.ESTIMATION_QUESTIONS.map((q) => ({
  ID: q.id,
  Question: q.question,
  "Réponse numérique": q.answer,
  Unité: q.unit ?? "",
  "Tolérance éventuelle": "Non définie (le mini-jeu classe par proximité, pas de seuil fixe)",
  "Catégorie / thème": "Culture générale / mesures",
  "Difficulté éventuelle": q.answer > 300 ? "Difficile" : q.answer > 50 ? "Moyenne" : "Facile",
  "Source / remarque": "Utilisée par DL6 (Estimation éclair, duel) et T12 (Estimation collective, groupe)",
}));

// -- Confession questions (personal) --
const confessionThemes = [
  "Couple", "Sexualité", "Soirée", "Substances", "Argent", "Travail",
  "Rencontres", "Fidélité", "Honnêteté", "Argent", "Relations sociales", "Vie privée",
];
const confessionRows = banks.CONFESSION_QUESTIONS.map((text, i) => ({
  ID: `cf${i + 1}`,
  Question: text,
  Intensité: intensityFor(text, "Épicé"),
  Thème: confessionThemes[i] ?? "Personnel",
  "Restriction éventuelle": text.includes("drogue") ? "Public averti / sujets sensibles" : "",
  "Utilisée par": "S9 (Confession express) et C10 (Vérité ou pénalité)",
}));

// -- Verdict statements (le tribunal) --
const verdictThemes = [
  "Caractère", "Honnêteté", "Fair-play", "Réseaux sociaux", "Fiabilité",
  "Politesse sociale", "Jalousie", "Sentiments", "Habitudes", "Alcool",
  "Vie privée", "Argent",
];
const verdictIntensities = [
  "Personnel","Personnel","Léger","Épicé","Léger","Léger","Personnel","Épicé","Léger","Soirée","Épicé","Personnel",
];
const verdictRows = banks.VERDICT_STATEMENTS.map((text, i) => ({
  ID: `vd${i + 1}`,
  Affirmation: text,
  Intensité: verdictIntensities[i],
  Thème: verdictThemes[i],
  "Restriction éventuelle": "",
  "Utilisée par": "S10 (Le tribunal)",
}));

// -- Never have I ever --
const neverThemes = [
  "Sexualité","Sexualité","Sexualité","Travail","Travail","Substances",
  "Couple","Alcool","Argent","Vie privée","Travail","Rencontres",
];
const neverRows = banks.NEVER_HAVE_I_EVER.map((text, i) => ({
  ID: `nhe${i + 1}`,
  Affirmation: text,
  Intensité: intensityFor(text, "Épicé"),
  Thème: neverThemes[i],
  "Restriction éventuelle": text.includes("drogue") ? "Public averti / sujets sensibles" : "",
  "Utilisée par": "T9 (Je n'ai jamais express)",
}));

// -- Extreme questions (Les extrêmes) --
const extremeThemes = [
  "Sexualité","Sexualité","Sexualité","Couple","Couple","Couple","Alcool","Alcool",
  "Alcool","Argent","Substances","Substances","Argent","Travail","Travail","Travail",
  "Travail","Argent","Sexualité","Rencontres",
];
const extremeRows = banks.EXTREME_QUESTIONS.map((text, i) => ({
  ID: `xq${i + 1}`,
  Question: text,
  Intensité: intensityFor(text, "Épicé"),
  Thème: extremeThemes[i],
  "Restriction éventuelle": text.includes("substances") || text.includes("drogue") ? "Public averti / sujets sensibles" : "",
  "Utilisée par": "T6 (Les extrêmes)",
}));

// -- Designation prompts: light fragments + spicy full questions --
const designationLightRows = banks.DESIGNATION_PROMPTS.map((fragment, i) => ({
  ID: `dg${i + 1}`,
  "Fragment (inséré dans « Qui serait le plus susceptible de {x} ? »)": fragment,
  "Question complète générée": `Qui serait le plus susceptible de ${fragment} ?`,
  Intensité: "Léger",
  "Utilisée par": "T8 (Désignation) — pool léger",
}));
const designationSpicyRows = banks.SPICY_DESIGNATION_PROMPTS.map((text, i) => ({
  ID: `dgs${i + 1}`,
  "Question complète": text,
  Intensité: intensityFor(text, "Épicé"),
  "Utilisée par": "T8 (Désignation) — pool épicé",
}));

// -- Destiny prompts (ceux qui...) --
const destinyRows = banks.DESTINY_PROMPTS.map((text, i) => ({
  ID: `dp${i + 1}`,
  "Qualificatif (« … boivent 1 gorgée »)": text,
  Thème: "Anecdote neutre / quotidien",
  "Utilisée par": "F8 (Destin collectif)",
}));

// -- Majority prompts (paires binaires) --
const majorityRows = banks.MAJORITY_PROMPTS.map((p) => ({
  ID: p.id,
  "Option gauche": p.left,
  "Option droite": p.right,
  Thème: "Préférence légère",
  "Utilisée par": "T2 (Majorité) et T11 (Camp contre camp)",
}));

// -- Forbidden words --
const forbiddenRows = banks.FORBIDDEN_WORDS.map((word, i) => ({
  ID: `fw${i + 1}`,
  Mot: word,
  Remarque: "Mot de remplissage courant, facile à dire par accident",
  "Utilisée par": "R6 (Mot interdit)",
}));

// -- Mime words --
const mimeRows = banks.MIME_WORDS.map((word, i) => ({
  ID: `mw${i + 1}`,
  "Mot à mimer": word,
  Difficulté: "Moyenne",
  "Utilisée par": "S12 (Mime ou sanction)",
}));

// -- Voice styles --
const voiceRows = banks.VOICE_STYLES.map((style, i) => ({
  ID: `vs${i + 1}`,
  "Manière de parler": style,
  "Utilisée par": "R9 (Voix imposée)",
}));

// -- Chain categories --
const chainRows = banks.CHAIN_CATEGORIES.map((cat, i) => ({
  ID: `cc${i + 1}`,
  Catégorie: cat,
  Difficulté: ["pays d'Europe","capitales du monde","sports olympiques"].includes(cat) ? "Difficile" : "Facile",
  "Utilisée par": "DL11 (Mot en chaîne) et T10 (Tour de table)",
}));

// ---------------------------------------------------------------------------
// 3) BUILD WORKBOOK
// ---------------------------------------------------------------------------

const wb = XLSX.utils.book_new();

function addSheet(name, rows, header, colWidths) {
  const ws = header
    ? XLSX.utils.json_to_sheet(rows, { header })
    : XLSX.utils.json_to_sheet(rows);
  if (colWidths) ws["!cols"] = colWidths.map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

// Rules sheet (array-of-arrays to control column order/header text exactly).
const rulesWs = XLSX.utils.aoa_to_sheet([RULES_HEADER, ...RULES]);
rulesWs["!cols"] = [10, 6, 24, 70, 34, 14, 14, 26, 70].map((wch) => ({ wch }));
XLSX.utils.book_append_sheet(wb, rulesWs, "Règles");

addSheet("Banque - Estimation", estimationRows, null, [6, 60, 14, 10, 45, 22, 14, 55]);
addSheet("Banque - Confessions", confessionRows, null, [6, 60, 12, 18, 30, 45]);
addSheet("Banque - Tribunal", verdictRows, null, [6, 55, 12, 20, 25, 25]);
addSheet("Banque - Je n'ai jamais", neverRows, null, [6, 60, 12, 15, 30, 30]);
addSheet("Banque - Extrêmes", extremeRows, null, [6, 55, 12, 15, 30, 25]);
addSheet("Banque - Désignation légère", designationLightRows, null, [6, 55, 55, 10, 30]);
addSheet("Banque - Désignation épicée", designationSpicyRows, null, [6, 60, 12, 30]);
addSheet("Banque - Destin collectif", destinyRows, null, [6, 55, 25, 25]);
addSheet("Banque - Majorité", majorityRows, null, [6, 25, 25, 20, 35]);
addSheet("Banque - Mots interdits", forbiddenRows, null, [6, 15, 45, 25]);
addSheet("Banque - Mime", mimeRows, null, [6, 30, 12, 30]);
addSheet("Banque - Voix imposée", voiceRows, null, [6, 35, 30]);
addSheet("Banque - Catégories chaîne", chainRows, null, [6, 35, 12, 40]);

// Summary sheet
const bankSummary = [
  ["Banque", "Fichier source", "Nb entrées", "Règles utilisatrices"],
  ["Estimation", "estimation-questions.ts", banks.ESTIMATION_QUESTIONS.length, "DL6, T12"],
  ["Confessions", "confession-questions.ts", banks.CONFESSION_QUESTIONS.length, "S9, C10"],
  ["Tribunal", "verdict-statements.ts", banks.VERDICT_STATEMENTS.length, "S10"],
  ["Je n'ai jamais", "never-have-i-ever.ts", banks.NEVER_HAVE_I_EVER.length, "T9"],
  ["Extrêmes", "extreme-questions.ts", banks.EXTREME_QUESTIONS.length, "T6"],
  ["Désignation légère", "designation-prompts.ts", banks.DESIGNATION_PROMPTS.length, "T8 (pool léger)"],
  ["Désignation épicée", "spicy-designation-prompts.ts", banks.SPICY_DESIGNATION_PROMPTS.length, "T8 (pool épicé)"],
  ["Destin collectif", "destiny-prompts.ts", banks.DESTINY_PROMPTS.length, "F8"],
  ["Majorité", "majority-prompts.ts", banks.MAJORITY_PROMPTS.length, "T2, T11"],
  ["Mots interdits", "forbidden-words.ts", banks.FORBIDDEN_WORDS.length, "R6"],
  ["Mime", "mime-words.ts", banks.MIME_WORDS.length, "S12"],
  ["Voix imposée", "voice-styles.ts", banks.VOICE_STYLES.length, "R9"],
  ["Catégories chaîne", "chain-categories.ts", banks.CHAIN_CATEGORIES.length, "DL11, T10"],
];
const totalEntries = bankSummary.slice(1).reduce((sum, row) => sum + row[2], 0);
bankSummary.push(["TOTAL", "", totalEntries, "13 banques"]);
const summaryWs = XLSX.utils.aoa_to_sheet(bankSummary);
summaryWs["!cols"] = [24, 30, 12, 40].map((wch) => ({ wch }));
XLSX.utils.book_append_sheet(wb, summaryWs, "Résumé banques");

XLSX.writeFile(wb, "Roulette_du_Chaos_Revue_Technique.xlsx");
console.log("OK — Roulette_du_Chaos_Revue_Technique.xlsx généré.");
console.log("Règles :", RULES.length, "(attendu 96)");
console.log("Total entrées de contenu :", totalEntries);
