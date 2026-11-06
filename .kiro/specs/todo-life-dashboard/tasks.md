# Implementation Plan: To-Do List Life Dashboard

## Overview

Build a zero-dependency, single-page web application delivered as three static files (`index.html`, `css/style.css`, `js/app.js`). The implementation follows a bottom-up order: shared utilities first, then each module's pure logic, then DOM wiring, and finally layout and styling. Property-based tests using **fast-check** (Node.js) validate the pure functions defined in `app.js`; unit tests cover boundary values and integration scenarios.

---

## Tasks

- [x] 1. Project scaffolding and shared utilities
  - [x] 1.1 Create the directory structure and stub files
    - Create `index.html` (semantic HTML5 boilerplate with four module card placeholders)
    - Create `css/style.css` (empty file with a file-level comment)
    - Create `js/app.js` (empty file with a file-level comment)
    - Create `tests/` directory with a stub `app.test.js`
    - Install `fast-check` and `uvu` as dev dependencies (or configure `node:test` if Node 18+ is available); add a `"test"` script to `package.json`
    - _Requirements: 5.1_

  - [x] 1.2 Implement shared storage utilities in `js/app.js`
    - Write `saveToStorage(key, data)` — JSON.stringify + localStorage.setItem; throws on quota error
    - Write `loadFromStorage(key)` — localStorage.getItem + JSON.parse; returns null on any parse or missing-key error
    - _Requirements: 3.11, 4.7_

  - [x] 1.3 Implement shared pure utility functions in `js/app.js`
    - Write `getGreeting(hour)` mapping integer hour [0–23] to one of four greeting strings per the exact boundaries in the design
    - Write `formatDate(date)` returning "Weekday, Month Day, Year"
    - Write `formatTimeDisplay(date)` returning "HH:MM:SS" (24-hour)
    - Write `formatTime(totalSeconds)` returning "MM:SS"
    - Write `validateTaskText(text)` returning `{ valid, reason }`
    - Write `validateLink(label, url)` returning `{ valid, reason }`
    - Write `isDuplicate(links, label, url)` returning boolean
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.6, 3.2, 3.3, 4.2, 4.3, 4.6_

  - [x]* 1.4 Write property tests for shared utility functions
    - **Property 1: Greeting mapping covers all 24 hours exactly** — `fc.integer({ min: 0, max: 23 })` asserts exactly one of the four strings for every hour in [0, 23] with correct boundary mapping
    - **Property 2: Date format always matches the expected pattern** — `fc.date()` asserts split on `", "` and `" "` yields valid weekday, month, day, year matching the Date object
    - **Property 3: Timer formatTime always produces valid MM:SS** — `fc.integer({ min: 0, max: 1500 })` asserts `"MM:SS"` form where `parseInt(MM)*60 + parseInt(SS) === s`
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 2.6**

  - [x]* 1.5 Write unit tests for shared utility functions
    - `getGreeting` boundary values: hours 0, 4, 5, 11, 12, 17, 18, 20, 21, 23
    - `formatTime(0) === "00:00"`, `formatTime(1500) === "25:00"`, `formatTime(90) === "01:30"`
    - `validateTaskText("")` fails, `validateTaskText(" ")` fails, `validateTaskText("a".repeat(201))` fails
    - `validateTaskText("hello")` passes, `validateTaskText("a".repeat(200))` passes
    - `validateLink("", "https://x.com")` fails; `validateLink("Google", "ftp://x.com")` fails; `validateLink("Google", "https://g.co")` passes
    - Corrupt JSON in loadFromStorage returns null
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.6, 3.2, 3.3, 4.2, 4.3_

- [x] 2. Focus Timer — pure logic and DOM wiring
  - [x] 2.1 Implement Focus Timer pure state functions in `js/app.js`
    - Write `timerTick(state)` — decrements remaining by 1; sets `complete: true` and `running: false` when reaching 0
    - Write `timerStart(state)` — returns state unchanged if `running === true` or `complete === true`; otherwise returns state with `running: true`
    - Write `timerStop(state)` — returns state with `running: false`
    - Write `timerReset(state)` — always returns `{ remaining: 1500, running: false, complete: false }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8_

  - [x]* 2.2 Write property tests for Focus Timer pure functions
    - **Property 4: Timer reset is always idempotent from any state** — `fc.record({ remaining: fc.integer({min:0,max:1500}), running: fc.boolean(), complete: fc.boolean() })` asserts `timerReset` always returns `{ remaining: 1500, running: false, complete: false }`
    - **Property 5: Timer start is a no-op when already running or complete** — generates running and complete states; asserts `timerStart(state)` returns state with all fields unchanged
    - **Validates: Requirements 2.1, 2.4, 2.7, 2.8**

  - [x]* 2.3 Write unit tests for Focus Timer pure functions
    - `timerTick` on state `{ remaining: 1, running: true, complete: false }` → `{ remaining: 0, running: false, complete: true }`
    - `timerStop` on running state → `running === false`, remaining unchanged
    - Session-complete state: `timerStart` returns identical state
    - `formatTime` spot-checks (already covered in 1.5; re-verify via timer integration)
    - _Requirements: 2.2, 2.3, 2.5, 2.7, 2.8_

  - [x] 2.4 Implement `focusTimerModule` in `js/app.js`
    - Write `focusTimerModule.init()` — initialises state, attaches Start/Stop/Reset button listeners, calls `render()`
    - Write the module-private `render()` — updates `#timer-display` with `formatTime(state.remaining)`, shows/hides `#timer-message`, updates button enabled states
    - Wire Start button to `timerStart`, Stop to `timerStop`, Reset to `timerReset` with `setInterval`/`clearInterval` side effects
    - Handle the session-complete message display in `#timer-message` when `state.complete === true`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 3. Checkpoint — timer smoke test
  - Ensure timer Start/Stop/Reset functions work correctly in isolation via unit tests.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. To-Do Module — pure logic and DOM wiring
  - [x] 4.1 Implement To-Do pure state functions in `js/app.js`
    - Write `addTask(tasks, text)` — trims text, validates via `validateTaskText`, generates id, returns new array or null
    - Write `deleteTask(tasks, id)` — returns filtered array excluding matching id
    - Write `toggleTask(tasks, id)` — flips `completed` on matching task; returns new array
    - Write `editTask(tasks, id, text)` — validates text, returns updated array or null if invalid
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9_

  - [ ]* 4.2 Write property tests for To-Do pure functions
    - **Property 6: Valid task description always grows the task list by exactly one** — `fc.array(taskArb)` + `fc.string({minLength:1,maxLength:200}).filter(s=>s.trim().length>=1)` asserts length increases by 1 and last element has trimmed text and `completed: false`
    - **Property 7: Invalid task description never mutates the task list** — empty/whitespace/201+ char strings assert `addTask` returns null
    - **Property 8: Completion toggle is a round-trip** — `fc.array(taskArb, {minLength:1})` + random index asserts double-toggle restores original `completed`
    - **Property 9: Delete reduces list length by exactly one and excludes the deleted task** — `fc.array(taskArb, {minLength:1})` + random index asserts length decreases by 1 and id absent
    - **Property 10: Task description validation is symmetric for add and edit** — `fc.array(taskArb, {minLength:1})` + `fc.string()` asserts `editTask` accepts iff `validateTaskText` returns valid
    - **Property 11: Task list serialization round-trip preserves all data** — `fc.array(taskArb)` asserts `JSON.parse(JSON.stringify(tasks))` equals original
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9, 3.11**

  - [ ]* 4.3 Write unit tests for To-Do pure functions
    - `addTask` with empty string → null; with 201-char string → null; with valid string → array length +1
    - `deleteTask` on last remaining task → empty array
    - `toggleTask` on completed task → uncompletes it
    - `editTask` cancel scenario: original text preserved when edit is discarded
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9_

  - [x] 4.4 Implement `todoModule` in `js/app.js`
    - Write `todoModule.init()` — calls `loadFromStorage("todo-tasks")`, handles null/corrupt JSON (show error, empty list), attaches form listener (Enter key + button), calls `render()`
    - Write `todoModule.render(tasks)` — rebuilds `#todo-list` DOM: each task gets a checkbox, text span (strikethrough when `completed`), edit button, and delete button
    - Wire Add control: validate → `addTask` → `saveToStorage` → `render()`; show inline error on rejection
    - Wire complete toggle: `toggleTask` → `saveToStorage` → `render()`
    - Wire delete control: `deleteTask` → `saveToStorage` → `render()`
    - Wire edit control: replace task row with editable field + Save + Cancel; on Save call `editTask` → `saveToStorage` → `render()`; on Cancel re-render with original text
    - Handle `saveToStorage` exceptions: show inline error, roll back in-memory change
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13_

- [ ] 5. Checkpoint — To-Do module smoke test
  - Ensure all To-Do pure function tests pass.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Quick Links Module — pure logic and DOM wiring
  - [x] 6.1 Implement Quick Links pure state functions in `js/app.js`
    - Write `addLink(links, label, url)` — trims inputs, validates via `validateLink`, checks `isDuplicate`, generates id, returns new array or null
    - Write `deleteLink(links, id)` — returns filtered array excluding matching id
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [ ]* 6.2 Write property tests for Quick Links pure functions
    - **Property 12: Valid label+URL always grows the links list by exactly one** — `fc.array(linkArb)` + valid non-duplicate label/URL asserts length increases by 1
    - **Property 13: Invalid or duplicate label+URL never mutates the links list** — malformed and duplicate pairs assert `addLink` returns null
    - **Property 14: Link delete reduces list length by exactly one and excludes the deleted link** — `fc.array(linkArb, {minLength:1})` + random index asserts length decreases by 1 and id absent
    - **Property 15: Link list serialization round-trip preserves all data** — `fc.array(linkArb)` asserts `JSON.parse(JSON.stringify(links))` equals original
    - **Validates: Requirements 4.2, 4.3, 4.5, 4.6, 4.7**

  - [ ]* 6.3 Write unit tests for Quick Links pure functions
    - `addLink` with missing label → null; with `ftp://` URL → null; with valid inputs → length +1
    - `addLink` with duplicate label+URL → null
    - `deleteLink` on last remaining link → empty array
    - _Requirements: 4.2, 4.3, 4.5, 4.6_

  - [ ] 6.4 Implement `quickLinksModule` in `js/app.js`
    - Write `quickLinksModule.init()` — loads from `"quick-links"` key, handles null/corrupt JSON, attaches form listener, calls `render()`
    - Write `quickLinksModule.render(links)` — rebuilds `#ql-list` DOM: each link renders as a clickable button (opens URL in new tab via `window.open`) with a delete control
    - Wire Add control: validate → `addLink` → `saveToStorage` → `render()`; show inline error in `#ql-error` on rejection or duplicate; clear error on success
    - Wire delete control: `deleteLink` → `saveToStorage` → `render()`
    - Handle `saveToStorage` exceptions: show inline error in `#ql-error`, do NOT update rendered list
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [ ] 7. Checkpoint — Quick Links module smoke test
  - Ensure all Quick Links pure function tests pass.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Greeting Module — live clock wiring
  - [ ] 8.1 Implement `greetingModule` in `js/app.js`
    - Write `greetingModule.init()` — starts a `setInterval` of 1000 ms that calls the private `tick()` function
    - Write the private `tick()` — calls `new Date()`, calls `formatTimeDisplay`, `formatDate`, and `getGreeting`; updates `#greeting-text`, `#current-time`, and `#current-date`
    - Handle invalid Date (fallback to `"--:--:--"`, `"---"`, `"---"`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [ ] 9. Bootstrap — wire all modules together
  - [ ] 9.1 Implement the top-level `init()` bootstrap in `js/app.js`
    - Add a `DOMContentLoaded` listener that calls `greetingModule.init()`, `focusTimerModule.init()`, `todoModule.init()`, and `quickLinksModule.init()` in order
    - _Requirements: 5.1, 5.2_

  - [ ]* 9.2 Write integration tests for bootstrap and persistence
    - Load page with pre-seeded LocalStorage tasks → verify tasks render correctly
    - Load page with pre-seeded LocalStorage links → verify link buttons render correctly
    - Load page with corrupt LocalStorage data → verify error message appears and list is empty
    - Timer: start → advance 3 ticks via fake timer → verify display decrements correctly
    - Timer: drive to 0 → verify session-complete message and Start is ignored
    - _Requirements: 3.12, 3.13, 4.9, 2.5, 2.8_

- [ ] 10. HTML markup — `index.html`
  - [ ] 10.1 Build the complete `index.html` structure
    - Write semantic HTML5: `<header>` for Greeting module (contains `#greeting-text`, `#current-time`, `#current-date`), `<section>` cards for Focus Timer, To-Do List, and Quick Links
    - Add all DOM targets required by `js/app.js`: `#timer-display`, `#timer-start`, `#timer-stop`, `#timer-reset`, `#timer-message`, `#todo-input`, `#todo-add-btn`, `#todo-list`, `#ql-label-input`, `#ql-url-input`, `#ql-add-btn`, `#ql-error`, `#ql-list`
    - Reference `css/style.css` and `js/app.js` (defer or place before `</body>`)
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 11. CSS styling and responsive layout — `css/style.css`
  - [ ] 11.1 Define CSS design tokens and global styles
    - Declare CSS custom properties for color palette, spacing scale, border-radius, font-size scale, and font-family system stack
    - Apply `box-sizing: border-box` globally; set base font-family to the sans-serif system stack
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ] 11.2 Implement grid/column layout and module card styles
    - Lay out the four module cards in a CSS Grid (≥768 px: two-column or four-column; <768 px: single-column via media query)
    - Style each card with consistent padding, border, and border-radius from design tokens
    - _Requirements: 6.1, 6.6_

  - [ ] 11.3 Style interactive controls and hover states
    - Apply consistent button styles (background, border, padding, cursor) across all four modules using shared tokens
    - Add `:hover` rules that change at least one visible CSS property (background-color or border-color) for every button, input, and link button
    - Style the strikethrough state for completed tasks (`text-decoration: line-through`)
    - Style inline error messages (color, font-size)
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 12. Final checkpoint — full integration
  - Open `index.html` via `file://` URL (or serve locally) and manually verify all four modules render and respond correctly.
  - Ensure all automated tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 3, 5, 7, 12) ensure incremental validation after each major module
- Property tests validate the 15 universal correctness properties defined in `design.md`; unit tests cover boundary values and specific examples
- `crypto.randomUUID()` is preferred for ID generation; fall back to `Date.now().toString()` if unavailable
- The test runner (`uvu` or `node:test`) operates against exported pure functions from `app.js`; DOM-dependent code is tested via integration tests with JSDOM or a browser harness

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "4.1", "6.1"] },
    { "id": 4, "tasks": ["2.4", "4.2", "4.3", "6.2", "6.3"] },
    { "id": 5, "tasks": ["4.4", "6.4", "8.1"] },
    { "id": 6, "tasks": ["9.1", "10.1"] },
    { "id": 7, "tasks": ["9.2", "11.1"] },
    { "id": 8, "tasks": ["11.2"] },
    { "id": 9, "tasks": ["11.3"] }
  ]
}
```
