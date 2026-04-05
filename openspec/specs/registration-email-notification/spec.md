# Spec: Registration Email Notification

## Requirements

### Requirement: Member receives registration confirmation email

After a successful registration, the system SHALL send an HTML confirmation email to the registrant's email address if `process.env.EMAIL_USER` is set. The email SHALL include: event title, date, location, company, member number, and a link to the member page.

#### Scenario: EMAIL_USER is configured

- **WHEN** `POST /api/register` completes successfully and `EMAIL_USER` env var is set
- **THEN** `sendRegistrationConfirmationEmail` SHALL be called with the registrant's email and event info; failure SHALL be caught and logged without affecting the registration response

#### Scenario: EMAIL_USER is not configured

- **WHEN** `EMAIL_USER` env var is empty
- **THEN** no confirmation email SHALL be sent and registration SHALL succeed normally


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
### Requirement: Organizer receives new registration notification email

After a successful registration, the system SHALL send a notification email to `process.env.ORGANIZER_EMAIL` if both `EMAIL_USER` and `ORGANIZER_EMAIL` are set. The email SHALL include: registrant name, email, phone, company, LINE ID, and member number.

#### Scenario: ORGANIZER_EMAIL is configured

- **WHEN** a registration succeeds and both `EMAIL_USER` and `ORGANIZER_EMAIL` are set
- **THEN** `sendOrganizerNotificationEmail` SHALL be called; failure SHALL be caught and logged without affecting the registration response

#### Scenario: ORGANIZER_EMAIL is not configured

- **WHEN** `ORGANIZER_EMAIL` env var is empty
- **THEN** `sendOrganizerNotificationEmail` SHALL return immediately without sending

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