import {
  daysBetween,
  escapeHTML,
  formatShortDate,
  toISODate,
  uid
} from "../shared.js";

let activeReadingPlanId = null;

export function initReadingPlan(ctx) {
  ctx.els.readingPlanForm.addEventListener("submit", (event) => addReadingPlan(event, ctx));
  ctx.els.readingReviewForm.addEventListener("submit", (event) => addReadingReview(event, ctx));
  ctx.els.closeReadingReviewBtn.addEventListener("click", () => closeReadingReview(ctx));

  ctx.els.readingReviewModal.addEventListener("click", (event) => {
    if (event.target === ctx.els.readingReviewModal) closeReadingReview(ctx);
  });
}

export function renderReadingPlans(ctx) {
  const plans = [...ctx.state.readingPlans].sort((a, b) => a.end.localeCompare(b.end));
  ctx.els.readingPlanList.innerHTML = plans.length
    ? plans.map(renderBookCard).join("")
    : `<div class="empty">还没有阅读计划</div>`;

  ctx.els.readingPlanList.querySelectorAll("[data-open-reading]").forEach((button) => {
    button.addEventListener("click", () => openReadingReview(ctx, button.dataset.openReading));
  });

  ctx.els.readingPlanList.querySelectorAll("[data-delete-reading]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      ctx.state.readingPlans = ctx.state.readingPlans.filter((plan) => plan.id !== button.dataset.deleteReading);
      ctx.showToast("阅读计划已删除");
      ctx.render();
    });
  });

  if (activeReadingPlanId) renderReadingReview(ctx);
}

function addReadingPlan(event, ctx) {
  event.preventDefault();
  const title = ctx.els.readingBookTitle.value.trim();
  if (!title) return;
  if (ctx.els.readingEnd.value < ctx.els.readingStart.value) {
    ctx.showToast("截至时间不能早于开始时间");
    return;
  }

  const file = ctx.els.readingCover.files[0];
  const createPlan = (cover) => {
    ctx.state.readingPlans.push({
      id: uid(),
      title,
      start: ctx.els.readingStart.value,
      end: ctx.els.readingEnd.value,
      cover,
      reviews: []
    });
    ctx.els.readingPlanForm.reset();
    ctx.showToast("阅读计划已创建");
    ctx.render();
  };

  if (!file) {
    createPlan(createCover(title));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => createPlan(String(reader.result || createCover(title)));
  reader.readAsDataURL(file);
}

function openReadingReview(ctx, planId) {
  activeReadingPlanId = planId;
  renderReadingReview(ctx);
  ctx.els.readingReviewModal.classList.add("is-open");
  ctx.els.readingReviewModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => ctx.els.readingReviewText.focus(), 80);
}

function closeReadingReview(ctx) {
  ctx.els.readingReviewModal.classList.remove("is-open");
  ctx.els.readingReviewModal.setAttribute("aria-hidden", "true");
  activeReadingPlanId = null;
  if (!document.querySelector(".note-modal.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

function addReadingReview(event, ctx) {
  event.preventDefault();
  const plan = ctx.state.readingPlans.find((item) => item.id === activeReadingPlanId);
  const content = ctx.els.readingReviewText.value.trim();
  if (!plan || !content) return;

  plan.reviews.push({
    id: uid(),
    rating: Number(ctx.els.readingRating.value),
    content,
    createdAt: new Date().toISOString()
  });

  ctx.els.readingReviewForm.reset();
  ctx.els.readingRating.value = "5";
  ctx.showToast("书评已保存");
  ctx.render();
}

function renderReadingReview(ctx) {
  const plan = ctx.state.readingPlans.find((item) => item.id === activeReadingPlanId);
  if (!plan) return;

  ctx.els.readingReviewTitle.textContent = plan.title;
  ctx.els.readingReviewBook.textContent = plan.title;
  ctx.els.readingReviewMeta.textContent = `${formatShortDate(plan.start)} - ${formatShortDate(plan.end)}`;
  ctx.els.readingReviewDays.textContent = deadlineLabel(plan.end);
  ctx.els.readingReviewCover.src = plan.cover;
  ctx.els.readingReviewCover.alt = `${plan.title} 封面`;
  ctx.els.readingReviewList.innerHTML = plan.reviews.length
    ? [...plan.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(renderReviewItem).join("")
    : `<div class="empty">还没有书评记录</div>`;
}

function renderBookCard(plan) {
  return `
    <article class="book-card" data-open-reading="${plan.id}" tabindex="0" role="button">
      <img src="${plan.cover}" alt="${escapeHTML(plan.title)} 封面">
      <div class="book-card-body">
        <strong>${escapeHTML(plan.title)}</strong>
        <span>${deadlineLabel(plan.end)}</span>
      </div>
      <button class="mini-btn danger" data-delete-reading="${plan.id}" title="删除阅读计划" type="button">×</button>
    </article>
  `;
}

function renderReviewItem(review) {
  return `
    <article class="note-item">
      <div class="note-top">
        <strong>${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</strong>
        <time class="record-time">${formatRecordTime(review.createdAt)}</time>
      </div>
      <p class="note-text">${escapeHTML(review.content)}</p>
    </article>
  `;
}

function deadlineLabel(endDate) {
  const days = daysBetween(toISODate(new Date()), endDate);
  if (days > 0) return `剩余 ${days} 天`;
  if (days === 0) return "今天截止";
  return `已逾期 ${Math.abs(days)} 天`;
}

function createCover(title) {
  const safeTitle = escapeHTML(title);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="440" viewBox="0 0 320 440">
      <rect width="320" height="440" rx="18" fill="#111827"/>
      <rect x="26" y="28" width="268" height="384" rx="14" fill="#f8fafc"/>
      <rect x="48" y="60" width="224" height="12" rx="6" fill="#0f766e"/>
      <foreignObject x="48" y="112" width="224" height="220">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,'Microsoft YaHei',sans-serif;font-size:30px;font-weight:800;line-height:1.25;color:#111827;word-break:break-word;">${safeTitle}</div>
      </foreignObject>
      <circle cx="250" cy="364" r="18" fill="#f97316"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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
