# Requirements Document

## Introduction

The To-Do List Life Dashboard is a standalone, single-page web application built with HTML, CSS, and Vanilla JavaScript. It provides four integrated modules — a live Greeting panel, a Focus Timer, a To-Do List, and a Quick Links panel — all running in the browser with no backend. All user data is persisted exclusively through the browser's LocalStorage API, making the app instantly usable with zero setup.

## Glossary

- **Dashboard**: The single HTML page that hosts all four modules.
- **Greeting_Module**: The UI section that displays the current time, date, and a time-sensitive greeting.
- **Focus_Timer**: The UI section providing a 25-minute countdown timer with Start, Stop, and Reset controls.
- **Todo_Module**: The UI section where users manage a list of tasks (add, edit, complete, delete).
- **QuickLinks_Module**: The UI section where users manage and launch bookmarked URLs as clickable buttons.
- **Task**: A single to-do item with a text description and a completion state.
- **Link**: A user-defined bookmark with a label and a URL.
- **LocalStorage**: The browser's built-in key-value store, scoped to the page origin, used for all data persistence.
- **Renderer**: The JavaScript functions responsible for re-drawing a module's DOM whenever its data changes.

---

## Requirements

### Requirement 1: Greeting Module — Live Time and Date Display

**User Story:** As a user, I want to see the current time, date, and a greeting when I open the dashboard, so that I always have an at-a-glance context of the moment.

#### Acceptance Criteria

1. THE Greeting_Module SHALL display the current local time in HH:MM:SS (24-hour) format, updated every second.
2. THE Greeting_Module SHALL display the current local date in the format "Weekday, Month Day, Year" (e.g., Monday, January 6, 2025).
3. WHEN the local hour is between 05:00 and 11:59 inclusive, THE Greeting_Module SHALL display the greeting "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59 inclusive, THE Greeting_Module SHALL display the greeting "Good Afternoon".
5. WHEN the local hour is between 18:00 and 20:59 inclusive, THE Greeting_Module SHALL display the greeting "Good Evening".
6. WHEN the local hour is between 21:00 and 04:59 inclusive (spanning midnight), THE Greeting_Module SHALL display the greeting "Good Night".
7. WHEN the local time crosses an hour boundary (e.g., 11:59:59 to 12:00:00), THE Greeting_Module SHALL update the displayed greeting within one second of the boundary crossing.
8. WHEN the Dashboard page loads, THE Greeting_Module SHALL begin updating the time display without requiring any user interaction.
9. IF the local clock cannot be read, THEN THE Greeting_Module SHALL display a placeholder indicating that time and date information is unavailable.

---

### Requirement 2: Focus Timer — 25-Minute Countdown

**User Story:** As a user, I want a 25-minute countdown timer I can start, stop, and reset, so that I can work in focused Pomodoro-style sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00) on every page load and after every reset.
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin decrementing the countdown by one second on each elapsed second.
3. WHEN the user activates the Stop control, THE Focus_Timer SHALL pause the countdown at its current value without resetting it.
4. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop the countdown and restore the display to 25:00.
5. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visible session-complete message until the user activates the Reset control.
6. WHILE the Focus_Timer is actively counting down, THE Focus_Timer SHALL display the remaining time in MM:SS format, updating every second.
7. IF the user activates the Start control while the timer is already running, THEN THE Focus_Timer SHALL ignore the activation and continue the current countdown without resetting.
8. IF the user activates the Start control when the countdown is at 00:00 (session complete, not yet reset), THEN THE Focus_Timer SHALL ignore the activation and preserve the session-complete message.

---

### Requirement 3: To-Do List — Task Management

**User Story:** As a user, I want to add, edit, complete, and delete tasks in a persistent list, so that I can track my daily work items across browser sessions.

#### Acceptance Criteria

1. THE Todo_Module SHALL provide a text input field and an Add control that creates a new Task from the entered text.
2. WHEN the user submits a task description of 1 to 200 characters (trimmed) via the Add control or the Enter key, THE Todo_Module SHALL append the new Task to the list and clear the input field.
3. IF the user attempts to submit a task description that is empty, whitespace-only, or exceeds 200 characters, THEN THE Todo_Module SHALL reject the submission and leave the input field unchanged.
4. WHEN the user activates the complete toggle on a Task, THE Todo_Module SHALL mark the Task as done and apply strikethrough styling to the Task text.
5. WHEN the user activates the complete toggle on an already-completed Task, THE Todo_Module SHALL unmark the Task and remove the strikethrough styling from the Task text.
6. WHEN the user activates the delete control on a Task, THE Todo_Module SHALL remove that Task from the list permanently.
7. WHEN the user activates the edit control on a Task, THE Todo_Module SHALL display the Task text in an editable field with a Save control and a Cancel control.
8. WHEN the user saves an edited Task with a description of 1 to 200 characters (trimmed), THE Todo_Module SHALL update the stored description and re-render the Task with the new text.
9. IF the user saves an edited Task with a description that is empty, whitespace-only, or exceeds 200 characters, THEN THE Todo_Module SHALL reject the save and retain the original task description in the editable field.
10. WHEN the user activates the Cancel control during an edit, THE Todo_Module SHALL discard all edits and re-render the Task with its original description.
11. THE Todo_Module SHALL persist all tasks (text and completion state) to LocalStorage after every add, edit, complete-toggle, or delete operation.
12. WHEN the Dashboard page loads, THE Todo_Module SHALL retrieve and render all previously saved tasks from LocalStorage.
13. IF LocalStorage data cannot be parsed on Dashboard page load, THEN THE Todo_Module SHALL render an empty task list and display an error message indicating that saved tasks could not be loaded.

---

### Requirement 4: Quick Links — Bookmark Management

**User Story:** As a user, I want to save and launch favorite URLs as labeled buttons, so that I can access frequently visited sites with a single click from my dashboard.

#### Acceptance Criteria

1. THE QuickLinks_Module SHALL provide a label input field (maximum 50 characters), a URL input field (maximum 2048 characters), and an Add control that creates a new Link.
2. WHEN the user submits a non-empty label and a valid URL (beginning with "http://" or "https://" followed by at least one additional character), THE QuickLinks_Module SHALL add the new Link and render it as a clickable button labeled with the provided label.
3. IF the user submits a missing label, an empty URL, or a URL that does not begin with "http://" or "https://" followed by at least one additional character, THEN THE QuickLinks_Module SHALL reject the submission and display an inline error message identifying which field is invalid and the reason for rejection.
4. WHEN the user activates a Link button, THE QuickLinks_Module SHALL open the corresponding URL in a new browser tab.
5. WHEN the user activates the delete control on a Link, THE QuickLinks_Module SHALL remove that Link from the list and re-render the buttons.
6. IF the user submits a label and URL combination that is identical to an existing Link, THEN THE QuickLinks_Module SHALL reject the submission and display an inline error message indicating a duplicate Link already exists.
7. WHEN the user adds or deletes a Link, THE QuickLinks_Module SHALL persist all current links (label and URL) to LocalStorage.
8. IF a LocalStorage write operation fails, THEN THE QuickLinks_Module SHALL display an inline error message indicating that the Link could not be saved and SHALL NOT add or remove the Link from the rendered list.
9. WHEN the Dashboard page loads, THE QuickLinks_Module SHALL retrieve and render all previously saved links from LocalStorage.

---

### Requirement 5: Technical Stack and Deployment Constraints

**User Story:** As a developer, I want the app to be built with plain HTML, CSS, and JavaScript with no build step required, so that it can be opened directly in any modern browser without any server or toolchain setup.

#### Acceptance Criteria

1. THE Dashboard SHALL be delivered as a single `index.html` file that references exactly one external CSS file located at `css/style.css` and exactly one external JavaScript file located at `js/app.js`.
2. IF the Dashboard is opened via a `file://` URL in Chrome, Firefox, Edge, or Safari, THEN THE Dashboard SHALL display all four modules without JavaScript console errors, without making any network requests, and with all interactive controls responding to user input.
3. THE Dashboard SHALL use only APIs built into the browser runtime (requiring no installation, import map, or CDN link), including but not limited to DOM manipulation, LocalStorage, setInterval, and Date, with no third-party libraries or frameworks referenced in any file.
4. THE Dashboard SHALL load and render all four modules within 2 seconds when opened on a machine with at least a dual-core 2 GHz CPU and 4 GB RAM, with no network dependency.

---

### Requirement 6: Visual Design and Responsive Layout

**User Story:** As a user, I want a clean, readable, and visually organised dashboard, so that I can navigate and use all modules without confusion.

#### Acceptance Criteria

1. THE Dashboard SHALL arrange the four modules in a grid or column layout such that all modules are visible without horizontal scrolling on viewport widths of 768 px and above.
2. THE Dashboard SHALL apply the same set of font sizes, color values, and spacing units across all four modules, with no module using a font size, color value, or spacing unit not used by the other modules.
3. THE Dashboard SHALL provide a color contrast ratio of at least 4.5:1 between normal text (below 18 pt / 24 px regular or 14 pt / 18.67 px bold) and its background, and at least 3:1 between large text (18 pt / 24 px regular or larger, or 14 pt / 18.67 px bold or larger) and its background, in compliance with WCAG 2.1 AA.
4. WHEN the user hovers over an interactive control (button, input, link button), THE Dashboard SHALL change at least one visible CSS property of that control (such as background color, border color, or text decoration) from its non-hovered value.
5. THE Dashboard SHALL display all text in a sans-serif typeface loaded from the system font stack or a single web-safe font, with no external font network requests required.
6. WHEN the viewport width is below 768 px, THE Dashboard SHALL stack all four modules in a single column such that each module occupies the full viewport width and no content is hidden or requires horizontal scrolling to access.
