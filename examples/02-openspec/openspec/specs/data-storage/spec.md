## Purpose

Data is stored in Google Sheets with three main sheets (Students, Challenges, Responses) and a Config named range. The backend reads and writes these sheets.

## Requirements

### Requirement: Students sheet schema
The backend SHALL read student data from a sheet named "Students" with columns: student_id, display_name, active.

#### Scenario: Backend reads Students sheet
- **WHEN** the backend fetches the student list
- **THEN** it reads from the Students sheet and returns only rows where active is true

#### Scenario: Student sheet has inactive students
- **WHEN** a student row has active set to false
- **THEN** the backend excludes that student from the returned list

### Requirement: Challenges sheet schema
The backend SHALL read challenge data from a sheet named "Challenges" with columns: challenge_id, date, active, title, topics, difficulty, challenge_json.

#### Scenario: Backend reads Challenges sheet
- **WHEN** the backend fetches the challenge for today
- **THEN** it reads from the Challenges sheet and finds the row where active is true and date matches today

#### Scenario: Multiple challenges on the same date
- **WHEN** multiple challenges are configured for the same date
- **THEN** only one challenge per date is expected; the backend selects the first active match

### Requirement: Responses sheet schema
The backend SHALL write response data to a sheet named "Responses" with columns: timestamp, challenge_id, challenge_version, student_id, student_display_name, student_source, response_json, feedback_json, elapsed_seconds, frontend_version.

#### Scenario: Backend writes a response row
- **WHEN** a valid submission is processed
- **THEN** the backend appends a new row to the Responses sheet with all required columns

#### Scenario: Instructor inspects responses
- **WHEN** the instructor opens the Responses sheet
- **THEN** responses appear in chronological order as they were submitted

### Requirement: Backend configuration values
The backend SHALL read configuration values from a named range or configuration sheet.

#### Scenario: Backend reads config
- **WHEN** the backend is queried for configuration
- **THEN** it reads values including course_name, timezone (defaulting to America/Sao_Paulo), allow_manual_name, frontend_version, and challenge_selection_mode
