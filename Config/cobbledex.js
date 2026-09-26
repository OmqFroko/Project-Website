/* ==========================================================================
   Cobblemon Dex — search/filter grid, per-Pokémon detail with stats,
   evolution chain, sprites (with a shiny toggle), and a moveset (deck)
   builder that shows how each move is learned.
   Reads POKEMON_DATA from Config/cobbledex-data.js.
   ========================================================================== */

const CAUGHT_STORAGE_KEY = "workshop-cobbledex-caught";
const DECKS_STORAGE_KEY = "workshop-cobbledex-decks";
const SHINY_STORAGE_KEY = "workshop-cobbledex-shiny";
const MAX_MOVES_PER_DECK = 4;
const MAX_STAT_VALUE = 200; // used to scale the stat bars

// Sprite files are assumed to live in /sprites as "<id>.gif" and
// "<id>-shiny.gif". Change spritePath() below if your naming differs.
const SPRITE_DIR = "sprites";
function spritePath(mon, shiny) {
  return `${SPRITE_DIR}/${mon.id}${shiny ? "-shiny" : ""}.gif`;
}

const STAT_LABELS = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Atk" },
  { key: "def", label: "Def" },
  { key: "spAtk", label: "SpA" },
  { key: "spDef", label: "SpD" },
  { key: "speed", label: "Spe" },
];

const TYPE_COLORS = {
  Grass: "#5fa85a", Poison: "#a259c4", Fire: "#e07a3f", Water: "#4a90c4",
  Electric: "#d4b93c", Normal: "#9c948a", Rock: "#b09a5c", Ground: "#c4915a",
  Fighting: "#b5493f", Psychic: "#d1567e", Flying: "#8fa8c9",
};

let caughtMap = loadCaught();
let decks = loadDecks();
let shinyMode = loadShinyMode();
let selectedId = null;
let selectedMoves = [];
let searchTerm = "";
let typeFilter = "all";
let caughtFilter = "all";

/* ---- storage ---- */

function loadCaught() {
  try {
    const raw = localStorage.getItem(CAUGHT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveCaught() {
  localStorage.setItem(CAUGHT_STORAGE_KEY, JSON.stringify(caughtMap));
}

function loadDecks() {
  try {
    const raw = localStorage.getItem(DECKS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveDecks() {
  localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
}

function loadShinyMode() {
  return localStorage.getItem(SHINY_STORAGE_KEY) === "true";
}

function saveShinyMode() {
  localStorage.setItem(SHINY_STORAGE_KEY, String(shinyMode));
}

function findPokemon(id) {
  return POKEMON_DATA.find((mon) => mon.id === id);
}

/* ---- sprite markup with a graceful fallback while art is missing ---- */

function spriteMarkup(mon, extraClass) {
  const src = spritePath(mon, shinyMode);
  return `
    <span class="sprite-wrap ${extraClass}">
      <img
        class="sprite-img"
        src="${src}"
        alt="${mon.name}${shinyMode ? " (shiny)" : ""}"
        loading="lazy"
        onerror="this.closest('.sprite-wrap').classList.add('sprite-missing')"
      >
      <span class="sprite-fallback">${mon.name.slice(0, 1)}</span>
    </span>
  `;
}

/* ---- type filter options ---- */

function populateTypeFilter() {
  const select = document.getElementById("dex-type-filter");
  if (!select) return;
  const types = new Set();
  POKEMON_DATA.forEach((mon) => mon.types.forEach((type) => types.add(type)));
  Array.from(types).sort().forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    typeFilter = select.value;
    renderGrid();
  });
}

/* ---- shiny toggle ---- */

function setupShinyToggle() {
  const checkbox = document.getElementById("dex-shiny-toggle");
  if (!checkbox) return;
  checkbox.checked = shinyMode;
  checkbox.addEventListener("change", () => {
    shinyMode = checkbox.checked;
    saveShinyMode();
    renderGrid();
    renderDetail();
  });
}

/* ---- type badges (shared by grid + detail) ---- */

function typeBadge(type) {
  const color = TYPE_COLORS[type] || "var(--wk-steel)";
  return `<span class="type-badge" style="--type-color:${color}">${type}</span>`;
}

/* ---- grid ---- */

function matchesFilters(mon) {
  const matchesSearch = mon.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesType = typeFilter === "all" || mon.types.includes(typeFilter);
  const isCaught = Boolean(caughtMap[mon.id]);
  const matchesCaught =
    caughtFilter === "all" ||
    (caughtFilter === "caught" && isCaught) ||
    (caughtFilter === "uncaught" && !isCaught);
  return matchesSearch && matchesType && matchesCaught;
}

function renderGridCard(mon) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = `dex-card${mon.id === selectedId ? " is-selected" : ""}`;

  const isCaught = Boolean(caughtMap[mon.id]);
  card.innerHTML = `
    <span class="dex-card__caught${isCaught ? " is-caught" : ""}" data-caught-toggle aria-label="${isCaught ? "Caught" : "Not caught"}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
    </span>
    ${spriteMarkup(mon, "dex-card__sprite")}
    <span class="dex-card__name">${mon.name}</span>
    <span class="dex-card__types">${mon.types.map(typeBadge).join("")}</span>
  `;

  card.querySelector("[data-caught-toggle]").addEventListener("click", (event) => {
    event.stopPropagation();
    caughtMap[mon.id] = !caughtMap[mon.id];
    saveCaught();
    renderGrid();
    if (selectedId === mon.id) renderDetail();
  });

  card.addEventListener("click", () => {
    selectedId = mon.id;
    selectedMoves = [];
    renderGrid();
    renderDetail();
  });

  return card;
}

function renderGrid() {
  const grid = document.getElementById("dex-grid");
  const empty = document.getElementById("dex-empty");
  if (!grid || !empty) return;

  const visible = POKEMON_DATA.filter(matchesFilters);
  grid.innerHTML = "";
  visible.forEach((mon) => grid.appendChild(renderGridCard(mon)));
  empty.hidden = visible.length > 0;
}

/* ---- detail: stats + evolution chain ---- */

function computeBST(stats) {
  return STAT_LABELS.reduce((total, { key }) => total + stats[key], 0);
}

function renderStatsBars(stats) {
  const bars = STAT_LABELS.map(({ key, label }) => {
    const value = stats[key];
    const pct = Math.min(100, Math.round((value / MAX_STAT_VALUE) * 100));
    return `
      <div class="stat-row">
        <span class="stat-row__label">${label}</span>
        <div class="stat-row__track"><div class="stat-row__fill" style="width:${pct}%"></div></div>
        <span class="stat-row__value">${value}</span>
      </div>
    `;
  }).join("");

  return `
    ${bars}
    <div class="stat-row stat-row--total">
      <span class="stat-row__label">BST</span>
      <div class="stat-row__track"></div>
      <span class="stat-row__value">${computeBST(stats)}</span>
    </div>
  `;
}

function renderEvolutionChain(mon) {
  return mon.family
    .map((stage, index) => {
      const isCurrent = stage.id === mon.id;
      const arrow = index > 0 ? '<span class="evo-chain__arrow">&rarr;</span>' : "";
      const noteMarkup = index > 0 ? `<span class="evo-chain__note">${stage.note}</span>` : "";
      return `
        ${arrow}
        <button type="button" class="evo-chain__stage${isCurrent ? " is-current" : ""}" data-evo-id="${stage.id}" ${isCurrent ? "disabled" : ""}>
          <span class="evo-chain__name">${stage.name}</span>
          ${noteMarkup}
        </button>
      `;
    })
    .join("");
}

/* ---- detail: moveset builder ---- */

function toggleMove(moveName) {
  const index = selectedMoves.indexOf(moveName);
  if (index >= 0) {
    selectedMoves.splice(index, 1);
  } else if (selectedMoves.length < MAX_MOVES_PER_DECK) {
    selectedMoves.push(moveName);
  }
}

function moveSourceLabel(move) {
  return move.method === "tm" ? "TM" : `Lv. ${move.level}`;
}

function renderMovePool(mon) {
  // Level-up moves first (in level order), then TMs, alphabetically.
  const sorted = mon.moves.slice().sort((a, b) => {
    if (a.method !== b.method) return a.method === "level" ? -1 : 1;
    if (a.method === "level") return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  return sorted
    .map((move) => {
      const isChecked = selectedMoves.includes(move.name);
      const isDisabled = !isChecked && selectedMoves.length >= MAX_MOVES_PER_DECK;
      return `
        <label class="move-option${isDisabled ? " is-disabled" : ""}">
          <input type="checkbox" value="${move.name}" ${isChecked ? "checked" : ""} ${isDisabled ? "disabled" : ""}>
          <span class="move-option__name">${move.name}</span>
          <span class="move-option__source move-option__source--${move.method}">${moveSourceLabel(move)}</span>
        </label>
      `;
    })
    .join("");
}

function renderSavedDecks(mon) {
  const monDecks = decks.filter((deck) => deck.pokemonId === mon.id);
  if (!monDecks.length) {
    return `<p class="deck-empty">No saved decks yet for ${mon.name}.</p>`;
  }
  const bst = computeBST(mon.stats);
  return monDecks
    .map(
      (deck) => `
      <div class="deck-card" data-deck-id="${deck.id}">
        <div class="deck-card__header">
          <span class="deck-card__name">${deck.name}<span class="deck-card__bst">BST ${bst}</span></span>
          <div class="deck-card__actions">
            <button type="button" class="deck-card__load" data-load-deck="${deck.id}">Load</button>
            <button type="button" class="deck-card__delete" data-delete-deck="${deck.id}">Delete</button>
          </div>
        </div>
        <div class="deck-card__moves">${deck.moves.map((move) => `<span class="move-chip">${move}</span>`).join("")}</div>
      </div>
    `
    )
    .join("");
}

/* ---- detail: assembly ---- */

function renderDetail() {
  const section = document.getElementById("dex-detail");
  if (!section) return;

  const mon = findPokemon(selectedId);
  if (!mon) {
    section.hidden = true;
    section.innerHTML = "";
    return;
  }

  const isCaught = Boolean(caughtMap[mon.id]);

  section.hidden = false;
  section.innerHTML = `
    <div class="dex-detail__header">
      <div class="dex-detail__identity">
        ${spriteMarkup(mon, "dex-detail__sprite")}
        <div>
          <h2 class="dex-detail__name">${mon.name}</h2>
          <div class="dex-detail__types">${mon.types.map(typeBadge).join("")}</div>
        </div>
      </div>
      <label class="dex-detail__caught-toggle">
        <input type="checkbox" id="detail-caught-checkbox" ${isCaught ? "checked" : ""}>
        <span>Caught</span>
      </label>
    </div>

    <div class="dex-detail__grid">
      <div class="dex-panel">
        <h3 class="dex-panel__title">Stats</h3>
        <div class="stat-list">${renderStatsBars(mon.stats)}</div>
      </div>

      <div class="dex-panel">
        <h3 class="dex-panel__title">Evolution</h3>
        <div class="evo-chain">${renderEvolutionChain(mon)}</div>
      </div>
    </div>

    <div class="dex-panel">
      <h3 class="dex-panel__title">Build a moveset</h3>
      <p class="dex-panel__hint">Pick up to ${MAX_MOVES_PER_DECK} moves, then save the combination as a named deck.</p>
      <div class="move-pool" id="move-pool">${renderMovePool(mon)}</div>
      <form id="deck-form" class="deck-form">
        <input type="text" id="deck-name-input" class="deck-form__input" placeholder="Deck name" autocomplete="off">
        <button type="submit" class="deck-form__save">Save deck</button>
      </form>
      <div class="deck-list" id="deck-list">${renderSavedDecks(mon)}</div>
    </div>
  `;

  section.querySelector("#detail-caught-checkbox").addEventListener("change", (event) => {
    caughtMap[mon.id] = event.target.checked;
    saveCaught();
    renderGrid();
  });

  section.querySelectorAll("[data-evo-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = Number(button.dataset.evoId);
      selectedMoves = [];
      renderGrid();
      renderDetail();
    });
  });

  section.querySelectorAll("#move-pool input[type=checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      toggleMove(checkbox.value);
      renderDetail();
    });
  });

  const deckForm = section.querySelector("#deck-form");
  deckForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = section.querySelector("#deck-name-input");
    const name = nameInput.value.trim();
    if (!name || !selectedMoves.length) return;

    decks.push({
      id: Date.now(),
      pokemonId: mon.id,
      name,
      moves: selectedMoves.slice(),
    });
    saveDecks();
    selectedMoves = [];
    renderDetail();
  });

  section.querySelectorAll("[data-load-deck]").forEach((button) => {
    button.addEventListener("click", () => {
      const deck = decks.find((item) => item.id === Number(button.dataset.loadDeck));
      if (!deck) return;
      selectedMoves = deck.moves.slice();
      renderDetail();
    });
  });

  section.querySelectorAll("[data-delete-deck]").forEach((button) => {
    button.addEventListener("click", () => {
      decks = decks.filter((item) => item.id !== Number(button.dataset.deleteDeck));
      saveDecks();
      renderDetail();
    });
  });
}

/* ---- controls ---- */

function setupControls() {
  const search = document.getElementById("dex-search");
  search.addEventListener("input", () => {
    searchTerm = search.value;
    renderGrid();
  });

  const caughtButtons = document.querySelectorAll(".dex-controls__btn");
  caughtButtons.forEach((button) => {
    button.addEventListener("click", () => {
      caughtFilter = button.dataset.caught;
      caughtButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
      renderGrid();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateTypeFilter();
  setupControls();
  setupShinyToggle();
  renderGrid();
});