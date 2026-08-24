"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand, LogoMark } from "@/games/sans-le-dire/components/brand";
import { Button, ButtonLink } from "@/games/shared/components/ui";
import { cards } from "@/games/sans-le-dire/data/cards";
import { WordCard } from "./word-card";
import { feedback } from "./feedback";
import {
  SOLO_WORDS_PER_MASTER,
  awardSoloPoint,
  getCurrentSoloCard,
  getSoloRank,
  getSoloRanking,
  replaySoloGame,
  startSoloTurn,
} from "@/games/sans-le-dire/lib/game/solo-engine";
import {
  clearSoloGame,
  loadSoloGame,
  saveSoloGame,
} from "@/games/sans-le-dire/lib/game/persistence";
import type { SoloGameState, SoloPlayer } from "@/games/sans-le-dire/lib/game/types";

export function SoloGameClient() {
  const router = useRouter();
  const [game, setGame] = useState<SoloGameState | null>(null);
  const [ready, setReady] = useState(false);
  const locked = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadSoloGame();
      const ids = new Set(cards.map((card) => card.id));
      if (!stored || stored.deck.some((id) => !ids.has(id))) {
        if (stored) clearSoloGame();
        router.replace("/sans-le-dire/jouer");
        return;
      }
      setGame(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function commit(next: SoloGameState) {
    saveSoloGame(next);
    setGame(next);
  }
  function beginTurn() {
    if (!game) return;
    commit(startSoloTurn(game));
  }
  function award(winnerId: string, cardId: string) {
    if (!game || game.status !== "playing" || locked.current) return;
    locked.current = true;
    try {
      commit(awardSoloPoint(game, winnerId, cardId));
      feedback("found");
    } catch {
      /* Tap tardif sur un mot déjà résolu : on l'ignore silencieusement. */
    } finally {
      window.setTimeout(() => {
        locked.current = false;
      }, 140);
    }
  }
  function replay() {
    if (game) commit(replaySoloGame(game, cards));
  }
  function goHome() {
    clearSoloGame();
  }

  if (!ready || !game)
    return (
      <main className="game-shell safe-shell game-loading" aria-busy="true">
        <LogoMark />
        <p>Préparation des mots…</p>
      </main>
    );
  if (game.status === "finished") return <SoloFinished game={game} onReplay={replay} onHome={goHome} />;
  if (game.status === "handoff") return <SoloHandoff game={game} onReady={beginTurn} />;

  const card = getCurrentSoloCard(game, cards);
  const master = game.players[game.masterIndex]!;
  const guessers = game.players.filter((player) => player.id !== master.id);

  return (
    <main className="play-shell safe-shell">
      <header className="play-header">
        <div>
          <strong>{master.name} fait deviner</strong>
          <span>
            Mot {game.wordIndex + 1} / {SOLO_WORDS_PER_MASTER}
          </span>
        </div>
      </header>
      <WordCard card={card} aria-live="polite" />
      <section className="solo-award-grid" aria-label="Qui a trouvé le mot ?">
        {guessers.map((player) => (
          <button
            key={player.id}
            type="button"
            className="solo-award-button"
            onClick={() => award(player.id, card.id)}
          >
            {player.name}
          </button>
        ))}
      </section>
    </main>
  );
}

function SoloHandoff({ game, onReady }: { game: SoloGameState; onReady: () => void }) {
  const master = game.players[game.masterIndex]!;
  const isFirstMaster = game.masterIndex === 0;

  return (
    <main className="play-shell safe-shell">
      <Brand compact />
      <section className="preparation-card">
        <p className="eyebrow">{isFirstMaster ? "C’est parti" : "Passe le téléphone"}</p>
        <h1>
          {isFirstMaster ? (
            <>
              {master.name}
              <br />
              fait deviner
            </>
          ) : (
            <>
              Passe le téléphone
              <br />à {master.name}
            </>
          )}
        </h1>
        <Button onClick={onReady}>
          Je suis prêt <span aria-hidden="true">→</span>
        </Button>
      </section>
    </main>
  );
}

function SoloFinished({
  game,
  onReplay,
  onHome,
}: {
  game: SoloGameState;
  onReplay: () => void;
  onHome: () => void;
}) {
  const ranking = getSoloRanking(game);
  const topScore = ranking[0]?.score ?? 0;
  const winners = ranking.filter((player) => player.score === topScore);

  return (
    <main className="result-shell safe-shell">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <Brand compact />
      <section className="result-card" aria-live="polite">
        <p className="eyebrow">Partie terminée !</p>
        <div className="trophy" aria-hidden="true">
          ★
        </div>
        <h1>
          {winners.length === 1 ? (
            <>
              {winners[0]!.name}
              <br />
              <span>gagne !</span>
            </>
          ) : (
            <>
              Égalité
              <br />
              <span>{winners.map((player) => player.name).join(" · ")}</span>
            </>
          )}
        </h1>
        <ol className="solo-leaderboard">
          {ranking.map((player) => (
            <SoloLeaderboardRow key={player.id} player={player} rank={getSoloRank(ranking, player)} />
          ))}
        </ol>
        <div className="result-actions">
          <Button onClick={onReplay}>
            Rejouer <span aria-hidden="true">↻</span>
          </Button>
          <ButtonLink href="/sans-le-dire" variant="secondary" onClick={onHome}>
            Accueil
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function SoloLeaderboardRow({ player, rank }: { player: SoloPlayer; rank: number }) {
  const medal = MEDALS[rank];
  return (
    <li className={`solo-leaderboard-row${rank <= 3 ? ` solo-leaderboard-row--${rank}` : ""}`}>
      <span className="solo-leaderboard-rank" aria-hidden={medal ? true : undefined}>
        {medal ?? `${rank}.`}
      </span>
      {medal ? <span className="sr-only">Rang {rank}</span> : null}
      <span className="solo-leaderboard-name">{player.name}</span>
      <strong className="solo-leaderboard-score">
        {player.score} {player.score === 1 ? "pt" : "pts"}
      </strong>
    </li>
  );
}
