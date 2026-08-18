// Bank for T2 "Majorité" — binary preference questions the group votes on
// physically (point left/right). The app just displays the question and
// records which side lost.

export interface MajorityPrompt {
  id: string;
  left: string;
  right: string;
}

export const MAJORITY_PROMPTS: readonly MajorityPrompt[] = [
  { id: "mp1", left: "Mer", right: "Montagne" },
  { id: "mp2", left: "Chien", right: "Chat" },
  { id: "mp3", left: "Maison", right: "Appartement" },
  { id: "mp4", left: "Sucré", right: "Salé" },
  { id: "mp5", left: "Été", right: "Hiver" },
  { id: "mp6", left: "Matin", right: "Soir" },
  { id: "mp7", left: "Film", right: "Série" },
  { id: "mp8", left: "Pizza", right: "Burger" },
  { id: "mp9", left: "Plage", right: "Piscine" },
  { id: "mp10", left: "Café", right: "Thé" },
  { id: "mp11", left: "Ville", right: "Campagne" },
  { id: "mp12", left: "Livre", right: "Podcast" },
  { id: "mp13", left: "Avion", right: "Train" },
  { id: "mp14", left: "Salé", right: "Sucré" },
  { id: "mp15", left: "Foot", right: "Basket" },
  { id: "mp16", left: "Rap", right: "Rock" },
  { id: "mp17", left: "Randonnée", right: "Farniente" },
  { id: "mp18", left: "Pâtes", right: "Riz" },
  { id: "mp19", left: "Été indien", right: "Neige" },
  { id: "mp20", left: "Soirée entre amis", right: "Soirée tranquille" },
  { id: "mp21", left: "Thé glacé", right: "Soda" },
  { id: "mp22", left: "Vacances organisées", right: "Vacances improvisées" },
  { id: "mp23", left: "Petit-déjeuner salé", right: "Petit-déjeuner sucré" },
  { id: "mp24", left: "Concert", right: "Festival" },
  { id: "mp25", left: "Chaud", right: "Froid" },
  { id: "mp26", left: "Jeux de société", right: "Jeux vidéo" },
  { id: "mp27", left: "Douche", right: "Bain" },
  { id: "mp28", left: "Cuisine maison", right: "Restaurant" },
  { id: "mp29", left: "Lève-tôt", right: "Lève-tard" },
  { id: "mp30", left: "Été à la campagne", right: "Été à la ville" },
  { id: "mp31", left: "Vélo", right: "Trottinette" },
  { id: "mp32", left: "Karaoké", right: "Escape game" },
] as const;
