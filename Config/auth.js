import { auth } from "./firebase-init.js";
import { ADMIN_EMAILS } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

export { auth };

export function isAdmin(user) {
  return !!user && ADMIN_EMAILS.includes((user.email || "").toLowerCase());
}

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function doSignOut() {
  return firebaseSignOut(auth);
}

/** Friendlier text for the Firebase Auth error codes people actually hit. */
export function describeAuthError(error) {
  const code = error && error.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account. Try signing in instead.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Use at least 6 characters for your password.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match an account.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before finishing.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a bit and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Fills the page's #topbar-user slot with the signed-in person's email,
 * an Admin badge when it applies, and a sign-out button.
 */
export function renderTopbarUser(user) {
  const slot = document.getElementById("topbar-user");
  if (!slot) return;

  slot.innerHTML = `
    <span class="topbar-user__email">${escapeHtml(user.email || "")}</span>
    ${isAdmin(user) ? '<span class="badge-admin">Admin</span>' : ""}
    <button id="topbar-signout" class="btn btn-ghost">Sign out</button>
  `;

  document.getElementById("topbar-signout").addEventListener("click", () => {
    doSignOut();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Gates a page behind sign-in. Call once per page.
 * Redirects to account.html if nobody's signed in; otherwise renders the
 * topbar user info, reveals the page, and calls onReady(user).
 */
export function requireAuth(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "account.html";
      return;
    }
    renderTopbarUser(user);
    document.body.classList.remove("auth-pending");
    onReady(user);
  });
}