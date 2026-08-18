// Small dictionary for the handful of strings that are shared across
// components (not a real i18n layer — the app is French-only, and every
// other screen just writes its copy directly in JSX, like the other games do).
export const FR = {
  resumeGame: "Reprendre la partie",
  abandonGame: "Abandonner la partie",
  errors: {
    load: "Impossible de récupérer la partie enregistrée.",
    save: "La partie n’a pas pu être enregistrée sur cet appareil.",
  },
} as const;
