import { requireAuth } from "./auth.js";

requireAuth(() => {
  // Nothing else to do on the hub page — the tool cards are static links.
});