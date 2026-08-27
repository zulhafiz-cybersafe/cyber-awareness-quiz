// ============================================================
// cyber-awareness-quiz — CONFIG
// This is the only file you should need to edit.
// ============================================================

const CONFIG = {
  // The Google Form quiz respondents fill in.
  FORM_URL:
    "https://docs.google.com/forms/d/e/1FAIpQLSfE3GisMumFkhxAYLeANGMmy8-0b2M4QnKK9hjjE50Ytc7oMA/viewform?usp=header",

  // Paste the /exec URL you get after deploying apps-script/Code.gs
  // as a Web App (Deploy > New deployment > Web app > Execute as: Me,
  // Who has access: Anyone). Looks like:
  // https://script.google.com/macros/s/AKfycb.../exec
  APPS_SCRIPT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",

  // Score needed to count as a "pass", as a fraction (0.7 = 70%).
  PASS_THRESHOLD: 0.7,

  // How often the dashboard re-polls the Apps Script endpoint, in ms.
  REFRESH_INTERVAL_MS: 60000,

  // Column headers to exclude when auto-detecting quiz questions
  // from the response sheet. Add any extra non-question columns here
  // (e.g. "Email Address", "Name") if your form collects them.
  NON_QUESTION_COLUMNS: ["Timestamp", "Score", "Email Address", "Email"],
};
