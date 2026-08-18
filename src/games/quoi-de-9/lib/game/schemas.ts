import { z } from "zod";
import { DIFFICULTY_LABELS, GAME_CONFIG } from "./config";
import { findSuspiciousMojibake } from "@/games/quoi-de-9/lib/text/encoding";

const safeName = z
  .string()
  .trim()
  .min(2, "2 caractères minimum")
  .max(24, "24 caractères maximum")
  .regex(/^[\p{L}\p{N} ._'’‘ʼ＇-]+$/u, "Certains caractères ne sont pas autorisés");

function comparableTeamName(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[’‘ʼ＇]/gu, "'")
    .toLocaleLowerCase("fr");
}

export const createGameSchema = z
  .object({
    teamAName: safeName,
    teamBName: safeName,
    teamAColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    teamBColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    startingTeamIndex: z.coerce.number().pipe(z.union([z.literal(0), z.literal(1)])),
    roundsPerTeam: z.coerce
      .number()
      .int()
      .min(GAME_CONFIG.minRoundsPerTeam)
      .max(GAME_CONFIG.maxRoundsPerTeam),
    turnDurationSeconds: z.coerce
      .number()
      .int()
      .min(GAME_CONFIG.minTurnDurationSeconds)
      .max(GAME_CONFIG.maxTurnDurationSeconds),
  })
  .refine((input) => comparableTeamName(input.teamAName) !== comparableTeamName(input.teamBName), {
    message: "Choisissez deux noms d’équipe différents",
    path: ["teamBName"],
  });

const answerSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  display: z.string().trim().min(1),
  normalized: z.string().trim().min(1),
  alternatives: z.array(z.string().trim().min(1)).default([]),
  displayOrder: z.number().int().min(1).max(GAME_CONFIG.answerCount),
});

export const questionImportSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    themeId: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    category: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    question: z.string().trim().min(12),
    teaser: z.string().trim().min(2).max(48),
    difficultyLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    difficultyLabel: z.enum(["Facile", "Moyen", "Difficile"]),
    coefficient: z.number().positive(),
    language: z.literal("fr").default("fr"),
    explanation: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]).default("published"),
    version: z.number().int().positive().default(1),
    createdAt: z.iso.datetime().default("2026-07-13T00:00:00.000Z"),
    updatedAt: z.iso.datetime().default("2026-07-13T00:00:00.000Z"),
    answers: z.array(answerSchema).length(GAME_CONFIG.answerCount),
  })
  .superRefine((question, context) => {
    if (!question.themeId && !question.category) {
      context.addIssue({ code: "custom", message: "Un themeId est requis", path: ["themeId"] });
    }
    const normalized = question.answers.map((answer) => answer.normalized.toLocaleLowerCase("fr"));
    if (new Set(normalized).size !== normalized.length) {
      context.addIssue({
        code: "custom",
        message: "Les neuf réponses normalisées doivent être uniques",
        path: ["answers"],
      });
    }
    const displayOrders = question.answers.map((answer) => answer.displayOrder);
    if (new Set(displayOrders).size !== GAME_CONFIG.answerCount) {
      context.addIssue({
        code: "custom",
        message: "Les ordres d’affichage doivent couvrir neuf positions uniques",
        path: ["answers"],
      });
    }
    if (question.difficultyLabel !== DIFFICULTY_LABELS[question.difficultyLevel]) {
      context.addIssue({
        code: "custom",
        message: "Le libellé de difficulté ne correspond pas au niveau numérique",
        path: ["difficultyLabel"],
      });
    }
    const expectedCoefficient = GAME_CONFIG.difficulties[question.difficultyLevel].coefficient;
    if (question.coefficient !== expectedCoefficient) {
      context.addIssue({
        code: "custom",
        message: `Le coefficient attendu est ${expectedCoefficient}`,
        path: ["coefficient"],
      });
    }
  });

export const questionCollectionSchema = z
  .array(questionImportSchema)
  .superRefine((questions, context) => {
    for (const finding of findSuspiciousMojibake(questions)) {
      context.addIssue({
        code: "custom",
        message: "Motif de mojibake suspect",
        path: finding.path,
      });
    }
    const ids = questions.map((question) => question.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Les identifiants de question doivent être uniques",
      });
    }
  });

export const themeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  icon: z.string().min(1),
  description: z.string().min(4),
});

export const themeCollectionSchema = z
  .array(themeSchema)
  .min(12)
  .superRefine((themes, context) => {
    for (const finding of findSuspiciousMojibake(themes)) {
      context.addIssue({
        code: "custom",
        message: "Motif de mojibake suspect",
        path: finding.path,
      });
    }
    const ids = themes.map((theme) => theme.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Les identifiants de thème doivent être uniques",
      });
    }
  });

export type CreateGameForm = z.infer<typeof createGameSchema>;
export type QuestionImport = z.infer<typeof questionImportSchema>;
