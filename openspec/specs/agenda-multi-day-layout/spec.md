# Spec: Agenda Multi-Day Layout

## Requirement: Agenda session columns use distinct color themes

Each session column header SHALL apply a CSS class corresponding to its session name: 上午場/早上 → `morning`, 下午場/下午 → `afternoon`, 晚上場/晚上 → `evening`, 全天 → `fullday`, labels containing digit N → `day1`–`day4` (cycling). Unknown labels SHALL cycle through themes by column index.

### Scenario: Day1 and Day2 render with distinct colors

- **WHEN** agenda rows have session="Day1" and session="Day2"
- **THEN** two column headers SHALL appear: Day1 with green `.day1` style, Day2 with rose `.day2` style

### Scenario: Known time-of-day sessions use preset themes

- **WHEN** session name is "上午場"
- **THEN** the column header SHALL use `.morning` CSS class with ☀️ icon

### Scenario: Labels with digits map to day-N themes

- **WHEN** session label contains digit 2 (e.g., "Day2", "第2天")
- **THEN** the style SHALL use `.day2` CSS class

---

## Requirement: Agenda multi-day layout groups empty session rows under previous session

Agenda rows with an empty session column SHALL be grouped under the most recently seen non-empty session. If no prior session exists, they SHALL fall into a "全天" group.

### Scenario: Empty session row inherits previous session

- **WHEN** a row has empty session and the preceding row has session="Day1"
- **THEN** the empty-session row SHALL appear in the Day1 column

### Scenario: First row with empty session falls back to 全天

- **WHEN** the first agenda row has an empty session and no preceding session exists
- **THEN** that row SHALL be placed in a "全天" column

### Scenario: All items in one session renders single column

- **WHEN** all rows share the same session value
- **THEN** the agenda SHALL render as a single column without a session label header

---

## Requirement: Agenda session columns are equal height per row

In a multi-column layout, cards at the same row position across all columns SHALL share equal height via CSS Grid `align-items: stretch`.

### Scenario: Short and tall cards in same row share height

- **WHEN** row N has a short card in column A and a tall card in column B
- **THEN** both cards SHALL have the same rendered height

### Scenario: Unequal column lengths do not break alignment

- **WHEN** column A has 8 items and column B has 5 items
- **THEN** rows 6–8 in column A SHALL render correctly with empty cells in column B

## Requirements

### Requirement: Agenda session columns use distinct color themes

Each session column header SHALL apply a CSS class corresponding to its session name: 上午場/早上 → `morning`, 下午場/下午 → `afternoon`, 晚上場/晚上 → `evening`, 全天 → `fullday`, labels containing digit N → `day1`–`day4` (cycling). Unknown labels SHALL cycle through themes by column index.

#### Scenario: Day1 and Day2 render with distinct colors

- **WHEN** agenda rows have session="Day1" and session="Day2"
- **THEN** two column headers SHALL appear: Day1 with green `.day1` style, Day2 with rose `.day2` style

#### Scenario: Known time-of-day sessions use preset themes

- **WHEN** session name is "上午場"
- **THEN** the column header SHALL use `.morning` CSS class with ☀️ icon

#### Scenario: Labels with digits map to day-N themes

- **WHEN** session label contains digit 2 (e.g., "Day2", "第2天")
- **THEN** the style SHALL use `.day2` CSS class

---
### Requirement: Agenda multi-day layout groups empty session rows under previous session

Agenda rows with an empty session column SHALL be grouped under the most recently seen non-empty session. If no prior session exists, they SHALL fall into a "全天" group.

#### Scenario: Empty session row inherits previous session

- **WHEN** a row has empty session and the preceding row has session="Day1"
- **THEN** the empty-session row SHALL appear in the Day1 column

#### Scenario: First row with empty session falls back to 全天

- **WHEN** the first agenda row has an empty session and no preceding session exists
- **THEN** that row SHALL be placed in a "全天" column

#### Scenario: All items in one session renders single column

- **WHEN** all rows share the same session value
- **THEN** the agenda SHALL render as a single column without a session label header

---
### Requirement: Agenda session columns are equal height per row

In a multi-column layout, cards at the same row position across all columns SHALL share equal height via CSS Grid `align-items: stretch`.

#### Scenario: Short and tall cards in same row share height

- **WHEN** row N has a short card in column A and a tall card in column B
- **THEN** both cards SHALL have the same rendered height

#### Scenario: Unequal column lengths do not break alignment

- **WHEN** column A has 8 items and column B has 5 items
- **THEN** rows 6–8 in column A SHALL render correctly with empty cells in column B
