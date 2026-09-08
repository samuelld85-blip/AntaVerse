import type { AntaverseTimerPlugin, TimerStartOptions } from "./native-timer";

const TIMER_TAG = "antaverse-rest-timer";
const TIMER_URL = "/sport/?section=training";

let updateInterval: number | undefined;
let currentEndsAt: number | null = null;

function formatRemaining(endsAt: number) {
  const seconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

async function closeNotifications() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    const notifications = await registration.getNotifications({ tag: TIMER_TAG });
    notifications.forEach((notification) => notification.close());
  } catch {
    // A browser may have a service worker without exposing notification controls.
  }
}

async function showNotification(endsAt: number, title: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    await registration.showNotification(title, {
      body: `Repos en cours · ${formatRemaining(endsAt)} restantes`,
      tag: TIMER_TAG,
      icon: "/icons/web/icon-192.png",
      badge: "/icons/web/icon-192.png",
      requireInteraction: true,
      silent: true,
      data: { url: TIMER_URL },
    });
  } catch {
    // Notifications are an enhancement; the in-app timer remains authoritative.
  }
}

function stopUpdating() {
  if (updateInterval !== undefined) window.clearInterval(updateInterval);
  updateInterval = undefined;
  currentEndsAt = null;
}

async function start(options: TimerStartOptions) {
  stopUpdating();
  currentEndsAt = options.endsAt;

  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // Permission prompts are optional and can be rejected by browser policy.
    }
  }

  await showNotification(options.endsAt, options.title);
  updateInterval = window.setInterval(() => {
    if (currentEndsAt === null) return;
    if (Date.now() >= currentEndsAt) {
      stopUpdating();
      void closeNotifications();
      return;
    }
    void showNotification(currentEndsAt, options.title);
  }, 1000);
}

async function stop() {
  stopUpdating();
  await closeNotifications();
}

export const WebTimerNotification: AntaverseTimerPlugin = { start, stop };
