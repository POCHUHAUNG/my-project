# Spec: Multi-Event Management

## Requirement: Each event uses dedicated Google Sheets tabs

The system SHALL support multiple events by using per-event sheet names: `event-info-<eventId>`, `agenda-<eventId>`, and `registrations-<eventId>`, where `eventId` is a short alphanumeric identifier (e.g., `001`, `002`). All functions in `sheets.js` (`getEventInfo`, `getAgenda`, `appendRegistration`, `getRegistrationsByEmail`, `markAttended`, `getRegistrationByToken`) SHALL accept an `eventId` parameter defaulting to `process.env.DEFAULT_EVENT_ID || '001'`.

### Scenario: Reading event info for a specific event

- **WHEN** `getEventInfo('002')` is called
- **THEN** the system SHALL read from the `event-info-002` sheet tab

### Scenario: DEFAULT_EVENT_ID not set

- **WHEN** no eventId is provided and DEFAULT_EVENT_ID is not set
- **THEN** the system SHALL default to eventId `'001'`

## Requirement: API routes accept eventId query parameter

All event-related API routes (`GET /api/event`, `GET /api/agenda`, `POST /api/register`, `GET /api/checkin/qr`, `GET /api/checkin/mark`, `GET /api/member/registrations`) SHALL accept an optional `eventId` query parameter and pass it to the corresponding sheets.js function.

### Scenario: API called with eventId

- **WHEN** GET /api/event?eventId=002 is called
- **THEN** the system SHALL return event info from the `event-info-002` sheet

### Scenario: API called without eventId

- **WHEN** GET /api/event is called without a query parameter
- **THEN** the system SHALL use the default eventId

## Requirement: Frontend supports event switching via URL parameter

The frontend SHALL read an `event` query parameter from the URL (e.g., `/?event=002`) and pass it as `eventId` to all API calls. If the parameter is absent, the frontend SHALL use `'001'` as the default. The AgendaSection, EventInfoSection, RegistrationForm, and MemberPage SHALL all use the active eventId when fetching data.

### Scenario: User navigates to event 002

- **WHEN** the user opens `/?event=002`
- **THEN** all API calls SHALL include `?eventId=002` and display data for that event

## Requirements

### Requirement: Each event uses dedicated Google Sheets tabs

The system SHALL support multiple events by using per-event sheet names: `event-info-<eventId>`, `agenda-<eventId>`, and `registrations-<eventId>`, where `eventId` is a short alphanumeric identifier (e.g., `001`, `002`). All functions in `sheets.js` (`getEventInfo`, `getAgenda`, `appendRegistration`, `getRegistrationsByEmail`, `markAttended`, `getRegistrationByToken`) SHALL accept an `eventId` parameter defaulting to `process.env.DEFAULT_EVENT_ID || '001'`.

#### Scenario: Reading event info for a specific event

- **WHEN** `getEventInfo('002')` is called
- **THEN** the system SHALL read from the `event-info-002` sheet tab

#### Scenario: DEFAULT_EVENT_ID not set

- **WHEN** no eventId is provided and DEFAULT_EVENT_ID is not set
- **THEN** the system SHALL default to eventId `'001'`

---
### Requirement: API routes accept eventId query parameter

All event-related API routes (`GET /api/event`, `GET /api/agenda`, `POST /api/register`, `GET /api/checkin/qr`, `GET /api/checkin/mark`, `GET /api/member/registrations`) SHALL accept an optional `eventId` query parameter and pass it to the corresponding sheets.js function.

#### Scenario: API called with eventId

- **WHEN** GET /api/event?eventId=002 is called
- **THEN** the system SHALL return event info from the `event-info-002` sheet

#### Scenario: API called without eventId

- **WHEN** GET /api/event is called without a query parameter
- **THEN** the system SHALL use the default eventId

---
### Requirement: Frontend supports event switching via URL parameter

The frontend SHALL read an `event` query parameter from the URL (e.g., `/?event=002`) and pass it as `eventId` to all API calls. If the parameter is absent, the frontend SHALL use `'001'` as the default. The AgendaSection, EventInfoSection, RegistrationForm, and MemberPage SHALL all use the active eventId when fetching data.

#### Scenario: User navigates to event 002

- **WHEN** the user opens `/?event=002`
- **THEN** all API calls SHALL include `?eventId=002` and display data for that event
