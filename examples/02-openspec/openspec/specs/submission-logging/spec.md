## Purpose

Responses are validated on both frontend and backend, submitted via POST, logged to Google Sheets with full metadata, and protected against accidental duplicates.

## Requirements

### Requirement: Validate required response fields before submission
The app SHALL validate that all required response fields are completed before allowing submission.

#### Scenario: All required fields are filled
- **WHEN** the student clicks submit and all required fields are completed
- **THEN** the app proceeds with submission

#### Scenario: Required field is empty
- **WHEN** the student clicks submit and a required field is empty
- **THEN** the app shows a validation error and does not submit

### Requirement: Validate minimum length for open-text fields
The app SHALL validate minimum length constraints for open-text response fields when configured.

#### Scenario: Open-text response meets minimum length
- **WHEN** the student submits and the open-text response meets the configured min_length
- **THEN** the app accepts the response

#### Scenario: Open-text response is below minimum length
- **WHEN** the student submits and the open-text response is shorter than the configured min_length
- **THEN** the app shows a validation error and does not submit

### Requirement: Prevent duplicate accidental submissions
The app SHALL prevent duplicate submissions through both frontend and backend mechanisms.

#### Scenario: Student clicks submit once
- **WHEN** the student clicks the submit button
- **THEN** the button is disabled while the submission is in progress

#### Scenario: Student clicks submit multiple times rapidly
- **WHEN** the student clicks submit multiple times before the first request completes
- **THEN** only one submission is sent

#### Scenario: Backend receives a duplicate submission
- **WHEN** the backend receives a submission with the same student_id and challenge_id that was already logged
- **THEN** the backend rejects the duplicate

### Requirement: Submit response to backend
The app SHALL send the response payload to the backend API via POST.

#### Scenario: Successful submission
- **WHEN** the student submits a valid response
- **THEN** the app sends the response JSON to the backend and shows a success message

#### Scenario: Backend rejects the submission
- **WHEN** the backend returns an error or rejection
- **THEN** the app shows an error message and re-enables the submit button

### Requirement: Backend validates submitted data
The backend SHALL validate the submitted payload before writing to the spreadsheet.

#### Scenario: Valid payload received
- **WHEN** the backend receives a complete and valid payload
- **THEN** it writes the response row to the Responses sheet

#### Scenario: Incomplete payload received
- **WHEN** the backend receives a payload missing required fields
- **THEN** it rejects the request and does not write any data

#### Scenario: Malformed payload received
- **WHEN** the backend receives a payload that cannot be parsed as JSON
- **THEN** it rejects the request and returns an error

### Requirement: Log submission details to Google Sheets
The backend SHALL log timestamp, challenge id, challenge version, student information, response JSON, feedback JSON, elapsed seconds, and frontend version for each submission.

#### Scenario: Instructor opens Responses sheet
- **WHEN** the instructor opens the Responses sheet after submissions
- **THEN** each response row contains timestamp, challenge_id, challenge_version, student_id, student_display_name, student_source, response_json, feedback_json, elapsed_seconds, and frontend_version
