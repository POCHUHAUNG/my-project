## Requirements

### Requirement: Three-button scroll navigation renders on all pages

The app SHALL render a fixed-position scroll navigation group containing three buttons — scroll to top (↑), scroll to middle (↕), and scroll to bottom (↓) — stacked vertically in the bottom-right corner of the viewport. The group SHALL only be visible when `window.scrollY` exceeds 300 pixels. When `window.scrollY` is 300 pixels or less, the entire group SHALL be hidden.

#### Scenario: Group hidden near top

- **WHEN** the user is within the top 300px of the page
- **THEN** all three scroll buttons SHALL NOT be visible

#### Scenario: Group visible after scrolling down

- **WHEN** the user scrolls past 300px from the top
- **THEN** all three scroll buttons SHALL become visible


<!-- @trace
source: scroll-navigation-buttons
updated: 2026-04-05
code:
  - client/vercel.json
  - client/dist/index.html
  - deploy.bat
  - client/dist/assets/index-B1M7jtPs.js
  - client/src/pages/LineCallbackPage.jsx
  - client/dist/assets/index-Cmqaqv77.js
  - client/src/App.jsx
  - 活動報名系統-功能模板.md
  - client/.env.example
  - client/src/AdminContext.jsx
  - client/src/pages/LoginPage.jsx
-->

---
### Requirement: Scroll to top button navigates to page top

Clicking the ↑ button SHALL smoothly scroll the page to `scrollY = 0`.

#### Scenario: Click scroll-to-top

- **WHEN** user clicks the ↑ button
- **THEN** the page SHALL smoothly scroll to the very top (scrollY = 0)


<!-- @trace
source: scroll-navigation-buttons
updated: 2026-04-05
code:
  - client/vercel.json
  - client/dist/index.html
  - deploy.bat
  - client/dist/assets/index-B1M7jtPs.js
  - client/src/pages/LineCallbackPage.jsx
  - client/dist/assets/index-Cmqaqv77.js
  - client/src/App.jsx
  - 活動報名系統-功能模板.md
  - client/.env.example
  - client/src/AdminContext.jsx
  - client/src/pages/LoginPage.jsx
-->

---
### Requirement: Scroll to middle button navigates to page middle

Clicking the ↕ button SHALL smoothly scroll the page to the vertical midpoint, calculated as `document.body.scrollHeight / 2`.

#### Scenario: Click scroll-to-middle

- **WHEN** user clicks the ↕ button
- **THEN** the page SHALL smoothly scroll to the vertical midpoint of the document


<!-- @trace
source: scroll-navigation-buttons
updated: 2026-04-05
code:
  - client/vercel.json
  - client/dist/index.html
  - deploy.bat
  - client/dist/assets/index-B1M7jtPs.js
  - client/src/pages/LineCallbackPage.jsx
  - client/dist/assets/index-Cmqaqv77.js
  - client/src/App.jsx
  - 活動報名系統-功能模板.md
  - client/.env.example
  - client/src/AdminContext.jsx
  - client/src/pages/LoginPage.jsx
-->

---
### Requirement: Scroll to bottom button navigates to page bottom

Clicking the ↓ button SHALL smoothly scroll the page to `document.body.scrollHeight`.

#### Scenario: Click scroll-to-bottom

- **WHEN** user clicks the ↓ button
- **THEN** the page SHALL smoothly scroll to the very bottom of the document

<!-- @trace
source: scroll-navigation-buttons
updated: 2026-04-05
code:
  - client/vercel.json
  - client/dist/index.html
  - deploy.bat
  - client/dist/assets/index-B1M7jtPs.js
  - client/src/pages/LineCallbackPage.jsx
  - client/dist/assets/index-Cmqaqv77.js
  - client/src/App.jsx
  - 活動報名系統-功能模板.md
  - client/.env.example
  - client/src/AdminContext.jsx
  - client/src/pages/LoginPage.jsx
-->