import type { PalmStage } from "@/games/palmier/lib/game/types";

const STAGE_LABEL: Record<PalmStage, string> = {
  stable: "Le palmier est stable.",
  shaky: "Le palmier commence à vaciller.",
  unstable: "Le palmier est instable.",
  critical: "Le palmier est au bord de la chute !",
};

/** Angles (degrees) each frond is rotated to, fanning around the crown (gap left at the bottom, over the trunk). */
const FROND_ANGLES = [-150, -115, -75, -35, 5, 45, 85, 125] as const;

type Point = readonly [number, number];

/** Base of every frond: the top of the trunk, where the crown attaches. */
const FROND_ORIGIN: Point = [120, 92];

function bezierPoint(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ];
}

function bezierTangent(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  return [
    2 * mt * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]),
    2 * mt * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]),
  ];
}

function normalize([x, y]: Point): Point {
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
}

function rotate([x, y]: Point, deg: number): Point {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [x * cos - y * sin, x * sin + y * cos];
}

function fmt(n: number): string {
  return String(Math.round(n * 10) / 10);
}

interface FrondShape {
  rachis: string;
  blade: string;
}

/**
 * Builds one pinnate frond: a curved rachis (spine) from the crown origin to
 * the tip, with tapering leaflet pairs swept forward along it — instead of a
 * single flat blade — so it reads as a real palm frond rather than an
 * isolated sliver. All output coordinates share the frond's local, pre-rotation
 * space; `FROND_ANGLES` fans the finished shape around the crown.
 */
function buildFrond({
  length,
  bowX,
  tipX,
  leafletPairs,
  maxLeafletLength,
  sweepAngle,
}: {
  length: number;
  bowX: number;
  tipX: number;
  leafletPairs: number;
  maxLeafletLength: number;
  sweepAngle: number;
}): FrondShape {
  const p0 = FROND_ORIGIN;
  const p1: Point = [p0[0] + bowX, p0[1] - length * 0.55];
  const p2: Point = [p0[0] + tipX, p0[1] - length];

  const rachisSteps = 12;
  const rachisPoints: string[] = [];
  for (let i = 0; i <= rachisSteps; i += 1) {
    const [x, y] = bezierPoint(p0, p1, p2, i / rachisSteps);
    rachisPoints.push(`${fmt(x)},${fmt(y)}`);
  }

  const leaflets: string[] = [];
  for (let i = 1; i <= leafletPairs; i += 1) {
    const t = i / (leafletPairs + 1);
    const base = bezierPoint(p0, p1, p2, t);
    const tangent = normalize(bezierTangent(p0, p1, p2, t));
    const leafLength = maxLeafletLength * Math.pow(Math.sin(Math.PI * t), 0.7);
    const rootA: Point = [base[0] - tangent[0] * 2, base[1] - tangent[1] * 2];
    const rootB: Point = [base[0] + tangent[0] * 2, base[1] + tangent[1] * 2];

    for (const side of [-1, 1]) {
      const dir = rotate(tangent, side * sweepAngle);
      const tip: Point = [base[0] + dir[0] * leafLength, base[1] + dir[1] * leafLength];
      leaflets.push(
        `M${fmt(rootA[0])},${fmt(rootA[1])} L${fmt(tip[0])},${fmt(tip[1])} L${fmt(rootB[0])},${fmt(rootB[1])} Z`,
      );
    }
  }

  return { rachis: `M${rachisPoints.join(" L")}`, blade: leaflets.join(" ") };
}

/** One shape per fan position, with light variety so the crown isn't perfectly uniform. */
const FRONDS: readonly { angle: number; shape: FrondShape }[] = FROND_ANGLES.map(
  (angle, index) => ({
    angle,
    shape: buildFrond({
      length: 116 + (index % 3) * 9,
      bowX: 22 + (index % 2) * 10,
      tipX: 8 + (index % 3) * 5,
      leafletPairs: 7,
      maxLeafletLength: 27 + (index % 2) * 5,
      sweepAngle: 37,
    }),
  }),
);

/**
 * The palm's hero visual (spec sections 10/27/28): a hand-built SVG whose
 * `data-stage` attribute drives everything (sway amplitude, frond flutter,
 * wind particles, coconut wobble) purely through CSS in styles.css — no
 * per-stage JS branching needed here. `collapsing` swaps in the fall
 * animation; the parent remounts this component with a fresh `key` after
 * each reset so the mount ("replant") animation replays automatically.
 */
export function PalmTree({
  stage,
  collapsing = false,
}: {
  stage: PalmStage;
  collapsing?: boolean;
}) {
  return (
    <div className="palm-tree" data-stage={stage} data-collapsing={collapsing}>
      <svg
        viewBox="0 0 240 320"
        className="palm-tree-svg"
        role="img"
        aria-label={STAGE_LABEL[stage]}
      >
        <defs>
          <radialGradient id="palm-halo-gradient" cx="50%" cy="32%" r="55%">
            <stop offset="0%" stopColor="var(--plm-gold)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--plm-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="palm-halo" cx="120" cy="118" r="108" fill="url(#palm-halo-gradient)" />
        <ellipse className="palm-ground-shadow" cx="120" cy="305" rx="66" ry="9" />

        <g className="palm-wind">
          <line className="palm-wind-line palm-wind-line--1" x1="14" y1="86" x2="52" y2="80" />
          <line className="palm-wind-line palm-wind-line--2" x1="6" y1="150" x2="46" y2="142" />
          <line className="palm-wind-line palm-wind-line--3" x1="192" y1="104" x2="228" y2="96" />
        </g>

        <g className="palm-plant">
          <path
            className="palm-trunk"
            d="M107,304 C104,242 118,202 112,152 C108,122 116,102 120,90
               C124,102 132,122 128,152 C122,202 136,242 133,304 Z"
          />
          <path className="palm-trunk-ridge" d="M110,270 Q120,266 130,270" />
          <path className="palm-trunk-ridge" d="M111,232 Q120,228 129,232" />
          <path className="palm-trunk-ridge" d="M113,192 Q120,189 127,192" />
          <path className="palm-trunk-ridge" d="M115,152 Q120,149 125,152" />

          <g className="palm-crown">
            {FRONDS.map(({ angle, shape }, index) => (
              <g
                key={angle}
                className={`palm-frond palm-frond--${index % 4}`}
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <g className="palm-frond-inner">
                  <path className="palm-frond-rachis" d={shape.rachis} />
                  <path className="palm-frond-blade" d={shape.blade} />
                </g>
              </g>
            ))}
            <g className="palm-coconuts">
              <circle className="palm-coconut" cx="111" cy="99" r="7" />
              <circle className="palm-coconut" cx="125" cy="103" r="7" />
              <circle className="palm-coconut" cx="118" cy="112" r="6" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
