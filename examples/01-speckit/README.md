# Challenge of the Day App

A greenfield static frontend hosted on GitHub Pages with a Google Apps Script backend that stores data in Google Sheets.

## Overview

- Frontend: `frontend/index.html`, `frontend/styles.css`, `frontend/app.js`
- Backend: `backend/Code.gs`, `backend/appsscript.json`
- Data storage: Google Sheets
- Configuration documentation: `backend/spreadsheet-schema.md`

## Setup

1. Deploy the backend as a Google Apps Script web app.
   - Create a new Apps Script project or use the backend directory contents in an existing project.
   - If the script is not bound to a spreadsheet, add a script property named `SPREADSHEET_ID` with the target spreadsheet ID.
   - Deploy the project and copy the web app URL.

2. Update the frontend backend URL:
   - Open `frontend/app.js`
   - Replace `REPLACE_WITH_APPS_SCRIPT_URL` with the deployed Apps Script web app URL.

3. Host the frontend on GitHub Pages.
   - Publish the `frontend/` directory as a static site.
   - Ensure the web app URL is reachable from the frontend.

## Google Sheets Setup

Create the following sheets in your spreadsheet:

- `Students`
- `Challenges`
- `Responses`
- `Config`

Refer to `backend/spreadsheet-schema.md` for the expected column names and example data.

## Notes

- This version intentionally avoids paid services, authentication, external databases, frameworks, and LLM APIs.
- The app uses lightweight student identification only; it is not a secure login system.
- Manual name entry is enabled by default and may be disabled via the backend config sheet.

## Development

- Edit `frontend/app.js` to update UI behavior and feedback rules.
- Edit `backend/Code.gs` to adjust data validation and sheet mapping.
- Use the static frontend with any HTML host that can fetch the Apps Script endpoint.
