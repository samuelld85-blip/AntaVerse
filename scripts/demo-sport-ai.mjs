// Manual, paid demonstration only. Never invoked by builds or automated tests.
// npx deno run --unstable-sloppy-imports --config supabase/functions/deno.json
//   --env-file=supabase/functions/.env --allow-env --allow-read
//   --allow-write=docs/examples --allow-net=openrouter.ai scripts/demo-sport-ai.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { createHandler, MODEL } from "../supabase/functions/sport-assistant/handler.ts";
import { buildAssistantContext } from "../src/sport/ai/context.ts";
import { createSession, completeSet } from "../src/sport/model.ts";
import { equipmentLabels, exercises } from "../src/sport/catalog.ts";
import { getSessionVolume } from "../src/sport/stats.ts";
import { draftToTemplate } from "../src/sport/ai/draft.ts";

if (!process.env.OPENROUTER_API_KEY) throw new Error("Secret serveur OpenRouter absent.");
const fixture = JSON.parse(
  await readFile(new URL("./fixtures/sport-ai-beginner.json", import.meta.url), "utf8"),
);
const history = fixture.map((item, index) => {
  const config = (exerciseId, equipment, numbers, restSeconds) => ({
    exerciseId,
    equipment,
    loadKg: numbers[0],
    reps: numbers[1],
    sets: 3,
    restSeconds,
  });
  const session = createSession(
    "full",
    [
      config("bench-press", "barbell", item.bench, 120),
      config("row", "dumbbell", item.row, 90),
      config("leg-press", "machine", item.press, 120),
    ],
    `Séance fictive ${index + 1}`,
  );
  session.id = item.id;
  session.startedAt = `${item.date}T09:00:00.000Z`;
  session.endedAt = `${item.date}T09:40:00.000Z`;
  session.exercises = session.exercises.map((initial) => {
    let entry = initial;
    for (let set = 0; set < 3; set++) entry = completeSet(entry, session.endedAt);
    return entry;
  });
  return session;
});
const now = new Date("2026-10-19T12:00:00.000Z");
const context = buildAssistantContext(history, null, now);
// Real provider, synthetic fixture only; no account, quota RPC or hosted DB writes.
const handler = createHandler({
  env: (name) => process.env[name],
  authenticate: async () => "synthetic-demonstration",
  consumeQuota: async () => true,
  fetch: globalThis.fetch,
});
const demonstrations = [];
async function ask(title, mode, prompt, options = {}) {
  const request = {
    mode,
    messages: [...(options.messages ?? []), { role: "user", content: prompt }],
    context: options.context ?? context,
    draft: options.draft ?? null,
  };
  const response = await handler(
    new Request("http://localhost/sport-assistant", {
      method: "POST",
      headers: {
        authorization: "Bearer synthetic-demonstration",
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
    }),
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      `Démonstration ${mode} impossible (${response.status}, ${result.error?.code ?? "erreur"}).`,
    );
  demonstrations.push({ title, request, response: result });
  console.log(`${mode} : réponse structurée vérifiée.`);
  return result;
}
const preparePrompt =
  "Je débute. Prépare-moi un full body simple de 30 minutes avec développé couché barre, rowing haltères et presse à cuisses. Tu peux reprendre les charges et répétitions de ma dernière séance : je les confirme pour cette proposition.";
const prepared = await ask("Préparer ma séance", "prepare", preparePrompt);
await ask(
  "Ajuster la proposition en conversation",
  "prepare",
  "La presse est occupée : remplace uniquement cet exercice par un squat au poids du corps, 2 séries de 10, 90 secondes de repos, sans lest (0 kg). Je confirme ces réglages. Conserve les deux autres exercices. Réponse brève.",
  {
    messages: [
      { role: "user", content: preparePrompt },
      { role: "assistant", content: prepared.message },
    ],
    draft: prepared.draft,
  },
);
await ask(
  "Importer un programme depuis un texte",
  "import",
  "Importe ce programme débutant sans ajouter d'exercice : développé couché barre 3 séries de 8 à 20 kg barre comprise, repos 120 secondes ; rowing haltères 3 séries de 10 à 8 kg par haltère, repos 90 secondes. Tous ces réglages sont confirmés. Réponds brièvement.",
  { context: buildAssistantContext([], null, now) },
);
await ask(
  "Faire le point après la cinquième séance",
  "review",
  "Milo, qu’est-ce que tu penses de ma dernière séance ? Qu’est-ce que je devrais garder en tête pour la prochaine ?",
  { context: buildAssistantContext(history, "demo-5", now) },
);
const progressPrompt =
  "Je débute et j’ai fait ces cinq séances. Est-ce que je suis sur la bonne voie ? Qu’est-ce que tu me conseilles pour la suite ?";
const progress = await ask("Comprendre ma progression", "progress", progressPrompt);
const nextSessionPrompt =
  "D’accord, prépare ma prochaine séance avec les mêmes trois exercices que la dernière fois. Je confirme la reprise des charges et répétitions de cette dernière séance pour le brouillon. Garde les temps de repos habituels.";
const nextSession = await ask(
  "Passer du bilan à une séance utilisable",
  "progress",
  nextSessionPrompt,
  {
    messages: [
      { role: "user", content: progressPrompt },
      { role: "assistant", content: progress.message },
    ],
    draft: progress.draft,
  },
);
const completed = await ask(
  "Préciser les repos puis démarrer dans le carnet",
  "progress",
  "Mes repos : 120 secondes au développé couché, 90 secondes au rowing et 120 secondes à la presse. Je confirme. Complète la séance avec ces temps, sans rien changer d’autre.",
  {
    messages: [
      { role: "user", content: progressPrompt },
      { role: "assistant", content: progress.message },
      { role: "user", content: nextSessionPrompt },
      { role: "assistant", content: nextSession.message },
    ],
    draft: nextSession.draft,
  },
);
if (!completed.draft || completed.draft.questions.length || !draftToTemplate(completed.draft))
  throw new Error("Le dernier brouillon ne peut pas être utilisé dans le carnet.");

const moneyless = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);
const lines = [
  "# Assistant Sport — exemples réels sur cinq séances fictives",
  "",
  `Modèle : \`${MODEL}\`, effort moyen. Réponses obtenues le ${new Date().toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })} par le même handler que l’application, auprès d’OpenRouter.`,
  "",
  "Toutes les données ci-dessous sont inventées. Aucun carnet personnel, compte connecté ou service de sauvegarde n’a été utilisé. Les contrôles d’authentification et de quota sont simulés pour cette démonstration ; les réponses du modèle sont réelles et validées par les schémas de l’application.",
  "",
  "## Le carnet débutant",
  "",
  "Chaque séance est un full body de trois exercices, avec trois séries par exercice. Développé couché : charge totale barre comprise, repos 120 s ; rowing : charge **par haltère**, repos 90 s ; presse : charge machine, repos 120 s. Ces charges illustrent un historique, sans constituer une prescription.",
  "",
  "| Séance | Date | Développé couché | Rowing haltères | Presse | Tonnage du carnet |",
  "| --- | --- | --- | --- | --- | --- |",
  ...fixture.map(
    (item, index) =>
      `| ${index + 1} | ${item.date} | 3 × ${item.bench[1]} à ${item.bench[0]} kg | 3 × ${item.row[1]} à ${item.row[0]} kg/haltère | 3 × ${item.press[1]} à ${item.press[0]} kg | ${moneyless(getSessionVolume(history[index]))} kg |`,
  ),
  "",
  `Bilan déterministe : **${context.summary.sessions} séances, ${context.summary.sets} séries, ${moneyless(context.summary.volumeKg)} kg** selon la convention de tonnage existante (pas de doublement de la charge des haltères).`,
  "",
  "## Le parcours dans l’application",
  "",
  "Accueil ou Nouvelle séance → Préparer ma séance / Depuis un texte → choix des données jointes et envoi → conversation + brouillon modifiable → Démarrer cette séance ou Enregistrer en favori. Après la séance, son détail propose Faire le point ; les statistiques proposent Comprendre ma progression. Ouvrir l’assistant ne déclenche aucun appel.",
  "",
];
const dateForId = (id) => fixture.find((item) => item.id === id)?.date ?? id;
for (const demo of demonstrations) {
  lines.push(
    `## ${demo.title}`,
    "",
    "**Demande utilisateur**",
    "",
    `> ${demo.request.messages.at(-1).content}`,
    "",
    "**Réponse réelle**",
    "",
    demo.response.message,
    "",
  );
  for (const observation of demo.response.observations)
    lines.push(
      `- ${observation.text}${observation.sessionIds.length ? ` — Sources : ${observation.sessionIds.map(dateForId).join(", ")}.` : ""}`,
      "",
    );
  const draft = demo.response.draft;
  if (draft) {
    lines.push(
      `**Brouillon affiché : ${draft.name}**`,
      "",
      "| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    const row = (exercise, prefix = "") =>
      `| ${prefix}${exercises.find((item) => item.id === exercise.exerciseId)?.name ?? exercise.exerciseId} | ${exercise.equipment ? equipmentLabels[exercise.equipment] : "À préciser"} | ${exercise.sets ?? "À préciser"} | ${exercise.reps ?? "Non renseignées"} | ${exercise.loadKg ?? "À préciser"} | ${exercise.restSeconds ?? "À préciser"} |`;
    for (const exercise of draft.exercises) {
      lines.push(row(exercise));
      if (exercise.superset) lines.push(row(exercise.superset, "Superset : "));
    }
    lines.push("");
    for (const question of draft.questions) lines.push(`- À préciser : ${question}`, "");
    lines.push(
      "L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.",
      "",
    );
  }
}
await mkdir(new URL("../docs/examples/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../docs/examples/sport-ai-beginner.md", import.meta.url),
  `${lines.join("\n").trimEnd()}\n`,
  "utf8",
);
await writeFile(
  new URL("../docs/examples/sport-ai-beginner.json", import.meta.url),
  `${JSON.stringify({ model: MODEL, reasoning: "medium", history, demonstrations }, null, 2)}\n`,
  "utf8",
);
console.log(
  "Exemples enregistrés dans docs/examples/sport-ai-beginner.md et .json (données fictives uniquement).",
);
