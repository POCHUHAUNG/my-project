# Spec: Admin Member Management

## Requirement: Admin PATCH endpoint updates member fields

The `PATCH /api/admin/members/:memberId` endpoint SHALL be protected by `requireAdmin` middleware. It SHALL accept a JSON body with any subset of `{ name, email, isActivated }` and apply the changes to the matching member in members.json via `memberStore.updateMember`.

### Scenario: Partial update with valid data

- **WHEN** PATCH is called with `{ name: "新名字" }` and correct admin password
- **THEN** only the name field SHALL be updated; other fields SHALL remain unchanged

## Requirements

### Requirement: Admin PATCH endpoint updates member fields

The `PATCH /api/admin/members/:memberId` endpoint SHALL be protected by `requireAdmin` middleware. It SHALL accept a JSON body with any subset of `{ name, email, isActivated }` and apply the changes to the matching member in members.json via `memberStore.updateMember`.

#### Scenario: Partial update with valid data

- **WHEN** PATCH is called with `{ name: "新名字" }` and correct admin password
- **THEN** only the name field SHALL be updated; other fields SHALL remain unchanged

---
### Requirement: Admin page requires password authentication

The system SHALL protect the `/admin` route with a password. The password SHALL be stored in `process.env.ADMIN_PASSWORD`. Every admin API request SHALL include an `x-admin-password` header. The server SHALL return HTTP 401 if the header is missing or incorrect.

#### Scenario: Correct password entered

- **WHEN** a user submits the correct password on the `/admin` login form
- **THEN** the system SHALL fetch the member list and display the admin dashboard

#### Scenario: Incorrect password entered

- **WHEN** a user submits an incorrect password
- **THEN** the system SHALL display an error message "密碼錯誤" and remain on the login form


<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->

---
### Requirement: Admin can view all members with company name

The `GET /api/admin/members` endpoint SHALL return all members from `members.json`, excluding `passwordHash`, `setPasswordToken`, and `setPasswordTokenExpiry` fields. Each member record SHALL include a `company` field populated by cross-referencing the `registrations` Google Sheet (column D = email, column F = company).

#### Scenario: Member has a registration record

- **WHEN** a member's email exists in the registrations sheet
- **THEN** the system SHALL include the company from column F in the member record

#### Scenario: Member has no registration record

- **WHEN** a member's email does not exist in the registrations sheet
- **THEN** the system SHALL return `company: ""` for that member


<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->

---
### Requirement: Admin can delete individual members

The `DELETE /api/admin/members/:memberId` endpoint SHALL remove the member with the matching `memberId` from `members.json`. The system SHALL return HTTP 404 if the memberId does not exist.

#### Scenario: Valid memberId deleted

- **WHEN** DELETE is called with an existing memberId
- **THEN** the member SHALL be removed from members.json and the response SHALL be `{ success: true }`


<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->

---
### Requirement: Admin can clear all members

The `DELETE /api/admin/members` endpoint SHALL overwrite `members.json` with an empty array `[]`.

#### Scenario: Clear all triggered

- **WHEN** DELETE is called on `/api/admin/members` with valid admin password
- **THEN** members.json SHALL contain `[]` and the response SHALL be `{ success: true }`

<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->

---
### Requirement: Member list supports search by name or email

The admin member list SHALL include a text search input with placeholder "搜尋姓名或 Email". As the admin types, the displayed member rows SHALL be filtered in real time (case-insensitive) to include only members whose name or email contains the query string. The filter SHALL apply without any API call. When the search query changes, the current page SHALL reset to 1.

#### Scenario: Filter by name substring

- **WHEN** admin types a name substring into the search input
- **THEN** only member rows whose name contains the query (case-insensitive) SHALL be shown

#### Scenario: Filter by email substring

- **WHEN** admin types an email substring into the search input
- **THEN** only member rows whose email contains the query (case-insensitive) SHALL be shown

#### Scenario: Search reset clears filter

- **WHEN** admin clears the search input
- **THEN** all member rows SHALL be shown

<!-- @trace
source: member-list-search-pagination
updated: 2026-04-04
-->


<!-- @trace
source: member-list-search-pagination
updated: 2026-04-05
code:
  - client/dist/index.html
  - client/src/AdminContext.jsx
  - client/src/pages/LineCallbackPage.jsx
  - client/dist/favicon.svg
  - client/src/pages/AdminPage.jsx
  - client/src/main.jsx
  - client/dist/icons.svg
  - 活動報名系統-功能模板.md
  - client/vercel.json
  - client/dist/assets/index-DSnY0D3p.css
  - client/src/pages/LoginPage.jsx
  - client/dist/assets/index-B1M7jtPs.js
  - client/.env.example
  - deploy.bat
-->

---
### Requirement: Member list supports pagination with selectable page size

The admin member list SHALL display members in pages. The page size SHALL be selectable from the options 20, 30, 40, 50, defaulting to 20. A pagination control SHALL appear below the table showing the current page, total pages, and prev/next navigation buttons. Prev SHALL be disabled on page 1; next SHALL be disabled on the last page. When the page size selection changes, the current page SHALL reset to 1. Pagination SHALL apply to the search-filtered result set.

#### Scenario: Default page size is 20

- **WHEN** admin opens the member list with more than 20 members
- **THEN** only the first 20 members SHALL be shown and the page size selector SHALL show 20 as selected

#### Scenario: Page size change resets to page 1

- **WHEN** admin is on page 2 and changes the page size selector
- **THEN** the current page SHALL reset to 1 and the correct slice of members SHALL be displayed

#### Scenario: Search change resets to page 1

- **WHEN** admin is on page 3 and types into the search input
- **THEN** the current page SHALL reset to 1 and only matching members SHALL be shown

#### Scenario: Navigation buttons respect boundaries

- **WHEN** admin is on the first page
- **THEN** the prev button SHALL be disabled

- **WHEN** admin is on the last page
- **THEN** the next button SHALL be disabled

<!-- @trace
source: member-list-search-pagination
updated: 2026-04-04
-->

<!-- @trace
source: member-list-search-pagination
updated: 2026-04-05
code:
  - client/dist/index.html
  - client/src/AdminContext.jsx
  - client/src/pages/LineCallbackPage.jsx
  - client/dist/favicon.svg
  - client/src/pages/AdminPage.jsx
  - client/src/main.jsx
  - client/dist/icons.svg
  - 活動報名系統-功能模板.md
  - client/vercel.json
  - client/dist/assets/index-DSnY0D3p.css
  - client/src/pages/LoginPage.jsx
  - client/dist/assets/index-B1M7jtPs.js
  - client/.env.example
  - deploy.bat
-->