import { escapeHTML, uid } from "../shared.js";

let diaryUnlocked = false;
let pendingView = "";

export function initDiary(ctx) {
  ctx.els.diaryForm.addEventListener("submit", (event) => addDiary(event, ctx));
  ctx.els.diaryPasswordForm.addEventListener("submit", (event) => unlockDiary(event, ctx));
  ctx.els.closeDiaryLockBtn.addEventListener("click", () => closeDiaryLock(ctx));
  ctx.els.diaryLockModal.addEventListener("click", (event) => {
    if (event.target === ctx.els.diaryLockModal) closeDiaryLock(ctx);
  });
}

export function requestDiaryAccess(ctx, viewId) {
  if (diaryUnlocked) return true;
  pendingView = viewId;
  ctx.els.diaryLockTitle.textContent = ctx.state.diaryPasswordHash ? "进入日记" : "设置日记密码";
  ctx.els.diaryLockHint.textContent = ctx.state.diaryPasswordHash
    ? "请输入 6 位数字密码"
    : "第一次使用日记，请设置 6 位数字密码";
  ctx.els.diaryPasswordSubmit.textContent = ctx.state.diaryPasswordHash ? "进入日记" : "设置密码";
  ctx.els.diaryPasswordInput.value = "";
  ctx.els.diaryLockModal.classList.add("is-open");
  ctx.els.diaryLockModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => ctx.els.diaryPasswordInput.focus(), 80);
  return false;
}

export function closeDiaryIfNeeded(viewId) {
  if (viewId !== "diaryModule") diaryUnlocked = false;
}

export function renderDiaries(ctx) {
  const diaries = [...ctx.state.diaries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ctx.els.diaryList.innerHTML = diaries.length
    ? diaries.map(renderDiaryItem).join("")
    : `<div class="empty">还没有日记</div>`;

  ctx.els.diaryList.querySelectorAll("[data-delete-diary]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.diaries = ctx.state.diaries.filter((diary) => diary.id !== button.dataset.deleteDiary);
      ctx.showToast("日记已删除");
      ctx.render();
    });
  });
}

function unlockDiary(event, ctx) {
  event.preventDefault();
  const password = ctx.els.diaryPasswordInput.value.trim();
  if (!/^\d{6}$/.test(password)) {
    ctx.showToast("请输入 6 位数字密码");
    return;
  }

  if (!ctx.state.diaryPasswordHash) {
    ctx.state.diaryPasswordHash = hashPassword(password);
    diaryUnlocked = true;
    closeDiaryLock(ctx);
    ctx.switchModule(pendingView || "diaryModule", { skipDiaryGuard: true });
    ctx.showToast("日记密码已设置");
    ctx.render();
    return;
  }

  if (hashPassword(password) !== ctx.state.diaryPasswordHash) {
    ctx.showToast("密码不正确");
    return;
  }

  diaryUnlocked = true;
  closeDiaryLock(ctx);
  ctx.switchModule(pendingView || "diaryModule", { skipDiaryGuard: true });
  ctx.showToast("已进入日记");
}

function addDiary(event, ctx) {
  event.preventDefault();
  const title = ctx.els.diaryTitle.value.trim();
  const content = ctx.els.diaryContent.value.trim();
  if (!title || !content) return;

  ctx.state.diaries.push({
    id: uid(),
    title,
    content,
    createdAt: new Date().toISOString()
  });

  ctx.els.diaryForm.reset();
  ctx.showToast("日记已保存");
  ctx.render();
}

function renderDiaryItem(diary) {
  return `
    <article class="diary-item">
      <div class="diary-item-head">
        <div class="item-title">
          <strong>${escapeHTML(diary.title)}</strong>
          <span>${formatDiaryTime(diary.createdAt)}</span>
        </div>
        <button class="mini-btn danger" data-delete-diary="${diary.id}" title="删除日记" type="button">×</button>
      </div>
      <p>${escapeHTML(diary.content)}</p>
    </article>
  `;
}

function closeDiaryLock(ctx) {
  ctx.els.diaryLockModal.classList.remove("is-open");
  ctx.els.diaryLockModal.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".note-modal.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

function hashPassword(password) {
  let hash = 2166136261;
  for (const char of password) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return String(hash >>> 0);
}

function formatDiaryTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
