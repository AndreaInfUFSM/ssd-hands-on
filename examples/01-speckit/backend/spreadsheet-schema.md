# Google Sheets Schema for Challenge of the Day App

This document describes the expected sheet names and column layout for the app backend.

## Students sheet
Sheet name: `Students`

Columns:
- `student_id` (string) — unique identifier for the student
- `display_name` (string) — name shown in the autocomplete picker
- `active` (boolean/string) — active students are included in the frontend list

Example rows:
- `s001`, `Alice Santos`, `true`
- `s002`, `Bruno Costa`, `TRUE`

## Challenges sheet
Sheet name: `Challenges`

Columns:
- `challenge_id` (string) — unique challenge identifier
- `date` (string) — date in `YYYY-MM-DD` format for the active challenge
- `active` (boolean/string) — whether the challenge is active
- `title` (string) — brief challenge title
- `topics` (string) — comma-separated topics
- `difficulty` (string) — optional difficulty label
- `challenge_json` (string) — full challenge payload as JSON text

The JSON stored in `challenge_json` should include the challenge structure documented in the spec, including response and feedback models.

## Responses sheet
Sheet name: `Responses`

Columns:
- `timestamp` (datetime) — submission timestamp
- `challenge_id` (string)
- `challenge_version` (number/string)
- `student_id` (string)
- `student_display_name` (string)
- `student_source` (string) — `listed` or `manual`
- `response_json` (string) — JSON-serialized response payload
- `feedback_json` (string) — JSON-serialized feedback payload
- `elapsed_seconds` (number)
- `frontend_version` (string)

## Config sheet
Sheet name: `Config`

Columns:
- `key` (string)
- `value` (string)

Supported configuration keys:
- `course_name`
- `timezone`
- `allow_manual_name`
- `frontend_version`
- `challenge_selection_mode`

## Deployment notes
- If the Apps Script project is not container-bound to a spreadsheet, set `SPREADSHEET_ID` in `PropertiesService`.
- The frontend must be updated with the deployed Apps Script URL.
- The app assumes a small class size and that only active students are selectable by default.
