import { auth, signUpWithEmail, signInWithEmail, signInWithGoogle, doSignOut, isAdmin, describeAuthError } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const signedOutPanel = document.getElementById("signed-out-panel");
const signedInPanel = document.getElementById("signed-in-panel");
const tabSignIn = document.getElementById("tab-signin");
const tabSignUp = document.getElementById("tab-signup");
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const submitBtn = document.getElementById("auth-submit");
const googleBtn = document.getElementById("auth-google");
const errorEl = document.getElementById("auth-error");

let mode = "signin"; // or "signup"

function setMode(next) {
  mode = next;
  tabSignIn.classList.toggle("is-active", mode === "signin");
  tabSignUp.classList.toggle("is-active", mode === "signup");
  submitBtn.textContent = mode === "signin" ? "Sign in" : "Create account";
  errorEl.textContent = "";
}

tabSignIn.addEventListener("click", () => setMode("signin"));
tabSignUp.addEventListener("click", () => setMode("signup"));

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";
  submitBtn.disabled = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    if (mode === "signin") {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password);
    }
  } catch (err) {
    errorEl.textContent = describeAuthError(err);
  } finally {
    submitBtn.disabled = false;
  }
});

googleBtn.addEventListener("click", async () => {
  errorEl.textContent = "";
  try {
    await signInWithGoogle();
  } catch (err) {
    errorEl.textContent = describeAuthError(err);
  }
});

document.getElementById("go-signout").addEventListener("click", () => {
  doSignOut();
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

onAuthStateChanged(auth, (user) => {
  document.body.classList.remove("auth-pending");
  if (user) {
    signedOutPanel.classList.add("is-hidden");
    signedInPanel.classList.remove("is-hidden");
    document.getElementById("signed-in-email").textContent = user.email || "";
    document.getElementById("signed-in-badge").innerHTML = isAdmin(user)
      ? '<span class="badge-admin">Admin</span>'
      : "";
  } else {
    signedInPanel.classList.add("is-hidden");
    signedOutPanel.classList.remove("is-hidden");
  }
});