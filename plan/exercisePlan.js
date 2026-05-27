import { escapeHTML, uid } from "../shared.js";

export function initExercisePlan(ctx) {
  ctx.els.exercisePlanForm.addEventListener("submit", (event) => addExercisePlan(event, ctx));
}

export function renderExercisePlans(ctx) {
  const records = [...ctx.state.exercisePlans].sort((a, b) => b.exercisedAt.localeCompare(a.exercisedAt));
  const groups = groupRecordsByDate(records);
  ctx.els.exercisePlanList.innerHTML = records.length
    ? groups.map(renderExerciseDayGroup).join("")
    : `<div class="empty">还没有运动记录</div>`;

  ctx.els.exercisePlanList.querySelectorAll("[data-delete-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.exercisePlans = ctx.state.exercisePlans.filter((record) => record.id !== button.dataset.deleteExercise);
      ctx.showToast("运动记录已删除");
      ctx.render();
    });
  });
}

function addExercisePlan(event, ctx) {
  event.preventDefault();
  const duration = Number(ctx.els.exerciseDuration.value);
  if (!ctx.els.exerciseTime.value || !duration) return;

  ctx.state.exercisePlans.push({
    id: uid(),
    category: ctx.els.exerciseCategory.value,
    exercisedAt: ctx.els.exerciseTime.value,
    duration,
    createdAt: new Date().toISOString()
  });

  ctx.els.exercisePlanForm.reset();
  ctx.showToast("运动记录已保存");
  ctx.render();
}

function renderExerciseDayGroup(group) {
  const totalDuration = group.records.reduce((sum, record) => sum + Number(record.duration || 0), 0);
  return `
    <article class="exercise-day-group">
      <header class="exercise-day-head">
        <div>
          <strong>${formatExerciseDate(group.date)}</strong>
          <span>${group.records.length} 条记录 · 共 ${totalDuration} 分钟</span>
        </div>
      </header>
      <div class="exercise-day-list">
        ${group.records.map(renderExerciseItem).join("")}
      </div>
    </article>
  `;
}

function renderExerciseItem(record) {
  return `
    <article class="exercise-item">
      <div class="exercise-top">
        <div class="item-title">
          <strong>${escapeHTML(record.category)}</strong>
          <span>${formatExerciseTime(record.exercisedAt)} · ${record.duration} 分钟</span>
        </div>
        <button class="mini-btn danger" data-delete-exercise="${record.id}" title="删除运动记录" type="button">×</button>
      </div>
    </article>
  `;
}

function groupRecordsByDate(records) {
  const map = new Map();
  records.forEach((record) => {
    const date = record.exercisedAt.slice(0, 10);
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(record);
  });

  return Array.from(map.entries()).map(([date, dayRecords]) => ({
    date,
    records: dayRecords.sort((a, b) => b.exercisedAt.localeCompare(a.exercisedAt))
  }));
}

function formatExerciseDate(value) {
  return new Date(`${value}T00:00`).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

function formatExerciseTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
