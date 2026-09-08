import { useId } from "react";
import type { Exercise } from "./catalog";

// Solid movement pictograms; names remain the authoritative exercise labels.
// Icons are single-colour (currentColor): the sport theme paints them
// --sport-cool, which is light blue on the dark theme and deep blue on the
// light one — so one drawing covers both variants.
//
// Art direction (set by the bench-press drawing, which every other icon
// follows):
//   * one 96x74 canvas for all icons, rendered at 44x34, so a stroke width
//     means the same on-screen thickness everywhere;
//   * the athlete is a thick rounded-stroke skeleton — torso 14, upper/fore
//     arm 6, thigh 10, shin 8, foot 5.4 — with disc joints and a r6.5 head;
//   * equipment is solid fill seen from the side: plates are vertical
//     ellipses, bars/pads/posts are rounded rects, stacks are stacked slabs;
//   * where two body parts or a limb and a bar overlap, a mask punches a
//     1.6px transparent channel between them so the silhouette stays
//     readable on any background.

const LIMB = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Limb thicknesses, taken from the bench-press reference.
const TORSO = 14;
const ARM = 6;
const THIGH = 10;
const SHIN = 8;
const FOOT = 5.4;

// The 1.6px channels punched between overlapping parts.
const SEPARATOR = {
  fill: "none",
  stroke: "#000",
  strokeWidth: 1.6,
  strokeLinecap: "round",
} as const;

/**
 * The shared canvas. `cut` holds the separation channels: any path listed
 * there is erased from the drawing, keeping overlapping limbs distinct.
 */
function Scene({ cut, children }: { cut?: React.ReactNode; children: React.ReactNode }) {
  // useId can contain characters that are invalid inside url(#…).
  const maskId = `ic${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg width="44" height="34" viewBox="0 0 96 74" fill="currentColor" aria-hidden="true">
      {cut ? (
        <>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="74">
            <rect width="96" height="74" fill="#fff" />
            <g {...SEPARATOR}>{cut}</g>
          </mask>
          <g mask={`url(#${maskId})`}>{children}</g>
        </>
      ) : (
        children
      )}
    </svg>
  );
}

// --- Body primitives -------------------------------------------------------

function Limb({ d, w }: { d: string; w: number }) {
  return <path d={d} {...LIMB} strokeWidth={w} />;
}
function Head({ x, y, r = 6.5 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} />;
}
function Joint({ x, y, r = 4.3 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} />;
}

// --- Equipment primitives --------------------------------------------------

/** A loaded barbell seen from the side; x1/x2 are the outer plate centres. */
function Barbell({
  x1,
  x2,
  y,
  rx = 4.6,
  ry = 11,
}: {
  x1: number;
  x2: number;
  y: number;
  rx?: number;
  ry?: number;
}) {
  return (
    <>
      <rect x={x1 - 9.6} y={y - 2} width={7} height={4} rx={2} />
      <ellipse cx={x1} cy={y} rx={rx} ry={ry} />
      <ellipse cx={x1 + 6.8} cy={y} rx={rx} ry={ry} />
      <rect x={x1 + 6.4} y={y - 1.9} width={x2 - 6.8 - (x1 + 6.4)} height={3.8} rx={1.9} />
      <ellipse cx={x2 - 6.8} cy={y} rx={rx} ry={ry} />
      <ellipse cx={x2} cy={y} rx={rx} ry={ry} />
      <rect x={x2 + 2.6} y={y - 2} width={7} height={4} rx={2} />
    </>
  );
}

/** A dumbbell centred on (x,y); `a` rotates it (90 = held neutral grip). */
function Dumbbell({
  x,
  y,
  a = 0,
  len = 14,
  rx = 3.2,
  ry = 7,
}: {
  x: number;
  y: number;
  a?: number;
  len?: number;
  rx?: number;
  ry?: number;
}) {
  return (
    <g transform={a ? `rotate(${a} ${x} ${y})` : undefined}>
      <rect x={x - len / 2} y={y - 1.7} width={len} height={3.4} rx={1.7} />
      <ellipse cx={x - len / 2 + rx} cy={y} rx={rx} ry={ry} />
      <ellipse cx={x + len / 2 - rx} cy={y} rx={rx} ry={ry} />
    </g>
  );
}

/** A padded surface: bench, seat, backrest, shoulder pad. */
function Pad({
  x,
  y,
  w,
  h = 6,
  a = 0,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  a?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={h / 2}
      transform={a ? `rotate(${a} ${x + w / 2} ${y + h / 2})` : undefined}
    />
  );
}

/** A frame member: upright, rail, bench leg. */
function Post({
  x,
  y,
  h,
  w = 5,
  a = 0,
}: {
  x: number;
  y: number;
  h: number;
  w?: number;
  a?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={1.4}
      transform={a ? `rotate(${a} ${x + w / 2} ${y + h / 2})` : undefined}
    />
  );
}

/** A machine weight stack. */
function Stack({ x, y, n = 4 }: { x: number; y: number; n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x} y={y + i * 6} width={14} height={4} rx={1.4} />
      ))}
    </>
  );
}

function Pulley({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="none" stroke="currentColor" strokeWidth={2.6} />;
}
function Cable({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />;
}
/** A machine roller: ankle pad, thigh pad. */
function Roller({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} />;
}
function Floor({ x = 6, y = 68.2, w = 84 }: { x?: number; y?: number; w?: number }) {
  return <rect x={x} y={y} width={w} height={4.4} rx={1.2} />;
}

// --- Chest -----------------------------------------------------------------

// The reference drawing: every icon below matches its weight and detail.
function BenchPress() {
  return (
    <Scene
      cut={
        <>
          <path d="M9.6 1A4.6 12.4 0 0 1 9.6 25" />
          <path d="M86.4 1A4.6 12.4 0 0 0 86.4 25" />
          <path d="M37.4 35.8C40.6 41 41 47 35.6 51.4" />
          <path d="M57.6 35.4C60.6 37.4 61.6 39.6 62 42" />
          <path d="m61.4 38 3.5 12.8" />
        </>
      }
    >
      <rect x="0" y="11" width="7" height="4" rx="2" />
      <rect x="89" y="11" width="7" height="4" rx="2" />
      <ellipse cx="9.6" cy="13" rx="4.6" ry="12.4" />
      <ellipse cx="16.4" cy="13" rx="4.6" ry="12.4" />
      <ellipse cx="86.4" cy="13" rx="4.6" ry="12.4" />
      <ellipse cx="79.6" cy="13" rx="4.6" ry="12.4" />
      <rect x="16" y="11.1" width="64" height="3.8" rx="1.9" />
      <circle cx="30" cy="13" r="3.4" />
      <circle cx="66" cy="13" r="3.4" />
      <Limb d="M29.8 13c1 9 1.8 19 5 29.4" w={6} />
      <Limb d="M66 13c-.4 9-1.4 18-4 25.4" w={6} />
      <Limb d="m67 43.6 18 6.8" w={10} />
      <Limb d="M85 50.6l-.6 13" w={8} />
      <Limb d="m83.6 69 9 2.4" w={5.4} />
      <Limb d="M41 45l17.5-2" w={14} />
      <circle cx="35.4" cy="46.8" r="4.3" />
      <circle cx="24.8" cy="45.6" r="6.5" />
      <rect x="15.5" y="51.8" width="63" height="5.4" rx="2.6" />
      <rect x="9.2" y="28.8" width="4.8" height="45" rx="1.2" />
      <path d="m13.6 35.4 3.8-2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="71.6" y="55" width="5" height="19" rx="1" />
      <rect x="7.4" y="68.2" width="69.4" height="4.4" rx="1.2" />
    </Scene>
  );
}

// Reclined on an incline bench, pressing the bar up and slightly back.
function InclinePress() {
  return (
    <Scene
      cut={
        <>
          <path d="M14 2A4.6 11 0 0 1 14 24" />
          <path d="M82 2A4.6 11 0 0 0 82 24" />
          <path d="M50 32c4 5 5 11 3 16" />
          <path d="m36 54-9 9" />
        </>
      }
    >
      <Barbell x1={14} x2={82} y={13} />
      <circle cx="34" cy="13" r="3.4" />
      <circle cx="62" cy="13" r="3.4" />
      <Limb d="M35 14c8 7 15 13 20 20" w={ARM} />
      <Limb d="M62 15c-2 8-4 13-6 19" w={ARM} />
      <Post x={30} y={56} h={14} />
      <Pad x={25} y={39.5} w={44} a={-45} />
      <Pad x={22} y={51} w={20} />
      <Limb d="M40 52 57 35" w={TORSO} />
      <Limb d="m38 53-12 8" w={THIGH} />
      <Limb d="M26 61 20 68" w={SHIN} />
      <Limb d="M17 70h9" w={FOOT} />
      <Joint x={56} y={34} />
      <Head x={63} y={26} />
      <Floor x={12} w={56} />
    </Scene>
  );
}

// Head low on a decline bench, ankles hooked under the rollers.
function DeclinePress() {
  return (
    <Scene
      cut={
        <>
          <path d="M14 4A4.6 10 0 0 1 14 24" />
          <path d="M78 4A4.6 10 0 0 0 78 24" />
          <path d="M31 40c-4 3-6 6-6 9" />
          <path d="M57 43c4 2 6 5 6 8" />
        </>
      }
    >
      <Barbell x1={12} x2={68} y={18} ry={10} />
      <circle cx="24" cy="18" r="3.4" />
      <Limb d="M25 20 26 34" w={ARM} />
      <Limb d="m26 34 3 13" w={ARM} />
      <Joint x={26} y={34} r={3.4} />
      <Post x={58} y={38} h={30} />
      <Post x={22} y={56} h={14} />
      <Pad x={17} y={41.5} w={44} a={-30} />
      <Limb d="M29 49 52 37" w={TORSO} />
      <Limb d="m53 37 13 7" w={THIGH} />
      <Limb d="M66 44 68 31" w={SHIN} />
      <Roller x={70} y={28} r={4.8} />
      <Joint x={29} y={48} />
      <Head x={19} y={53} />
      <Floor x={12} w={62} />
    </Scene>
  );
}

// Pec deck, seen from the front: forearms vertical against the pads, which
// reads unambiguously where a side-view fly would look like two antennae.
function ChestFly() {
  return (
    <Scene
      cut={
        <>
          <path d="M40 22c-3 3-4 6-4 8" />
          <path d="M56 22c3 3 4 6 4 8" />
        </>
      }
    >
      <Post x={12} y={20} h={44} />
      <Post x={79} y={20} h={44} />
      <Pad x={23} y={14} w={7} h={18} />
      <Pad x={66} y={14} w={7} h={18} />
      <Limb d="M42 28 32 30" w={ARM} />
      <Limb d="m32 30-2-9" w={ARM} />
      <Limb d="m54 28 10 2" w={ARM} />
      <Limb d="m64 30 2-9" w={ARM} />
      <Joint x={32} y={30} r={3.6} />
      <Joint x={64} y={30} r={3.6} />
      <Limb d="M48 25v22" w={TORSO} />
      <Limb d="M45 49 42 66" w={9} />
      <Limb d="m51 49 3 17" w={9} />
      <Head x={48} y={15} />
      <Pad x={36} y={50} w={24} h={6} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Seated on a vertical chest-press machine, handles pushed straight ahead.
function VerticalChestPress() {
  return (
    <Scene
      cut={
        <>
          <path d="M40 27c-3 3-4 6-4 10" />
          <path d="M52 27c3 3 4 6 4 10" />
          <path d="M46 47c-3 4-4 8-4 12" />
        </>
      }
    >
      <Post x={75} y={5} h={63} />
      <Stack x={79} y={25} n={4} />
      <Pad x={62} y={25} w={8} h={29} />
      <Pad x={25} y={52} w={43} h={6} />
      <Post x={38} y={57} h={13} />
      <Limb d="M42 29 29 28" w={ARM} />
      <Limb d="M54 29 67 28" w={ARM} />
      <Pad x={20} y={25} w={10} h={5} />
      <Pad x={66} y={25} w={10} h={5} />
      <Limb d="M48 28v21" w={TORSO} />
      <Limb d="M45 49 39 61" w={THIGH} />
      <Limb d="m39 61-2 8" w={SHIN} />
      <Limb d="M34 71h11" w={FOOT} />
      <Head x={48} y={18} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Plank position, arms locked under the shoulders.
function PushUp() {
  return (
    <Scene
      cut={
        <>
          <path d="M30 30c-4 3-6 6-6 10" />
          <path d="M58 40c3 3 4 6 4 9" />
        </>
      }
    >
      <Limb d="M31 36 59 45" w={TORSO} />
      <Limb d="m60 46 17 7" w={THIGH} />
      <Limb d="M77 53 87 59" w={SHIN} />
      <Limb d="m87 61 4 3" w={FOOT} />
      <Limb d="M31 37 29 60" w={ARM} />
      <Joint x={30} y={36} />
      <circle cx="29" cy="61" r="3.6" />
      <Head x={20} y={31} />
      <Floor x={8} y={63} w={80} />
    </Scene>
  );
}

// Suspended between parallel bars, elbows behind, knees tucked back.
function Dips() {
  return (
    <Scene
      cut={
        <>
          <path d="M44 27c-5 3-8 7-9 11" />
          <path d="M56 45c4 3 6 6 6 9" />
        </>
      }
    >
      <Post x={14} y={32} h={36} />
      <Post x={76} y={32} h={36} />
      <Pad x={10} y={29} w={28} h={4.4} />
      <Pad x={58} y={29} w={28} h={4.4} />
      <Limb d="M48 22 47 44" w={TORSO} />
      <Limb d="m47 45 12 7" w={THIGH} />
      <Limb d="M59 52 55 62" w={SHIN} />
      <Limb d="M48 23 33 31" w={ARM} />
      <Joint x={48} y={22} />
      <circle cx="32" cy="31" r="3.6" />
      <Head x={49} y={11} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// --- Shoulders -------------------------------------------------------------

// Front view, bar locked out overhead.
function ShoulderPress() {
  return (
    <Scene
      cut={
        <>
          <path d="M18 3A4.6 10 0 0 1 18 23" />
          <path d="M78 3A4.6 10 0 0 0 78 23" />
          <path d="M42 30c-3 3-4 6-4 9" />
          <path d="M54 30c3 3 4 6 4 9" />
        </>
      }
    >
      <Barbell x1={18} x2={78} y={13} ry={10} />
      <circle cx="38" cy="13" r="3.4" />
      <circle cx="58" cy="13" r="3.4" />
      <Limb d="M41 33 38 15" w={ARM} />
      <Limb d="m55 33 3-18" w={ARM} />
      <Limb d="M48 32v20" w={TORSO} />
      <Limb d="M45 52 42 66" w={9} />
      <Limb d="m51 52 3 14" w={9} />
      <Limb d="M39 69h8" w={FOOT} />
      <Limb d="M49 69h8" w={FOOT} />
      <Head x={48} y={24} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Front view, arms out level with the shoulders.
function LateralRaise() {
  return (
    <Scene
      cut={
        <>
          <path d="M40 20c-3 2-4 4-4 7" />
          <path d="M56 20c3 2 4 4 4 7" />
        </>
      }
    >
      <Dumbbell x={17} y={25} a={90} />
      <Dumbbell x={79} y={25} a={90} />
      <Limb d="M42 26 24 25" w={ARM} />
      <Limb d="m54 26 18-1" w={ARM} />
      <Limb d="M48 24v24" w={TORSO} />
      <Limb d="M45 48 42 66" w={9} />
      <Limb d="m51 48 3 18" w={9} />
      <Limb d="M39 69h8" w={FOOT} />
      <Limb d="M49 69h8" w={FOOT} />
      <Head x={48} y={15} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Hinged forward, both arms fanning out and back.
function ReverseFly() {
  return (
    <Scene
      cut={
        <>
          <path d="M28 24c-4 3-6 6-7 10" />
          <path d="M40 30c2 4 3 8 3 12" />
          <path d="M52 34c4 3 5 6 5 10" />
        </>
      }
    >
      <Limb d="M34 33 21 45" w={ARM} />
      <Limb d="m34 33 13 16" w={ARM} />
      <Dumbbell x={18} y={48} a={90} len={13} rx={3} ry={6.4} />
      <Dumbbell x={50} y={52} a={90} len={13} rx={3} ry={6.4} />
      <Limb d="M32 30 58 37" w={TORSO} />
      <Limb d="m58 38 3 15" w={THIGH} />
      <Limb d="M61 53 60 66" w={SHIN} />
      <Limb d="M55 69h12" w={FOOT} />
      <Joint x={34} y={32} />
      <Head x={23} y={26} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Cable pulled to the face, elbows kept high.
function FacePull() {
  return (
    <Scene
      cut={
        <>
          <path d="M44 28c4-2 8-2 11 0" />
          <path d="M40 34c-3 4-4 8-4 13" />
        </>
      }
    >
      <Post x={82} y={4} h={64} />
      <Pulley x={79} y={12} />
      <Cable d="M79 16 57 26" />
      <Limb d="M42 31 54 23l1 4" w={ARM} />
      <Limb d="M40 30v22" w={TORSO} />
      <Limb d="m40 53 4 13" w={THIGH} />
      <Limb d="M35 69h12" w={FOOT} />
      <Limb d="M38 53 34 66" w={SHIN} />
      <Joint x={42} y={30} />
      <circle cx="56" cy="26" r="3.8" />
      <Head x={33} y={22} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// --- Triceps ---------------------------------------------------------------

// Pushdown: elbows pinned to the ribs, forearms driven down.
function TricepsExtension() {
  return (
    <Scene
      cut={
        <>
          <path d="M45 30c-4 3-6 7-6 11" />
          <path d="M52 34c3 4 4 9 4 14" />
        </>
      }
    >
      <Post x={11} y={4} h={64} />
      <Pulley x={14} y={12} />
      <Cable d="M14 16 33 40" />
      <Pad x={24} y={40} w={20} h={4} />
      <Limb d="M47 31 43 42l-9 1" w={ARM} />
      <Limb d="M50 30v22" w={TORSO} />
      <Limb d="m50 53 3 13" w={THIGH} />
      <Limb d="M45 69h12" w={FOOT} />
      <Joint x={47} y={30} />
      <Head x={53} y={21} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Lying with the upper arms vertical, bar lowered toward the forehead.
function SkullCrusher() {
  return (
    <Scene
      cut={
        <>
          <path d="M24 24A4 8 0 0 1 24 40" />
          <path d="M40 32c-3 4-4 8-4 12" />
          <path d="M57 42c4 3 6 6 6 9" />
        </>
      }
    >
      <Limb d="M40 44 39 29" w={ARM} />
      <Limb d="m39 29-8-4" w={ARM} />
      <Joint x={39} y={29} r={3.6} />
      <Barbell x1={20} x2={44} y={24} rx={3.4} ry={8} />
      <Limb d="M41 45 60 43" w={TORSO} />
      <Limb d="m61 44 15 6" w={THIGH} />
      <Limb d="M76 50 77 62" w={SHIN} />
      <Limb d="M75 69h11" w={FOOT} />
      <Joint x={40} y={44} />
      <Head x={27} y={45} />
      <Pad x={14} y={52} w={64} h={5.4} />
      <Post x={20} y={57} h={12} />
      <Post x={68} y={57} h={12} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// --- Back ------------------------------------------------------------------

// Hanging from a fixed bar, knees folded back.
function PullUp() {
  return (
    <Scene
      cut={
        <>
          <path d="M42 32c-3 3-4 6-4 9" />
          <path d="M54 32c3 3 4 6 4 9" />
          <path d="M45 54c-3 4-4 7-4 10" />
        </>
      }
    >
      <Post x={8} y={0} h={13} />
      <Post x={83} y={0} h={13} />
      <Pad x={8} y={8} w={80} h={4.4} />
      <circle cx="36" cy="12" r="3.6" />
      <circle cx="60" cy="12" r="3.6" />
      <Limb d="M42 34 36 13" w={ARM} />
      <Limb d="m54 34 6-21" w={ARM} />
      <Limb d="M48 33v20" w={TORSO} />
      <Limb d="M45 53 39 64" w={9} />
      <Limb d="m51 53 6 11" w={9} />
      <Head x={48} y={24} />
    </Scene>
  );
}

// Seated under the machine, bar pulled down past the chin.
function LatPulldown() {
  return (
    <Scene
      cut={
        <>
          <path d="M42 38c-3 3-4 6-4 9" />
          <path d="M54 38c3 3 4 6 4 9" />
        </>
      }
    >
      <Post x={44} y={0} h={8} w={8} />
      <Cable d="M48 6v13" />
      <Pad x={24} y={17} w={48} h={4.4} />
      <Post x={22} y={13} h={4} w={6} a={-28} />
      <Post x={68} y={13} h={4} w={6} a={28} />
      <circle cx="35" cy="20" r="3.6" />
      <circle cx="61" cy="20" r="3.6" />
      <Limb d="M42 41 35 21" w={ARM} />
      <Limb d="m54 41 7-20" w={ARM} />
      <Limb d="M48 40v16" w={TORSO} />
      <Limb d="M44 57 42 66" w={9} />
      <Limb d="m52 57 2 9" w={9} />
      <Head x={48} y={32} />
      <Pad x={32} y={53} w={32} h={5} />
      <Pad x={36} y={59} w={26} h={6} />
      <Post x={45} y={64} h={6} />
      <Floor x={26} w={44} />
    </Scene>
  );
}

// Bent-over row: back flat, bar pulled to the waist.
function Row() {
  return (
    <Scene
      cut={
        <>
          <path d="M30 26c-3 4-4 8-4 12" />
          <path d="M14 36A4.6 10 0 0 1 14 56" />
          <path d="M52 34c4 4 5 8 5 12" />
        </>
      }
    >
      <Limb d="M31 29 34 42l-4 3" w={ARM} />
      <Limb d="M30 27 58 34" w={TORSO} />
      <Limb d="m58 35 4 15" w={THIGH} />
      <Limb d="M62 50 60 66" w={SHIN} />
      <Limb d="M55 69h13" w={FOOT} />
      <Joint x={31} y={29} />
      <Head x={21} y={23} />
      <Barbell x1={14} x2={48} y={46} ry={10} />
      <circle cx="30" cy="46" r="3.4" />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Seated cable row: legs braced forward, handle drawn to the navel.
function CableRow() {
  return (
    <Scene
      cut={
        <>
          <path d="M31 36c4 3 6 6 7 10" />
          <path d="M30 52c4 3 6 6 6 9" />
        </>
      }
    >
      <Post x={82} y={14} h={54} />
      <Stack x={66} y={22} n={4} />
      <Cable d="M80 44 56 44" />
      <Pad x={51} y={37} w={5} h={14} />
      <Limb d="M28 36 41 42l12 2" w={ARM} />
      <Limb d="M25 34v18" w={TORSO} />
      <Limb d="m26 53 22 2" w={THIGH} />
      <Limb d="M48 55 65 52" w={SHIN} />
      <Limb d="M68 46v10" w={FOOT} />
      <Joint x={28} y={36} />
      <Head x={25} y={25} />
      <Pad x={10} y={58} w={58} h={5} />
      <Post x={16} y={62} h={8} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Shrug: shoulders driven up toward the ears, arms hanging loaded.
function Shrug() {
  return (
    <Scene
      cut={
        <>
          <path d="M41 20c-2 3-3 6-3 9" />
          <path d="M55 20c2 3 3 6 3 9" />
          <path d="M42 21a6.5 6.5 0 0 0 12 0" />
        </>
      }
    >
      <Dumbbell x={34} y={50} a={90} />
      <Dumbbell x={62} y={50} a={90} />
      <Limb d="M38 27 36 45" w={ARM} />
      <Limb d="m58 27 2 18" w={ARM} />
      <Limb d="M48 28v20" w={TORSO} />
      <Limb d="M38 27 48 22 58 27" w={9} />
      <Limb d="M45 48 42 66" w={9} />
      <Limb d="m51 48 3 18" w={9} />
      <Limb d="M39 69h8" w={FOOT} />
      <Limb d="M49 69h8" w={FOOT} />
      <Head x={48} y={15} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// --- Arms ------------------------------------------------------------------

// Barbell curl, front view: elbows fixed, bar swept up to the chest.
function Curl() {
  return (
    <Scene
      cut={
        <>
          <path d="M40 22c-3 3-4 6-4 9" />
          <path d="M56 22c3 3 4 6 4 9" />
          <path d="M20 20A4 9 0 0 1 20 38" />
          <path d="M76 20A4 9 0 0 0 76 38" />
        </>
      }
    >
      <Limb d="M42 28 40 43" w={ARM} />
      <Limb d="m40 43 4-10" w={ARM} />
      <Limb d="m54 28 2 15" w={ARM} />
      <Limb d="m56 43-4-10" w={ARM} />
      <Joint x={40} y={43} r={3.4} />
      <Joint x={56} y={43} r={3.4} />
      <Limb d="M48 25v24" w={TORSO} />
      <Limb d="M45 49 42 66" w={9} />
      <Limb d="m51 49 3 17" w={9} />
      <Limb d="M39 69h8" w={FOOT} />
      <Limb d="M49 69h8" w={FOOT} />
      <Head x={48} y={15} />
      <Barbell x1={22} x2={74} y={32} rx={4} ry={9} />
      <circle cx="44" cy="32" r="3.4" />
      <circle cx="52" cy="32" r="3.4" />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Incline curl: back on the incline bench, arms hanging behind the torso.
function InclineCurl() {
  return (
    <Scene
      cut={
        <>
          <path d="M50 32c4 5 5 11 3 16" />
          <path d="m36 54-9 9" />
          <path d="M55 44c3 2 5 4 6 7" />
        </>
      }
    >
      <Post x={30} y={56} h={14} />
      <Pad x={25} y={39.5} w={44} a={-45} />
      <Pad x={22} y={51} w={20} />
      <Limb d="M40 52 57 35" w={TORSO} />
      <Limb d="m38 53-12 8" w={THIGH} />
      <Limb d="M26 61 20 68" w={SHIN} />
      <Limb d="M17 70h9" w={FOOT} />
      <Limb d="M57 36 59 52" w={ARM} />
      <Joint x={56} y={34} />
      <Head x={63} y={26} />
      <Dumbbell x={60} y={58} a={90} />
      <Floor x={12} w={56} />
    </Scene>
  );
}

// Preacher curl: upper arms locked down the pad, forearms swept up.
function PreacherCurl() {
  return (
    <Scene
      cut={
        <>
          <path d="M32 28c-4 4-6 8-6 12" />
          <path d="M46 26A3.4 8 0 0 1 46 42" />
          <path d="M34 54c5 1 9 3 12 6" />
        </>
      }
    >
      <Post x={44} y={50} h={20} />
      <Pad x={25.5} y={38.5} w={27} h={7} a={36} />
      <Limb d="M28 35 49 50" w={ARM} />
      <Limb d="m49 50 5-14" w={ARM} />
      <Limb d="M26 32 29 51" w={TORSO} />
      <Limb d="m29 52 15 3" w={THIGH} />
      <Limb d="M44 55 42 66" w={SHIN} />
      <Limb d="M37 69h12" w={FOOT} />
      <Joint x={28} y={34} />
      <Head x={22} y={23} />
      <Barbell x1={46} x2={66} y={34} rx={3.4} ry={8} />
      <Pad x={14} y={54} w={22} h={6} />
      <Post x={18} y={59} h={11} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Hammer curl: same hinge, dumbbells kept in a neutral grip.
function HammerCurl() {
  return (
    <Scene
      cut={
        <>
          <path d="M40 22c-3 3-4 6-4 9" />
          <path d="M56 22c3 3 4 6 4 9" />
        </>
      }
    >
      <Limb d="M42 28 39 43" w={ARM} />
      <Limb d="m39 43-3-9" w={ARM} />
      <Limb d="m54 28 3 15" w={ARM} />
      <Limb d="m57 43 3-9" w={ARM} />
      <Joint x={39} y={43} r={3.4} />
      <Joint x={57} y={43} r={3.4} />
      <Limb d="M48 25v24" w={TORSO} />
      <Limb d="M45 49 42 66" w={9} />
      <Limb d="m51 49 3 17" w={9} />
      <Limb d="M39 69h8" w={FOOT} />
      <Limb d="M49 69h8" w={FOOT} />
      <Head x={48} y={15} />
      <Dumbbell x={34} y={32} a={90} len={13} rx={3} ry={6.4} />
      <Dumbbell x={62} y={32} a={90} len={13} rx={3} ry={6.4} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// --- Legs ------------------------------------------------------------------

// Back squat at depth, bar racked across the traps.
function Squat() {
  return (
    <Scene
      cut={
        <>
          <path d="M12 14A4.6 12 0 0 1 12 38" />
          <path d="M76 14A4.6 12 0 0 0 76 38" />
          <path d="M44 30c-3 4-4 8-4 12" />
          <path d="m60 42 3 12" />
        </>
      }
    >
      <Limb d="M41 25 46 42" w={TORSO} />
      <Limb d="m46 43 16 5" w={THIGH} />
      <Limb d="M62 48 60 66" w={SHIN} />
      <Limb d="M55 69h13" w={FOOT} />
      <Head x={39} y={12} />
      <Barbell x1={12} x2={76} y={25} ry={12} />
      <Limb d="M42 26 37 33" w={ARM} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Front squat: bar racked on the front delts, torso upright, elbows driven up.
function FrontSquat() {
  return (
    <Scene
      cut={
        <>
          <path d="M14 12A4.6 12 0 0 1 14 36" />
          <path d="M78 12A4.6 12 0 0 0 78 36" />
          <path d="M44 30c-2 4-2 8-1 12" />
          <path d="m60 43 3 12" />
        </>
      }
    >
      <Limb d="M43 25 46 43" w={TORSO} />
      <Limb d="m46 44 16 5" w={THIGH} />
      <Limb d="M62 49 60 66" w={SHIN} />
      <Limb d="M55 69h13" w={FOOT} />
      <Head x={40} y={12} />
      <Barbell x1={14} x2={78} y={24} ry={12} />
      <Limb d="M44 28 57 23" w={ARM} />
      <Joint x={44} y={27} r={3.8} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Hack squat: back on the angled sled, feet planted on the footplate.
function HackSquat() {
  return (
    <Scene
      cut={
        <>
          <path d="M40 30c4 4 6 8 6 13" />
          <path d="M56 44c4 1 7 3 9 6" />
        </>
      }
    >
      <Post x={12} y={56} h={5} w={72} a={-30} />
      <ellipse cx="20" cy="34" rx="4.6" ry="10" />
      <Pad x={26} y={36.5} w={29} h={7} a={56} />
      <Pad x={22} y={20} w={16} h={6} a={-30} />
      <Limb d="M36 32 45 49" w={TORSO} />
      <Limb d="m46 49 18-2" w={THIGH} />
      <Limb d="M64 47 66 60" w={SHIN} />
      <Limb d="M62 64h12" w={FOOT} />
      <Limb d="M37 33 30 26" w={ARM} />
      <Joint x={36} y={32} />
      <Head x={33} y={22} />
      <Pad x={58} y={62} w={28} h={6} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Reclined in the sled, legs driving the platform up the rail.
function LegPress() {
  return (
    <Scene
      cut={
        <>
          <path d="M36 42c4 3 6 7 6 11" />
          <path d="M58 32c3 3 4 6 4 9" />
        </>
      }
    >
      <Post x={24} y={56} h={5} w={62} a={-24} />
      <Post x={74} y={10} h={30} w={6} a={-38} />
      <Pad x={68} y={12} w={7} h={26} a={-38} />
      <ellipse cx="88" cy="18" rx="4.6" ry="10" />
      <Limb d="M23 44 41 50" w={TORSO} />
      <Limb d="m42 50 17-12" w={THIGH} />
      <Limb d="M59 38 70 28" w={SHIN} />
      <Limb d="m71 25 5 4" w={FOOT} />
      <Joint x={23} y={44} />
      <Head x={14} y={40} />
      <Pad x={8} y={44} w={20} h={7} a={16} />
      <Post x={12} y={50} h={16} />
      <Floor x={8} y={64} w={80} />
    </Scene>
  );
}

// Split stance, back knee dropped toward the floor.
function Lunge() {
  return (
    <Scene
      cut={
        <>
          <path d="M36 26c-3 4-4 8-4 12" />
          <path d="M44 42c-6 3-9 7-11 11" />
          <path d="M56 46c3 4 4 8 4 12" />
        </>
      }
    >
      <Dumbbell x={29} y={49} a={90} />
      <Dumbbell x={53} y={45} a={90} />
      <Limb d="M40 24v17" w={TORSO} />
      <Limb d="m41 42 16 5" w={THIGH} />
      <Limb d="M57 47 57 65" w={SHIN} />
      <Limb d="M51 69h14" w={FOOT} />
      <Limb d="M39 42 26 53" w={THIGH} />
      <Limb d="m26 54 8 11" w={SHIN} />
      <Limb d="M32 68h9" w={FOOT} />
      <Limb d="M37 26 31 44" w={ARM} />
      <Limb d="m43 26 8 16" w={ARM} />
      <Head x={40} y={13} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Bulgarian split squat: rear foot parked on a bench.
function BulgarianSquat() {
  return (
    <Scene
      cut={
        <>
          <path d="M44 26c-3 4-4 8-4 12" />
          <path d="M52 42c-5 3-8 7-9 11" />
          <path d="M64 46c3 4 4 8 4 12" />
        </>
      }
    >
      <Pad x={8} y={48} w={30} h={5.4} />
      <Post x={13} y={53} h={16} />
      <Post x={30} y={53} h={16} />
      <Dumbbell x={37} y={49} a={90} />
      <Dumbbell x={61} y={45} a={90} />
      <Limb d="M48 24v17" w={TORSO} />
      <Limb d="m49 42 16 5" w={THIGH} />
      <Limb d="M65 47 65 65" w={SHIN} />
      <Limb d="M59 69h14" w={FOOT} />
      <Limb d="M47 42 35 51" w={THIGH} />
      <Limb d="M35 51 27 47" w={SHIN} />
      <Limb d="M45 26 39 44" w={ARM} />
      <Limb d="m51 26 8 16" w={ARM} />
      <Head x={48} y={13} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Seated machine, shins swung up against the ankle roller.
function LegExtension() {
  return (
    <Scene
      cut={
        <>
          <path d="M30 40c4 3 6 6 6 10" />
          <path d="M48 46c3 2 4 5 4 8" />
        </>
      }
    >
      <Post x={12} y={26} h={30} w={7} />
      <Post x={54} y={44} h={24} />
      <Stack x={74} y={20} n={4} />
      <Cable d="M58 46 74 26" />
      <Limb d="M28 36v16" w={TORSO} />
      <Limb d="m29 53 19-1" w={THIGH} />
      <Limb d="M48 52 67 43" w={SHIN} />
      <Limb d="m70 40 5-3" w={FOOT} />
      <Roller x={69} y={41} r={4.8} />
      <Head x={28} y={26} />
      <Pad x={16} y={57} w={36} h={6} />
      <Floor x={10} w={76} />
    </Scene>
  );
}

// Deadlift: hips loaded behind, flat back, bar pulled off the floor.
function Deadlift() {
  return (
    <Scene
      cut={
        <>
          <path d="M28 24c-3 4-4 8-4 12" />
          <path d="M16 46A4.6 11 0 0 1 16 68" />
          <path d="M52 34c4 4 5 8 5 12" />
        </>
      }
    >
      <Limb d="M31 28 30 52" w={ARM} />
      <Limb d="M30 26 56 34" w={TORSO} />
      <Limb d="m57 35 5 13" w={THIGH} />
      <Limb d="M62 48 58 66" w={SHIN} />
      <Limb d="M53 69h13" w={FOOT} />
      <Joint x={31} y={28} />
      <Head x={21} y={21} />
      <Barbell x1={16} x2={46} y={56} />
      <circle cx="30" cy="56" r="3.4" />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Pull-over: lying across the bench, arms swept back over the head.
function Pullover() {
  return (
    <Scene
      cut={
        <>
          <path d="M34 34c3 4 4 8 4 12" />
          <path d="M62 47c4 4 5 8 5 12" />
        </>
      }
    >
      <Dumbbell x={16} y={22} a={-52} len={13} rx={3.2} ry={7} />
      <Limb d="M42 45 20 26" w={ARM} />
      <Limb d="M42 46 62 44" w={TORSO} />
      <Limb d="m63 45 15 6" w={THIGH} />
      <Limb d="M78 51 79 63" w={SHIN} />
      <Limb d="M77 69h11" w={FOOT} />
      <Joint x={42} y={45} />
      <Head x={31} y={48} />
      <Pad x={14} y={53} w={64} h={5.4} />
      <Post x={20} y={58} h={11} />
      <Post x={68} y={58} h={11} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Prone on the machine, heels curled up against the roller.
function LegCurl() {
  return (
    <Scene
      cut={
        <>
          <path d="M28 34c4 2 6 5 6 8" />
          <path d="M56 38c3 2 4 5 4 8" />
        </>
      }
    >
      <Post x={70} y={22} h={42} />
      <Stack x={76} y={30} n={4} />
      <Limb d="M23 40 47 42" w={TORSO} />
      <Limb d="m48 43 14 2" w={THIGH} />
      <Limb d="M63 44 65 28" w={SHIN} />
      <Roller x={66} y={25} r={4.8} />
      <Joint x={23} y={40} />
      <Head x={14} y={37} />
      <Pad x={10} y={45} w={52} h={6} />
      <Post x={16} y={50} h={16} />
      <Post x={50} y={50} h={16} />
      <Floor x={8} y={64} w={80} />
    </Scene>
  );
}

// Shoulders on the bench, bar loaded across the hips, knees at 90.
function HipThrust() {
  return (
    <Scene
      cut={
        <>
          <path d="M30 22A4.6 11 0 0 1 30 44" />
          <path d="M70 22A4.6 11 0 0 0 70 44" />
          <path d="M52 44c4 3 6 6 6 9" />
        </>
      }
    >
      <Pad x={6} y={32} w={32} h={6} />
      <Post x={11} y={37} h={31} />
      <Limb d="M22 37 50 39" w={TORSO} />
      <Limb d="m51 40 17 6" w={THIGH} />
      <Limb d="M68 46 66 64" w={SHIN} />
      <Limb d="M61 69h13" w={FOOT} />
      <Joint x={22} y={37} />
      <Head x={13} y={29} />
      <Barbell x1={30} x2={70} y={31} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Seated abduction machine, knees driving out against the pads.
function HipAbduction() {
  return (
    <Scene
      cut={
        <>
          <path d="M40 42c-5 3-8 6-10 10" />
          <path d="M56 42c5 3 8 6 10 10" />
        </>
      }
    >
      <Post x={12} y={40} h={28} />
      <Post x={79} y={40} h={28} />
      <Pad x={19} y={45} w={6} h={17} />
      <Pad x={71} y={45} w={6} h={17} />
      <Limb d="M48 26v18" w={TORSO} />
      <Limb d="m45 45-17 9" w={THIGH} />
      <Limb d="M28 54 24 66" w={SHIN} />
      <Limb d="m51 45 17 9" w={THIGH} />
      <Limb d="M68 54 72 66" w={SHIN} />
      <Limb d="M41 43 34 34" w={ARM} />
      <Limb d="m55 43 7-9" w={ARM} />
      <Head x={48} y={16} />
      <Pad x={34} y={50} w={28} h={6} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Standing on the step, heels driven above the edge.
function CalfRaise() {
  return (
    <Scene
      cut={
        <>
          <path d="M42 22c-2 3-3 6-3 9" />
          <path d="M54 22c2 3 3 6 3 9" />
        </>
      }
    >
      <Limb d="M48 26v20" w={TORSO} />
      <Limb d="M45 46 44 57" w={9} />
      <Limb d="m51 46 1 11" w={9} />
      <Limb d="m43 58 8 3.6" w={FOOT} />
      <Limb d="m53 58 4 3.6" w={FOOT} />
      <Limb d="M42 28 38 47" w={ARM} />
      <Dumbbell x={36} y={51} a={90} />
      <Head x={48} y={15} />
      <rect x="46" y="60" width="24" height="6" rx="2" />
      <Floor x={8} y={69} w={80} />
    </Scene>
  );
}

// --- Core ------------------------------------------------------------------

// Knees folded, shoulders curled off the mat, hands at the temples.
function Crunch() {
  return (
    <Scene
      cut={
        <>
          <path d="M46 44c-3 3-5 6-6 10" />
          <path d="M70 46c3 3 4 7 4 10" />
        </>
      }
    >
      <Limb d="M58 57 45 46" w={TORSO} />
      <Limb d="m59 57 15-9" w={THIGH} />
      <Limb d="M75 48 78 62" w={SHIN} />
      <Limb d="M74 69h12" w={FOOT} />
      <Limb d="M46 45 39 41" w={ARM} />
      <Joint x={45} y={46} />
      <Head x={35} y={40} />
      <Floor x={8} y={64} w={80} />
    </Scene>
  );
}

// Flat on the mat, legs stacked straight over the hips.
function LegRaise() {
  return (
    <Scene
      cut={
        <>
          <path d="M28 50c3 3 4 6 4 10" />
          <path d="M60 48c4 1 7 3 9 6" />
        </>
      }
    >
      <Limb d="M27 58 52 60" w={TORSO} />
      <Limb d="m53 60 11-21" w={THIGH} />
      <Limb d="M64 39 72 21" w={SHIN} />
      <Limb d="m74 19 6-3" w={FOOT} />
      <Limb d="M28 58 21 62" w={ARM} />
      <Joint x={27} y={58} />
      <Head x={18} y={55} />
      <Floor x={8} y={64} w={80} />
    </Scene>
  );
}

// Balanced on the seat bones, torso rotated with a plate across the body.
function RussianTwist() {
  return (
    <Scene
      cut={
        <>
          <path d="M38 42c-2 5-2 9 0 13" />
          <path d="M52 52c4 2 6 5 7 8" />
        </>
      }
    >
      <Limb d="M44 58 39 38" w={TORSO} />
      <Limb d="m45 58 17-7" w={THIGH} />
      <Limb d="M62 51 75 57" w={SHIN} />
      <Limb d="m77 59 6 2" w={FOOT} />
      <Limb d="M40 40 52 46" w={ARM} />
      <Joint x={39} y={39} />
      <Head x={35} y={28} />
      <circle cx="58" cy="48" r="7" />
      <Floor x={8} w={80} />
    </Scene>
  );
}

// Per-exercise pictograms. Ids are the same permanent keys used in the
// catalog; a new exercise falls back to the generic pattern drawing below
// until it gets one here.
const iconById: Record<string, () => React.ReactElement> = {
  "bench-press": BenchPress,
  "vertical-chest-press": VerticalChestPress,
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
  "incline-curl": InclineCurl,
  "preacher-curl": PreacherCurl,
  "hammer-curl": HammerCurl,
  squat: Squat,
  "front-squat": FrontSquat,
  "hack-squat": HackSquat,
  "leg-press": LegPress,
  lunge: Lunge,
  "bulgarian-squat": BulgarianSquat,
  "leg-extension": LegExtension,
  "romanian-deadlift": Deadlift,
  pullover: Pullover,
  "leg-curl": LegCurl,
  "hip-thrust": HipThrust,
  "hip-abduction": HipAbduction,
  "calf-raise": CalfRaise,
  crunch: Crunch,
  "leg-raise": LegRaise,
  "russian-twist": RussianTwist,
};

// Fallback for an exercise added to the catalog before it gets a drawing:
// one generic figure per movement pattern, in the same visual system.
function PatternIcon({ pattern }: { pattern: Exercise["pattern"] }) {
  if (pattern === "legs") {
    return (
      <Scene cut={<path d="M44 30c-3 4-4 8-4 12" />}>
        <Limb d="M41 25 46 42" w={TORSO} />
        <Limb d="m46 43 16 5" w={THIGH} />
        <Limb d="M62 48 60 66" w={SHIN} />
        <Limb d="M55 69h13" w={FOOT} />
        <Limb d="M42 26 37 33" w={ARM} />
        <Head x={39} y={12} />
        <Barbell x1={12} x2={76} y={25} ry={12} />
        <Floor x={8} w={80} />
      </Scene>
    );
  }
  if (pattern === "core") {
    return (
      <Scene cut={<path d="M46 44c-3 3-5 6-6 10" />}>
        <Limb d="M58 57 45 46" w={TORSO} />
        <Limb d="m59 57 15-9" w={THIGH} />
        <Limb d="M75 48 78 62" w={SHIN} />
        <Limb d="M74 69h12" w={FOOT} />
        <Limb d="M46 45 39 41" w={ARM} />
        <Joint x={45} y={46} />
        <Head x={35} y={40} />
        <Floor x={8} y={64} w={80} />
      </Scene>
    );
  }
  if (pattern === "pull") {
    return (
      <Scene
        cut={
          <>
            <path d="M42 32c-3 3-4 6-4 9" />
            <path d="M54 32c3 3 4 6 4 9" />
          </>
        }
      >
        <Pad x={8} y={8} w={80} h={4.4} />
        <Limb d="M42 34 36 13" w={ARM} />
        <Limb d="m54 34 6-21" w={ARM} />
        <Limb d="M48 33v20" w={TORSO} />
        <Limb d="M45 53 39 64" w={9} />
        <Limb d="m51 53 6 11" w={9} />
        <Head x={48} y={24} />
      </Scene>
    );
  }
  return (
    <Scene
      cut={
        <>
          <path d="M42 30c-3 3-4 6-4 9" />
          <path d="M54 30c3 3 4 6 4 9" />
        </>
      }
    >
      <Barbell x1={18} x2={78} y={13} ry={10} />
      <Limb d="M41 33 38 15" w={ARM} />
      <Limb d="m55 33 3-18" w={ARM} />
      <Limb d="M48 32v20" w={TORSO} />
      <Limb d="M45 52 42 66" w={9} />
      <Limb d="m51 52 3 14" w={9} />
      <Limb d="M39 69h8" w={FOOT} />
      <Limb d="M49 69h8" w={FOOT} />
      <Head x={48} y={24} />
      <Floor x={8} w={80} />
    </Scene>
  );
}

export function ExerciseIcon({ exercise }: { exercise: Exercise }) {
  const Specific = iconById[exercise.id];
  if (Specific) return <Specific />;
  return <PatternIcon pattern={exercise.pattern} />;
}
