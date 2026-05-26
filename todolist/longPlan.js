import {
  categoryColor,
  categoryName,
  daysBetween,
  escapeHTML,
  formatShortDate,
  toISODate,
  uid
} from "../shared.js";

export function initLongPlan(ctx) {
  ctx.els.planForm.addEventListener("submit", (event) => addPlan(event, ctx));
}

export function renderLongPlans(ctx) {
  const plans = activePlans(ctx.state);
  ctx.els.planList.innerHTML = plans.length
    ? plans.map(renderPlanItem).join("")
    : `<div class="empty">还没有长期计划</div>`;

  ctx.els.planList.querySelectorAll("[data-delete-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.plans = ctx.state.plans.filter((plan) => plan.id !== button.dataset.deletePlan);
      ctx.showToast("计划已删除");
      ctx.render();
    });
  });

  ctx.els.planList.querySelectorAll("[data-finish-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      const plan = ctx.state.plans.find((item) => item.id === button.dataset.finishPlan);
      if (plan) plan.done = true;
      ctx.showToast("计划已完成");
      ctx.render();
    });
  });
}

export function activePlans(state) {
  return state.plans
    .filter((plan) => !plan.done)
    .sort((a, b) => a.due.localeCompare(b.due));
}

function renderPlanItem(plan) {
  const days = daysBetween(toISODate(new Date()), plan.due);
  const dueText = days > 0 ? `剩余 ${days} 天` : days === 0 ? "今天截止" : `已逾期 ${Math.abs(days)} 天`;

  return `
    <article class="plan-item">
      <div class="plan-top">
        <div class="item-title">
          <strong>${escapeHTML(plan.title)}</strong>
          <span class="plan-meta">
            <span class="badge" style="background:${categoryColor(plan.category)}">${categoryName(plan.category)}</span>
            <span class="badge soft">${dueText}</span>
            <span class="badge soft">${formatShortDate(plan.due)}</span>
          </span>
        </div>
        <button class="mini-btn danger" data-delete-plan="${plan.id}" title="删除计划" type="button">×</button>
      </div>
      <button type="button" data-finish-plan="${plan.id}">完成计划</button>
    </article>
  `;
}

function addPlan(event, ctx) {
  event.preventDefault();
  const title = ctx.els.planTitle.value.trim();
  if (!title) return;

  ctx.state.plans.push({
    id: uid(),
    title,
    due: ctx.els.planDue.value,
    category: ctx.els.planCategory.value,
    done: false
  });

  ctx.els.planTitle.value = "";
  ctx.showToast("长期计划已保存");
  ctx.render();
}
