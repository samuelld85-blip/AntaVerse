import { z } from "zod";
import { computeAnswerSetFingerprint } from "./content-fingerprint.mjs";
import { findSuspiciousMojibake } from "./text-encoding.mjs";

export const DIFFICULTY_LABELS = { 1: "Facile", 2: "Moyen", 3: "Difficile" };
export const DIFFICULTY_LEVELS = [1, 2, 3];
export const CONTENT_STATUSES = [
  "draft",
  "needs_review",
  "verified",
  "published",
  "rejected",
  "archived",
];

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.iso.date();
const dateTime = z.iso.datetime();
const score = z.number().min(0).max(100);

export const sourceReferenceSchema = z.object({
  id: slug,
  title: z.string().trim().min(2),
  publisher: z.string().trim().min(2),
  url: z.url().refine((url) => /^https?:\/\//u.test(url), "Une URL HTTP(S) est requise"),
  accessedAt: dateTime,
  publishedAt: date.optional(),
  isPrimarySource: z.boolean(),
  notes: z.string().trim().min(2).optional(),
});

export const quizAnswerSchema = z.object({
  id: slug,
  display: z.string().trim().min(1),
  normalized: z.string().trim().min(1),
  aliases: z.array(z.string().trim().min(1)),
  abbreviations: z.array(z.string().trim().min(1)),
  alternativeSpellings: z.array(z.string().trim().min(1)),
  accentInsensitiveVariants: z.array(z.string().trim().min(1)),
  hyphenationVariants: z.array(z.string().trim().min(1)),
  originalName: z.string().trim().min(1).optional(),
  explanation: z.string().trim().min(2).optional(),
  displayOrder: z.number().int().min(1).max(9),
  sources: z.array(sourceReferenceSchema),
  sensitivityNote: z.string().trim().min(2).optional(),
});

export const quizBombSchema = z.object({
  id: slug,
  display: z.string().trim().min(1),
  normalized: z.string().trim().min(1),
  aliases: z.array(z.string().trim().min(1)),
  abbreviations: z.array(z.string().trim().min(1)),
  alternativeSpellings: z.array(z.string().trim().min(1)),
  accentInsensitiveVariants: z.array(z.string().trim().min(1)),
  hyphenationVariants: z.array(z.string().trim().min(1)),
  explanation: z.string().trim().min(12),
});

export const quizQuestionSchema = z
  .object({
    id: slug,
    slug,
    language: z.literal("fr"),
    themeId: slug,
    subthemeIds: z.array(z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/)).min(1),
    tags: z.array(slug),
    questionText: z.string().trim().min(12),
    shortTitle: z.string().trim().min(2).max(80),
    difficultyLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    difficultyLabel: z.enum(["Facile", "Moyen", "Difficile"]),
    editorialDifficultyScore: score,
    specificityScore: score,
    popularityScore: score,
    recallDifficultyScore: score,
    answerSetHomogeneityScore: score,
    expectedAverageAnswers: z.number().min(0).max(9),
    observedAverageAnswers: z.number().min(0).max(9).optional(),
    playCount: z.number().int().nonnegative(),
    difficultyConfidence: z.enum(["low", "medium", "high"]),
    validationMode: z.enum(["documentary", "editorial_panel"]),
    answers: z.array(quizAnswerSchema).length(9),
    bomb: quizBombSchema,
    explanation: z.string().trim().min(12),
    qualificationRule: z.string().trim().min(12),
    exclusionNotes: z.string().trim().min(2).optional(),
    referenceDate: date.optional(),
    timeSensitive: z.boolean(),
    recommendedReviewAt: date.optional(),
    sources: z.array(sourceReferenceSchema),
    status: z.enum(CONTENT_STATUSES),
    reviewer: z.string().trim().min(2).optional(),
    reviewedAt: dateTime.optional(),
    rejectionReason: z.string().trim().min(4).optional(),
    duplicateJustification: z.string().trim().min(12).optional(),
    answerSetFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    version: z.number().int().positive(),
    createdAt: dateTime,
    updatedAt: dateTime,
  })
  .superRefine((question, context) => {
    if (question.difficultyLabel !== DIFFICULTY_LABELS[question.difficultyLevel]) {
      context.addIssue({
        code: "custom",
        message: "Le libellé doit être dérivé du niveau numérique",
        path: ["difficultyLabel"],
      });
    }
    if (question.timeSensitive && !question.referenceDate) {
      context.addIssue({
        code: "custom",
        message: "referenceDate est requis",
        path: ["referenceDate"],
      });
    }
    if (question.timeSensitive && !question.recommendedReviewAt) {
      context.addIssue({
        code: "custom",
        message: "recommendedReviewAt est requis",
        path: ["recommendedReviewAt"],
      });
    }
    if (["verified", "published"].includes(question.status)) {
      if (question.validationMode === "documentary" && question.sources.length === 0) {
        context.addIssue({ code: "custom", message: "Une source est requise", path: ["sources"] });
      }
      if (!question.reviewer || !question.reviewedAt) {
        context.addIssue({
          code: "custom",
          message: "Une revue éditoriale est requise",
          path: ["reviewer"],
        });
      }
      question.answers.forEach((answer, index) => {
        if (question.validationMode === "documentary" && answer.sources.length === 0) {
          context.addIssue({
            code: "custom",
            message: "Une source de preuve est requise pour chaque réponse",
            path: ["answers", index, "sources"],
          });
        }
      });
    }
    if (question.status === "rejected" && !question.rejectionReason) {
      context.addIssue({
        code: "custom",
        message: "Le motif du rejet est requis",
        path: ["rejectionReason"],
      });
    }
    const normalizedAnswers = question.answers.map((answer) => answer.normalized);
    if (new Set(normalizedAnswers).size !== 9) {
      context.addIssue({
        code: "custom",
        message: "Les réponses normalisées doivent être uniques",
        path: ["answers"],
      });
    }
    const normalizedBombValues = [
      question.bomb.normalized,
      ...question.bomb.aliases,
      ...question.bomb.abbreviations,
      ...question.bomb.alternativeSpellings,
      ...question.bomb.accentInsensitiveVariants,
      ...question.bomb.hyphenationVariants,
    ].map((value) => value.toLocaleLowerCase("fr"));
    const acceptedAnswerValues = new Set(
      question.answers
        .flatMap((answer) => [
          answer.normalized,
          ...answer.aliases,
          ...answer.abbreviations,
          ...answer.alternativeSpellings,
          ...answer.accentInsensitiveVariants,
          ...answer.hyphenationVariants,
        ])
        .map((value) => value.toLocaleLowerCase("fr")),
    );
    if (normalizedBombValues.some((value) => acceptedAnswerValues.has(value))) {
      context.addIssue({
        code: "custom",
        message: "La bombe ne peut pas être une réponse acceptée",
        path: ["bomb"],
      });
    }
    const aliases = question.answers.flatMap((answer) => [
      ...answer.aliases,
      ...answer.abbreviations,
      ...answer.alternativeSpellings,
    ]);
    if (new Set(aliases.map((value) => value.toLocaleLowerCase("fr"))).size !== aliases.length) {
      context.addIssue({
        code: "custom",
        message: "Un alias est dupliqué dans la question",
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
    const expectedFingerprint = computeAnswerSetFingerprint(question.answers);
    if (question.answerSetFingerprint !== expectedFingerprint) {
      context.addIssue({
        code: "custom",
        message: "L’empreinte de l’ensemble de réponses est incorrecte",
        path: ["answerSetFingerprint"],
      });
    }
    if (/\?\?|!!|\.\.|,,/u.test(question.questionText)) {
      context.addIssue({
        code: "custom",
        message: "Ponctuation dupliquée",
        path: ["questionText"],
      });
    }
    if (
      /\b(?:lorem ipsum|placeholder|todo|à compléter|exemple fictif)\b/iu.test(
        JSON.stringify(question),
      )
    ) {
      context.addIssue({ code: "custom", message: "Contenu provisoire interdit" });
    }
    for (const finding of findSuspiciousMojibake(question)) {
      context.addIssue({
        code: "custom",
        message: "Motif de mojibake suspect",
        path: finding.path,
      });
    }
    for (const [key, value] of Object.entries(question)) {
      if (typeof value === "string" && value !== value.normalize("NFC")) {
        context.addIssue({ code: "custom", message: "Texte non normalisé en NFC", path: [key] });
      }
    }
  });

export const subthemeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/),
  label: z.string().trim().min(2),
  description: z.string().trim().min(4),
});

export const themeSchema = z.object({
  id: slug,
  label: z.string().trim().min(2),
  description: z.string().trim().min(4),
  icon: z.string().trim().min(1),
  category: z.enum([
    "Culture générale accessible",
    "Pop culture & loisirs",
    "Vie quotidienne & société",
  ]),
  weight: z.number().int().positive(),
  subthemes: z.array(subthemeSchema).min(5),
  tags: z.array(slug).min(5),
  contentVersion: z.string().trim().min(1),
});
