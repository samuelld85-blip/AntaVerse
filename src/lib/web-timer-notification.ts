import type { AntaverseTimerPlugin, TimerStartOptions } from "./native-timer";

const TIMER_TAG = "antaverse-rest-timer";
const TIMER_URL = "/sport/?section=training";

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

async function showNotification(title: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    await registration.showNotification(title, {
      body: "Repos en cours · touchez pour revenir à AntaVerse",
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

async function start(options: TimerStartOptions) {
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // Permission prompts are optional and can be rejected by browser policy.
    }
  }

  // Browsers cannot update a notification in place reliably (especially on iOS).
  // Keep one stable, clickable notification instead of recreating it every second.
  await showNotification(options.title);
}

async function stop() {
  await closeNotifications();
}

export const WebTimerNotification: AntaverseTimerPlugin = { start, stop };
