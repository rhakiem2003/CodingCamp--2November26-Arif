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


