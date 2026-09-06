"use client";
import { useEffect, useRef, useState } from "react";

// Runtime only: neither countdowns nor rest events belong in the training log.
export function useRestTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const deadline = useRef<number | null>(null);
  const warned = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  function prepareAudio() {
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    } catch {}
  }
  function start(seconds: number) {
    prepareAudio();
    deadline.current = Date.now() + seconds * 1000;
    warned.current = false;
    setRemaining(seconds);
  }
  function stop() {
    deadline.current = null;
    setRemaining(null);
  }
  useEffect(() => {
    function beep(final: boolean) {
      const context = audio.current;
      if (!context || context.state !== "running") return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = final ? 880 : 660;
      gain.gain.setValueAtTime(0.15, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.4);
    }
    function tick() {
      if (deadline.current === null) return;
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        deadline.current = null;
        beep(true);
      } else if (seconds <= 5 && !warned.current) {
        warned.current = true;
        beep(false);
      }
    }
    const interval = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      void audio.current?.close();
      audio.current = null;
    };
  }, []);
  return { remaining, start, stop };
}
