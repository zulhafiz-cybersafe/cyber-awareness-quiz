/**
 * Cyber Awareness Quiz — Google Apps Script backend.
 *
 * Reads AND writes into a dedicated Sheet (SHEET_ID/SHEET_GID below)
 * that belongs ONLY to this script — not the real Google Form's own
 * response Sheet. That Form-linked sheet turned out to have structural
 * problems that broke column alignment for real Form submissions too
 * (an extra "Score" column Forms didn't actually manage, plus an
 * earlier stale-columns issue on a different tab in the same
 * spreadsheet) — not something fixable from this script's side.
 * A sheet nothing else writes into can't drift out of alignment.
 *
 * Trade-off: someone filling out the actual Google Form directly
 * (not through quiz.html) won't land here. That's fine since quiz.html
 * is the real respondent-facing tool — the Form itself isn't part of
 * the live flow (see quiz.html's config comment for why a raw POST
 * into the Form's own formResponse endpoint doesn't work reliably).
 *
 * Both doGet and doPost read/write by ACTUAL HEADER TEXT, not column
 * position, so this survives someone reordering columns later. Answers
 * are keyed by the literal question text (matching quiz.html's
 * SECTIONS[].questions[].text exactly), not q1..q14.
 *
 * SETUP
 * 1. Open this script's project (bound to, or pointed at, the Sheet
 *    above). Paste this whole file in.
 * 2. Run `setupSheet` once (Run menu -> select setupSheet -> Run).
 *    Creates the header row. Grant permissions when asked.
 * 3. Deploy -> New deployment -> Web app. Execute as: Me. Who has
 *    access: Anyone. Paste the URL into SCRIPT_URL in quiz.html AND
 *    dashboard.html.
 *
 * To update after an edit: Deploy -> Manage deployments -> pencil icon
 * -> Version: New version -> Deploy (keeps the same /exec URL).
 */

var SHEET_ID = "1CMvRVWCQV9rmhQuQ8P5LYeSmWbHkgWILswypKczSppU";
var SHEET_GID = 899554030;

// Must stay byte-identical to quiz.html/dashboard.html's SECTIONS
// question text — this is what setupSheet writes as headers, and what
// quiz.html sends as answer keys.
var QUESTION_TEXTS = [
  "Which of the following are communication channels used in phishing attempts?",
  "Which statement about social engineering is false?",
  "Which message content helps you to confirm whether it is from a legitimate source?",
  "Which of the following is an example of a common phishing scenario?",
  "Which of the following does not describe passphrases?",
  "Which of the following is a strong passphrase?",
  "Which of the following is not a good passphrase practice?",
  "What are the key considerations in selecting a software that helps you to manage your passphrases?",
  "Which of the following is a Multi-Factor Authentication key?",
  "Which of the following is not a good practice in protecting your device from loss/theft and unauthorised access?",
  "Which of the following is not a good practice when using wireless access?",
  "Which of the following is an example of a good practice in software security?",
  "Which of the following is a reason to report cyber incidents?",
  "Which of the following is a common cyber incident?",
];

function setupSheet() {
  var sheet = getResponseSheet_();
  var headers = ["Timestamp", "Full Name", "Email"].concat(QUESTION_TEXTS);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function getResponseSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === SHEET_GID) return sheets[i];
  }
  return ss.getSheets()[0];
}

function getHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); });
}

function doGet(e) {
  var sheet = getResponseSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data.shift().map(function (h) { return String(h).trim(); });
  var rows = data
    .filter(function (row) { return row.some(function (cell) { return cell !== ""; }); })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
  return jsonOutput({ ok: true, headers: headers, rows: rows });
}

function doPost(e) {
  var sheet = getResponseSheet_();
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput({ ok: false, error: "Invalid JSON body." });
  }

  var headers = getHeaders_(sheet);
  var row = headers.map(function () { return ""; });

  var setByHeader = function (headerText, value) {
    var idx = headers.indexOf(headerText);
    if (idx !== -1) row[idx] = value;
  };

  setByHeader("Timestamp", new Date());
  setByHeader("Full Name", payload.fullName || "");
  setByHeader("Email", payload.email || "");

  // answers is keyed by the literal question TEXT (matching the header
  // exactly), not q1..q14 — sent that way by quiz.html specifically so
  // this doesn't depend on column order.
  var answers = payload.answers || {};
  Object.keys(answers).forEach(function (questionText) {
    setByHeader(questionText, answers[questionText]);
  });

  sheet.appendRow(row);
  return jsonOutput({ ok: true });
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
