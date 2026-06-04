# Feature Specification: Challenge of the Day App for Programming Paradigms

**Feature Branch**: `main`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "Create a specification for a greenfield web app called Challenge of the Day App for Programming Paradigms."

## Clarifications

### Session 2026-06-03

- Q: Default manual name entry behavior? → A: Enable manual name entry by default and allow instructors to disable it in the sheet.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit daily challenge response (Priority: P1)

Students open the app, identify themselves with a known or approved manual name, view the daily programming paradigm challenge, and submit their response.

**Why this priority**: This is the core student workflow and delivers the primary learning value of the app.

**Independent Test**: Load the app with a valid challenge available for today, select or enter a student name, complete required response fields, and submit.

**Acceptance Scenarios**:

1. **Given** a valid challenge JSON exists for today, **When** a student opens the app, **Then** the app renders the challenge blocks correctly.
2. **Given** the student list is loaded, **When** the user types in the student field, **Then** the app shows matching suggestions and allows selection of a known student.
3. **Given** manual name entry is enabled, **When** the user types a name not in the list, **Then** the app allows submission and marks the response as manual.
4. **Given** manual name entry is disabled, **When** the user types a name not in the list, **Then** the app prevents submission and asks the user to select a listed student.

---

### User Story 2 - View rich challenge content (Priority: P2)

Students see a challenge composed of structured content blocks such as markdown, code snippets, images, and callouts.

**Why this priority**: The challenge presentation drives comprehension and supports varied learning activities.

**Independent Test**: Render a challenge that includes markdown, code, image, and callout blocks and verify each block type is displayed clearly.

**Acceptance Scenarios**:

1. **Given** the challenge contains a markdown block, **When** the app renders it, **Then** the markdown/text content is displayed clearly.
2. **Given** the challenge contains a code block, **When** the app renders it, **Then** the code is displayed in a readable preformatted style with its language label.
3. **Given** the challenge contains an image block, **When** the app renders it, **Then** the image is displayed with alt text.
4. **Given** the challenge contains a callout block, **When** the app renders it, **Then** the callout is visually distinct and clearly labeled.

---

### User Story 3 - Receive feedback after submission (Priority: P2)

Students receive automatic feedback immediately after submitting their response, based on configured feedback rules.

**Why this priority**: Feedback closes the learning loop and encourages reflection.

**Independent Test**: Submit a challenge response and verify the app displays configured feedback and after-submission explanation blocks.

**Acceptance Scenarios**:

1. **Given** feedback is configured as answer-key feedback, **When** the student submits, **Then** the app shows the corresponding correct or incorrect feedback message.
2. **Given** feedback is configured as rule-based feedback, **When** the student submits, **Then** the app shows messages for matched rules and a default message when no rule matches.
3. **Given** feedback is configured as hybrid feedback, **When** the student submits, **Then** the app combines choice feedback and explanation feedback.
4. **Given** after-submission blocks are configured, **When** the student submits successfully, **Then** the app displays those blocks.

---

### Edge Cases

- What happens when no active challenge exists for the current date?
- How does the app behave if the student list cannot be loaded from the backend?
- How does the app prevent duplicate accidental submissions when a user clicks submit twice?
- What happens if challenge JSON is malformed or missing required fields?
- How does the app behave if manual name entry is disabled and the student cannot find their name?
- What happens if the backend rejects the submission due to malformed data?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST load the current daily challenge from a backend endpoint backed by Google Sheets.
- **FR-002**: The system MUST load the active student list from the backend and keep the list in the browser for client-side filtering.
- **FR-003**: The system MUST load basic app configuration from the backend, including the `allow_manual_name` setting.
- **FR-021**: The system MUST default `allow_manual_name` to true and allow instructors to disable manual name entry in the backend configuration.
- **FR-016**: The frontend MUST display a clear no-active-challenge message and prevent challenge submission when no valid challenge is available for the current date.
- **FR-004**: The system MUST render challenge content dynamically from structured JSON representation.
- **FR-005**: The system MUST support markdown/text, code, image, and callout prompt blocks in challenge content.
- **FR-006**: The system MUST support open-text, single-choice with explanation, code response, and mixed response fields in the first version.
- **FR-007**: The autocomplete student selector MUST filter the loaded student list dynamically as the user types and present selectable matches.
- **FR-008**: The system MUST clearly distinguish between a known student selected from the list and a manually entered unlisted name.
- **FR-009**: When a known student is selected, the backend MUST store student_id, student_display_name, and student_source as "listed".
- **FR-010**: When a manual name is submitted, the backend MUST store student_id empty, student_display_name, and student_source as "manual".
- **FR-011**: The system MUST validate required response fields and open-text minimum length before submission.
- **FR-012**: The system MUST prevent duplicate accidental submissions while a submission is in progress.
- **FR-013**: The backend MUST validate submitted payloads and reject malformed or incomplete data before writing to Google Sheets.
- **FR-014**: The system MUST provide immediate automatic feedback after submission using static, answer-key, rule-based, or hybrid feedback models.
- **FR-015**: The system MUST display after-submission explanation blocks when they are configured.
- **FR-016**: The frontend MUST show a clear error message if no challenge is available for the current date.
- **FR-017**: The frontend MUST show a useful error message when the loaded challenge JSON is malformed.
- **FR-018**: The instructor MUST be able to manage challenges and student lists directly through Google Sheets without a web dashboard in the first version.
- **FR-019**: The system MUST minimize collection of personal data and avoid exposing private spreadsheet data publicly.
- **FR-020**: The system MUST support the app being usable by a small class of up to about 40 students.

### Key Entities *(include if feature involves data)*

- **Challenge**: A structured daily activity defined in Google Sheets as JSON, including title, topics, difficulty, prompt blocks, response model, feedback model, and after-submission blocks.
- **Student**: A learner record loaded from a Students sheet, with identifiers for student_id, display_name, active status, and selection source.
- **Response**: A submission record containing timestamp, challenge_id, challenge_version, student identification, response JSON, feedback JSON, elapsed time, and frontend version.
- **App Configuration**: Backend-provided values such as course_name, timezone, allow_manual_name, frontend_version, and challenge_selection_mode.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can complete the challenge submission workflow in a single session without requiring a separate login.
- **SC-002**: At least 95% of valid challenges for the current date render with all configured content block types visible.
- **SC-003**: When the student list is available, name filtering shows matching suggestions within one second of typing.
- **SC-004**: Manual name submissions are clearly identified and stored separately from listed student submissions.
- **SC-005**: When no challenge is available today, the app displays a clear message and prevents submission.
- **SC-006**: Invalid submissions are rejected by the backend and do not create malformed rows in the Responses sheet.
- **SC-007**: Duplicate clicks during submission do not create duplicate response records.
- **SC-008**: The app provides feedback after submission for answer-key rules, rule-based rules, or hybrid feedback models.
- **SC-009**: Challenges and student data remain manageable for a class of about 40 students.

## Assumptions

- The first version is designed for a small class and does not require institutional authentication or secure login.
- The instructor will maintain challenges, students, and configuration directly in Google Sheets.
- Only one active challenge per day is expected in the first version.
- Timezone behavior is configurable, with a default of America/Sao_Paulo.
- Manual name entry is controlled by backend configuration, defaults to enabled, and may be disabled by the instructor.
- The app must behave as a lightweight identification system, not as authentication.
- The frontend may be deployed on free static hosting, and the backend may use Google Apps Script and Google Sheets as required by budget constraints.
- The system must not expose answer keys or instructor notes before submission.
- The response model may include mixed fields combining choice and open-text responses in the first version.
