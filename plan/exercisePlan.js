import { escapeHTML, uid } from "../shared.js";

export function initExercisePlan(ctx) {
  ctx.els.exercisePlanForm.addEventListener("submit", (event) => addExercisePlan(event, ctx));
}

export function renderExercisePlans(ctx) {
  const records = [...ctx.state.exercisePlans].sort((a, b) => b.exercisedAt.localeCompare(a.exercisedAt));
  ctx.els.exercisePlanList.innerHTML = records.length
    ? records.map(renderExerciseItem).join("")
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

function formatExerciseTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
