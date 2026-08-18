const PIP_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** A simple 2D die face with a rolling shake — not the full 3D cube Triman uses; this is a minor secondary flourish here, not the core mechanic. */
export function DieFace({ value, rolling }: { value: number; rolling: boolean }) {
  const active = new Set(PIP_LAYOUTS[value] ?? []);
  return (
    <div
      className={rolling ? "die-face-2d die-face-2d--rolling" : "die-face-2d"}
      aria-hidden="true"
    >
      <div className="die-face-2d-grid">
        {Array.from({ length: 9 }, (_, cell) => (
          <span key={cell} className={active.has(cell) ? "pip pip--on" : "pip"} />
        ))}
      </div>
    </div>
  );
}
