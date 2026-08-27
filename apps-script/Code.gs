/**
 * cyber-awareness-quiz — Apps Script Web App
 *
 * SETUP:
 * 1. Open the response spreadsheet (the one linked to your Google Form).
 * 2. Extensions > Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Deploy > New deployment > select type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the /exec URL it gives you and paste it into config.js
 *    as APPS_SCRIPT_URL.
 * 6. Re-deploy (Deploy > Manage deployments > pencil icon > New version)
 *    any time you edit this script — otherwise the live URL keeps
 *    serving the old code.
 *
 * This script only reads the sheet. It never writes anything, and the
 * spreadsheet itself stays private — only this JSON endpoint is public.
 */

// If your responses live on a sheet/tab other than the first one,
// set its exact name here. Leave as null to just use the first sheet.
const SHEET_NAME = null;

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];

  const values = sheet.getDataRange().getValues();
  if (values.length === 0) {
    return jsonResponse({ headers: [], responses: [], generatedAt: new Date().toISOString() });
  }

  const headers = values[0];
  const rows = values.slice(1);

  const responses = rows
    // skip fully blank rows
    .filter((row) => row.some((cell) => cell !== "" && cell !== null))
    .map((row) => {
      const record = {};
      headers.forEach((header, i) => {
        const cell = row[i];
        // Normalise Date objects (e.g. Timestamp column) to ISO strings
        record[header] = cell instanceof Date ? cell.toISOString() : cell;
      });
      return record;
    });

  return jsonResponse({
    headers: headers,
    responses: responses,
    generatedAt: new Date().toISOString(),
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
