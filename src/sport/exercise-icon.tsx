import type { Exercise } from "./catalog";

// Compact movement pictograms; names remain the authoritative exercise labels.
export function ExerciseIcon({ exercise }: { exercise: Exercise }) {
  const bench = /press|fly/.test(exercise.id) && exercise.primary === "chest";
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
      {bench ? (
        <>
          <path d="M5 29h32M9 29v7M33 29v7M16 23h15l8 11M23 23V9M12 8h23M13 4v8M33 4v8" />
          <circle cx="9" cy="22" r="3" />
        </>
      ) : legs ? (
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
