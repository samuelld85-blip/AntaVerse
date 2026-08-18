// Bank for the "Estimation éclair" mini-game (DUEL). Casual numerical
// questions anyone can take a guess at — no specialist trivia.

export interface EstimationQuestion {
  id: string;
  question: string;
  answer: number;
  unit?: string;
}

export const ESTIMATION_QUESTIONS: readonly EstimationQuestion[] = [
  {
    id: "eq1",
    question: "Combien de cartes dans un jeu classique (avec les jokers) ?",
    answer: 54,
  },
  { id: "eq2", question: "Combien de minutes dans une journée ?", answer: 1440 },
  { id: "eq3", question: "Combien de touches sur un piano standard ?", answer: 88 },
  { id: "eq4", question: "Combien de kilomètres environ entre Paris et Marseille ?", answer: 660 },
  { id: "eq5", question: "Combien de secondes dans une heure ?", answer: 3600 },
  { id: "eq6", question: "Combien de cases sur un échiquier ?", answer: 64 },
  { id: "eq7", question: "Combien d'os dans le corps humain adulte ?", answer: 206 },
  { id: "eq8", question: "Combien de pays sont membres de l'Union européenne ?", answer: 27 },
  { id: "eq9", question: "Combien de dents a un adulte en moyenne ?", answer: 32 },
  { id: "eq10", question: "Combien de kilomètres fait un marathon ?", answer: 42 },
  { id: "eq11", question: "Combien de couleurs dans un arc-en-ciel classique ?", answer: 7 },
  { id: "eq12", question: "Combien de jours dans une année bissextile ?", answer: 366 },
  { id: "eq13", question: "Combien de faces a un ballon de football classique ?", answer: 32 },
  {
    id: "eq14",
    question: "Combien de minutes dure un match de football (hors prolongations) ?",
    answer: 90,
  },
  {
    id: "eq15",
    question: "Combien de kilomètres environ fait la Tour Eiffel de haut ?",
    answer: 330,
  },
  { id: "eq16", question: "Combien de litres dans une baignoire pleine en moyenne ?", answer: 150 },
  { id: "eq17", question: "Combien d'étages a la Tour Eiffel ?", answer: 3 },
  { id: "eq18", question: "Combien de pattes a une araignée ?", answer: 8 },
  { id: "eq19", question: "Combien de temps dure un cycle de sommeil en minutes ?", answer: 90 },
  {
    id: "eq20",
    question: "Combien de kilomètres environ fait le tour de la Terre à l'équateur (en milliers) ?",
    answer: 40,
  },
  {
    id: "eq21",
    question: "Combien de médailles d'or la France a-t-elle en moyenne par JO d'été ?",
    answer: 10,
  },
  {
    id: "eq22",
    question: "Combien de litres de sang un corps humain adulte contient-il environ ?",
    answer: 5,
  },
  {
    id: "eq23",
    question: "Combien de temps met la lumière du soleil pour atteindre la Terre, en minutes ?",
    answer: 8,
  },
  {
    id: "eq24",
    question: "Combien de km/h roule un TGV en vitesse de croisière environ ?",
    answer: 300,
  },
  {
    id: "eq25",
    question: "Combien de mots contient en moyenne un roman classique (en milliers) ?",
    answer: 90,
  },
  { id: "eq26", question: "Combien de bougies faut-il pour un gâteau de 100 ans ?", answer: 100 },
  { id: "eq27", question: "Combien de km sépare la Terre de la Lune (en milliers) ?", answer: 384 },
  { id: "eq28", question: "Combien de minutes dure en moyenne un épisode de série ?", answer: 45 },
  {
    id: "eq29",
    question: "Combien de temps faut-il pour faire cuire un œuf dur, en minutes ?",
    answer: 9,
  },
  { id: "eq30", question: "Combien de départements compte la France métropolitaine ?", answer: 96 },
  { id: "eq31", question: "Combien de touches a un clavier d'ordinateur classique ?", answer: 104 },
  { id: "eq32", question: "Combien de kilomètres fait Paris de diamètre environ ?", answer: 12 },
] as const;
