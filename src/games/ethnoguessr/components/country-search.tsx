"use client";

import { useId, useMemo, useState } from "react";
import { COUNTRIES, type Country } from "@/games/ethnoguessr/lib/geo/countries";
import { normalizeSearchText } from "@/games/ethnoguessr/lib/text/normalize";

const MAX_RESULTS = 8;

export function CountrySearch({
  onSelect,
  disabled = false,
}: {
  onSelect: (country: Country) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listId = useId();

  const results = useMemo(() => {
    const normalized = normalizeSearchText(query);
    if (!normalized) return [];
    return COUNTRIES.filter((country) =>
      normalizeSearchText(country.name).includes(normalized),
    ).slice(0, MAX_RESULTS);
  }, [query]);

  const showResults = open && results.length > 0;

  function select(country: Country) {
    onSelect(country);
    setQuery(country.name);
    setOpen(false);
    setHighlightedIndex(0);
  }

  return (
    <div className="eg-search">
      <input
        type="text"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        placeholder="Rechercher un pays…"
        value={query}
        disabled={disabled}
        className="eg-search-input"
        role="combobox"
        aria-expanded={showResults}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showResults && results[highlightedIndex]
            ? `${listId}-${results[highlightedIndex].id}`
            : undefined
        }
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown" && results.length > 0) {
            event.preventDefault();
            setOpen(true);
            setHighlightedIndex((current) => Math.min(current + 1, results.length - 1));
          }
          if (event.key === "ArrowUp" && results.length > 0) {
            event.preventDefault();
            setOpen(true);
            setHighlightedIndex((current) => Math.max(current - 1, 0));
          }
          if (event.key === "Enter" && results.length > 0) {
            event.preventDefault();
            select(results[highlightedIndex]!);
          }
        }}
      />
      {showResults ? (
        <ul id={listId} className="eg-search-results" role="listbox">
          {results.map((country, index) => (
            <li key={country.id}>
              <button
                id={`${listId}-${country.id}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onPointerDown={() => select(country)}
              >
                {country.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
