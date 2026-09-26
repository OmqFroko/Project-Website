/* ==========================================================================
   Feedback Page — compose a feedback message from shorthand notes.
   Type a note into a "quick add" box; if it contains a saved trigger
   phrase, the trigger's full preset message is inserted instead of what
   you typed. Otherwise your text is added as-is. Everything below is
   editable afterward, and the draft + presets both autosave.
   ========================================================================== */

const PRESETS_STORAGE_KEY = "workshop-feedback-presets";
const DRAFT_STORAGE_KEY = "workshop-feedback-draft";

// The fixed sign-off appended to every generated message.
const SIGN_OFF = "That's all, let me know if you have any questions!\n--/";

let presets = loadPresets();
let draft = loadDraft();
let editingPresetId = null;

/* ---- storage ---- */

function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function savePresets() {
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      username: parsed.username || "",
      eventNotes: parsed.eventNotes || "",
      simNotes: parsed.simNotes || "",
    };
  } catch (error) {
    return { username: "", eventNotes: "", simNotes: "" };
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

/* ---- trigger matching ---- */

function findMatchingPreset(inputText) {
  const lower = inputText.toLowerCase();
  return presets.find((preset) => lower.includes(preset.trigger.toLowerCase()));
}

// How many characters of typed text before partial/prefix matching kicks in.
// Below this, matching only fires once a trigger is fully typed out, to
// avoid every trigger containing a common single letter lighting up.
const MIN_PARTIAL_MATCH_LENGTH = 2;

function lastToken(text) {
  const parts = text.trim().split(/\s+/);
  return parts[parts.length - 1] || "";
}

// Matches presets against text that may still be mid-typing: a trigger
// that's already fully present anywhere, the start of a short trigger,
// or the word currently being typed being a substring of a trigger.
function findMatchingPresets(inputText) {
  const trimmed = inputText.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();
  const token = lastToken(lower);

  return presets.filter((preset) => {
    const trig = preset.trigger.toLowerCase();
    if (lower.includes(trig)) return true;
    if (lower.length >= MIN_PARTIAL_MATCH_LENGTH && trig.includes(lower)) return true;
    if (token.length >= MIN_PARTIAL_MATCH_LENGTH && trig.includes(token)) return true;
    return false;
  });
}

// How many characters of a preset's message to preview in a suggestion row.
const SUGGESTION_PREVIEW_LENGTH = 70;

function previewText(text) {
  return text.length > SUGGESTION_PREVIEW_LENGTH
    ? `${text.slice(0, SUGGESTION_PREVIEW_LENGTH).trim()}…`
    : text;
}

function resolveNoteText(inputText) {
  const match = findMatchingPreset(inputText);
  return match ? match.message : inputText.trim();
}

/* ---- quick-add note builders (shared logic for Event/Sim notes) ---- */

function setupNoteBuilder({ quickAddId, addBtnId, hintId, textareaId, draftKey }) {
  const quickAdd = document.getElementById(quickAddId);
  const addBtn = document.getElementById(addBtnId);
  const hint = document.getElementById(hintId);
  const textarea = document.getElementById(textareaId);

  textarea.value = draft[draftKey];

  function hideHint() {
    hint.hidden = true;
    hint.innerHTML = "";
  }

  function showSuggestions(matches, onSelect) {
    hint.hidden = false;
    hint.innerHTML = matches
      .map(
        (preset) => `
        <div class="note-builder__suggestion">
          <span class="note-builder__suggestion-text">
            <strong>${preset.trigger}</strong> — ${previewText(preset.message)}
          </span>
          <button type="button" class="note-builder__select" data-select-id="${preset.id}">Select</button>
        </div>
      `
      )
      .join("");

    hint.querySelectorAll("[data-select-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const preset = presets.find((item) => item.id === Number(button.dataset.selectId));
        if (preset) onSelect(preset);
      });
    });
  }

  // --- quick-add box: appends the resolved text to the end of the notes ---

  function insertAtEnd(text) {
    textarea.value = textarea.value.trim() ? `${textarea.value.trim()} ${text}` : text;
    draft[draftKey] = textarea.value;
    saveDraft();
    renderOutput();
    quickAdd.value = "";
    hideHint();
    quickAdd.focus();
  }

  quickAdd.addEventListener("input", () => {
    const matches = findMatchingPresets(quickAdd.value);
    if (!matches.length || !quickAdd.value.trim()) {
      hideHint();
      return;
    }
    showSuggestions(matches, (preset) => insertAtEnd(preset.message));
  });

  function addNote() {
    const value = quickAdd.value.trim();
    if (!value) return;
    insertAtEnd(resolveNoteText(value));
  }

  addBtn.addEventListener("click", addNote);
  quickAdd.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addNote();
    }
  });

  // --- typing directly in the textarea: suggests based on the current
  // (last) line, and replaces just that line when you pick one ---

  function getLastLine() {
    const idx = textarea.value.lastIndexOf("\n");
    return idx === -1 ? textarea.value : textarea.value.slice(idx + 1);
  }

  function replaceLastLine(newLine) {
    const idx = textarea.value.lastIndexOf("\n");
    textarea.value = idx === -1 ? newLine : textarea.value.slice(0, idx + 1) + newLine;
    draft[draftKey] = textarea.value;
    saveDraft();
    renderOutput();
    hideHint();
    textarea.focus();
  }

  textarea.addEventListener("input", () => {
    draft[draftKey] = textarea.value;
    saveDraft();
    renderOutput();

    const lastLine = getLastLine();
    const matches = findMatchingPresets(lastLine);
    if (!matches.length || !lastLine.trim()) {
      hideHint();
      return;
    }
    showSuggestions(matches, (preset) => replaceLastLine(preset.message));
  });
}

/* ---- output assembly ---- */

function renderOutput() {
  const output = document.getElementById("feedback-output");
  if (!output) return;

  const username = draft.username.trim() || "Username";
  const eventNotes = draft.eventNotes.trim();
  const simNotes = draft.simNotes.trim();

  output.textContent =
    `**${username}**\n\n${eventNotes}\n\n**Simulation Notes:** ${simNotes}\n\n${SIGN_OFF}`;
}

function setupUsername() {
  const input = document.getElementById("feedback-username");
  input.value = draft.username;
  input.addEventListener("input", () => {
    draft.username = input.value;
    saveDraft();
    renderOutput();
  });
}

function setupCopyButton() {
  const button = document.getElementById("copy-output-btn");
  const output = document.getElementById("feedback-output");
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      const original = button.textContent;
      button.textContent = "Copied!";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1500);
    } catch (error) {
      // Clipboard API unavailable (e.g. non-HTTPS) — nothing more to do here.
    }
  });
}

function setupClearButton() {
  const button = document.getElementById("feedback-clear-btn");
  button.addEventListener("click", () => {
    draft = { username: "", eventNotes: "", simNotes: "" };
    saveDraft();
    document.getElementById("feedback-username").value = "";
    document.getElementById("event-notes").value = "";
    document.getElementById("sim-notes").value = "";
    renderOutput();
  });
}

/* ---- preset manager ---- */

function renderPresetList() {
  const list = document.getElementById("preset-list");
  const empty = document.getElementById("preset-empty");
  if (!list || !empty) return;

  list.innerHTML = "";
  empty.hidden = presets.length > 0;

  presets.forEach((preset) => {
    const card = document.createElement("div");
    card.className = "preset-card";
    card.innerHTML = `
      <div class="preset-card__header">
        <span class="preset-card__trigger">${preset.trigger}</span>
        <div class="preset-card__actions">
          <button type="button" class="preset-card__edit" data-edit-id="${preset.id}">Edit</button>
          <button type="button" class="preset-card__delete" data-delete-id="${preset.id}">Delete</button>
        </div>
      </div>
      <p class="preset-card__message">${preset.message}</p>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-edit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = presets.find((item) => item.id === Number(button.dataset.editId));
      if (!preset) return;
      editingPresetId = preset.id;
      document.getElementById("preset-trigger-input").value = preset.trigger;
      document.getElementById("preset-message-input").value = preset.message;
      document.getElementById("preset-save-btn").textContent = "Update preset";
      document.getElementById("preset-trigger-input").focus();
    });
  });

  list.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => {
      presets = presets.filter((item) => item.id !== Number(button.dataset.deleteId));
      savePresets();
      renderPresetList();
    });
  });
}

function setupPresetForm() {
  const form = document.getElementById("preset-form");
  const triggerInput = document.getElementById("preset-trigger-input");
  const messageInput = document.getElementById("preset-message-input");
  const saveBtn = document.getElementById("preset-save-btn");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const trigger = triggerInput.value.trim();
    const message = messageInput.value.trim();
    if (!trigger || !message) return;

    if (editingPresetId !== null) {
      const preset = presets.find((item) => item.id === editingPresetId);
      if (preset) {
        preset.trigger = trigger;
        preset.message = message;
      }
      editingPresetId = null;
      saveBtn.textContent = "Save preset";
    } else {
      presets.push({ id: Date.now(), trigger, message });
    }

    savePresets();
    renderPresetList();
    triggerInput.value = "";
    messageInput.value = "";
    triggerInput.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupUsername();
  setupNoteBuilder({
    quickAddId: "event-quickadd",
    addBtnId: "event-add-btn",
    hintId: "event-match-hint",
    textareaId: "event-notes",
    draftKey: "eventNotes",
  });
  setupNoteBuilder({
    quickAddId: "sim-quickadd",
    addBtnId: "sim-add-btn",
    hintId: "sim-match-hint",
    textareaId: "sim-notes",
    draftKey: "simNotes",
  });
  setupCopyButton();
  setupClearButton();
  setupPresetForm();
  renderPresetList();
  renderOutput();
});