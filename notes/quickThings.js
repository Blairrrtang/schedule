import { escapeHTML, uid } from "../shared.js";

export function initQuickThings(ctx) {
  ctx.els.quickThingForm.addEventListener("submit", (event) => addQuickThing(event, ctx));
}

export function renderQuickThings(ctx) {
  const things = [...ctx.state.quickThings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ctx.els.quickThingList.innerHTML = things.length
    ? things.map(renderThingItem).join("")
    : `<div class="empty">还没有保存记录</div>`;

  ctx.els.quickThingList.querySelectorAll("[data-delete-quick-thing]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.quickThings = ctx.state.quickThings.filter((thing) => thing.id !== button.dataset.deleteQuickThing);
      ctx.showToast("记录已删除");
      ctx.render();
    });
  });
}

function addQuickThing(event, ctx) {
  event.preventDefault();
  const content = ctx.els.quickThingText.value.trim();
  if (!content) return;

  ctx.state.quickThings.push({
    id: uid(),
    content,
    createdAt: new Date().toISOString()
  });

  ctx.els.quickThingText.value = "";
  ctx.showToast("想到的事情已保存");
  ctx.render();
}

function renderThingItem(thing) {
  return `
    <article class="note-item quick-thing">
      <div class="note-top">
        <time class="record-time">${formatRecordTime(thing.createdAt)}</time>
        <button class="mini-btn danger" data-delete-quick-thing="${thing.id}" title="删除记录" type="button">×</button>
      </div>
      <p class="note-text">${escapeHTML(thing.content)}</p>
    </article>
  `;
}

function formatRecordTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
