# Implementation Plan: Challenge of the Day App for Programming Paradigms

**Branch**: `main` | **Date**: 2026-06-03 | **Spec**: specs/001-challenge-of-the-day-app/spec.md

**Input**: Feature specification from `specs/001-challenge-of-the-day-app/spec.md`

## Summary

Build a greenfield web app that delivers a daily programming paradigms challenge to students and logs responses to Google Sheets. The frontend will be a static HTML/CSS/JavaScript app hosted on GitHub Pages. The backend will be implemented with Google Apps Script and will use Google Sheets for Students, Challenges, Responses, and App Configuration.

The first version will avoid paid services, authentication, frameworks, databases, and LLM APIs. It will focus on lightweight student identification, rich JSON-driven challenge rendering, submission validation, and immediate feedback.

## Technical Context

**Language/Version**: Static web frontend using HTML, CSS, and JavaScript; Google Apps Script (V8 runtime) for backend logic.

**Primary Dependencies**: No external runtime dependencies. Use browser-native APIs and minimal helper code for markdown rendering if needed.

**Storage**: Google Sheets for all persisted data, including:
- Students sheet
- Challenges sheet
- Responses sheet
- App Configuration sheet

**Testing**: Manual frontend validation and backend payload validation. Potential Apps Script helper functions may be added for schema checks.

**Target Platform**: GitHub Pages for static hosting and Google Apps Script web app for backend.

**Project Type**: Web application with a static frontend and a script-based backend.

**Performance Goals**: Support small-class use (around 40 students) with responsive in-browser student filtering and fast challenge rendering.

**Constraints**: Free hosting, no paid services, no authentication, no external databases, no frameworks, no LLM APIs in v1.

## Project Structure

### Documentation (this feature)
```text
specs/001-challenge-of-the-day-app/
├── plan.md
├── spec.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)
```text
frontend/
├── index.html
├── styles.css
├── app.js
└── assets/

backend/
├── appsscript.json
└── Code.gs

README.md
```

**Structure Decision**: The frontend and backend are separated by directory, with the frontend deployed as a static site and the backend deployed as a Google Apps Script web application. This keeps the implementation aligned with the no-paid-services and no-frameworks constraint.

## Key Implementation Areas

### Backend
- Google Apps Script endpoints for:
  - `getConfig`
  - `getStudents`
  - `getActiveChallenge`
  - `submitResponse`
- Validate all incoming payloads and reject malformed requests.
- Log responses to the Responses sheet with timestamp, student info, challenge metadata, response JSON, feedback JSON, elapsed_seconds, and frontend_version.
- Expose `allow_manual_name` and other configuration values through the backend.

### Frontend
- Load configuration, student list, and active challenge data from the backend on page load.
- Render challenge content dynamically from JSON blocks: markdown, code, image, callout.
- Render response fields dynamically: open-text, single-choice, code response, mixed.
- Implement autocomplete student selection with client-side filtering of the loaded student list.
- Allow manual name entry by default, with behavior controlled by backend configuration.
- Prevent duplicate submissions and disable submit while processing.
- Show immediate feedback and optional after-submission blocks.
- Display helpful errors for missing challenge, malformed JSON, or submission failure.

## Important Design Decisions

- Manual name entry defaults to enabled, but instructors can disable it in the backend config.
- Only active students will be loaded for selection, matching the small-class use case.
- The app requires no authentication and treats student selection as lightweight identification only.

## Phase Plan

1. Setup project structure and documentation.
2. Implement backend endpoints, validation, and spreadsheet schema.
3. Build frontend shell and data loading.
4. Implement student autocomplete and submission flow.
5. Implement challenge rendering and response inputs.
6. Implement feedback display and after-submission blocks.
7. Polish error handling, accessibility, and deployment guidance.

## Notes

- The plan intentionally avoids any paid or hosted backend service.
- It also avoids frameworks and third-party runtime dependencies in v1.
- Google Sheets is the single source of truth for configuration, challenge content, student data, and responses.
