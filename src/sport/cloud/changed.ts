export function notifySaveChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("antaverse:save-changed"));
}
