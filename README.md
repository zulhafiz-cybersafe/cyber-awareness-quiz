# cyber-awareness-quiz

QR-code entry point + live results dashboard for a Google Forms cyber awareness quiz.

- `index.html` — QR code page. Scanning it opens the Google Form quiz.
- `dashboard.html` — Live dashboard: total responses, average score, pass rate, score distribution, submissions over time, and a per-question answer breakdown.
- `config.js` — The one file you edit: form URL, Apps Script URL, pass threshold.
- `apps-script/Code.gs` — Backend that reads the response Sheet and serves it as JSON. Keeps the Sheet itself private.

## 1. Deploy the Apps Script backend

1. Open the response spreadsheet (the one linked to your Google Form).
2. **Extensions > Apps Script**.
3. Delete the placeholder code, paste in the contents of `apps-script/Code.gs`.
4. **Deploy > New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize when prompted, then copy the URL ending in `/exec`.
6. If your form responses live on a tab other than the first one, set `SHEET_NAME` near the top of `Code.gs` to that tab''s exact name and redeploy.

Whenever you edit `Code.gs` later, use **Deploy > Manage deployments > pencil icon > New version** — editing the script alone does not update the live URL.

## 2. Fill in config.js

Open `config.js` and paste the `/exec` URL from step 1 into `APPS_SCRIPT_URL`. `FORM_URL` is already set to your quiz. Adjust `PASS_THRESHOLD` and `NON_QUESTION_COLUMNS` if needed (add "Name" or similar if your form collects it).

## Notes

- The dashboard auto-refreshes every 60s (configurable via `REFRESH_INTERVAL_MS`) and has a manual **Refresh now** button.
- Per-question breakdown is fully dynamic — it reads whatever question columns exist in the response sheet, so new quiz questions show up automatically without touching any code.
- If a question allows multiple selections (checkboxes), the dashboard splits comma-separated answers and tallies each option individually.
- The Sheet itself is never made public — only the read-only JSON the Apps Script serves.
