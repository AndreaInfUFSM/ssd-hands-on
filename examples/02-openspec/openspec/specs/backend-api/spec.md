## Purpose

The backend exposes HTTP endpoints for the frontend to fetch challenges, student lists, configuration, and submit responses. It runs as a Google Apps Script web app.

## Requirements

### Requirement: Provide challenge endpoint
The backend SHALL expose a GET endpoint that returns the active challenge for the current date.

#### Scenario: Challenge exists for today
- **WHEN** a GET request is made to the challenge endpoint and an active challenge exists for today's date
- **THEN** the endpoint returns the challenge JSON with status 200

#### Scenario: No challenge for today
- **WHEN** a GET request is made to the challenge endpoint and no challenge is configured for today
- **THEN** the endpoint returns a 404 response with a message indicating no challenge is available

#### Scenario: Challenge date is in the future
- **WHEN** a GET request is made and the only challenge matching today is not yet active
- **THEN** the endpoint treats it as no challenge available

### Requirement: Provide student list endpoint
The backend SHALL expose a GET endpoint that returns the list of active students.

#### Scenario: Active students exist
- **WHEN** a GET request is made to the students endpoint
- **THEN** the endpoint returns a JSON array of active students with id and display_name

#### Scenario: No active students
- **WHEN** a GET request is made and no students are marked as active in the Students sheet
- **THEN** the endpoint returns an empty array

### Requirement: Provide configuration endpoint
The backend SHALL expose a GET endpoint that returns app configuration values.

#### Scenario: Configuration is requested
- **WHEN** a GET request is made to the config endpoint
- **THEN** the endpoint returns configuration including course_name, timezone, allow_manual_name, frontend_version, and challenge_selection_mode

#### Scenario: Timezone is not configured
- **WHEN** the timezone is not set in configuration
- **THEN** the endpoint defaults to America/Sao_Paulo

### Requirement: Accept response submissions via POST
The backend SHALL accept POST requests with response payloads, validate them, and log to the Responses sheet.

#### Scenario: Valid submission received
- **WHEN** a POST request with a valid response payload is received
- **THEN** the backend validates, writes the row to the Responses sheet, and returns a success response

#### Scenario: Duplicate submission received
- **WHEN** a POST request has the same student_id and challenge_id as an existing response
- **THEN** the backend rejects the submission and returns an error

#### Scenario: Invalid payload received
- **WHEN** a POST request has missing or malformed fields
- **THEN** the backend rejects the submission and does not write any data

### Requirement: Handle CORS for GitHub Pages frontend
The backend SHALL include CORS headers to allow requests from the GitHub Pages domain.

#### Scenario: Request from allowed origin
- **WHEN** the frontend at the GitHub Pages URL makes a request
- **THEN** the backend responds with appropriate CORS headers
