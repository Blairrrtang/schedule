export const STORAGE_KEY = "schedule_app_state_v1";

export const categories = [
  { id: "study", name: "学习", color: "#3b82f6" },
  { id: "sport", name: "运动", color: "#16a34a" },
  { id: "work", name: "工作", color: "#8b5cf6" },
  { id: "life", name: "生活", color: "#f97316" },
  { id: "health", name: "健康", color: "#ef4444" },
  { id: "other", name: "其他", color: "#64748b" }
];

export function createDefaultState(today = new Date()) {
  const todayISO = toISODate(today);
  return {
    events: [
      {
        id: uid(),
        title: "示例：英语阅读",
        date: todayISO,
        start: "09:00",
        end: "10:00",
        category: "study",
        note: "可删除或替换为自己的安排"
      },
      {
        id: uid(),
        title: "示例：慢跑",
        date: todayISO,
        start: "18:30",
        end: "",
        category: "sport",
        note: ""
      }
    ],
    todos: {
      [todayISO]: [
        { id: uid(), text: "整理今日计划", done: false, category: "life" },
        { id: uid(), text: "完成一项重点任务", done: false, category: "work" }
      ]
    },
    plans: [
      {
        id: uid(),
        title: "示例：完成阶段复习",
        due: addDays(todayISO, 14),
        category: "study",
        done: false
      }
    ],
    uncomfortableNotes: [],
    quickThings: []
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return createDefaultState();
    return {
      events: Array.isArray(saved.events) ? saved.events : [],
      todos: saved.todos && typeof saved.todos === "object" ? saved.todos : {},
      plans: Array.isArray(saved.plans) ? saved.plans : [],
      uncomfortableNotes: Array.isArray(saved.uncomfortableNotes) ? saved.uncomfortableNotes : [],
      quickThings: Array.isArray(saved.quickThings) ? saved.quickThings : []
    };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function categoryName(id) {
  return (categories.find((cat) => cat.id === id) || categories.at(-1)).name;
}

export function categoryColor(id) {
  return (categories.find((cat) => cat.id === id) || categories.at(-1)).color;
}

export function fillCategorySelects(selects) {
  selects.forEach((select) => {
    select.innerHTML = categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join("");
  });
}

export function toISODate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, amount) {
  const parsed = parseISODate(date);
  parsed.setDate(parsed.getDate() + amount);
  return toISODate(parsed);
}

export function daysBetween(start, end) {
  const one = parseISODate(start);
  const two = parseISODate(end);
  return Math.round((two - one) / 86400000);
}

export function formatLongDate(date) {
  return parseISODate(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

export function formatShortDate(date) {
  return parseISODate(date).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric"
  });
}

export function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function focusSection(sectionId, input) {
  document.getElementById(sectionId).scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => input.focus(), 250);
}
