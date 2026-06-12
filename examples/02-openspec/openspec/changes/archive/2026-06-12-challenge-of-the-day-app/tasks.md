## 1. Setup and Infrastructure

- [x] 1.1 Create Google Sheets workbook with Students, Challenges, and Responses sheets and a Config named range
- [x] 1.2 Create Google Apps Script project attached to the workbook
- [x] 1.3 Create GitHub Pages repository for frontend hosting (instructions in README)
- [x] 1.4 Create frontend project structure (index.html, style.css, app.js)
- [x] 1.5 Set up local development workflow (no build step, serve with any static server)

## 2. Data Storage (Google Sheets)

- [x] 2.1 Define Students sheet columns: student_id, display_name, active
- [x] 2.2 Define Challenges sheet columns: challenge_id, date, active, title, topics, difficulty, challenge_json
- [x] 2.3 Define Responses sheet columns: timestamp, challenge_id, challenge_version, student_id, student_display_name, student_source, response_json, feedback_json, elapsed_seconds, frontend_version
- [x] 2.4 Define Config named range with keys: course_name, timezone, allow_manual_name, frontend_version, challenge_selection_mode
- [x] 2.5 Seed sample data: 2-3 test students, 1 sample challenge (from spec example), config with allow_manual_name = true

## 3. Backend API (Google Apps Script)

- [x] 3.1 Implement doGet routing to dispatch requests by query parameter (resource type)
- [x] 3.2 Implement GET /challenges endpoint that reads Challenges sheet and returns active challenge for today
- [x] 3.3 Implement GET /students endpoint that reads Students sheet and returns active students
- [x] 3.4 Implement GET /config endpoint that reads Config named range and returns configuration JSON
- [x] 3.5 Implement doPost endpoint that validates payload and writes to Responses sheet
- [x] 3.6 Add duplicate submission check (same student_id + challenge_id already exists)
- [x] 3.7 Add payload validation (required fields present, proper types)
- [x] 3.8 Add CORS headers for GitHub Pages origin
- [x] 3.9 Deploy GAS project as web app (execute as me, access anyone) — instructions in README

## 4. Frontend: App Shell and Data Loading

- [x] 4.1 Create HTML structure with sections: student-selection, challenge-view, submission-area, feedback-area, error-display
- [x] 4.2 Create CSS with mobile-first responsive layout
- [x] 4.3 Implement app.js: fetch config, student list, and challenge on page load
- [x] 4.4 Handle loading states (show spinner or skeleton while fetching)
- [x] 4.5 Handle error states (show descriptive error messages when API calls fail)
- [x] 4.6 Handle no-challenge state (show friendly message when no challenge for today)

## 5. Frontend: Challenge Rendering

- [x] 5.1 Implement block renderer that dispatches to type-specific renderers
- [x] 5.2 Implement markdown block renderer (format text content with basic Markdown)
- [x] 5.3 Implement code block renderer (preformatted text with language label)
- [x] 5.4 Implement image block renderer (img element with alt text and optional caption)
- [x] 5.5 Implement callout block renderer (styled div based on callout style)
- [x] 5.6 Render intro blocks, prompt blocks, and response model from challenge JSON
- [x] 5.7 Render after-submission blocks after successful submission

## 6. Frontend: Student Selection

- [x] 6.1 Create autocomplete input element with embedded suggestion dropdown
- [x] 6.2 Implement in-memory case-insensitive filtering on input event
- [x] 6.3 Implement suggestion list rendering and selection (click/tap to select)
- [x] 6.4 Implement student_id tracking: set when suggestion selected, clear when text diverges
- [x] 6.5 Implement manual name entry: allow submit without student_id when config allows
- [x] 6.6 Show clear visual distinction between listed and manual mode
- [x] 6.7 Show error when manual entry is disabled and name is not in list

## 7. Frontend: Response Model Rendering

- [x] 7.1 Implement open_text response field renderer (textarea with character count)
- [x] 7.2 Implement single_choice response field renderer (radio buttons with optional explanation)
- [x] 7.3 Implement code response field renderer (textarea with monospace font and language hint)
- [x] 7.4 Implement mixed response renderer (composes multiple field types)
- [x] 7.5 Build response JSON object from filled-in fields for submission

## 8. Frontend: Validation

- [x] 8.1 Validate student selection (selected from list or manual when enabled)
- [x] 8.2 Validate required response fields are not empty
- [x] 8.3 Validate min_length for open-text fields
- [x] 8.4 Display inline validation errors next to failing fields
- [x] 8.5 Prevent submission when validation fails

## 9. Frontend: Feedback Engine

- [x] 9.1 Implement static feedback evaluator (return configured message)
- [x] 9.2 Implement answer-key feedback evaluator (compare selection to correct_options)
- [x] 9.3 Implement rule-based feedback evaluator (check contains_any term matching)
- [x] 9.4 Implement hybrid feedback evaluator (combine choice + explanation)
- [x] 9.5 Render feedback messages in the feedback area after submission
- [x] 9.6 Ensure answer keys are never exposed before submission

## 10. Frontend: Submission

- [x] 10.1 Build submission payload with student info, challenge info, response JSON, feedback JSON
- [x] 10.2 Disable submit button during submission
- [x] 10.3 Send POST request to backend submit endpoint
- [x] 10.4 Handle success: show success message, feedback, and after-submission blocks
- [x] 10.5 Handle error: show error and re-enable submit button
- [x] 10.6 Prevent duplicate submission (disable button after first click, ignore subsequent clicks)

## 11. Verification and Deployment

- [ ] 11.1 Test end-to-end: deploy GAS, open frontend from GitHub Pages, submit a response
- [ ] 11.2 Test acceptance criteria from spec (all 22 scenarios)
- [ ] 11.3 Test on mobile viewport
- [ ] 11.4 Test with manual name entry enabled and disabled
- [ ] 11.5 Test with no challenge for today
- [ ] 11.6 Test with malformed challenge JSON
- [x] 11.7 Document deployment steps for instructor (how to copy sheets, deploy GAS, configure pages)

## 12. README

- [x] 12.1 Create project README with overview, architecture diagram, and setup instructions
