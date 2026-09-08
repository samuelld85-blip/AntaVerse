import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebTimerNotification } from "./web-timer-notification";

describe("WebTimerNotification", () => {
  const showNotification = vi.fn().mockResolvedValue(undefined);
  const getNotifications = vi.fn().mockResolvedValue([]);
  const registration = { getNotifications, showNotification };
  const getRegistration = vi.fn().mockResolvedValue(registration);
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    showNotification.mockClear();
    getNotifications.mockClear();
    getRegistration.mockClear();
    vi.stubGlobal("Notification", { permission: "granted" });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration },
    });
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it("publishes one stable silent notification without a countdown refresh loop", async () => {
    await WebTimerNotification.start({
      endsAt: Date.now() + 60_000,
      title: "AntaVerse · Repos",
      url: "/sport/?section=training",
    });

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith(
      "AntaVerse · Repos",
      expect.objectContaining({
        tag: "antaverse-rest-timer",
        requireInteraction: true,
        silent: true,
      }),
    );
  });

  it("refreshes one tagged notification for Android without re-alerting", async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Linux; Android 14; Pixel 8)",
    });
    const endsAt = Date.now() + 5_000;

    await WebTimerNotification.start({
      endsAt,
      title: "AntaVerse · Repos",
      url: "/sport/?section=training",
    });
    await vi.advanceTimersByTimeAsync(2_100);

    expect(showNotification).toHaveBeenCalledTimes(3);
    expect(showNotification.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        body: expect.stringContaining("restantes"),
        tag: "antaverse-rest-timer",
        renotify: false,
        silent: true,
      }),
    );

    await WebTimerNotification.stop();
    await vi.advanceTimersByTimeAsync(3_000);
    expect(showNotification).toHaveBeenCalledTimes(3);
  });

  it("closes only the timer notification when the timer stops", async () => {
    await WebTimerNotification.stop();

    expect(getNotifications).toHaveBeenCalledWith({ tag: "antaverse-rest-timer" });
  });
});
