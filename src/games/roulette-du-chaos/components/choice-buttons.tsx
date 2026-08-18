import type { ChoiceRequest } from "@/games/roulette-du-chaos/lib/game/types";

export function ChoiceButtons({
  request,
  onChoose,
}: {
  request: ChoiceRequest;
  onChoose: (key: string) => void;
}) {
  return (
    <div className="choice-buttons">
      {request.prompt ? <p className="choice-buttons-prompt">{request.prompt}</p> : null}
      <div className="choice-buttons-grid">
        {request.options.map((option) => (
          <button
            key={option.key}
            type="button"
            className="choice-button"
            onClick={() => onChoose(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
