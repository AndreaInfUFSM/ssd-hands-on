# Challenge of the Day App

A lightweight daily challenge app for Programming Paradigms courses. No hosting budget — frontend on GitHub Pages, backend on Google Apps Script, data in Google Sheets.

## Architecture

```
GitHub Pages (static HTML/CSS/JS)
       ↕ HTTP + CORS
Google Apps Script Web App
       ↕
Google Sheets (Students, Challenges, Responses, Config)
```

## Setup

### 1. Google Sheets

1. Create a new Google Sheet
2. Rename the default sheet to **Students** with columns:
   `student_id | display_name | active`
3. Add a sheet named **Challenges** with columns:
   `challenge_id | date | active | title | topics | difficulty | challenge_json`
4. Add a sheet named **Responses** with columns:
   `timestamp | challenge_id | challenge_version | student_id | student_display_name | student_source | response_json | feedback_json | elapsed_seconds | frontend_version`
5. Create a named range **Config** (range A1:B10) with keys in column A and values in column B:
   - `course_name` → `Programming Paradigms`
   - `timezone` → `America/Sao_Paulo`
   - `allow_manual_name` → `TRUE`
   - `frontend_version` → `1.0.0`
   - `challenge_selection_mode` → `daily`

### 2. Google Apps Script

1. In the Google Sheet, go to Extensions → Apps Script
2. Copy the contents of `app/backend/Code.gs` into the script editor
3. Save the project
4. Deploy → New deployment → Web app
   - Execute as: `Me`
   - Access: `Anyone`
5. Copy the web app URL

### 3. Frontend

1. Push `app/frontend/` to a GitHub Pages repository
2. Configure the API URL:
   - Set the localStorage key `CHALLENGE_APP_API_BASE_URL` to your GAS web app URL, or
   - Hardcode the URL in `app.js` by changing `DEFAULT_API_BASE`
3. Open the GitHub Pages URL

## Development

Serve the frontend locally for testing:

```bash
cd app/frontend
python3 -m http.server 8000
# or: npx serve .
```

Set the API base URL in browser localStorage:
```js
localStorage.setItem('CHALLENGE_APP_API_BASE_URL', 'https://script.google.com/.../exec')
```

## Seed Data

### Sample Students

| student_id | display_name | active |
|-----------|-------------|--------|
| 1         | Alice Souza | TRUE   |
| 2         | Bruno Lima  | TRUE   |
| 3         | Carla Dias  | TRUE   |

### Sample Challenge

Use the example challenge JSON from the spec (`openspec/specs/challenge-of-the-day-app.md`) for the `challenge_json` column.
