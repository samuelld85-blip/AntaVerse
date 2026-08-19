// Bank for T2 "Majorité" and T11 "Camp contre camp" — binary preference
// questions the group votes on physically (point left/right). The app just
// displays the question and records which side lost.

export interface MajorityPrompt {
  id: string;
  left: string;
  right: string;
}

export const MAJORITY_PROMPTS: readonly MajorityPrompt[] = [
  { id: "mp1", left: "Mer", right: "Montagne" },
  { id: "mp2", left: "Chien", right: "Chat" },
  { id: "mp3", left: "Été", right: "Hiver" },
  { id: "mp4", left: "Film", right: "Série" },
  { id: "mp5", left: "Sucré", right: "Salé" },
  { id: "mp6", left: "Bière", right: "Vin" },
  { id: "mp7", left: "Bar", right: "Boîte" },
  { id: "mp8", left: "Soirée prévue", right: "Soirée improvisée" },
  { id: "mp9", left: "Rentrer tôt", right: "Faire l'after" },
  { id: "mp10", left: "Cocktail", right: "Shot" },
  { id: "mp11", left: "Apéro à la maison", right: "Apéro en terrasse" },
  { id: "mp12", left: "Uber/VTC", right: "Métro de nuit" },
  { id: "mp13", left: "Amour", right: "Argent" },
  { id: "mp14", left: "Plan cul", right: "Relation sérieuse" },
  { id: "mp15", left: "Premier date au bar", right: "Premier date au resto" },
  { id: "mp16", left: "Ghoster", right: "Dire franchement que ça ne colle pas" },
  { id: "mp17", left: "Retourner avec son ex", right: "Rester célibataire un an" },
  { id: "mp18", left: "Être trompé", right: "Tromper puis devoir l'avouer" },
  { id: "mp19", left: "Voir tous les messages de son partenaire", right: "Lui montrer tous les siens" },
  { id: "mp20", left: "Sexe incroyable avec quelqu'un d'insupportable", right: "Sexe moyen avec quelqu'un de parfait" },
  { id: "mp21", left: "Plan à trois", right: "Jamais de plan à trois" },
  { id: "mp22", left: "Coucher avec un collègue", right: "Coucher avec un ex" },
  { id: "mp23", left: "Carrière parfaite", right: "Couple parfait" },
  { id: "mp24", left: "10 000 € maintenant", right: "100 000 € dans dix ans" },
  { id: "mp25", left: "Être riche et inconnu", right: "Être célèbre avec un salaire moyen" },
  { id: "mp26", left: "Maison de rêve loin de tout", right: "Petit appart au cœur de Paris" },
  { id: "mp27", left: "Plus jamais boire d'alcool", right: "Plus jamais boire de café" },
  { id: "mp28", left: "Plus jamais réseaux sociaux", right: "Plus jamais séries/streaming" },
  { id: "mp29", left: "Savoir exactement quand tu vas mourir", right: "Savoir exactement comment tu vas mourir" },
  { id: "mp30", left: "Lire dans les pensées", right: "Être invisible" },
  { id: "mp31", left: "Pouvoir revenir 10 ans en arrière", right: "Recevoir 1 million d'euros maintenant" },
  { id: "mp32", left: "Ne jamais avoir de gueule de bois", right: "Ne jamais avoir besoin de dormir" },
  { id: "mp33", left: "Toujours dire la vérité", right: "Entendre toujours la vérité" },
  { id: "mp34", left: "Être toujours 30 minutes en avance", right: "Être toujours 10 minutes en retard" },
  { id: "mp35", left: "Avoir un téléphone à 1 % toute la journée", right: "Ne plus avoir internet pendant 24 h" },
  { id: "mp36", left: "Supprimer toutes tes photos", right: "Supprimer tous tes messages" },
  { id: "mp37", left: "Montrer ton historique de recherche", right: "Montrer tes DM" },
  { id: "mp38", left: "Un an sans sexe", right: "Un an sans alcool" },
  { id: "mp39", left: "Être célibataire mais très riche", right: "Être en couple heureux mais fauché" },
  { id: "mp40", left: "Sortir avec l'ex d'un ami", right: "Laisser un ami sortir avec ton ex" },
  { id: "mp41", left: "Dire à ton crush ce que tu penses", right: "Ne jamais savoir s'il était intéressé" },
  { id: "mp42", left: "Avoir un date parfait mais zéro attirance", right: "Forte attirance mais conversation catastrophique" },
  { id: "mp43", left: "Faire la fête tous les week-ends", right: "Voyager tous les deux mois" },
  { id: "mp44", left: "Travailler 4 jours/semaine moins payé", right: "Travailler 5 jours/semaine mieux payé" },
  { id: "mp45", left: "Pouvoir effacer une soirée honteuse", right: "Pouvoir revivre ta meilleure soirée" },
] as const;
