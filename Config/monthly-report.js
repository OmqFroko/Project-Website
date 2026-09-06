/* ==========================================================================
   Monthly Report — table-driven topic template with autosave.
   To add/rename a topic: edit the TOPICS array below. Everything else
   (rendering, saving, archiving) reads from it.
   ========================================================================== */

const DRAFT_STORAGE_KEY = "workshop-report-draft";
const ARCHIVE_STORAGE_KEY = "workshop-report-archive";

// Each topic needs a stable "key" (used in storage) and a display "label".
const TOPICS = [
  { key: "wentWell", label: "What went well" },
  { key: "didntGoWell", label: "What didn't go well" },
  { key: "plannedNext", label: "Planned for next month" },
];

function makeEmptyDraft() {
  const draft = { title: "" };
  TOPICS.forEach((topic) => {
    draft[topic.key] = [];
  });
  return draft;
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return makeEmptyDraft();
    const parsed = JSON.parse(raw);
    const draft = makeEmptyDraft();
    draft.title = parsed.title || "";
    TOPICS.forEach((topic) => {
      draft[topic.key] = Array.isArray(parsed[topic.key]) ? parsed[topic.key] : [];
    });
    return draft;
  } catch (error) {
    return makeEmptyDraft();
  }
}

function loadArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

let draft = loadDraft();
let archive = loadArchive();

function saveDraft() {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function saveArchive() {
  localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archive));
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/* ---- Draft: title + topic cards ---- */

function renderTitle() {
  const input = document.getElementById("report-title");
  if (!input) return;
  input.value = draft.title;
  input.addEventListener("input", () => {
    draft.title = input.value;
    saveDraft();
  });
}

// How long the removal animation plays before the item is actually deleted, in ms.
// Keep this in sync with the .topic-card__item transition duration in style.css.
const ITEM_REMOVE_DELAY_MS = 180;

function renderTopicItem(topicKey, index, text) {
  const li = document.createElement("li");
  li.className = "topic-card__item";
  li.innerHTML = `
    <span class="topic-card__item-text"></span>
    <button type="button" class="topic-card__item-remove" aria-label="Remove line">&times;</button>
  `;
  li.querySelector(".topic-card__item-text").textContent = text;
  li.querySelector(".topic-card__item-remove").addEventListener("click", () => {
    li.classList.add("is-removing");
    window.setTimeout(() => {
      draft[topicKey].splice(index, 1);
      saveDraft();
      renderTopics();
    }, ITEM_REMOVE_DELAY_MS);
  });
  return li;
}

function renderTopics() {
  const container = document.getElementById("topics");
  if (!container) return;
  container.innerHTML = "";

  TOPICS.forEach((topic) => {
    const card = document.createElement("article");
    card.className = "topic-card";

    const list = document.createElement("ul");
    list.className = "topic-card__list";
    draft[topic.key].forEach((text, index) => {
      list.appendChild(renderTopicItem(topic.key, index, text));
    });

    const form = document.createElement("form");
    form.className = "topic-card__form";
    form.innerHTML = `
      <input type="text" class="topic-card__input" placeholder="Add a line" autocomplete="off">
      <button type="submit" class="topic-card__add">Add</button>
    `;
    const input = form.querySelector(".topic-card__input");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      draft[topic.key].push(value);
      saveDraft();
      input.value = "";
      renderTopics();
      container.querySelectorAll(".topic-card__input")[TOPICS.indexOf(topic)].focus();
    });

    const heading = document.createElement("h2");
    heading.className = "topic-card__title";
    heading.textContent = topic.label;

    card.append(heading, list, form);
    container.appendChild(card);
  });
}

/* ---- Archive ---- */

function renderArchiveEntry(entry, index) {
  const details = document.createElement("details");
  details.className = "archive-entry";
  details.style.animationDelay = `${index * 40}ms`;

  const summary = document.createElement("summary");
  summary.innerHTML = `
    <span class="archive-entry__title">
      <svg class="archive-entry__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
      <span>${entry.title || "Untitled report"}</span>
    </span>
    <span class="archive-entry__date">${formatDate(entry.savedAt)}</span>
  `;

  const body = document.createElement("div");
  body.className = "archive-entry__body";

  TOPICS.forEach((topic) => {
    const section = document.createElement("div");
    section.className = "archive-entry__topic";
    const items = entry[topic.key] || [];
    const listMarkup = items.length
      ? `<ul>${items.map((item) => `<li></li>`).join("")}</ul>`
      : `<p class="archive-entry__empty">Nothing recorded.</p>`;
    section.innerHTML = `<h3>${topic.label}</h3>${listMarkup}`;
    if (items.length) {
      section.querySelectorAll("li").forEach((li, index) => {
        li.textContent = items[index];
      });
    }
    body.appendChild(section);
  });

  const footer = document.createElement("div");
  footer.className = "archive-entry__footer";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "archive-entry__remove";
  removeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>
    </svg>
    <span>Delete this entry</span>
  `;

  let confirmTimeout = null;
  removeBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (!removeBtn.classList.contains("is-confirming")) {
      removeBtn.classList.add("is-confirming");
      removeBtn.querySelector("span").textContent = "Click again to confirm";
      confirmTimeout = window.setTimeout(() => {
        removeBtn.classList.remove("is-confirming");
        removeBtn.querySelector("span").textContent = "Delete this entry";
      }, 3000);
      return;
    }

    window.clearTimeout(confirmTimeout);
    archive = archive.filter((item) => item.id !== entry.id);
    saveArchive();
    renderArchive();
  });

  footer.appendChild(removeBtn);
  details.append(summary, body, footer);
  return details;
}

function renderArchive() {
  const list = document.getElementById("archive-list");
  const empty = document.getElementById("archive-empty");
  if (!list || !empty) return;

  list.innerHTML = "";
  archive
    .slice()
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    .forEach((entry, index) => list.appendChild(renderArchiveEntry(entry, index)));

  empty.hidden = archive.length > 0;
}

/* ---- Save as new month ---- */

function setupSaveButton() {
  const button = document.getElementById("save-month-btn");
  if (!button) return;

  button.addEventListener("click", () => {
    const hasContent = TOPICS.some((topic) => draft[topic.key].length > 0) || draft.title.trim();
    if (!hasContent) return;

    const entry = { id: Date.now(), title: draft.title.trim(), savedAt: new Date().toISOString() };
    TOPICS.forEach((topic) => {
      entry[topic.key] = draft[topic.key].slice();
    });

    archive.push(entry);
    saveArchive();

    draft = makeEmptyDraft();
    saveDraft();

    document.getElementById("report-title").value = "";
    renderTopics();
    renderArchive();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTitle();
  renderTopics();
  renderArchive();
  setupSaveButton();
});