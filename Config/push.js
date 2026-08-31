import { db } from "./firebase-init.js";
import { VAPID_PUBLIC_KEY } from "./firebase-config.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const PUSH_SUBSCRIPTIONS_COLLECTION = "pushSubscriptions";

export function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** True once this browser already has an active push subscription. */
export async function hasActivePushSubscription() {
  if (!pushSupported()) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription && Notification.permission === "granted";
}

/**
 * Requests notification permission, registers the service worker, subscribes
 * to push, and saves the subscription to Firestore under this user.
 * Throws with a human-readable message on failure.
 */
export async function enablePushNotifications(user) {
  if (!pushSupported()) {
    throw new Error("Push notifications aren't supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission wasn't granted.");
  }

  const registration = await navigator.serviceWorker.register("sw.js");
  await navigator.serviceWorker.ready;

  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const json = subscription.toJSON();
  const subscriptionId = await hashEndpoint(subscription.endpoint);

  await setDoc(doc(db, PUSH_SUBSCRIPTIONS_COLLECTION, subscriptionId), {
    ownerId: user.uid,
    endpoint: subscription.endpoint,
    keys: json.keys,
    updatedAt: serverTimestamp(),
  });

  return subscription;
}

async function hashEndpoint(endpoint) {
  const data = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}