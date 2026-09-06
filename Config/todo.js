/* ==========================================================================
   To-Do — simple checklist with autosave, filters, and a clear-completed
   action. Tasks persist in localStorage under TASKS_STORAGE_KEY.
   ========================================================================== */

const TASKS_STORAGE_KEY = "workshop-todo-tasks";

// How long the removal animation plays before the task is actually deleted, in ms.
// Keep this in sync with the .todo-item transition duration in style.css.
const ITEM_REMOVE_DELAY_MS = 180;

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  if (activeFilter === "active") return tasks.filter((task) => !task.done);
  if (activeFilter === "done") return tasks.filter((task) => task.done);
  return tasks;
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = `todo-item${task.done ? " is-done" : ""}`;

  const checkbox = document.createElement("button");
  checkbox.type = "button";
  checkbox.className = "todo-item__checkbox";
  checkbox.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");
  checkbox.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
  `;
  checkbox.addEventListener("click", () => {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  });

  const text = document.createElement("span");
  text.className = "todo-item__text";
  text.textContent = task.text;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "todo-item__remove";
  removeBtn.setAttribute("aria-label", "Delete task");
  removeBtn.textContent = "\u00d7";
  removeBtn.addEventListener("click", () => {
    li.classList.add("is-removing");
    window.setTimeout(() => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    }, ITEM_REMOVE_DELAY_MS);
  });

  li.append(checkbox, text, removeBtn);
  return li;
}

function renderTasks() {
  const list = document.getElementById("todo-list");
  const empty = document.getElementById("todo-empty");
  const count = document.getElementById("todo-count");
  if (!list || !empty || !count) return;

  const visible = visibleTasks();
  list.innerHTML = "";
  visible.forEach((task) => list.appendChild(renderTask(task)));
  empty.hidden = visible.length > 0;

  const remaining = tasks.filter((task) => !task.done).length;
  count.textContent = tasks.length
    ? `${remaining} of ${tasks.length} remaining`
    : "";
}

function setupForm() {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  if (!form || !input) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    tasks.push({ id: Date.now(), text: value, done: false });
    saveTasks();
    input.value = "";
    renderTasks();
    input.focus();
  });
}

function setupFilters() {
  const buttons = document.querySelectorAll(".todo-filters__btn");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      buttons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
      renderTasks();
    });
  });
}

function setupClearDone() {
  const button = document.getElementById("todo-clear-done");
  if (!button) return;

  button.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.done);
    saveTasks();
    renderTasks();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupForm();
  setupFilters();
  setupClearDone();
  renderTasks();
});