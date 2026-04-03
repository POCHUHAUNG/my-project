## ADDED Requirements

### Requirement: Organizer can send event cancellation notification to all registrants

The `POST /api/admin/notify-event-change` endpoint SHALL accept `{ type: "cancel", message: string, eventId?: string }`. The system SHALL fetch all registrant emails from the `registrations-<eventId>` sheet (column D), send an HTML cancellation email to each address using `sendEventCancelNotificationEmail`, and return `{ queued: N }` immediately without waiting for all sends to complete.

#### Scenario: Cancellation notification sent

- **WHEN** POST /api/admin/notify-event-change is called with `{ type: "cancel", message: "因故取消" }`
- **THEN** each registrant SHALL receive a cancellation email and the endpoint SHALL return `{ queued: N }` where N is the number of unique registrant emails

#### Scenario: No registrants exist

- **WHEN** the registrations sheet is empty
- **THEN** the endpoint SHALL return `{ queued: 0 }` without sending any emails

### Requirement: Organizer can send event update notification to all registrants

The `POST /api/admin/notify-event-change` endpoint SHALL accept `{ type: "update", message: string, eventId?: string }`. The system SHALL send an HTML update notification email via `sendEventChangeNotificationEmail` to all registrant emails. The `message` field SHALL be included verbatim in the email body.

#### Scenario: Update notification sent

- **WHEN** POST is called with `{ type: "update", message: "活動時間改為下午 2 點" }`
- **THEN** each registrant SHALL receive an email containing the message text

### Requirement: Admin page provides event notification UI

The AdminPage SHALL include a notification section with a type selector (取消活動 / 資訊更改), a textarea for the message, and a "發送通知" button. After sending, the UI SHALL display the number of emails queued. The button SHALL be disabled while the request is in progress.

#### Scenario: Admin sends notification from UI

- **WHEN** admin selects "資訊更改", enters a message, and clicks "發送通知"
- **THEN** the UI SHALL show "已發送通知給 N 位報名者" after the API responds
