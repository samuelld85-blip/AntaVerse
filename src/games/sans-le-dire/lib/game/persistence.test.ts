import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { saveTeamNames, loadTeamNames, saveCurrentGame, loadCurrentGame, clearCurrentGame } from "./persistence";

describe("Sans le dire - Persistance des équipes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("charge la configuration par défaut au premier démarrage", () => {
    const names = loadTeamNames();
    expect(names).toEqual(["Les Antagonistes", "Les Sanglieeers"]);
  });

  it("persiste une configuration avec 2 équipes", () => {
    saveTeamNames(["Team A", "Team B"]);
    const names = loadTeamNames();
    expect(names).toEqual(["Team A", "Team B"]);
  });

  it("persiste une configuration avec 3 équipes", () => {
    saveTeamNames(["Team A", "Team B", "Team C"]);
    const names = loadTeamNames();
    expect(names).toEqual(["Team A", "Team B", "Team C"]);
  });

  it("persiste la configuration avec 2 équipes si la 3e équipe n'est pas persistée", () => {
    saveTeamNames(["Team A", "Team B"]);
    const names = loadTeamNames();
    expect(names.length).toBe(2);
    expect(names).toEqual(["Team A", "Team B"]);
  });

  it("change d'une configuration 3 équipes à 2 équipes lors de la suppression", () => {
    saveTeamNames(["Team A", "Team B", "Team C"]);
    expect(loadTeamNames().length).toBe(3);

    saveTeamNames(["Team A", "Team B"]);
    const names = loadTeamNames();
    expect(names.length).toBe(2);
    expect(names).toEqual(["Team A", "Team B"]);
  });

  it("charge la dernière configuration persistée après un retour à la page", () => {
    saveTeamNames(["Les Antagonistes", "Les Sanglieeers", "Une Troisième Équipe"]);

    const names = loadTeamNames();
    expect(names).toEqual(["Les Antagonistes", "Les Sanglieeers", "Une Troisième Équipe"]);
  });

  it("rejette les configurations invalides et retourne la valeur par défaut", () => {
    localStorage.setItem("sans-le-dire:team-names", JSON.stringify(["Only One"]));
    const names = loadTeamNames();
    expect(names).toEqual(["Les Antagonistes", "Les Sanglieeers"]);
  });

  it("rejette les configurations avec plus de 3 équipes", () => {
    localStorage.setItem("sans-le-dire:team-names", JSON.stringify(["Team A", "Team B", "Team C", "Team D"]));
    const names = loadTeamNames();
    expect(names).toEqual(["Les Antagonistes", "Les Sanglieeers"]);
  });

  it("gère les noms spéciaux correctement", () => {
    saveTeamNames(["Équipe 1 & Co.", "Équipe 2 (édition)"] as any);
    const names = loadTeamNames();
    expect(names).toEqual(["Équipe 1 & Co.", "Équipe 2 (édition)"]);
  });
});
