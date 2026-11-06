/* js/app.js — To-Do Life Dashboard application logic */

// ─── Shared Storage Utilities ────────────────────────────────────────────────

/**
 * Persists data to localStorage under the given key.
 * Serialises the value with JSON.stringify before writing.
 * @param {string} key
 * @param {*} data
 * @throws {DOMException} Re-throws any QuotaExceededError from localStorage.setItem
 */
export function saveToStorage(key, data) {
  const serialised = JSON.stringify(data);
  localStorage.setItem(key, serialised); // throws DOMException on quota error
}

/**
 * Retrieves and deserialises a value from localStorage.
 * Returns null when the key is absent or the stored string is not valid JSON.
 * @param {string} key
 * @returns {*|null}
 */
export function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shared Pure Utility Functions (Task 1.3)
// ---------------------------------------------------------------------------

/**
 * Maps an integer hour [0–23] to a time-sensitive greeting string.
 * @param {number} hour - Integer in [0, 23]
 * @returns {string}
 */
export function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 20) return 'Good Evening';
  return 'Good Night'; // [0–4] and [21–23]
}

/**
 * Formats a Date object as "Weekday, Month Day, Year"
 * e.g. "Monday, January 6, 2025"
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Formats a Date object as "HH:MM:SS" in 24-hour time.
 * @param {Date} date
 * @returns {string}
 */
export function formatTimeDisplay(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Converts a total number of seconds into "MM:SS" format.
 * @param {number} totalSeconds - Integer in [0, 1500]
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Validates a task description string.
 * Valid if trimmed length is between 1 and 200 characters (inclusive).
 * @param {string} text
 * @returns {{ valid: boolean, reason: string | null }}
 */
export function validateTaskText(text) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (trimmed.length === 0) {
    return { valid: false, reason: 'Task description cannot be empty.' };
  }
  if (trimmed.length > 200) {
    return { valid: false, reason: 'Task description cannot exceed 200 characters.' };
  }
  return { valid: true, reason: null };
}

/**
 * Validates a quick-link label and URL.
 * Valid if label is non-empty and at most 50 chars,
 * and URL matches /^https?:\/\/.+/.
 * @param {string} label
 * @param {string} url
 * @returns {{ valid: boolean, reason: string | null }}
 */
export function validateLink(label, url) {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';

  if (trimmedLabel.length === 0) {
    return { valid: false, reason: 'Label cannot be empty.' };
  }
  if (trimmedLabel.length > 50) {
    return { valid: false, reason: 'Label cannot exceed 50 characters.' };
  }
  if (!/^https?:\/\/.+/.test(trimmedUrl)) {
    return { valid: false, reason: 'URL must begin with "http://" or "https://" followed by at least one character.' };
  }
  return { valid: true, reason: null };
}

/**
 * Checks whether a links array already contains an entry with the
 * same trimmed label and trimmed URL.
 * @param {Array<{ label: string, url: string }>} links
 * @param {string} label
 * @param {string} url
 * @returns {boolean}
 */
export function isDuplicate(links, label, url) {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';
  return links.some(
    (link) => link.label === trimmedLabel && link.url === trimmedUrl
  );
}



// ---------------------------------------------------------------------------
// Focus Timer — Pure State Functions (Task 2.1)
// ---------------------------------------------------------------------------

/**
 * Advances the timer by one second.
 * When remaining reaches 0, marks the session as complete and stops running.
 * @param {{ remaining: number, running: boolean, complete: boolean }} state
 * @returns {{ remaining: number, running: boolean, complete: boolean }}
 */
export function timerTick(state) {
  const next = state.remaining - 1;
  if (next <= 0) {
    return { remaining: 0, running: false, complete: true };
  }
  return { ...state, remaining: next };
}

/**
 * Starts the timer.
 * Returns state unchanged when already running or when the session is complete
 * (Requirements 2.7, 2.8).
 * @param {{ remaining: number, running: boolean, complete: boolean }} state
 * @returns {{ remaining: number, running: boolean, complete: boolean }}
 */
export function timerStart(state) {
  if (state.running || state.complete) return state;
  return { ...state, running: true };
}

/**
 * Pauses the timer, preserving the current remaining value.
 * @param {{ remaining: number, running: boolean, complete: boolean }} state
 * @returns {{ remaining: number, running: boolean, complete: boolean }}
 */
export function timerStop(state) {
  return { ...state, running: false };
}

/**
 * Resets the timer to its initial 25-minute state regardless of current state.
 * @param {{ remaining: number, running: boolean, complete: boolean }} _state
 * @returns {{ remaining: 1500, running: false, complete: false }}
 */
export function timerReset(_state) {
  return { remaining: 1500, running: false, complete: false };
}

// ---------------------------------------------------------------------------
// Quick Links — Pure State Functions (Task 6.1)
// ---------------------------------------------------------------------------

/**
 * Adds a new link to the links array.
 * Trims label and URL, validates them via validateLink, checks for duplicates
 * via isDuplicate, generates a unique id, and returns the new array.
 * Returns null if validation fails or the label+URL pair already exists.
 *
 * @param {Array<{ id: string, label: string, url: string }>} links
 * @param {string} label - Display text (1–50 chars)
 * @param {string} url   - URL beginning with http:// or https://
 * @returns {Array<{ id: string, label: string, url: string }> | null}
 */
export function addLink(links, label, url) {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';

  const validation = validateLink(trimmedLabel, trimmedUrl);
  if (!validation.valid) return null;

  if (isDuplicate(links, trimmedLabel, trimmedUrl)) return null;

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Date.now().toString();

  return [...links, { id, label: trimmedLabel, url: trimmedUrl }];
}

/**
 * Removes the link with the given id from the links array.
 * Returns a new array without the matching entry (original array is unchanged).
 *
 * @param {Array<{ id: string, label: string, url: string }>} links
 * @param {string} id - The id of the link to remove
 * @returns {Array<{ id: string, label: string, url: string }>}
 */
export function deleteLink(links, id) {
  return links.filter((link) => link.id !== id);
}

// ---------------------------------------------------------------------------
// To-Do Module — Pure State Functions (Task 4.1)
// ---------------------------------------------------------------------------

/**
 * Adds a new task to the task list.
 * Trims the text, validates it via validateTaskText, generates a unique id,
 * and returns a new array with the task appended.
 * Returns null when validation fails (empty, whitespace-only, or >200 chars).
 * @param {Array<{ id: string, text: string, completed: boolean }>} tasks
 * @param {string} text
 * @returns {Array<{ id: string, text: string, completed: boolean }> | null}
 */
export function addTask(tasks, text) {
  const trimmedText = typeof text === 'string' ? text.trim() : '';
  const { valid } = validateTaskText(trimmedText);
  if (!valid) return null;

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Date.now().toString();

  return [...tasks, { id, text: trimmedText, completed: false }];
}

/**
 * Removes the task matching the given id from the list.
 * Returns a new array; the original is not mutated.
 * @param {Array<{ id: string, text: string, completed: boolean }>} tasks
 * @param {string} id
 * @returns {Array<{ id: string, text: string, completed: boolean }>}
 */
export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

/**
 * Flips the `completed` flag on the task matching the given id.
 * Returns a new array; all other tasks are unchanged (immutable update).
 * @param {Array<{ id: string, text: string, completed: boolean }>} tasks
 * @param {string} id
 * @returns {Array<{ id: string, text: string, completed: boolean }>}
 */
export function toggleTask(tasks, id) {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
}

/**
 * Updates the text of the task matching the given id.
 * Trims the new text and validates it via validateTaskText.
 * Returns the updated array on success, or null when validation fails.
 * @param {Array<{ id: string, text: string, completed: boolean }>} tasks
 * @param {string} id
 * @param {string} text
 * @returns {Array<{ id: string, text: string, completed: boolean }> | null}
 */
export function editTask(tasks, id, text) {
  const trimmedText = typeof text === 'string' ? text.trim() : '';
  const { valid } = validateTaskText(trimmedText);
  if (!valid) return null;

  return tasks.map((task) =>
    task.id === id ? { ...task, text: trimmedText } : task
  );
}

// ---------------------------------------------------------------------------
// Focus Timer Module — DOM wiring (Task 2.4)
// ---------------------------------------------------------------------------

/**
 * focusTimerModule
 *
 * Manages the Focus Timer UI. Owns all mutable timer state and the setInterval
 * handle within a closure so nothing leaks into the global scope.
 *
 * DOM targets:
 *   #timer-display  — shows remaining time as MM:SS
 *   #timer-start    — Start button
 *   #timer-stop     — Stop button
 *   #timer-reset    — Reset button
 *   #timer-message  — session-complete message (hidden until complete)
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */
export const focusTimerModule = (() => {
  /** @type {{ remaining: number, running: boolean, complete: boolean }} */
  let state = { remaining: 1500, running: false, complete: false };

  /** @type {number | null} */
  let intervalId = null;

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Re-renders the timer UI to match the current state.
   * Updates the display, message visibility, and button enabled states.
   */
  function render() {
    const display = document.getElementById('timer-display');
    const message = document.getElementById('timer-message');
    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');

    if (!display || !message || !startBtn || !stopBtn || !resetBtn) return;

    // Time display — always visible
    display.textContent = formatTime(state.remaining);

    // Session-complete message — visible only when complete
    if (state.complete) {
      message.hidden = false;
      message.textContent = 'Session complete! Take a break, then reset to start again.';
    } else {
      message.hidden = true;
      message.textContent = '';
    }

    // Button enabled states
    // Start: disabled while running OR after session is complete (Req 2.7, 2.8)
    startBtn.disabled = state.running || state.complete;
    // Stop: disabled when not running
    stopBtn.disabled  = !state.running;
    // Reset: always enabled (Req 2.4)
    resetBtn.disabled = false;
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  /** Handles the Start button click — starts the countdown interval. */
  function handleStart() {
    state = timerStart(state);
    if (!state.running) return; // guard: already running or complete → no-op

    if (intervalId !== null) {
      clearInterval(intervalId); // defensive: clear any stale interval
    }

    intervalId = setInterval(() => {
      state = timerTick(state);

      if (state.complete) {
        clearInterval(intervalId);
        intervalId = null;
      }

      render();
    }, 1000);

    render();
  }

  /** Handles the Stop button click — pauses the countdown. */
  function handleStop() {
    state = timerStop(state);

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    render();
  }

  /** Handles the Reset button click — restores the initial 25:00 state. */
  function handleReset() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    state = timerReset(state);
    render();
  }

  // ── Public interface ───────────────────────────────────────────────────────

  return {
    /**
     * Initialises the Focus Timer module.
     * Sets up the initial state, wires button event listeners, and renders.
     */
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
    },
  };
})();

// ---------------------------------------------------------------------------
// To-Do Module — DOM wiring
// ---------------------------------------------------------------------------
export const todoModule = (() => {
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

// ---------------------------------------------------------------------------
// Quick Links Module — DOM wiring
// ---------------------------------------------------------------------------
export const quickLinksModule = (() => {
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

// ---------------------------------------------------------------------------
// Greeting Module — live clock
// ---------------------------------------------------------------------------
export const greetingModule = (() => {
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

// ---------------------------------------------------------------------------
// Bootstrap — start everything on page load
// ---------------------------------------------------------------------------
function init() {
  greetingModule.init();
  focusTimerModule.init();
  todoModule.init();
  quickLinksModule.init();
}

document.addEventListener('DOMContentLoaded', init);
