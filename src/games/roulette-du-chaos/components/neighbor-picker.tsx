export function NeighborPicker({ onChoose }: { onChoose: (side: "left" | "right") => void }) {
  return (
    <div className="choice-buttons">
      <div className="choice-buttons-grid">
        <button type="button" className="choice-button" onClick={() => onChoose("left")}>
          <span aria-hidden="true">←</span> Voisin de gauche
        </button>
        <button type="button" className="choice-button" onClick={() => onChoose("right")}>
          Voisin de droite <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
