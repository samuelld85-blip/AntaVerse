import { registerPlugin } from "@capacitor/core";

export type TimerStartOptions = {
  endsAt: number;
  title: string;
  url: string;
};

export type AntaverseTimerPlugin = {
  start(options: TimerStartOptions): Promise<{ supported?: boolean } | void>;
  stop(): Promise<void>;
};

// The native implementations keep the timer visible while the WebView is in the
// background. The web implementation below is deliberately lightweight: browsers
// cannot expose a live countdown in the status bar, but an installed PWA can still
// keep a clickable notification in the notification shade.
export const AntaverseTimer = registerPlugin<AntaverseTimerPlugin>("AntaverseTimer", {
  web: () =>
    import("./web-timer-notification").then(({ WebTimerNotification }) => WebTimerNotification),
});
