# EthnoGuessr assets

`duos/` holds one photo per person, named by their Wikidata QID
(`<qid>.jpg`/`.png`) so the filename never gives away who they are before
the reveal. `src/games/ethnoguessr/data/duos.ts` maps each pair (one man,
one woman, both born in the same country) to a `countryId`. See
`CREDITS.md` for the photographer/license of every photo.

## Where this content comes from

Each person was found via a Wikidata query: born in the target country
(`P19` place of birth → `P17` country — not citizenship, which also catches
naturalized people and would misrepresent the country), born after 1950
(so the linked photo is an actual photograph, not a painting of someone
who predates photography), not tagged with the occupation "politician"
(sidesteps current heads of state/government), and with a freely-licensed
photo already hosted on Wikimedia Commons (`P18`). Commons only hosts
free-license content, so every image here is CC BY / CC BY-SA / CC0 /
public domain — never "fair use".

People are deliberately **not** famous — each has only a handful of
Wikipedia language editions linking to them. The round is meant to be
guessed from the photo alone; a recognizable face would let players answer
from name recall instead of any visual or cultural cue. Names, and the
photo credit, are only shown after the round is scored (see the result
screen).

## Regenerating or extending this set

The scripts used to build this aren't checked into the repo (they were a
one-off content pass, run from scratch). To add more countries or refresh
the set, redo the same three-step query: Wikidata SPARQL for candidates →
resolve labels/sitelinks (filter out anyone too well-known) → Commons
`imageinfo` for a scaled thumbnail URL + license + author — then download
by QID into `duos/` and add entries to `DUO_ROUNDS` in
`src/games/ethnoguessr/data/duos.ts` (and a line to `CREDITS.md`). No other
game code needs to change.
