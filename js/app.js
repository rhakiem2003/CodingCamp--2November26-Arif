/* js/app.js — To-Do Life Dashboard application logic */

// ─── Shared Storage Utilities ─────────────────────────────────────────────

function saveToStorage(key, data) {
  const serialised = JSON.stringify(data);
  localStorage.setItem(key, serialised);
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Shared Pure Utility Functions ────────────────────────────────────────

function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 20) return 'Good Evening';
  return 'Good Night';
}

function formatDate(date) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatTimeDisplay(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function validateTaskText(text) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (trimmed.length === 0) return { valid: false, reason: 'Task description cannot be empty.' };
  if (trimmed.length > 200) return { valid: false, reason: 'Task description cannot exceed 200 characters.' };
  return { valid: true, reason: null };
}

function validateLink(label, url) {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';
  if (trimmedLabel.length === 0) return { valid: false, reason: 'Label cannot be empty.' };
  if (trimmedLabel.length > 50) return { valid: false, reason: 'Label cannot exceed 50 characters.' };
  if (!/^https?:\/\/.+/.test(trimmedUrl)) return { valid: false, reason: 'URL must begin with http:// or https://.' };
  return { valid: true, reason: null };
}

function isDuplicate(links, label, url) {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';
  return links.some(link => link.label === trimmedLabel && link.url === trimmedUrl);
}

// ─── Focus Timer — Pure State Functions ───────────────────────────────────

function timerTick(state) {
  const next = state.remaining - 1;
  if (next <= 0) return { remaining: 0, running: false, complete: true };
  return { ...state, remaining: next };
}

function timerStart(state) {
  if (state.running || state.complete) return state;
  return { ...state, running: true };
}

function timerStop(state) {
  return { ...state, running: false };
}

function timerReset(_state) {
  return { remaining: 1500, running: false, complete: false };
}

// ─── To-Do — Pure State Functions ─────────────────────────────────────────

function addTask(tasks, text) {
  const trimmedText = typeof text === 'string' ? text.trim() : '';
  const { valid } = validateTaskText(trimmedText);
  if (!valid) return null;
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : Date.now().toString();
  return [...tasks, { id, text: trimmedText, completed: false }];
}

function deleteTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}

function toggleTask(tasks, id) {
  return tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
}

function editTask(tasks, id, text) {
  const trimmedText = typeof text === 'string' ? text.trim() : '';
  const { valid } = validateTaskText(trimmedText);
  if (!valid) return null;
  return tasks.map(task => task.id === id ? { ...task, text: trimmedText } : task);
}

// ─── Quick Links — Pure State Functions ───────────────────────────────────

function addLink(links, label, url) {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';
  const validation = validateLink(trimmedLabel, trimmedUrl);
  if (!validation.valid) return null;
  if (isDuplicate(links, trimmedLabel, trimmedUrl)) return null;
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : Date.now().toString();
  return [...links, { id, label: trimmedLabel, url: trimmedUrl }];
}

function deleteLink(links, id) {
  return links.filter(link => link.id !== id);
}

// ─── Focus Timer Module — DOM wiring ──────────────────────────────────────

const focusTimerModule = (() => {
  let state = { remaining: 1500, running: false, complete: false };
  let intervalId = null;

  function render() {
    const display = document.getElementById('timer-display');
    const message = document.getElementById('timer-message');
    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    if (!display || !message || !startBtn || !stopBtn || !resetBtn) return;
    display.textContent = formatTime(state.remaining);
    if (state.complete) {
      message.hidden = false;
      message.textContent = 'Session complete! Take a break, then reset to start again.';
    } else {
      message.hidden = true;
      message.textContent = '';
    }
    startBtn.disabled = state.running || state.complete;
    stopBtn.disabled  = !state.running;
    resetBtn.disabled = false;
  }

  function handleStart() {
    state = timerStart(state);
    if (!state.running) return;
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = setInterval(() => {
      state = timerTick(state);
      if (state.complete) { clearInterval(intervalId); intervalId = null; }
      render();
    }, 1000);
    render();
  }

  function handleStop() {
    state = timerStop(state);
    if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
    render();
  }

  function handleReset() {
    if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
    state = timerReset(state);
    render();
  }

  return {
    init() {
      state = { remaining: 1500, running: false, complete: false };
      intervalId = null;
      const startBtn = document.getElementById('timer-start');
      const stopBtn  = document.getElementById('timer-stop');
      const resetBtn = document.getElementById('timer-reset');
      if (startBtn) startBtn.addEventListener('click', handleStart);
      if (stopBtn)  stopBtn.addEventListener('click', handleStop);
      if (resetBtn) resetBtn.addEventListener('click', handleReset);
      render();
    }
  };
})();

// ─── To-Do Module — DOM wiring ────────────────────────────────────────────

const todoModule = (() => {
  let tasks = [];

  function render() {
    const list = document.getElementById('todo-list');
    const errorEl = document.getElementById('todo-error');
    if (!list) return;
    list.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (task.completed ? ' completed' : '');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', 'Mark complete: ' + task.text);
      checkbox.addEventListener('change', () => {
        tasks = toggleTask(tasks, task.id);
        saveToStorage('todo-tasks', tasks);
        render();
      });

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = task.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'todo-delete';
      deleteBtn.textContent = '\u00d7';
      deleteBtn.setAttribute('aria-label', 'Delete: ' + task.text);
      deleteBtn.addEventListener('click', () => {
        tasks = deleteTask(tasks, task.id);
        saveToStorage('todo-tasks', tasks);
        render();
      });

      li.append(checkbox, span, deleteBtn);
      list.appendChild(li);
    });
    if (errorEl) errorEl.hidden = true;
  }

  return {
    init() {
      tasks = loadFromStorage('todo-tasks') || [];
      const input   = document.getElementById('todo-input');
      const addBtn  = document.getElementById('todo-add-btn');
      const errorEl = document.getElementById('todo-error');

      function handleAdd() {
        const text = input ? input.value : '';
        const result = addTask(tasks, text);
        if (result === null) {
          if (errorEl) { errorEl.textContent = 'Task must be 1-200 characters.'; errorEl.hidden = false; }
          return;
        }
        tasks = result;
        saveToStorage('todo-tasks', tasks);
        if (input) input.value = '';
        if (errorEl) errorEl.hidden = true;
        render();
      }

      if (addBtn) addBtn.addEventListener('click', handleAdd);
      if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAdd(); });
      render();
    }
  };
})();

// ─── Quick Links Module — DOM wiring ──────────────────────────────────────

const quickLinksModule = (() => {
  let links = [];

  function render() {
    const container = document.getElementById('ql-list');
    const errorEl   = document.getElementById('ql-error');
    if (!container) return;
    container.innerHTML = '';
    links.forEach(link => {
      const item = document.createElement('div');
      item.className = 'ql-item';

      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.label;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'ql-delete';
      deleteBtn.textContent = '\u00d7';
      deleteBtn.setAttribute('aria-label', 'Delete: ' + link.label);
      deleteBtn.addEventListener('click', () => {
        links = deleteLink(links, link.id);
        saveToStorage('ql-links', links);
        render();
      });

      item.append(a, deleteBtn);
      container.appendChild(item);
    });
    if (errorEl) errorEl.hidden = true;
  }

  return {
    init() {
      links = loadFromStorage('ql-links') || [];
      const labelInput = document.getElementById('ql-label-input');
      const urlInput   = document.getElementById('ql-url-input');
      const addBtn     = document.getElementById('ql-add-btn');
      const errorEl    = document.getElementById('ql-error');

      if (addBtn) addBtn.addEventListener('click', () => {
        const label  = labelInput ? labelInput.value : '';
        const url    = urlInput   ? urlInput.value   : '';
        const result = addLink(links, label, url);
        if (result === null) {
          if (errorEl) { errorEl.textContent = 'Enter a label and a valid http/https URL.'; errorEl.hidden = false; }
          return;
        }
        links = result;
        saveToStorage('ql-links', links);
        if (labelInput) labelInput.value = '';
        if (urlInput)   urlInput.value   = '';
        render();
      });
      render();
    }
  };
})();

// ─── Greeting Module — live clock ─────────────────────────────────────────

const greetingModule = (() => {
  function render() {
    const now = new Date();
    const greetingEl = document.getElementById('greeting-text');
    const timeEl     = document.getElementById('current-time');
    const dateEl     = document.getElementById('current-date');
    if (greetingEl) greetingEl.textContent = getGreeting(now.getHours());
    if (timeEl)     timeEl.textContent     = formatTimeDisplay(now);
    if (dateEl)     dateEl.textContent     = formatDate(now);
  }
  return {
    init() { render(); setInterval(render, 1000); }
  };
})();

// ─── Bootstrap ────────────────────────────────────────────────────────────

function init() {
  greetingModule.init();
  focusTimerModule.init();
  todoModule.init();
  quickLinksModule.init();
}

document.addEventListener('DOMContentLoaded', init);
