import { z } from "zod";
import { assertNoSuspiciousMojibake, normalizeUnicode } from "./text-encoding.mjs";

export const difficultyLabels = { 1: "Facile", 2: "Moyen", 3: "Difficile" };
export const coefficients = { 1: 1, 2: 1.5, 3: 2 };
export const difficultyLevels = [1, 2, 3];

const answerSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  display: z.string().trim().min(1),
  normalized: z.string().trim().min(1),
  alternatives: z.array(z.string().trim().min(1)),
  displayOrder: z.number().int().min(1).max(9),
});

export const questionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    themeId: z.string().regex(/^[a-z0-9-]+$/),
    question: z.string().trim().min(12),
    teaser: z.string().trim().min(2).max(48),
    difficultyLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    difficultyLabel: z.enum(["Facile", "Moyen", "Difficile"]),
    coefficient: z.number().positive(),
    language: z.literal("fr"),
    explanation: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    answers: z.array(answerSchema).length(9),
  })
  .superRefine((question, context) => {
    if (question.difficultyLabel !== difficultyLabels[question.difficultyLevel]) {
      context.addIssue({
        code: "custom",
        message: "Libellé de difficulté incohérent",
        path: ["difficultyLabel"],
      });
    }
    if (question.coefficient !== coefficients[question.difficultyLevel]) {
      context.addIssue({
        code: "custom",
        message: "Coefficient incohérent",
        path: ["coefficient"],
      });
    }
    const normalized = question.answers.map((answer) =>
      answer.normalized.normalize("NFC").toLocaleLowerCase("fr"),
    );
    if (new Set(normalized).size !== 9) {
      context.addIssue({
        code: "custom",
        message: "Les neuf réponses doivent être distinctes",
        path: ["answers"],
      });
    }
    const orders = question.answers.map((answer) => answer.displayOrder).sort((a, b) => a - b);
    if (orders.some((order, index) => order !== index + 1)) {
      context.addIssue({
        code: "custom",
        message: "displayOrder doit couvrir 1 à 9",
        path: ["answers"],
      });
    }
  });

export const questionCollectionSchema = z
  .array(questionSchema)
  .min(1)
  .superRefine((questions, context) => {
    const ids = questions.map((question) => question.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Les identifiants de question doivent être uniques",
      });
    }
  });

export const themeCollectionSchema = z.array(
  z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(2),
    icon: z.string().min(1),
    description: z.string().min(4),
  }),
);

export function validateCatalogue(questions, themes) {
  const normalizedQuestions = normalizeUnicode(questions);
  const normalizedThemes = normalizeUnicode(themes);
  assertNoSuspiciousMojibake(normalizedQuestions, "catalogue de questions");
  assertNoSuspiciousMojibake(normalizedThemes, "catalogue de thèmes");
  const parsedQuestions = questionCollectionSchema.parse(normalizedQuestions);
  const parsedThemes = themeCollectionSchema.parse(normalizedThemes);
  for (const theme of parsedThemes) {
    for (const difficultyLevel of difficultyLevels) {
      const available = parsedQuestions.some(
        (question) =>
          question.status === "published" &&
          question.themeId === theme.id &&
          question.difficultyLevel === difficultyLevel,
      );
      if (!available) {
        throw new Error(
          `Le thème ${theme.id} n’a pas de question de niveau ${difficultyLevel} publiée`,
        );
      }
    }
  }
  return parsedQuestions;
}
