

const GATE_PASSWORD_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
const GATE_STORAGE_KEY = "workshop-unlocked";

async function hashPassword(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function unlockSite() {
  document.documentElement.classList.add("wk-unlocked");
}

function showGate() {
  const overlay = document.createElement("div");
  overlay.className = "wk-gate";
  overlay.innerHTML = `
    <form class="wk-gate__form" id="wk-gate-form">
      <p class="wk-gate__label">This workshop is private.</p>
      <input type="password" class="wk-gate__input" id="wk-gate-input"
             placeholder="Password" autocomplete="off" autofocus>
      <button type="submit" class="wk-gate__submit">Unlock</button>
      <p class="wk-gate__error" id="wk-gate-error" hidden>Wrong password.</p>
    </form>
  `;
  document.body.appendChild(overlay);

  const form = overlay.querySelector("#wk-gate-form");
  const input = overlay.querySelector("#wk-gate-input");
  const error = overlay.querySelector("#wk-gate-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const attemptHash = await hashPassword(input.value);
    if (attemptHash === GATE_PASSWORD_HASH) {
      localStorage.setItem(GATE_STORAGE_KEY, "true");
      unlockSite();
      overlay.remove();
      return;
    }

    error.hidden = false;
    input.value = "";
    input.focus();
    form.classList.remove("is-shaking");
    void form.offsetWidth; // restart the shake animation
    form.classList.add("is-shaking");
  });
}

if (localStorage.getItem(GATE_STORAGE_KEY) === "true") {
  unlockSite();
} else {
  showGate();
}