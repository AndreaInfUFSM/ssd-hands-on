## Context

Greenfield web app for the Programming Paradigms course. No hosting budget: frontend on GitHub Pages, backend as Google Apps Script, storage in Google Sheets. Students access a single daily challenge, submit responses, and receive automated feedback. Instructors manage everything directly in the spreadsheet — no admin dashboard in v1.

## Goals / Non-Goals

**Goals:**
- A static frontend that loads and renders challenge JSON from a GAS endpoint
- Student identification via autocomplete widget (not authentication)
- Response submission with frontend and backend validation
- Automated feedback (static, answer-key, rule-based, hybrid) evaluated client-side
- Full submission logging to Google Sheets
- Deployable by an instructor with minimal setup

**Non-Goals:**
- User login, passwords, or institutional auth
- Instructor web dashboard
- Code execution or automatic grading of code responses
- LLM-based feedback
- Gamification, rankings, or scores
- File uploads
- Multi-course management
- Push notifications
- High-traffic or concurrent-write optimization (small class only)

## Decisions

1. **No frontend framework** — Vanilla HTML/CSS/JS keeps the deployment trivial (no build step) and the codebase small. The dynamic rendering (challenge blocks from JSON, autocomplete, feedback display) is achievable with DOM manipulation and event delegation. No SPA router needed — single view with conditional rendering of challenge vs. no-challenge message.

2. **Client-side feedback evaluation** — Feedback rules (static, answer-key, term-matching) are simple enough to run in the browser. This eliminates a round-trip to GAS for feedback evaluation, keeping the UX fast. The backend still receives and stores the feedback JSON for audit/inspection.

3. **Challenge JSON as the contract** — The frontend treats the challenge as opaque structured data. It reads block types and renders a corresponding UI component. This allows adding new block types later without changing the backend data model. The JSON structure is defined upfront in the spec.

4. **Single GAS web app, multiple endpoints** — One Google Apps Script project exposes doGet for reading (challenge, students, config) and doPost for writing (submit). URL parameters distinguish the resource. This avoids managing multiple script projects.

5. **No duplicate submission by frontend + backend** — The frontend disables the submit button after the first click. The backend checks (via timestamp + student_id + challenge_id) whether a submission for this student+challenge already exists and rejects duplicates. Double-check to handle the case where the frontend guard fails.

6. **Student list loaded once at startup** — Small list (~40 names), loaded on page load and cached. Filtering happens entirely in-memory in the browser (case-insensitive substring match). No debounced API calls.

## Risks / Trade-offs

- **GAS execution quotas** → Challenge JSON should be small (< 100 KB). Avoid heavy processing in the script. Keep response validation lightweight.
- **Google Sheets race conditions** → With a small class (40 students), the risk of concurrent writes is low. Accept as a design trade-off for v1.
- **No auth — lightweight identification** → Clearly communicated to students. No sensitive data stored. Student_id is an internal identifier, not a password equivalent.
- **Mobile responsiveness with vanilla CSS** → Use CSS media queries and a mobile-first layout. Keep the form fields large enough for touch targets.
- **Malformed JSON in sheets** → The frontend validates challenge JSON structure before rendering. If validation fails, show a clear error with a reference for the instructor to debug.
