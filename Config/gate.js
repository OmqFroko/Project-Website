/* ==========================================================================
   Workshop — password gate. Runs on every protected page.
   NOTE: this is a client-side deterrent only, not real security — the
   password below is visible to anyone who reads this file. Don't put
   anything actually sensitive behind it.
   ========================================================================== */

const GATE_PASSWORD = "admin123";
const GATE_STORAGE_KEY = "workshop-unlocked";

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (input.value === GATE_PASSWORD) {
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