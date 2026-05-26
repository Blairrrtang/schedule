import {
  categoryColor,
  categoryName,
  escapeHTML,
  formatShortDate,
  uid
} from "../shared.js";

export function initDailyTodo(ctx) {
  ctx.els.todoForm.addEventListener("submit", (event) => addTodo(event, ctx));
  ctx.els.moveOpenTodosBtn.addEventListener("click", () => moveOpenTodos(ctx));
  ctx.els.clearDoneBtn.addEventListener("click", () => clearDoneTodosForSelectedDate(ctx));
}

export function renderDailyTodos(ctx) {
  const todos = todosForDate(ctx.state, ctx.selectedDate);
  ctx.els.todoList.innerHTML = todos.length
    ? todos.map((todo) => renderTodoItem(todo, ctx.selectedDate)).join("")
    : `<div class="empty">这一天还没有待办</div>`;

  ctx.els.todoList.querySelectorAll("[data-toggle-todo]").forEach((input) => {
    input.addEventListener("change", () => {
      const todo = todosForDate(ctx.state, ctx.selectedDate).find((item) => item.id === input.dataset.toggleTodo);
      if (todo) todo.done = input.checked;
      ctx.render();
    });
  });

  ctx.els.todoList.querySelectorAll("[data-delete-todo]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.todos[ctx.selectedDate] = todosForDate(ctx.state, ctx.selectedDate).filter((todo) => todo.id !== button.dataset.deleteTodo);
      ctx.showToast("待办已删除");
      ctx.render();
    });
  });

  ctx.els.todoList.querySelectorAll("[data-move-todo]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = ctx.els.todoList.querySelector(`[data-move-date="${button.dataset.moveTodo}"]`);
      moveTodo(ctx, button.dataset.moveTodo, input.value);
    });
  });
}

export function todosForDate(state, date) {
  return state.todos[date] || [];
}

function renderTodoItem(todo, selectedDate) {
  return `
    <article class="todo-item ${todo.done ? "done" : ""}">
      <div class="todo-top">
        <label class="todo-check">
          <input type="checkbox" ${todo.done ? "checked" : ""} data-toggle-todo="${todo.id}">
          <span class="item-title">
            <strong>${escapeHTML(todo.text)}</strong>
            <span><span class="badge" style="background:${categoryColor(todo.category)}">${categoryName(todo.category)}</span></span>
          </span>
        </label>
        <button class="mini-btn danger" data-delete-todo="${todo.id}" title="删除待办" type="button">×</button>
      </div>
      <div class="move-row">
        <input type="date" data-move-date="${todo.id}" value="${selectedDate}">
        <button type="button" data-move-todo="${todo.id}">迁移</button>
      </div>
    </article>
  `;
}

function addTodo(event, ctx) {
  event.preventDefault();
  const text = ctx.els.todoText.value.trim();
  if (!text) return;

  if (!ctx.state.todos[ctx.selectedDate]) ctx.state.todos[ctx.selectedDate] = [];
  ctx.state.todos[ctx.selectedDate].push({
    id: uid(),
    text,
    done: false,
    category: ctx.els.todoCategory.value
  });

  ctx.els.todoText.value = "";
  ctx.showToast("待办已添加");
  ctx.render();
}

function moveTodo(ctx, todoId, targetDate) {
  if (!targetDate || targetDate === ctx.selectedDate) return;
  const source = todosForDate(ctx.state, ctx.selectedDate);
  const todo = source.find((item) => item.id === todoId);
  if (!todo) return;

  ctx.state.todos[ctx.selectedDate] = source.filter((item) => item.id !== todoId);
  if (!ctx.state.todos[targetDate]) ctx.state.todos[targetDate] = [];
  ctx.state.todos[targetDate].push({ ...todo, done: false });
  ctx.showToast(`已迁移到 ${formatShortDate(targetDate)}`);
  ctx.render();
}

function moveOpenTodos(ctx) {
  const targetDate = ctx.els.bulkMoveDate.value;
  if (!targetDate || targetDate === ctx.selectedDate) return;
  const source = todosForDate(ctx.state, ctx.selectedDate);
  const moving = source.filter((todo) => !todo.done);

  if (!moving.length) {
    ctx.showToast("没有未完成待办");
    return;
  }

  ctx.state.todos[ctx.selectedDate] = source.filter((todo) => todo.done);
  if (!ctx.state.todos[targetDate]) ctx.state.todos[targetDate] = [];
  ctx.state.todos[targetDate].push(...moving.map((todo) => ({ ...todo, id: uid(), done: false })));
  ctx.showToast(`已迁移 ${moving.length} 个待办`);
  ctx.render();
}

function clearDoneTodosForSelectedDate(ctx) {
  const source = todosForDate(ctx.state, ctx.selectedDate);
  const open = source.filter((todo) => !todo.done);

  if (open.length === source.length) {
    ctx.showToast("没有已完成待办");
    return;
  }

  ctx.state.todos[ctx.selectedDate] = open;
  ctx.showToast("已清除完成项");
  ctx.render();
}
