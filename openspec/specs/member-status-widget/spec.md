## Requirements

### Requirement: Home page displays a fixed member status widget

The home page SHALL display a fixed-position member status widget in the top-right corner of the viewport that reflects the current authentication state.

#### Scenario: Unauthenticated user visits the home page

- **WHEN** a user visits any page and `localStorage.memberToken` is absent or the token resolves to an error
- **THEN** the widget SHALL render a purple capsule button labeled "👤 會員登入" linking to `/login`, fixed at `top: 12px; right: 16px; z-index: 1000`

#### Scenario: Authenticated user visits the home page

- **WHEN** a user visits any page and `localStorage.memberToken` resolves to a valid member
- **THEN** the widget SHALL render a green button displaying the member's name, and on click SHALL expand a dropdown panel

---
### Requirement: Member status dropdown shows registration status and history

The member status dropdown panel SHALL display the member's registration status and history for the current event.

#### Scenario: Member has no registrations

- **WHEN** the dropdown is opened and `/api/member/registrations` returns an empty array
- **THEN** the panel SHALL display "⏳ 尚未報名此活動" in a yellow badge

#### Scenario: Member has at least one registration

- **WHEN** the dropdown is opened and `/api/member/registrations` returns one or more records
- **THEN** the panel SHALL display "✅ 已完成報名" in a green badge and list each registration with course title, date, location, attendance status, and submission time

---
### Requirement: Member status widget is present on all pages

The member status widget SHALL be mounted outside the page route tree so it appears on every page including `/login`, `/member`, `/set-password`, and `/forgot-password`.

#### Scenario: User navigates between pages

- **WHEN** the user navigates to any route
- **THEN** the `<MemberStatus />` component SHALL remain mounted and visible
