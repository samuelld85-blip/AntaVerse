export function feedback(kind: "found" | "pass" | "fault" | "violation" | "end") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator)
    navigator.vibrate(kind === "end" ? [80, 50, 120] : kind === "found" ? 35 : 20);
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = kind === "found" ? 660 : kind === "end" ? 220 : 330;
    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  } catch {
    /* Le jeu reste entièrement utilisable sans audio. */
  }
}
