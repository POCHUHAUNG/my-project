## ADDED Requirements

### Requirement: Admin can compose and trigger a pre-event notification from the admin panel

The admin panel (`/admin`) SHALL include a "課前通知" section containing: a text input for notification title, a textarea for message body, two checkboxes for channel selection (Email and LINE), and a "發送通知" button. Both checkboxes SHALL be checked by default. The "發送通知" button SHALL be disabled when neither channel is selected or when a send is in progress.

#### Scenario: Admin opens notification section

- **WHEN** an admin visits `/admin` and scrolls to the 課前通知 section
- **THEN** the section SHALL display a title input, message textarea, two pre-checked channel checkboxes (Email, LINE), and a "發送通知" button

#### Scenario: No channel selected

- **WHEN** an admin unchecks both Email and LINE checkboxes
- **THEN** the "發送通知" button SHALL be disabled

### Requirement: POST /api/admin/notify-pre-event sends notification to all registrants

The `POST /api/admin/notify-pre-event` endpoint SHALL be protected by `requireAdmin` middleware. It SHALL accept `{ title: string, message: string, channels: string[] }` where `channels` is an array containing "email" and/or "line". It SHALL call `getAllRegistrations()` to retrieve all registrants, then for each enabled channel: send `sendPreEventReminderEmail` to each unique email address (if "email" in channels and `EMAIL_USER` is set), and call `sendLineMulticast` with all non-empty `lineUserId` values (if "line" in channels and `LINE_CHANNEL_ACCESS_TOKEN` is set). The endpoint SHALL return `{ queued: { email: N, line: M } }` immediately without waiting for all sends to complete. Individual send failures SHALL be caught and logged without aborting the overall send.

#### Scenario: Both channels selected and configured

- **WHEN** `POST /api/admin/notify-pre-event` is called with `{ title: "提醒", message: "活動明天開始", channels: ["email", "line"] }` and both `EMAIL_USER` and `LINE_CHANNEL_ACCESS_TOKEN` are set
- **THEN** the system SHALL enqueue emails to all registrant emails and LINE pushes to all registrant lineUserIds, and return `{ queued: { email: N, line: M } }` where N and M are the respective counts

#### Scenario: Only Email channel selected

- **WHEN** `channels` contains only "email"
- **THEN** the system SHALL send emails only and return `{ queued: { email: N, line: 0 } }`

#### Scenario: Only LINE channel selected

- **WHEN** `channels` contains only "line"
- **THEN** the system SHALL send LINE pushes only and return `{ queued: { email: 0, line: M } }`

#### Scenario: LINE_CHANNEL_ACCESS_TOKEN not configured

- **WHEN** `channels` contains "line" but `LINE_CHANNEL_ACCESS_TOKEN` is not set
- **THEN** LINE push SHALL be skipped and `line` count in response SHALL be 0

#### Scenario: No registrants

- **WHEN** the registrations sheet is empty
- **THEN** the endpoint SHALL return `{ queued: { email: 0, line: 0 } }` without sending anything

### Requirement: sendLineMulticast sends LINE push messages in batches of 500

`server/line.js` SHALL export a `sendLineMulticast(userIds, messages)` function. It SHALL filter out empty or invalid `userId` strings (those not starting with "U" or shorter than 10 characters). It SHALL split the remaining userIds into batches of at most 500. For each batch, it SHALL POST to `https://api.line.me/v2/bot/message/multicast` with `Authorization: Bearer <LINE_CHANNEL_ACCESS_TOKEN>` header and body `{ to: [userIds], messages }`. Failures per batch SHALL be caught and logged; successful batches SHALL continue processing.

#### Scenario: 600 userIds provided

- **WHEN** `sendLineMulticast` is called with 600 valid userIds
- **THEN** the function SHALL make 2 API calls: one with 500 userIds and one with 100 userIds

#### Scenario: userId list contains empty strings

- **WHEN** the userIds array includes empty strings or strings not starting with "U"
- **THEN** those entries SHALL be filtered out before sending

### Requirement: sendPreEventReminderEmail sends an HTML reminder email

`server/mailer.js` SHALL export a `sendPreEventReminderEmail(toEmail, { title, message })` function. It SHALL send an HTML email with subject `【課前通知】{title}` and a body displaying the `message` text. The email SHALL only be sent if `EMAIL_USER` is set; otherwise the function SHALL return immediately.

#### Scenario: EMAIL_USER configured

- **WHEN** `sendPreEventReminderEmail` is called with a valid email, title, and message
- **THEN** the system SHALL send an HTML email with subject "【課前通知】{title}" containing the message text

#### Scenario: EMAIL_USER not configured

- **WHEN** `EMAIL_USER` is not set
- **THEN** `sendPreEventReminderEmail` SHALL return without sending
