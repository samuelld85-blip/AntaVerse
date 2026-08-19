// Bank for the "Estimation éclair" mini-game (DL6) and T12 "Estimation collective".
// Casual numerical questions anyone can take a guess at — no specialist trivia.

export interface EstimationQuestion {
  id: string;
  question: string;
  answer: number;
  unit?: string;
}

export const ESTIMATION_QUESTIONS: readonly EstimationQuestion[] = [
  { id: "eq1", question: "Quelle est la hauteur de la tour Eiffel, antenne comprise ?", answer: 330, unit: "m" },
  { id: "eq2", question: "Quelle est la distance moyenne entre la Terre et la Lune ?", answer: 384400, unit: "km" },
  { id: "eq3", question: "Quelle est la circonférence de la Terre à l'équateur ?", answer: 40075, unit: "km" },
  { id: "eq4", question: "À quelle altitude culmine l'Everest ?", answer: 8849, unit: "m" },
  { id: "eq5", question: "Quelle est la profondeur approximative du point le plus profond de l'océan ?", answer: 10900, unit: "m" },
  { id: "eq6", question: "À quelle vitesse voyage le son dans l'air à température ambiante ?", answer: 343, unit: "m/s" },
  { id: "eq7", question: "À quelle vitesse voyage la lumière dans le vide ?", answer: 299792, unit: "km/s" },
  { id: "eq8", question: "Quelle est la longueur officielle d'un marathon ?", answer: 42.195, unit: "km" },
  { id: "eq9", question: "Quelle est la hauteur d'un panier de basket ?", answer: 3.05, unit: "m" },
  { id: "eq10", question: "Combien mesure une piscine olympique en longueur ?", answer: 50, unit: "m" },
  { id: "eq11", question: "Quel est le record du monde masculin du 100 m de Usain Bolt ?", answer: 9.58, unit: "s" },
  { id: "eq12", question: "À quelle vitesse environ roule un TGV en service commercial à grande vitesse ?", answer: 320, unit: "km/h" },
  { id: "eq13", question: "À quelle vitesse de croisière vole généralement un avion de ligne ?", answer: 900, unit: "km/h" },
  { id: "eq14", question: "Combien de litres contient un fût de bière standard de grande taille ?", answer: 50, unit: "L" },
  { id: "eq15", question: "Combien de millilitres contient une bouteille de vin standard ?", answer: 750, unit: "mL" },
  { id: "eq16", question: "Combien de centilitres contient une bouteille de spiritueux standard en France ?", answer: 70, unit: "cL" },
  { id: "eq17", question: "Combien de calories environ contient une bouteille de vin rouge de 75 cL ?", answer: 625, unit: "kcal" },
  { id: "eq18", question: "Combien de calories environ apporte une bouteille de vodka de 70 cL à 40 % ?", answer: 1550, unit: "kcal" },
  { id: "eq19", question: "Combien de calories environ contient une bière de 33 cL à 5 % ?", answer: 140, unit: "kcal" },
  { id: "eq20", question: "Combien de litres de sang contient approximativement le corps d'un adulte ?", answer: 5, unit: "L" },
  { id: "eq21", question: "Combien d'os possède généralement un adulte ?", answer: 206 },
  { id: "eq22", question: "Combien de fois environ le cœur bat-il en une journée ?", answer: 100000, unit: "battements" },
  { id: "eq23", question: "Quelle proportion du corps humain adulte est constituée d'eau en moyenne ?", answer: 60, unit: "%" },
  { id: "eq24", question: "Combien de dents possède normalement un adulte avec ses dents de sagesse ?", answer: 32 },
  { id: "eq25", question: "Combien de temps en moyenne dure la pénétration lors d'un rapport sexuel selon une étude souvent citée ?", answer: 5.4, unit: "min" },
  { id: "eq26", question: "Combien de temps une personne dormant 8 h par nuit passe-t-elle à dormir sur 80 ans ?", answer: 26.7, unit: "ans" },
  { id: "eq27", question: "Combien de battements un cœur effectue-t-il environ sur 80 ans à 70 bpm ?", answer: 2940000000, unit: "battements" },
  { id: "eq28", question: "Combien de secondes y a-t-il dans une semaine ?", answer: 604800, unit: "s" },
  { id: "eq29", question: "Combien de mètres de papier toilette représente approximativement un rouleau standard ?", answer: 20, unit: "m" },
  { id: "eq30", question: "Combien pèse approximativement un éléphant d'Afrique mâle adulte ?", answer: 6000, unit: "kg" },
  { id: "eq31", question: "Quelle longueur maximale peut atteindre une baleine bleue adulte ?", answer: 30, unit: "m" },
  { id: "eq32", question: "À quelle vitesse maximale approximative peut courir un guépard ?", answer: 110, unit: "km/h" },
  { id: "eq33", question: "Quelle hauteur peut atteindre une girafe adulte ?", answer: 5.5, unit: "m" },
  { id: "eq34", question: "Combien pèse approximativement un T-Rex adulte ?", answer: 8000, unit: "kg" },
  { id: "eq35", question: "Quelle longueur pouvait atteindre un T-Rex adulte ?", answer: 12, unit: "m" },
  { id: "eq36", question: "Combien de litres contient une baignoire domestique remplie à niveau confortable ?", answer: 150, unit: "L" },
  { id: "eq37", question: "Combien pèse approximativement un litre d'eau ?", answer: 1, unit: "kg" },
  { id: "eq38", question: "Quelle est la hauteur approximative d'un étage d'immeuble standard ?", answer: 3, unit: "m" },
  { id: "eq39", question: "Combien de feuilles de papier standard faut-il empiler pour atteindre environ 1 cm ?", answer: 100, unit: "feuilles" },
  { id: "eq40", question: "Combien mesure environ une figurine LEGO classique ?", answer: 4, unit: "cm" },
  { id: "eq41", question: "Combien de litres d'eau une chasse d'eau moderne consomme-t-elle généralement en grand débit ?", answer: 6, unit: "L" },
  { id: "eq42", question: "Combien de kilomètres parcourt la lumière en une seconde ?", answer: 299792, unit: "km" },
  { id: "eq43", question: "Combien de minutes met la lumière du Soleil pour atteindre la Terre ?", answer: 8.3, unit: "min" },
  { id: "eq44", question: "Quelle température atteint approximativement la surface du Soleil ?", answer: 5500, unit: "°C" },
  { id: "eq45", question: "Combien de kilomètres de diamètre mesure la Terre ?", answer: 12742, unit: "km" },
  { id: "eq46", question: "Combien de mètres mesure un terrain de football international typique en longueur ?", answer: 105, unit: "m" },
  { id: "eq47", question: "Combien pèse un ballon de football réglementaire environ ?", answer: 430, unit: "g" },
  { id: "eq48", question: "Combien de tours de piste de 400 m faut-il faire pour courir 10 km ?", answer: 25, unit: "tours" },
  { id: "eq49", question: "À combien de km/h correspond une allure de 5 min/km ?", answer: 12, unit: "km/h" },
  { id: "eq50", question: "Combien de cafés espresso correspond approximativement à 400 mg de caféine si un espresso contient 60 mg ?", answer: 6.7, unit: "expressos" },
] as const;
