import {
  auth,
  signUpWithUsername,
  signInWithUsername,
  doSignOut,
  isAdmin,
  getUsername,
  isValidUsername,
  describeAuthError,
} from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const signedOutPanel = document.getElementById("signed-out-panel");
const signedInPanel = document.getElementById("signed-in-panel");
const tabSignIn = document.getElementById("tab-signin");
const tabSignUp = document.getElementById("tab-signup");
const authForm = document.getElementById("auth-form");
const usernameInput = document.getElementById("auth-username");
const passwordInput = document.getElementById("auth-password");
const submitBtn = document.getElementById("auth-submit");
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

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!isValidUsername(username)) {
    errorEl.textContent = "Usernames are 3-24 characters: letters, numbers, . _ or -.";
    return;
  }

  submitBtn.disabled = true;
  try {
    if (mode === "signin") {
      await signInWithUsername(username, password);
    } else {
      await signUpWithUsername(username, password);
    }
  } catch (err) {
    errorEl.textContent = describeAuthError(err);
  } finally {
    submitBtn.disabled = false;
  }
});

document.getElementById("go-signout").addEventListener("click", () => {
  doSignOut();
});

onAuthStateChanged(auth, (user) => {
  document.body.classList.remove("auth-pending");
  if (user) {
    signedOutPanel.classList.add("is-hidden");
    signedInPanel.classList.remove("is-hidden");
    document.getElementById("signed-in-username").textContent = getUsername(user);
    document.getElementById("signed-in-badge").innerHTML = isAdmin(user)
      ? '<span class="badge-admin">Admin</span>'
      : "";
  } else {
    signedInPanel.classList.add("is-hidden");
    signedOutPanel.classList.remove("is-hidden");
  }
});