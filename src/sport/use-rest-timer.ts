"use client";
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { AntaverseTimer } from "@/lib/native-timer";

const STORAGE_KEY = "antaverse:sport:rest-timer";
const TIMER_EVENT = "antaverse:sport:rest-timer-change";

type StoredTimer = { endsAt: number };

function readDeadline() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredTimer>;
    return typeof parsed.endsAt === "number" && Number.isFinite(parsed.endsAt)
      ? parsed.endsAt
      : null;
  } catch {
    return null;
  }
}

function writeDeadline(endsAt: number | null) {
  try {
    if (endsAt === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ endsAt } satisfies StoredTimer));
    // A local stop/expiry already updates this hook directly. Emitting here
    // would synchronously turn the terminal 0 into the configured rest value.
    if (endsAt !== null) window.dispatchEvent(new Event(TIMER_EVENT));
  } catch {
    // Private browsing/storage restrictions must not disable the timer.
  }
}

export function useRestTimer() {
  const [remaining, setRemaining] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const deadline = readDeadline();
    return deadline === null ? null : Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  });
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
    const endsAt = Date.now() + seconds * 1000;
    deadline.current = endsAt;
    warned.current = false;
    setRemaining(seconds);
    writeDeadline(endsAt);
    void AntaverseTimer.start({
      endsAt,
      title: "AntaVerse · Repos",
      url: "/sport/?section=training",
    });
  }
  function stop() {
    deadline.current = null;
    setRemaining(null);
    writeDeadline(null);
    void AntaverseTimer.stop();
  }
  useEffect(() => {
    deadline.current = readDeadline();

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
      if (deadline.current === null) {
        const stored = readDeadline();
        if (stored === null) {
          setRemaining(null);
          return;
        }
        deadline.current = stored;
      }
      const activeDeadline = deadline.current;
      if (activeDeadline === null) return;
      const seconds = Math.max(0, Math.ceil((activeDeadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        deadline.current = null;
        writeDeadline(null);
        void AntaverseTimer.stop();
        beep(true);
      } else if (seconds <= 5 && !warned.current) {
        warned.current = true;
        beep(false);
      }
    }
    const interval = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("storage", tick);
    window.addEventListener(TIMER_EVENT, tick);
    tick();
    const canRefreshExternalTimer =
      Capacitor.isNativePlatform() ||
      (typeof Notification !== "undefined" && Notification.permission === "granted");
    if (canRefreshExternalTimer && deadline.current !== null && deadline.current > Date.now()) {
      void AntaverseTimer.start({
        endsAt: deadline.current,
        title: "AntaVerse · Repos",
        url: "/sport/?section=training",
      });
    }
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("storage", tick);
      window.removeEventListener(TIMER_EVENT, tick);
      void audio.current?.close();
      audio.current = null;
    };
  }, []);
  return { remaining, start, stop };
}
