import {
  categories,
  fillCategorySelects,
  focusSection,
  formatLongDate,
  loadState,
  saveState,
  toISODate
} from "./shared.js";
import { eventsForDate, initCalendar, renderCalendar, renderEvents } from "./calendar/calendar.js";
import { initDailyTodo, renderDailyTodos, todosForDate } from "./todolist/dailyTodo.js";
import { activePlans, initLongPlan, renderLongPlans } from "./todolist/longPlan.js";
import { initUncomfortableNotes, renderUncomfortableNotes } from "./notes/uncomfortableNotes.js";
import { initQuickThings, renderQuickThings } from "./notes/quickThings.js";

const now = new Date();
const ctx = {
  state: loadState(),
  selectedDate: toISODate(now),
  visibleMonth: new Date(now.getFullYear(), now.getMonth(), 1),
  toastTimer: null,
  els: getElements(),
  render,
  showToast,
  todosForDate: (date) => todosForDate(ctx.state, date),
  formatLongDate
};

init();

function init() {
  fillCategorySelects([ctx.els.eventCategory, ctx.els.todoCategory, ctx.els.planCategory]);
  ctx.els.todayText.textContent = formatLongDate(toISODate(now));
  ctx.els.eventDate.value = ctx.selectedDate;
  ctx.els.bulkMoveDate.value = ctx.selectedDate;
  ctx.els.planDue.value = ctx.selectedDate;

  bindGlobalShortcuts();
  initCalendar(ctx);
  initDailyTodo(ctx);
  initLongPlan(ctx);
  initUncomfortableNotes(ctx);
  initQuickThings(ctx);
  registerServiceWorker();
  render();
}

function getElements() {
  return {
    todayText: document.getElementById("todayText"),
    statEvents: document.getElementById("statEvents"),
    statTodos: document.getElementById("statTodos"),
    categoryList: document.getElementById("categoryList"),
    calendarGrid: document.getElementById("calendarGrid"),
    monthTitle: document.getElementById("monthTitle"),
    selectedLabel: document.getElementById("selectedLabel"),
    prevMonth: document.getElementById("prevMonth"),
    nextMonth: document.getElementById("nextMonth"),
    todayBtn: document.getElementById("todayBtn"),
    exportBtn: document.getElementById("exportBtn"),
    icsInput: document.getElementById("icsInput"),
    clearDoneBtn: document.getElementById("clearDoneBtn"),
    quickEventBtn: document.getElementById("quickEventBtn"),
    quickTodoBtn: document.getElementById("quickTodoBtn"),
    quickPlanBtn: document.getElementById("quickPlanBtn"),
    quickUncomfortableBtn: document.getElementById("quickUncomfortableBtn"),
    quickThingBtn: document.getElementById("quickThingBtn"),
    openUncomfortableBtn: document.getElementById("openUncomfortableBtn"),
    openQuickThingBtn: document.getElementById("openQuickThingBtn"),
    closeUncomfortableBtn: document.getElementById("closeUncomfortableBtn"),
    closeQuickThingBtn: document.getElementById("closeQuickThingBtn"),
    uncomfortableModal: document.getElementById("uncomfortableModal"),
    quickThingModal: document.getElementById("quickThingModal"),
    uncomfortableCount: document.getElementById("uncomfortableCount"),
    quickThingCount: document.getElementById("quickThingCount"),
    detailDate: document.getElementById("detailDate"),
    detailSummary: document.getElementById("detailSummary"),
    eventForm: document.getElementById("eventForm"),
    eventTitle: document.getElementById("eventTitle"),
    eventDate: document.getElementById("eventDate"),
    eventCategory: document.getElementById("eventCategory"),
    eventStart: document.getElementById("eventStart"),
    eventEnd: document.getElementById("eventEnd"),
    eventNote: document.getElementById("eventNote"),
    eventList: document.getElementById("eventList"),
    todoForm: document.getElementById("todoForm"),
    todoText: document.getElementById("todoText"),
    todoCategory: document.getElementById("todoCategory"),
    bulkMoveDate: document.getElementById("bulkMoveDate"),
    moveOpenTodosBtn: document.getElementById("moveOpenTodosBtn"),
    todoList: document.getElementById("todoList"),
    planForm: document.getElementById("planForm"),
    planTitle: document.getElementById("planTitle"),
    planDue: document.getElementById("planDue"),
    planCategory: document.getElementById("planCategory"),
    planList: document.getElementById("planList"),
    uncomfortableForm: document.getElementById("uncomfortableForm"),
    uncomfortableText: document.getElementById("uncomfortableText"),
    uncomfortableList: document.getElementById("uncomfortableList"),
    quickThingForm: document.getElementById("quickThingForm"),
    quickThingText: document.getElementById("quickThingText"),
    quickThingList: document.getElementById("quickThingList"),
    toast: document.getElementById("toast")
  };
}

function bindGlobalShortcuts() {
  ctx.els.quickEventBtn.addEventListener("click", () => {
    focusSection("eventSection", ctx.els.eventTitle);
  });

  ctx.els.quickTodoBtn.addEventListener("click", () => {
    focusSection("dailyTodoSection", ctx.els.todoText);
  });

  ctx.els.quickPlanBtn.addEventListener("click", () => {
    focusSection("longPlanSection", ctx.els.planTitle);
  });

  ctx.els.quickUncomfortableBtn.addEventListener("click", () => {
    openNoteModal(ctx.els.uncomfortableModal, ctx.els.uncomfortableText);
  });

  ctx.els.quickThingBtn.addEventListener("click", () => {
    openNoteModal(ctx.els.quickThingModal, ctx.els.quickThingText);
  });

  ctx.els.openUncomfortableBtn.addEventListener("click", () => {
    openNoteModal(ctx.els.uncomfortableModal, ctx.els.uncomfortableText);
  });

  ctx.els.openQuickThingBtn.addEventListener("click", () => {
    openNoteModal(ctx.els.quickThingModal, ctx.els.quickThingText);
  });

  ctx.els.closeUncomfortableBtn.addEventListener("click", () => closeNoteModal(ctx.els.uncomfortableModal));
  ctx.els.closeQuickThingBtn.addEventListener("click", () => closeNoteModal(ctx.els.quickThingModal));

  [ctx.els.uncomfortableModal, ctx.els.quickThingModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeNoteModal(modal);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeNoteModal(ctx.els.uncomfortableModal);
    closeNoteModal(ctx.els.quickThingModal);
  });
}

function render() {
  ctx.els.eventDate.value = ctx.selectedDate;
  renderCalendar(ctx);
  renderDetails();
  renderSidebar();
  saveState(ctx.state);
}

function renderDetails() {
  const events = eventsForDate(ctx.state, ctx.selectedDate);
  const todos = todosForDate(ctx.state, ctx.selectedDate);
  const doneCount = todos.filter((todo) => todo.done).length;

  ctx.els.detailDate.textContent = formatLongDate(ctx.selectedDate);
  ctx.els.detailSummary.textContent = `${events.length} 个日程 · ${todos.length} 个每日待办 · ${doneCount} 个已完成 · ${ctx.state.uncomfortableNotes.length + ctx.state.quickThings.length} 条便签`;
  ctx.els.uncomfortableCount.textContent = ctx.state.uncomfortableNotes.length;
  ctx.els.quickThingCount.textContent = ctx.state.quickThings.length;
  renderEvents(ctx);
  renderDailyTodos(ctx);
  renderLongPlans(ctx);
  renderUncomfortableNotes(ctx);
  renderQuickThings(ctx);
}

function renderSidebar() {
  const monthStart = toISODate(new Date(ctx.visibleMonth.getFullYear(), ctx.visibleMonth.getMonth(), 1));
  const monthEnd = toISODate(new Date(ctx.visibleMonth.getFullYear(), ctx.visibleMonth.getMonth() + 1, 0));
  const monthEvents = ctx.state.events.filter((event) => event.date >= monthStart && event.date <= monthEnd);
  const todayTodos = todosForDate(ctx.state, toISODate(new Date()));
  const todayDone = todayTodos.filter((todo) => todo.done).length;
  const percent = todayTodos.length ? Math.round((todayDone / todayTodos.length) * 100) : 0;

  ctx.els.statEvents.textContent = monthEvents.length;
  ctx.els.statTodos.textContent = `${percent}%`;

  ctx.els.categoryList.innerHTML = categories.map((cat) => {
    const count = ctx.state.events.filter((event) => event.category === cat.id).length
      + Object.values(ctx.state.todos).flat().filter((todo) => todo.category === cat.id).length
      + activePlans(ctx.state).filter((plan) => plan.category === cat.id).length;
    return `
      <div class="category-item">
        <span class="category-left">
          <span class="dot" style="background:${cat.color}"></span>
          <span>${cat.name}</span>
        </span>
        <span class="count-pill">${count}</span>
      </div>
    `;
  }).join("");
}

function showToast(message) {
  clearTimeout(ctx.toastTimer);
  ctx.els.toast.textContent = message;
  ctx.els.toast.classList.add("show");
  ctx.toastTimer = setTimeout(() => ctx.els.toast.classList.remove("show"), 2200);
}

function openNoteModal(modal, focusTarget) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => focusTarget.focus(), 80);
}

function closeNoteModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".note-modal.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      console.info("Service worker registration skipped.");
    });
  });
}
