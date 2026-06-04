---
description: "Task list for feature implementation"
---

# Tasks: Challenge of the Day App for Programming Paradigms

**Input**: Design documents from `/specs/001-challenge-of-the-day-app/`

**Prerequisites**: `plan.md`, `spec.md`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create frontend static site structure in `frontend/` with `index.html`, `styles.css`, and `app.js`
- [ ] T002 [P] Create backend Google Apps Script project structure in `backend/` with `Code.gs` and `appsscript.json`
- [ ] T003 [P] Create `README.md` with GitHub Pages deployment instructions and feature overview
- [ ] T004 [P] Create `backend/spreadsheet-schema.md` documenting Students, Challenges, Responses, and Configuration sheet layouts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend and frontend infrastructure that MUST be complete before any user story implementation

- [ ] T005 Implement backend endpoints in `backend/Code.gs` to expose `getConfig`, `getStudents`, `getActiveChallenge`, and `submitResponse`
- [ ] T006 Implement backend request validation and payload sanitization in `backend/Code.gs`
- [ ] T007 Implement backend configuration loading in `backend/Code.gs`, including default `allow_manual_name` behavior, and document it in `backend/spreadsheet-schema.md`
- [ ] T008 Configure `backend/appsscript.json` manifest for web app deployment and required script permissions
- [ ] T009 Create the initial frontend application shell in `frontend/index.html` and `frontend/app.js` to load backend data
- [ ] T010 Create responsive base styles in `frontend/styles.css` for mobile and desktop layouts

---

## Phase 3: User Story 1 - Submit daily challenge response (Priority: P1)

**Goal**: Enable student identification and response submission with lightweight validation and safe backend logging

**Independent Test**: Select or enter a student name, complete required response fields, and submit a challenge response successfully.

- [ ] T011 [US1] Implement the student autocomplete selection widget in `frontend/index.html` and `frontend/app.js`
- [ ] T012 [US1] Implement selection logic that stores `student_id`, `student_display_name`, and `student_source` in `frontend/app.js`
- [ ] T013 [US1] Implement frontend submission flow in `frontend/app.js` with valid request payload shape
- [ ] T014 [US1] Implement duplicate-submission prevention and submit-button disable behavior in `frontend/app.js`
- [ ] T015 [US1] Implement frontend validation for required student selection/manual name and required response field rules in `frontend/app.js`

---

## Phase 4: User Story 2 - View rich challenge content (Priority: P2)

**Goal**: Render challenge content blocks and response input controls dynamically from the challenge JSON

**Independent Test**: Load a challenge containing markdown, code, image, callout, and mixed response fields and verify rendering.

- [ ] T016 [US2] Implement markdown block rendering in `frontend/app.js`
- [ ] T017 [US2] Implement code block rendering with language labels in `frontend/app.js`
- [ ] T018 [US2] Implement image block rendering with alt text in `frontend/app.js`
- [ ] T019 [US2] Implement callout block rendering in `frontend/app.js`
- [ ] T020 [US2] Implement response input rendering for open-text, single-choice, code, and mixed response models in `frontend/app.js`
- [ ] T021 [US2] Implement malformed challenge JSON error handling and user-facing error display in `frontend/app.js`
- [ ] T022 [US2] Implement no-active-challenge fallback messaging and disabled submission state in `frontend/app.js`

---

## Phase 5: User Story 3 - Receive feedback after submission (Priority: P2)

**Goal**: Display automatic feedback and optional after-submission explanation blocks following a successful submission

**Independent Test**: Submit a response and verify configured feedback and after-submission blocks appear.

- [ ] T023 [US3] Implement feedback evaluation logic for static, answer-key, rule-based, and hybrid feedback in `frontend/app.js`
- [ ] T024 [US3] Implement after-submission explanation block rendering in `frontend/app.js`
- [ ] T025 [US3] Implement backend logging of `timestamp`, `challenge_id`, `challenge_version`, `student_id`, `student_display_name`, `student_source`, `response_json`, `feedback_json`, `elapsed_seconds`, and `frontend_version` in `backend/Code.gs`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, and platform readiness

- [ ] T026 [P] Update `README.md` with setup, deployment, and instructor sheet management guidance
- [ ] T027 [P] Improve frontend accessibility and mobile usability in `frontend/styles.css` and `frontend/index.html`
- [ ] T028 [P] Add graceful error handling and retry guidance for backend failures in `frontend/app.js`
- [ ] T029 [P] Review `backend/spreadsheet-schema.md` and update it to match the final Google Sheets implementation
- [ ] T030 [P] Validate final end-to-end workflow manually and document verification steps in `specs/001-challenge-of-the-day-app/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on user story completion

### User Story Dependencies

- **User Story 1 (P1)**: Core submission flow; orchestrates student selection and backend logging
- **User Story 2 (P2)**: Challenge rendering and response input; can be implemented once frontend and backend data loading exist
- **User Story 3 (P2)**: Feedback presentation; depends on submission flow and challenge response model

### Parallel Opportunities

- Setup tasks T001, T002, T003, and T004 can run in parallel
- Documentation and schema review tasks T026, T027, T028, T029, and T030 can run in parallel
- Backend manifest setup and frontend shell creation can proceed in parallel once the project structure exists

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup
2. Complete Phase 2 Foundational
3. Complete Phase 3 User Story 1
4. Validate the core student submission workflow
5. Deliver MVP before adding Stories 2 and 3

### Incremental Delivery

1. Build core infrastructure
2. Add student submission flow
3. Add challenge rendering and response model support
4. Add feedback and after-submission blocks
5. Polish documentation and error handling

### Notes

- Keep each story independently testable
- Prefer plain HTML/CSS/JavaScript in the frontend
- Keep backend logic simple inside Google Apps Script
- Avoid paid services, frameworks, authentication, databases, and LLM APIs in v1
