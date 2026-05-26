import { escapeHTML, uid } from "../shared.js";

export function initUncomfortableNotes(ctx) {
  ctx.els.uncomfortableForm.addEventListener("submit", (event) => addUncomfortableNote(event, ctx));
}

export function renderUncomfortableNotes(ctx) {
  const notes = [...ctx.state.uncomfortableNotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ctx.els.uncomfortableList.innerHTML = notes.length
    ? notes.map(renderNoteItem).join("")
    : `<div class="empty">还没有保存记录</div>`;

  ctx.els.uncomfortableList.querySelectorAll("[data-delete-uncomfortable]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.uncomfortableNotes = ctx.state.uncomfortableNotes.filter((note) => note.id !== button.dataset.deleteUncomfortable);
      ctx.showToast("记录已删除");
      ctx.render();
    });
  });
}

function addUncomfortableNote(event, ctx) {
  event.preventDefault();
  const content = ctx.els.uncomfortableText.value.trim();
  if (!content) return;

  ctx.state.uncomfortableNotes.push({
    id: uid(),
    content,
    createdAt: new Date().toISOString()
  });

  ctx.els.uncomfortableText.value = "";
  ctx.showToast("小事记录已保存");
  ctx.render();
}

function renderNoteItem(note) {
  return `
    <article class="note-item uncomfortable-note">
      <div class="note-top">
        <time class="record-time">${formatRecordTime(note.createdAt)}</time>
        <button class="mini-btn danger" data-delete-uncomfortable="${note.id}" title="删除记录" type="button">×</button>
      </div>
      <p class="note-text">${escapeHTML(note.content)}</p>
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
