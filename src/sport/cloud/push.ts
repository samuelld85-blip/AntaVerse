import { getCloud } from "./client";

export async function enableSportPush(userId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window))
    throw new Error(
      "Sur iPhone, ajoutez Sport à l’écran d’accueil puis ouvrez-le depuis son icône. Ce navigateur doit prendre en charge les notifications web.",
    );
  const key = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  if (!key) throw new Error("Les notifications ne sont pas encore activées sur le serveur.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error(
      "Notifications non autorisées. Vous pouvez modifier ce choix dans les réglages du navigateur.",
    );
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration?.active)
    throw new Error(
      "Les notifications seront disponibles dans l’application web publiée. Rechargez la page puis réessayez.",
    );
  const publicKey = Uint8Array.from(atob(key.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
    c.charCodeAt(0),
  );
  let subscription = await registration.pushManager.getSubscription();
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicKey,
  });
  const json = subscription.toJSON();
  const { error } = await getCloud()!.from("push_subscriptions").upsert({
    endpoint: subscription.endpoint,
    user_id: userId,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
  });
  if (error)
    throw new Error(
      "L’abonnement n’a pas pu être enregistré. Réessayez lorsque vous êtes connecté.",
    );
}
export async function disableSportPush() {
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager?.getSubscription();
  if (!subscription) return;
  const { error } = await getCloud()!
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", subscription.endpoint);
  if (error)
    throw new Error(
      "Impossible de désactiver les notifications pour le moment. Réessayez en ligne.",
    );
  await subscription.unsubscribe();
}
