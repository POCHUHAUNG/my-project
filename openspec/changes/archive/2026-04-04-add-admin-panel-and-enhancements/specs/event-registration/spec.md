## ADDED Requirements

### Requirement: Registration form validates all required fields before submission

The registration form SHALL validate all five fields (name, email, phone, company, lineId) on submit. If any field is empty, the system SHALL: (1) display a red error summary box at the top of the form listing all missing fields, (2) display an inline error message below each missing field, (3) highlight the missing field's input with a red border, (4) scroll to the first invalid field, and (5) prevent the POST request from being sent. Each field label SHALL display a red asterisk (`*`) to indicate it is required.

#### Scenario: All fields empty on submit

- **WHEN** a user clicks submit without filling any field
- **THEN** the system SHALL display a red summary box listing all 5 missing fields, highlight all inputs with red borders, and scroll to the name field

#### Scenario: Single field missing

- **WHEN** a user fills 4 out of 5 fields and clicks submit
- **THEN** the system SHALL show the error summary listing only the missing field and scroll to it

#### Scenario: Error clears on input

- **WHEN** a user types into a field that previously showed an error
- **THEN** the inline error message and red border for that field SHALL be removed immediately
