/* ==========================================================================
   Workshop — renders tool cards from a config table and plays the hero's
   pegboard reveal animation.
   To add a new tool: switch a slot's status from "coming-soon" to "active"
   and fill in "href". To open more slots: duplicate an object.
   ========================================================================== */

// Delay between one card revealing and the next, in ms.
const REVEAL_STAGGER_MS = 60;

// How many empty slots to show alongside the active tools below.
const EMPTY_SLOT_COUNT = 1;

// Pegboard hole grid drawn behind the hero illustration.
const PEG_HOLE_COLUMNS = 8;
const PEG_HOLE_ROWS = 7;
const PEG_HOLE_MARGIN = 40;
const PEG_HOLE_RADIUS = 2.2;
const PEG_HOLE_BOARD = { x: 20, y: 16, width: 320, height: 288 };

// accepted status values: "active" (clickable card) | "coming-soon" (open slot)
const TOOLS = [
  {
    title: "Monthly Report",
    description: "What went well, what didn't, and what's planned next month.",
    href: "monthly-report.html",
    status: "active",
    icon: "report",
  },
  {
    title: "To-Do",
    description: "A running list of tasks, saved as you go.",
    href: "todo.html",
    status: "active",
    icon: "todo",
  },
  {
    title: "Feedback Page",
    description: "Compose feedback from shorthand notes and saved presets.",
    href: "feedback.html",
    status: "active",
    icon: "feedback",
  },
  ...Array.from({ length: EMPTY_SLOT_COUNT }, () => ({
    title: "Open slot",
    description: "No tool assigned yet.",
    href: null,
    status: "coming-soon",
    icon: "slot",
  })),
];

const ICONS = {
  slot: '<svg class="tool-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',
  report: '<svg class="tool-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="3" width="14" height="18" rx="1.5"/><line x1="8.5" y1="8" x2="15.5" y2="8"/><line x1="8.5" y1="12" x2="15.5" y2="12"/><line x1="8.5" y1="16" x2="12.5" y2="16"/></svg>',
  todo: '<svg class="tool-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12l2.5 2.5L16 9"/></svg>',
  feedback: '<svg class="tool-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5h16v11H8l-4 4V5z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="12.5" x2="13" y2="12.5"/></svg>',
};

function buildCard(tool) {
  const isActive = tool.status === "active";
  const tag = document.createElement(isActive ? "a" : "div");

  tag.className = `tool-card tool-card--${isActive ? "active" : "empty"}`;
  if (isActive && tool.href) {
    tag.href = tool.href;
  }

  const icon = ICONS[tool.icon] || ICONS.slot;
  const statusMarkup = isActive
    ? '<span class="status-dot" aria-hidden="true"></span>Open'
    : "Coming soon";

  tag.innerHTML = `
    ${icon}
    <span class="tool-card__title">${tool.title}</span>
    <p class="tool-card__description">${tool.description}</p>
    <span class="tool-card__status tool-card__status--${isActive ? "active" : "coming-soon"}">${statusMarkup}</span>
  `;

  return tag;
}

function renderTools() {
  const grid = document.getElementById("pegboard-grid");
  if (!grid) return;

  TOOLS.forEach((tool, index) => {
    const card = buildCard(tool);
    grid.appendChild(card);

    // Sequential reveal, once, on page load.
    window.setTimeout(() => {
      card.classList.add("is-visible");
    }, index * REVEAL_STAGGER_MS);
  });
}

function renderPegHoles() {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const group = document.getElementById("pegboard-holes");
  if (!group) return;

  const usableWidth = PEG_HOLE_BOARD.width - PEG_HOLE_MARGIN * 2;
  const usableHeight = PEG_HOLE_BOARD.height - PEG_HOLE_MARGIN * 2;

  for (let row = 0; row < PEG_HOLE_ROWS; row++) {
    for (let col = 0; col < PEG_HOLE_COLUMNS; col++) {
      const cx = PEG_HOLE_BOARD.x + PEG_HOLE_MARGIN + (usableWidth * col) / (PEG_HOLE_COLUMNS - 1);
      const cy = PEG_HOLE_BOARD.y + PEG_HOLE_MARGIN + (usableHeight * row) / (PEG_HOLE_ROWS - 1);

      const circle = document.createElementNS(svgNamespace, "circle");
      circle.setAttribute("cx", cx.toFixed(1));
      circle.setAttribute("cy", cy.toFixed(1));
      circle.setAttribute("r", PEG_HOLE_RADIUS);
      circle.setAttribute("class", "peg-hole");
      circle.style.transitionDelay = `${(row * PEG_HOLE_COLUMNS + col) * 8}ms`;
      group.appendChild(circle);
    }
  }
}

function revealBlueprint() {
  const blueprint = document.getElementById("hero-blueprint");
  if (!blueprint) return;

  requestAnimationFrame(() => {
    blueprint.classList.add("is-visible");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTools();
  renderPegHoles();
  revealBlueprint();
});