import { auth } from "./firebase-init.js";
import { ADMIN_USERNAMES, USERNAME_DOMAIN } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

export { auth };

const USERNAME_PATTERN = /^[a-z0-9_.-]{3,24}$/i;

export function isValidUsername(username) {
  return USERNAME_PATTERN.test(username);
}

function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export function getUsername(user) {
  if (!user) return "";
  if (user.displayName) return user.displayName;
  return (user.email || "").split("@")[0];
}

export function isAdmin(user) {
  const username = getUsername(user).toLowerCase();
  return !!username && ADMIN_USERNAMES.map((u) => u.toLowerCase()).includes(username);
}

export async function signUpWithUsername(username, password) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    usernameToEmail(username),
    password
  );
  await updateProfile(credential.user, { displayName: username });
  return credential;
}

export function signInWithUsername(username, password) {
  return signInWithEmailAndPassword(auth, usernameToEmail(username), password);
}

export function doSignOut() {
  return firebaseSignOut(auth);
}

/** Friendlier text for the Firebase Auth error codes people actually hit. */
export function describeAuthError(error) {
  const code = error && error.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "That username is already taken. Try signing in instead.";
    case "auth/weak-password":
      return "Use at least 6 characters for your password.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That username and password don't match an account.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a bit and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Fills the page's #topbar-user slot with the signed-in person's username,
 * an Admin badge when it applies, and a sign-out button.
 */
export function renderTopbarUser(user) {
  const slot = document.getElementById("topbar-user");
  if (!slot) return;

  slot.innerHTML = `
    <span class="topbar-user__email">${escapeHtml(getUsername(user))}</span>
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