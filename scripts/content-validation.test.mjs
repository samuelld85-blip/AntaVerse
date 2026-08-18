import { describe, expect, it } from "vitest";
import { loadContentLibrary } from "./content-loader.mjs";
import { validateContentLibrary } from "./content-validation.mjs";

const library = await loadContentLibrary();

describe("politique éditoriale de la bibliothèque", () => {
  it("accepte une banque jouable avec au moins 15 fiches et 5 questions par niveau et par thème", () => {
    const result = validateContentLibrary(library);
    expect(result.errors).toEqual([]);
    const published = library.questions.filter((question) => question.status === "published");
    expect(published.length).toBeGreaterThanOrEqual(360);
    for (const theme of library.themes) {
      const themeQuestions = published.filter((question) => question.themeId === theme.id);
      expect(themeQuestions.length).toBeGreaterThanOrEqual(15);
      for (const level of [1, 2, 3]) {
        expect(
          themeQuestions.filter((question) => question.difficultyLevel === level).length,
        ).toBeGreaterThanOrEqual(5);
      }
    }
  }, 30_000);

  it("refuse une difficulté absente, invalide ou incohérente avec son libellé", () => {
    const source = publishedFixture();
    const missing = structuredClone(source);
    delete missing.difficultyLevel;
    const unsupported = { ...structuredClone(source), difficultyLevel: 4 };
    const mismatch = { ...structuredClone(source), difficultyLabel: "Difficile" };

    expect(errorsFor(missing).some((error) => error.includes("difficultyLevel"))).toBe(true);
    expect(errorsFor(unsupported).some((error) => error.includes("difficultyLevel"))).toBe(true);
    expect(errorsFor(mismatch).some((error) => error.includes("difficultyLabel"))).toBe(true);
  });

  it("refuse une publication sans source ou preuve au niveau d’une réponse", () => {
    const source = {
      id: "test-source",
      title: "Source de test",
      publisher: "Tests",
      url: "https://example.com/test",
      accessedAt: "2026-08-17T00:00:00.000Z",
      isPrimarySource: false,
    };
    const documented = structuredClone(publishedFixture());
    documented.validationMode = "documentary";
    documented.sources = [source];
    for (const answer of documented.answers) answer.sources = [source];
    const withoutQuestionSource = { ...structuredClone(documented), sources: [] };
    const withoutAnswerSource = structuredClone(documented);
    withoutAnswerSource.answers[0].sources = [];

    expect(errorsFor(withoutQuestionSource).some((error) => error.includes("sources"))).toBe(true);
    expect(
      errorsFor(withoutAnswerSource).some((error) => error.includes("answers.0.sources")),
    ).toBe(true);
  });

  it("autorise un panel éditorial publié sans source documentaire", () => {
    const panel = structuredClone(
      library.questions.find((candidate) => candidate.validationMode === "editorial_panel"),
    );
    if (!panel) throw new Error("Aucun panel éditorial disponible pour le test");
    panel.sources = [];
    for (const answer of panel.answers) answer.sources = [];

    expect(errorsFor(panel)).toEqual([]);
  });

  it("refuse les métadonnées temporelles, références et empreintes invalides", () => {
    const timeSensitive = {
      ...structuredClone(publishedFixture()),
      timeSensitive: true,
      referenceDate: undefined,
      recommendedReviewAt: undefined,
    };
    const unknownTheme = { ...structuredClone(publishedFixture()), themeId: "unknown-theme" };
    const invalidFingerprint = {
      ...structuredClone(publishedFixture()),
      answerSetFingerprint: "0".repeat(64),
    };

    expect(errorsFor(timeSensitive).some((error) => error.includes("referenceDate"))).toBe(true);
    expect(errorsFor(timeSensitive).some((error) => error.includes("recommendedReviewAt"))).toBe(
      true,
    );
    expect(errorsFor(unknownTheme).some((error) => error.includes("thème inconnu"))).toBe(true);
    expect(
      errorsFor(invalidFingerprint).some((error) => error.includes("answerSetFingerprint")),
    ).toBe(true);
  });

  it("refuse une collision du même jeu de neuf réponses sans justification", () => {
    const source = structuredClone(publishedFixture());
    delete source.duplicateJustification;
    const duplicate = {
      ...structuredClone(source),
      id: `${source.id}-duplicate-test`,
      slug: `${source.slug}-duplicate-test`,
    };
    const result = validateContentLibrary(
      { themes: library.themes, questions: [source, duplicate] },
      { strictQuotas: false },
    );
    expect(result.errors.some((error) => error.includes("Empreinte de réponses dupliquée"))).toBe(
      true,
    );
  });
});

function publishedFixture() {
  const question = library.questions.find((candidate) => candidate.status === "published");
  if (!question) throw new Error("Aucune question publiée pour les tests");
  return question;
}

function errorsFor(question) {
  return validateContentLibrary(
    { themes: library.themes, questions: [question] },
    { strictQuotas: false },
  ).errors;
}
