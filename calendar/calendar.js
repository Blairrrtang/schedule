import {
  categoryColor,
  categoryName,
  categories,
  escapeHTML,
  formatShortDate,
  parseISODate,
  toISODate,
  uid
} from "../shared.js";

export function initCalendar(ctx) {
  ctx.els.prevMonth.addEventListener("click", () => {
    ctx.visibleMonth = new Date(ctx.visibleMonth.getFullYear(), ctx.visibleMonth.getMonth() - 1, 1);
    ctx.render();
  });

  ctx.els.nextMonth.addEventListener("click", () => {
    ctx.visibleMonth = new Date(ctx.visibleMonth.getFullYear(), ctx.visibleMonth.getMonth() + 1, 1);
    ctx.render();
  });

  ctx.els.todayBtn.addEventListener("click", () => {
    ctx.selectedDate = toISODate(new Date());
    ctx.visibleMonth = new Date();
    ctx.visibleMonth.setDate(1);
    ctx.render();
  });

  ctx.els.eventForm.addEventListener("submit", (event) => addEvent(event, ctx));
  ctx.els.exportBtn.addEventListener("click", () => exportICS(ctx));
  ctx.els.icsInput.addEventListener("change", (event) => importICS(event, ctx));
}

export function renderCalendar(ctx) {
  const year = ctx.visibleMonth.getFullYear();
  const month = ctx.visibleMonth.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const today = toISODate(new Date());

  ctx.els.monthTitle.textContent = ctx.visibleMonth.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long"
  });
  ctx.els.selectedLabel.textContent = ctx.formatLongDate(ctx.selectedDate);

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const iso = toISODate(day);
    const eventItems = eventsForDate(ctx.state, iso);
    const todoItems = ctx.todosForDate(iso);
    const chips = [
      ...eventItems.map((event) => ({ title: eventTitleWithTime(event), color: categoryColor(event.category), cls: "" })),
      ...todoItems.filter((todo) => !todo.done).map((todo) => ({ title: todo.text, color: categoryColor(todo.category), cls: "todo" }))
    ];
    const doneCount = todoItems.filter((todo) => todo.done).length;
    const score = todoItems.length ? `${doneCount}/${todoItems.length}` : "";

    days.push(`
      <button class="day ${day.getMonth() !== month ? "outside" : ""} ${iso === ctx.selectedDate ? "selected" : ""} ${iso === today ? "today" : ""}" data-date="${iso}" type="button">
        <span class="day-head">
          <span class="date-number">${day.getDate()}</span>
          <span class="day-score">${score}</span>
        </span>
        <span class="chips">
          ${chips.slice(0, 4).map((chip) => `<span class="chip ${chip.cls}" style="background:${chip.color}">${escapeHTML(chip.title)}</span>`).join("")}
          ${chips.length > 4 ? `<span class="more">+${chips.length - 4}</span>` : ""}
        </span>
      </button>
    `);
  }

  ctx.els.calendarGrid.innerHTML = days.join("");
  ctx.els.calendarGrid.querySelectorAll(".day").forEach((day) => {
    day.addEventListener("click", () => {
      ctx.selectedDate = day.dataset.date;
      const parsed = parseISODate(ctx.selectedDate);
      ctx.visibleMonth = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
      ctx.render();
    });
  });
}

export function renderEvents(ctx) {
  const events = eventsForDate(ctx.state, ctx.selectedDate);
  ctx.els.eventList.innerHTML = events.length
    ? events.map(renderEventItem).join("")
    : `<div class="empty">这一天还没有日程</div>`;

  ctx.els.eventList.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.events = ctx.state.events.filter((event) => event.id !== button.dataset.deleteEvent);
      ctx.showToast("日程已删除");
      ctx.render();
    });
  });
}

export function eventsForDate(state, date) {
  return state.events
    .filter((event) => event.date === date)
    .sort((a, b) => (a.start || "99:99").localeCompare(b.start || "99:99"));
}

export function eventTimeLabel(event) {
  if (event.start && event.end) return `${event.start}-${event.end}`;
  if (event.start) return event.start;
  return "全天";
}

function renderEventItem(event) {
  return `
    <article class="event-item">
      <div class="event-top">
        <div class="item-title">
          <strong>${escapeHTML(event.title)}</strong>
          <span>${eventTimeLabel(event)} · <span class="badge" style="background:${categoryColor(event.category)}">${categoryName(event.category)}</span></span>
        </div>
        <button class="mini-btn danger" data-delete-event="${event.id}" title="删除日程" type="button">×</button>
      </div>
      ${event.note ? `<div class="item-note">${escapeHTML(event.note)}</div>` : ""}
    </article>
  `;
}

function addEvent(event, ctx) {
  event.preventDefault();
  const title = ctx.els.eventTitle.value.trim();
  if (!title) return;

  ctx.state.events.push({
    id: uid(),
    title,
    date: ctx.els.eventDate.value,
    start: ctx.els.eventStart.value,
    end: ctx.els.eventEnd.value,
    category: ctx.els.eventCategory.value,
    note: ctx.els.eventNote.value.trim()
  });

  ctx.selectedDate = ctx.els.eventDate.value;
  const selected = parseISODate(ctx.selectedDate);
  ctx.visibleMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
  ctx.els.eventForm.reset();
  ctx.els.eventDate.value = ctx.selectedDate;
  ctx.els.eventCategory.value = "study";
  ctx.showToast("日程已保存");
  ctx.render();
}

function exportICS(ctx) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Local Schedule App//CN"
  ];

  ctx.state.events.forEach((event) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@local-schedule`);
    lines.push(`DTSTAMP:${toICSDateTime(new Date())}`);
    lines.push(`DTSTART:${toICSDate(event.date, event.start)}`);
    if (event.end) lines.push(`DTEND:${toICSDate(event.date, event.end)}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    lines.push(`CATEGORIES:${escapeICS(categoryName(event.category))}`);
    if (event.note) lines.push(`DESCRIPTION:${escapeICS(event.note)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  downloadText(`schedule-${toISODate(new Date())}.ics`, lines.join("\r\n"));
  ctx.showToast("日程文件已生成");
}

function importICS(event, ctx) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imported = parseICS(String(reader.result || ""), ctx.selectedDate);
    ctx.state.events.push(...imported);
    ctx.showToast(`已导入 ${imported.length} 个日程`);
    event.target.value = "";
    ctx.render();
  };
  reader.readAsText(file);
}

function parseICS(text, selectedDate) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const blocks = unfolded.split("BEGIN:VEVENT").slice(1).map((block) => block.split("END:VEVENT")[0]);

  return blocks.map((block) => {
    const lines = block.split(/\r?\n/);
    const data = {};
    lines.forEach((line) => {
      const index = line.indexOf(":");
      if (index === -1) return;
      const key = line.slice(0, index).split(";")[0].toUpperCase();
      data[key] = unescapeICS(line.slice(index + 1));
    });
    const start = parseICSDate(data.DTSTART);
    const end = parseICSDate(data.DTEND);
    const importedCategory = categories.find((cat) => cat.name === data.CATEGORIES || cat.id === data.CATEGORIES);

    return {
      id: uid(),
      title: data.SUMMARY || "未命名日程",
      date: start.date || selectedDate,
      start: start.time || "",
      end: end.time || "",
      category: importedCategory ? importedCategory.id : "other",
      note: data.DESCRIPTION || ""
    };
  }).filter((item) => item.date);
}

function parseICSDate(value = "") {
  const clean = value.replace(/Z$/, "");
  if (/^\d{8}T\d{4}/.test(clean)) {
    return {
      date: `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`,
      time: `${clean.slice(9, 11)}:${clean.slice(11, 13)}`
    };
  }
  if (/^\d{8}$/.test(clean)) {
    return {
      date: `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`,
      time: ""
    };
  }
  return { date: "", time: "" };
}

function toICSDate(date, time) {
  const compactDate = date.replaceAll("-", "");
  if (!time) return compactDate;
  return `${compactDate}T${time.replace(":", "")}00`;
}

function toICSDateTime(date) {
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function eventTitleWithTime(event) {
  return event.start ? `${event.start} ${event.title}` : event.title;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeICS(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function unescapeICS(value) {
  return String(value)
    .replaceAll("\\n", "\n")
    .replaceAll("\\,", ",")
    .replaceAll("\\;", ";")
    .replaceAll("\\\\", "\\");
}
