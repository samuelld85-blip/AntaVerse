import type { Exercise } from "./catalog";

// Solid movement pictograms; names remain the authoritative exercise labels.
// Icons are single-colour (currentColor): the sport theme paints them
// --sport-cool, which is light blue on the dark theme and deep blue on the
// light one — so one drawing covers both variants.
//
// Convention: the athlete is drawn in side profile (one thick rounded-stroke
// path for head/torso/limbs) while equipment facing the viewer — a barbell,
// a dumbbell pair, a machine stack — is drawn frontally in solid fill. This
// mirrors standard gym pictograms and keeps 30+ icons visually consistent
// without hand-tuning a bespoke illustration per exercise.

const BODY = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Icon({ viewBox = "0 0 64 50", children }: { viewBox?: string; children: React.ReactNode }) {
  return (
    <svg width="44" height="34" viewBox={viewBox} fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}
function Body({ d, strokeWidth }: { d: string; strokeWidth?: number }) {
  return <path d={d} {...BODY} strokeWidth={strokeWidth ?? BODY.strokeWidth} />;
}
function Head({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} />;
}
// A weighted bar: barbell when wide, dumbbell when short.
function Bar({
  x1,
  y1,
  x2,
  y2,
  r = 5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r?: number;
}) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" />
      <circle cx={x1} cy={y1} r={r} />
      <circle cx={x2} cy={y2} r={r} />
    </>
  );
}
function Ground({ y = 45, x = 4, w = 56 }: { y?: number; x?: number; w?: number }) {
  return <rect x={x} y={y} width={w} height={2.6} rx={1.3} />;
}
function Bench({ x = 8, y = 33, w = 34 }: { x?: number; y?: number; w?: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={5.4} rx={2.6} />
      <rect x={x + 3} y={y + 5} width={4} height={9} rx={1.4} />
      <rect x={x + w - 7} y={y + 5} width={4} height={9} rx={1.4} />
    </>
  );
}
function Stack({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width={11} height={3} rx={1} />
      <rect x={x} y={y + 4.5} width={11} height={3} rx={1} />
      <rect x={x} y={y + 9} width={11} height={3} rx={1} />
    </>
  );
}
function Cable({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  );
}
function Pulley({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={3.2} fill="none" stroke="currentColor" strokeWidth={2} />;
}

// Overlapping body parts are separated by transparent channels punched with a
// mask, which keeps the silhouette readable on any background. Reserved for
// the flagship drawing below; the rest use the lighter stroke system above.
function BenchPress() {
  return (
    <svg width="44" height="34" viewBox="0 0 96 74" fill="currentColor" aria-hidden="true">
      <mask id="ic-bench-press" maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="74">
        <rect width="96" height="74" fill="#fff" />
        <g fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round">
          <path d="M9.6 1A4.6 12.4 0 0 1 9.6 25" />
          <path d="M86.4 1A4.6 12.4 0 0 0 86.4 25" />
          <path d="M37.4 35.8C40.6 41 41 47 35.6 51.4" />
          <path d="M57.6 35.4C60.6 37.4 61.6 39.6 62 42" />
          <path d="m61.4 38 3.5 12.8" />
        </g>
      </mask>
      <g mask="url(#ic-bench-press)">
        <rect x="0" y="11" width="7" height="4" rx="2" />
        <rect x="89" y="11" width="7" height="4" rx="2" />
        <ellipse cx="9.6" cy="13" rx="4.6" ry="12.4" />
        <ellipse cx="16.4" cy="13" rx="4.6" ry="12.4" />
        <ellipse cx="86.4" cy="13" rx="4.6" ry="12.4" />
        <ellipse cx="79.6" cy="13" rx="4.6" ry="12.4" />
        <rect x="16" y="11.1" width="64" height="3.8" rx="1.9" />
        <circle cx="30" cy="13" r="3.4" />
        <circle cx="66" cy="13" r="3.4" />
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M29.8 13c1 9 1.8 19 5 29.4" strokeWidth="6" />
          <path d="M66 13c-.4 9-1.4 18-4 25.4" strokeWidth="6" />
          <path d="m67 43.6 18 6.8" strokeWidth="10" />
          <path d="M85 50.6l-.6 13" strokeWidth="8" />
          <path d="m83.6 69 9 2.4" strokeWidth="5.4" />
          <path d="M41 45l17.5-2" strokeWidth="14" />
        </g>
        <circle cx="35.4" cy="46.8" r="4.3" />
        <circle cx="24.8" cy="45.6" r="6.5" />
        <rect x="15.5" y="51.8" width="63" height="5.4" rx="2.6" />
        <rect x="9.2" y="28.8" width="4.8" height="45" rx="1.2" />
        <path
          d="m13.6 35.4 3.8-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="71.6" y="55" width="5" height="19" rx="1" />
        <rect x="7.4" y="68.2" width="69.4" height="4.4" rx="1.2" />
      </g>
    </svg>
  );
}

// --- Chest ---------------------------------------------------------------

function InclinePress() {
  return (
    <Icon>
      <g transform="rotate(-14 25 36)">
        <Bench />
      </g>
      <Head cx={9} cy={29} r={5.6} />
      <Body d="M15 33 30 34 36 44M30 34 42 44M15 33 14 18M15 33 22 15" />
      <Bar x1={11} y1={10} x2={25} y2={10} r={4.6} />
      <Ground />
    </Icon>
  );
}

function DeclinePress() {
  return (
    <Icon>
      <g transform="rotate(10 25 36)">
        <Bench />
      </g>
      <Head cx={9} cy={29} r={5.6} />
      <Body d="M15 33 30 34 36 44M30 34 42 44M15 33 14 18M15 33 22 15" />
      <Bar x1={11} y1={10} x2={25} y2={10} r={4.6} />
      <Ground />
    </Icon>
  );
}

function ChestFly() {
  return (
    <Icon>
      <Bench />
      <Head cx={9} cy={29} r={5.6} />
      <Body d="M15 33 30 34 36 44M30 34 42 44M15 33 18 18M15 33 8 14" />
      <Bar x1={14} y1={15} x2={20} y2={19} r={4} />
      <Bar x1={3} y1={11} x2={9} y2={15} r={4} />
      <Ground />
    </Icon>
  );
}

function PushUp() {
  return (
    <Icon>
      <Head cx={14} cy={29} r={5.6} />
      <Body d="M18 33 46 30M18 33 16 44M46 30 50 44" />
      <Ground />
    </Icon>
  );
}

function Dips() {
  return (
    <Icon>
      <rect x="10" y="10" width="4" height="30" rx="1.6" />
      <rect x="38" y="10" width="4" height="30" rx="1.6" />
      <rect x="6" y="8" width="12" height="3.4" rx="1.6" />
      <rect x="34" y="8" width="12" height="3.4" rx="1.6" />
      <Head cx={27} cy={16} r={5.6} />
      <Body d="M27 22 24 34 30 44M24 34 20 44M27 22 12 27M27 22 40 30" />
      <Ground />
    </Icon>
  );
}

// --- Shoulders -------------------------------------------------------------

function ShoulderPress() {
  return (
    <Icon>
      <Head cx={32} cy={9} r={6} />
      <Body d="M32 15 32 29 26 44M32 29 38 44M32 17 24 8M32 17 40 8" />
      <Bar x1={19} y1={6} x2={45} y2={6} />
      <Ground />
    </Icon>
  );
}

function LateralRaise() {
  return (
    <Icon>
      <Head cx={32} cy={9} r={6} />
      <Body d="M32 15 32 29 26 44M32 29 38 44M32 18 16 15M32 18 48 15" />
      <Bar x1={10} y1={14} x2={16} y2={15} r={4} />
      <Bar x1={48} y1={15} x2={54} y2={14} r={4} />
      <Ground />
    </Icon>
  );
}

function ReverseFly() {
  return (
    <Icon>
      <Head cx={13} cy={8} r={5.4} />
      <Body d="M18 13 36 22 30 44M36 22 42 44M18 13 6 15M18 13 32 8" />
      <Bar x1={3} y1={13} x2={9} y2={17} r={3.6} />
      <Bar x1={29} y1={6} x2={35} y2={10} r={3.6} />
      <Ground />
    </Icon>
  );
}

function FacePull() {
  return (
    <Icon>
      <Pulley cx={48} cy={8} />
      <Cable x1={48} y1={11} x2={33} y2={19} />
      <Head cx={26} cy={12} r={6} />
      <Body d="M26 18 26 29 20 44M26 29 32 44M26 20 33 19M26 20 20 26" />
      <circle cx="33" cy="19" r="3" />
      <Ground />
    </Icon>
  );
}

// --- Triceps -----------------------------------------------------------

function TricepsExtension() {
  return (
    <Icon>
      <Pulley cx={20} cy={6} />
      <Cable x1={20} y1={9} x2={20} y2={26} />
      <Head cx={32} cy={9} r={6} />
      <Body d="M32 15 32 29 26 44M32 29 38 44M32 18 22 22 20 30" />
      <Ground />
    </Icon>
  );
}

function SkullCrusher() {
  return (
    <Icon>
      <Bench />
      <Head cx={13} cy={28} r={5.6} />
      <Body d="M18 32 34 33 27 44M34 33 41 44M18 32 24 20 21 12" />
      <Bar x1={13} y1={10} x2={29} y2={10} r={4.4} />
      <Ground />
    </Icon>
  );
}

// --- Back ----------------------------------------------------------------

function PullUp() {
  return (
    <Icon>
      <rect x="6" y="6" width="52" height="3.6" rx="1.8" />
      <Head cx={30} cy={16} r={5.8} />
      <Body d="M30 22 33 34 28 45M33 34 39 44M30 22 22 10M30 22 38 10" />
      <Ground />
    </Icon>
  );
}

function LatPulldown() {
  return (
    <Icon>
      <Pulley cx={25} cy={6} />
      <Cable x1={25} y1={6} x2={25} y2={16} />
      <Bar x1={14} y1={16} x2={36} y2={16} r={3.6} />
      <Head cx={24} cy={20} r={5.8} />
      <Body d="M24 27 26 38 34 42M24 27 16 17M24 27 34 17" />
    </Icon>
  );
}

function Row() {
  return (
    <Icon>
      <Head cx={28} cy={9} r={6} />
      <Body d="M22 16 36 22 30 44M36 22 42 44M22 16 14 22 20 27" />
      <Bar x1={16} y1={29} x2={24} y2={29} r={4.2} />
      <Ground />
    </Icon>
  );
}

function CableRow() {
  return (
    <Icon>
      <rect x="47" y="12" width="4" height="22" rx="1.4" />
      <Cable x1={36} y1={26} x2={47} y2={26} />
      <line x1="36" y1="20" x2="36" y2="32" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" />
      <Head cx={16} cy={17} r={5.8} />
      <Body d="M16 24 16 38 28 40M16 38 40 40M16 24 34 26" />
    </Icon>
  );
}

function Shrug() {
  return (
    <Icon>
      <Head cx={32} cy={9} r={6} />
      <Body d="M32 16 32 29 26 44M32 29 38 44M32 17 25 30M32 17 39 30" />
      <Bar x1={21} y1={30} x2={27} y2={30} r={4} />
      <Bar x1={37} y1={30} x2={43} y2={30} r={4} />
      <path d="M26 13h4M34 13h4" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
      <Ground />
    </Icon>
  );
}

// --- Arms ------------------------------------------------------------------

function Curl() {
  return (
    <Icon>
      <Head cx={32} cy={9} r={6} />
      <Body d="M32 16 32 29 26 44M32 29 38 44M32 18 26 26 30 32" />
      <Bar x1={26} y1={30} x2={34} y2={32} r={4.2} />
      <Ground />
    </Icon>
  );
}

function HammerCurl() {
  return (
    <Icon>
      <Head cx={32} cy={9} r={6} />
      <Body d="M32 16 32 29 26 44M32 29 38 44M32 18 26 26 27 34" />
      <line x1="23" y1="30" x2="31" y2="38" stroke="currentColor" strokeWidth={4} strokeLinecap="round" />
      <Ground />
    </Icon>
  );
}

// --- Legs ------------------------------------------------------------------

function Squat() {
  return (
    <Icon>
      <Head cx={30} cy={9} r={6} />
      <Body d="M30 15 30 25 20 34 24 44M30 25 40 34 38 44M30 17 22 16M30 17 38 16" />
      <Bar x1={13} y1={15} x2={47} y2={15} />
      <Ground />
    </Icon>
  );
}

function LegPress() {
  return (
    <Icon>
      <rect x="2" y="30" width="14" height="6" rx="3" />
      <rect x="36" y="8" width="6" height="18" rx="2" />
      <line x1="16" y1="30" x2="36" y2="18" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <Head cx={10} cy={26} r={5.6} />
      <Body d="M14 29 20 33 28 26 36 18" />
      <Ground y={43} />
    </Icon>
  );
}

function Lunge() {
  return (
    <Icon>
      <Head cx={26} cy={9} r={6} />
      <Body d="M26 15 27 28 18 33 14 44M27 28 39 34 42 44M26 17 20 24M26 17 33 22" />
      <Bar x1={13} y1={23} x2={19} y2={24} r={4} />
      <Bar x1={32} y1={21} x2={38} y2={23} r={4} />
      <Ground />
    </Icon>
  );
}

function BulgarianSquat() {
  return (
    <Icon>
      <rect x="38" y="30" width="14" height="4" rx="1.6" />
      <rect x="43" y="34" width="4" height="10" rx="1.4" />
      <Head cx={20} cy={9} r={6} />
      <Body d="M20 15 21 28 14 34 12 44M21 28 34 32 40 30M20 17 16 25M20 17 26 22" />
      <Bar x1={10} y1={24} x2={16} y2={25} r={4} />
      <Bar x1={24} y1={20} x2={30} y2={22} r={4} />
      <Ground />
    </Icon>
  );
}

function LegExtension() {
  return (
    <Icon>
      <rect x="6" y="18" width="10" height="20" rx="2.4" />
      <Stack x={4} y={12} />
      <Head cx={24} cy={16} r={5.6} />
      <Body d="M24 22 27 34 27 34M27 34 27 34" />
      <Body d="M24 22 27 34 42 30" />
      <Body d="M27 34 22 44" />
      <Ground />
    </Icon>
  );
}

function RomanianDeadlift() {
  return (
    <Icon>
      <Body d="M22 16 36 22 30 44M36 22 42 44M22 16 16 24M22 16 28 10" />
      <Head cx={28} cy={9} r={6} />
      <Bar x1={20} y1={33} x2={38} y2={33} r={4.6} />
      <Body d="M20 25 20 33" />
      <Ground />
    </Icon>
  );
}

function LegCurl() {
  return (
    <Icon>
      <Bench x={6} y={34} w={32} />
      <Head cx={10} cy={30} r={5.6} />
      <Body d="M15 33 32 33 32 20M15 33 10 30" />
      <Stack x={40} y={16} />
      <Ground />
    </Icon>
  );
}

function HipThrust() {
  return (
    <Icon>
      <rect x="2" y="27" width="12" height="13" rx="2.2" />
      <Head cx={9} cy={23} r={5.4} />
      <Body d="M14 26 28 18 36 28 36 44" />
      <Bar x1={24} y1={15} x2={34} y2={15} r={4.4} />
      <Ground />
    </Icon>
  );
}

function HipAbduction() {
  return (
    <Icon>
      <rect x="6" y="10" width="9" height="26" rx="2" />
      <rect x="45" y="10" width="9" height="26" rx="2" />
      <Head cx={30} cy={13} r={5.6} />
      <Body d="M30 19 30 30 16 27M30 30 48 27M30 21 24 28M30 21 36 28" />
      <Ground />
    </Icon>
  );
}

function CalfRaise() {
  return (
    <Icon>
      <rect x="16" y="40" width="32" height="4.4" rx="1.6" />
      <Head cx={32} cy={12} r={6} />
      <Body d="M32 18 32 30 27 40M32 30 37 40" />
      <path d="M27 40 25 44M37 40 39 44" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" />
    </Icon>
  );
}

// --- Core --------------------------------------------------------------

function Crunch() {
  return (
    <Icon>
      <Body d="M10 42 26 42 34 32 30 22" strokeWidth={7} />
      <Head cx={17} cy={35} r={5.6} />
      <Body d="M18 40 26 42" />
      <Ground />
    </Icon>
  );
}

function LegRaise() {
  return (
    <Icon>
      <Body d="M10 42 30 42 42 16" strokeWidth={7} />
      <Head cx={17} cy={36} r={5.6} />
      <Ground />
    </Icon>
  );
}

function RussianTwist() {
  return (
    <Icon>
      <Body d="M22 40 34 33 28 20M34 33 44 40" strokeWidth={7} />
      <Head cx={26} cy={14} r={5.6} />
      <circle cx="46" cy="41" r="4.4" />
      <Body d="M14 44 30 44" strokeWidth={5} />
      <Ground />
    </Icon>
  );
}

// Per-exercise pictograms. Ids are the same permanent keys used in the
// catalog; a new exercise falls back to the generic pattern drawing below
// until it gets one here.
const iconById: Record<string, () => React.ReactElement> = {
  "bench-press": BenchPress,
  "incline-press": InclinePress,
  "decline-press": DeclinePress,
  "chest-fly": ChestFly,
  "push-up": PushUp,
  dips: Dips,
  "shoulder-press": ShoulderPress,
  "lateral-raise": LateralRaise,
  "reverse-fly": ReverseFly,
  "face-pull": FacePull,
  "triceps-extension": TricepsExtension,
  "skull-crusher": SkullCrusher,
  "pull-up": PullUp,
  "lat-pulldown": LatPulldown,
  row: Row,
  "cable-row": CableRow,
  shrug: Shrug,
  curl: Curl,
  "hammer-curl": HammerCurl,
  squat: Squat,
  "leg-press": LegPress,
  lunge: Lunge,
  "bulgarian-squat": BulgarianSquat,
  "leg-extension": LegExtension,
  "romanian-deadlift": RomanianDeadlift,
  "leg-curl": LegCurl,
  "hip-thrust": HipThrust,
  "hip-abduction": HipAbduction,
  "calf-raise": CalfRaise,
  crunch: Crunch,
  "leg-raise": LegRaise,
  "russian-twist": RussianTwist,
};

export function ExerciseIcon({ exercise }: { exercise: Exercise }) {
  const Specific = iconById[exercise.id];
  if (Specific) return <Specific />;
  const legs = exercise.pattern === "legs";
  const core = exercise.pattern === "core";
  const pull = exercise.pattern === "pull";
  return (
    <svg
      width="42"
      height="36"
      viewBox="0 0 48 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {legs ? (
        <>
          <circle cx="22" cy="7" r="3" />
          <path d="m22 11-5 11 13 5-6 9h11M18 21 9 28l-4 8h9M17 17h17M14 13v8M34 13v8" />
        </>
      ) : core ? (
        <>
          <circle cx="11" cy="19" r="3" />
          <path d="m15 23 11 8 9-13 8 8M8 35h35M17 24l3-9" />
        </>
      ) : pull ? (
        <>
          <circle cx="24" cy="12" r="3" />
          <path d="M24 16v11l-7 9M24 27l7 9M24 20 13 9V5M24 20 35 9V5M7 5h34" />
        </>
      ) : (
        <>
          <circle cx="24" cy="12" r="3" />
          <path d="M24 16v11l-7 9M24 27l7 9M24 19l-11-3V8M24 19l11-3V8M8 8h10M30 8h10M10 5v6M38 5v6" />
        </>
      )}
    </svg>
  );
}
