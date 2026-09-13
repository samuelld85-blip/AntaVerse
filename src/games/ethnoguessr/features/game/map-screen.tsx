"use client";

import { useState } from "react";
import { WorldMap } from "@/games/ethnoguessr/components/world-map";
import { CountrySearch } from "@/games/ethnoguessr/components/country-search";
import { DuoPortraitThumbnail } from "@/games/ethnoguessr/components/duo-portrait";
import type { Country } from "@/games/ethnoguessr/lib/geo/countries";
import type { RoundGuess } from "@/games/ethnoguessr/lib/game/types";

export function MapScreen({
  manSrc,
  womanSrc,
  roundNumber,
  totalRounds,
  onSubmit,
}: {
  manSrc: string;
  womanSrc: string;
  roundNumber: number;
  totalRounds: number;
  onSubmit: (guess: RoundGuess) => void;
}) {
  const [guess, setGuess] = useState<RoundGuess | null>(null);

  return (
    <>
      <div className="game-status">
        <p className="round-pill">
          Manche {roundNumber}/{totalRounds}
        </p>
      </div>
      <section className="eg-guess-stage">
        <div className="eg-guess-toolbar">
          <DuoPortraitThumbnail manSrc={manSrc} womanSrc={womanSrc} />
          <CountrySearch
            onSelect={(country: Country) => setGuess({ lat: country.lat, lon: country.lon, countryId: country.id })}
          />
        </div>
        <WorldMap
          className="eg-guess-map"
          onPick={(point) => setGuess({ lat: point.lat, lon: point.lon })}
          markers={guess ? [{ lat: guess.lat, lon: guess.lon, kind: "guess" }] : []}
        />
        <p className="eg-hint">
          {guess
            ? "Tu peux encore ajuster ta réponse — touche la carte ou change de pays."
            : "Touche la carte à l'endroit où tu penses que se situe le duo, ou recherche un pays."}
        </p>
        <button
          type="button"
          className="button button--primary"
          disabled={!guess}
          onClick={() => guess && onSubmit(guess)}
        >
          Valider ma réponse
        </button>
      </section>
    </>
  );
}
