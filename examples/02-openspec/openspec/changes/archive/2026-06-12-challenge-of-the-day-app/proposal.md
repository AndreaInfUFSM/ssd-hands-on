## Why

Students in Programming Paradigms need a lightweight daily exercise to think about paradigms outside class. A no-budget web app with a daily challenge keeps them engaged without requiring institutional hosting or complex infrastructure.

## What Changes

- New static frontend (HTML/CSS/JS) that loads and renders daily challenges from JSON
- New Google Apps Script backend providing challenge data, student list, and configuration
- New Google Sheets structure for challenges, students, and responses
- Challenge JSON model with blocks, response fields, and feedback rules
- Autocomplete student selection widget with optional manual name entry
- Feedback engine (static, answer-key, rule-based, hybrid)
- Submission logging with duplicate prevention

## Capabilities

### New Capabilities
- `challenge-rendering`: Dynamic rendering of challenge blocks (markdown, code, image, callout) from JSON
- `student-selection`: Searchable autocomplete widget for student identification with manual entry support
- `submission-logging`: Response submission, validation, duplicate prevention, and Google Sheets logging
- `feedback-engine`: Static, answer-key, rule-based, and hybrid feedback displayed after submission
- `backend-api`: Google Apps Script endpoints for challenges, students, config, and submissions
- `data-storage`: Google Sheets schema for Challenges, Students, and Responses sheets

### Modified Capabilities

- None (first version, no existing capabilities to modify)

## Impact

- New frontend codebase (static HTML, CSS, JS) deployable to GitHub Pages
- New Google Apps Script project deployed as a web app
- New Google Sheets workbook with three sheets (Students, Challenges, Responses)
- No existing code affected — greenfield project
