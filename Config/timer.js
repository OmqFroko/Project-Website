import { requireAuth } from "./auth.js";
import { db } from "./firebase-init.js";
import { pushSupported, hasActivePushSubscription, enablePushNotifications } from "./push.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TIMERS_COLLECTION = "timers";

const banner = document.getElementById("permission-banner");
const enableBtn = document.getElementById("enable-notifications");
const form = document.getElementById("timer-form");
const nameInput = document.getElementById("timer-name");
const dateInput = document.getElementById("timer-date");
const timeInput = document.getElementById("timer-time");
const repeatInput = document.getElementById("timer-repeat");
const formError = document.getElementById("form-error");
const list = document.getElementById("timer-list");
const emptyState = document.getElementById("empty-state");

const notificationsSupported = "Notification" in window;

/** @type {{id:string, name:string, target:number, notified:boolean, repeatWeekly:boolean}[]} */
let timers = [];
let currentUser = null;
const inFlight = new Set(); // doc ids currently being written, to avoid double-firing

requireAuth((user) => {
  currentUser = user;
  renderBanner();
  watchTimers();
  setInterval(tick, 1000);
});

/* ---------------- Firestore sync ---------------- */

function watchTimers() {
  const timersQuery = query(
    collection(db, TIMERS_COLLECTION),
    where("ownerId", "==", currentUser.uid)
  );

  onSnapshot(timersQuery, (snapshot) => {
    timers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderList();
  });
}

/* ---------------- notification / push permission banner ---------------- */

async function renderBanner() {
  if (!notificationsSupported) {
    banner.classList.remove("is-hidden", "is-ok");
    banner.classList.add("is-error");
    banner.querySelector(".banner__text").innerHTML =
      "<strong>Notifications aren't supported</strong> in this browser. Timers will still count down here, but you won't get an alert.";
    enableBtn.style.display = "none";
    return;
  }

  if (Notification.permission === "denied") {
    banner.classList.remove("is-hidden", "is-ok");
    banner.classList.add("is-error");
    banner.querySelector(".banner__text").innerHTML =
      "<strong>Notifications are blocked.</strong> Enable them for this site in your browser's settings to get alerts.";
    enableBtn.style.display = "none";
    return;
  }

  const alreadyEnabled = await hasActivePushSubscription();
  if (alreadyEnabled) {
    banner.classList.add("is-hidden");
    return;
  }

  banner.classList.remove("is-hidden", "is-ok", "is-error");
  banner.querySelector(".banner__text").innerHTML = pushSupported()
    ? "<strong>Notifications are off.</strong> Turn them on to get alerted even if this tab is closed."
    : "<strong>Notifications are off.</strong> Turn them on so a timer can alert you while this tab is open.";
  enableBtn.style.display = "";
  enableBtn.disabled = false;
  enableBtn.textContent = "Turn on notifications";
}

enableBtn.addEventListener("click", async () => {
  enableBtn.disabled = true;
  enableBtn.textContent = "Turning on…";
  try {
    await enablePushNotifications(currentUser);
    await renderBanner();
  } catch (err) {
    banner.classList.remove("is-hidden", "is-ok");
    banner.classList.add("is-error");
    banner.querySelector(".banner__text").innerHTML = `<strong>Couldn't turn that on.</strong> ${escapeHtml(
      err.message || "Please try again."
    )}`;
    enableBtn.disabled = false;
    enableBtn.textContent = "Turn on notifications";
  }
});

/* ---------------- sound + notification on completion ---------------- */

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.16);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.16);
      osc.stop(now + i * 0.16 + 0.32);
    });
  } catch {
    /* audio is a nice-to-have; ignore failures */
  }
}

function fireNotification(timer) {
  if (notificationsSupported && Notification.permission === "granted") {
    try {
      new Notification(timer.name || "Timer finished", {
        body: timer.repeatWeekly
          ? "Your weekly timer has reached its time."
          : "Your timer has reached its time.",
        tag: timer.id,
      });
    } catch {
      /* some browsers require a service worker; fail quietly */
    }
  }
  playChime();
}

/* ---------------- rendering ---------------- */

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return days > 0
    ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatTarget(ts) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderList() {
  const now = Date.now();
  const sorted = [...timers].sort((a, b) => a.target - b.target);

  emptyState.classList.toggle("is-hidden", sorted.length > 0);
  if (sorted.length === 0) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = sorted
    .map((t) => {
      const remaining = t.target - now;
      const done = remaining <= 0 && !t.repeatWeekly;
      return `
        <div class="timer-card bracket ${done ? "is-done" : ""}" data-id="${t.id}">
          <span class="corner tl"></span>
          <span class="corner tr"></span>
          <span class="corner bl"></span>
          <span class="corner br"></span>
          <p class="timer-card__name">
            ${escapeHtml(t.name)}
            ${t.repeatWeekly ? '<span class="timer-card__repeat-tag">Weekly</span>' : ""}
          </p>
          <p class="timer-card__target">${formatTarget(t.target)}</p>
          <p class="timer-card__countdown">${done ? "00:00:00" : formatCountdown(remaining)}</p>
          <div class="timer-card__footer">
            <span class="timer-card__badge">${done ? "✓ Done" : ""}</span>
            <button class="btn btn-danger js-delete" data-id="${t.id}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

list.addEventListener("click", (e) => {
  const btn = e.target.closest(".js-delete");
  if (!btn) return;
  deleteDoc(doc(db, TIMERS_COLLECTION, btn.dataset.id));
});

/* ---------------- form ---------------- */

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";

  const name = nameInput.value.trim();
  const dateVal = dateInput.value;
  const timeVal = timeInput.value;
  const repeatWeekly = repeatInput.checked;

  if (!name || !dateVal || !timeVal) {
    formError.textContent = "Fill in a name, date, and time.";
    return;
  }

  const [y, m, d] = dateVal.split("-").map(Number);
  const [h, mi, se] = timeVal.split(":").map((v) => Number(v) || 0);
  const target = new Date(y, m - 1, d, h, mi, se || 0).getTime();

  if (Number.isNaN(target) || target <= Date.now()) {
    formError.textContent = "Pick a date and time in the future.";
    return;
  }

  try {
    await addDoc(collection(db, TIMERS_COLLECTION), {
      ownerId: currentUser.uid,
      name,
      target,
      notified: false,
      repeatWeekly,
      createdAt: serverTimestamp(),
    });
    form.reset();
  } catch {
    formError.textContent = "Couldn't save that timer. Please try again.";
  }
});

/* ---------------- tick loop ---------------- */

function tick() {
  const now = Date.now();

  for (const t of timers) {
    if (t.notified || inFlight.has(t.id) || now < t.target) continue;

    inFlight.add(t.id);
    fireNotification(t);

    const update = t.repeatWeekly
      ? { target: nextWeeklyTarget(t.target, now), notified: false }
      : { notified: true };

    updateDoc(doc(db, TIMERS_COLLECTION, t.id), update)
      .catch(() => {
        /* the next tick will retry once the snapshot catches up */
      })
      .finally(() => inFlight.delete(t.id));
  }

  renderList();
}

/** Rolls a weekly target forward past "now", in case the tab was closed for a while. */
function nextWeeklyTarget(target, now) {
  let next = target;
  while (next <= now) next += WEEK_MS;
  return next;
}