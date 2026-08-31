// Runs headless on GitHub's servers on a schedule (see ../.github/workflows/check-timers.yml).
// This is what lets a timer notify you even with your browser fully closed.

const admin = require("firebase-admin");
const webpush = require("web-push");

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TIMERS_COLLECTION = "timers";
const PUSH_SUBSCRIPTIONS_COLLECTION = "pushSubscriptions";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable/secret: ${name}`);
    process.exit(1);
  }
  return value;
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(requireEnv("FIREBASE_SERVICE_ACCOUNT"))),
});
const db = admin.firestore();

webpush.setVapidDetails(
  requireEnv("VAPID_SUBJECT"),
  requireEnv("VAPID_PUBLIC_KEY"),
  requireEnv("VAPID_PRIVATE_KEY")
);

function nextWeeklyTarget(target, now) {
  let next = target;
  while (next <= now) next += WEEK_MS;
  return next;
}

async function sendToOwner(ownerId, payload) {
  const subsSnap = await db
    .collection(PUSH_SUBSCRIPTIONS_COLLECTION)
    .where("ownerId", "==", ownerId)
    .get();

  await Promise.all(
    subsSnap.docs.map(async (subDoc) => {
      const sub = subDoc.data();
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err) {
        // 404/410 = the browser unsubscribed or the subscription expired — clean it up.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await subDoc.ref.delete();
        } else {
          console.error(`Push failed for subscription ${subDoc.id}:`, err.message);
        }
      }
    })
  );
}

async function main() {
  const now = Date.now();

  const dueSnap = await db
    .collection(TIMERS_COLLECTION)
    .where("notified", "==", false)
    .where("target", "<=", now)
    .get();

  if (dueSnap.empty) {
    console.log("No due timers.");
    return;
  }

  console.log(`Found ${dueSnap.size} due timer(s).`);

  for (const timerDoc of dueSnap.docs) {
    const timer = timerDoc.data();

    await sendToOwner(timer.ownerId, {
      title: timer.name || "Timer finished",
      body: timer.repeatWeekly
        ? "Your weekly timer has reached its time."
        : "Your timer has reached its time.",
      tag: timerDoc.id,
    });

    const update = timer.repeatWeekly
      ? { target: nextWeeklyTarget(timer.target, now), notified: false }
      : { notified: true };

    await timerDoc.ref.update(update);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });