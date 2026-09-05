/*
 * Google Apps Script Web App that turns a Google Sheet into a free form
 * backend for this site's forms (suggest-topic.html, review-event.html,
 * volunteer.html, newsletter.html, and the newsletter box in index.html)
 * — see README.md "Forms" for the full one-time setup:
 *
 *   1. Create a new Google Sheet.
 *   2. Extensions -> Apps Script, delete the default content, paste this
 *      whole file in, and save.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *   4. Copy the deployment's URL (ends in /exec) and paste it in as
 *      YOUR_APPS_SCRIPT_URL wherever it appears in this repo's HTML
 *      (data-sheet-endpoint="..." on each <form>).
 *
 * Each submission lands as one row on a tab named after the form (e.g.
 * "topic-suggestion", "event-review", "volunteer-signup", "newsletter" —
 * matching each <form name="..."> in the HTML). A tab is created
 * automatically the first time that form gets a submission, with column
 * headers taken from the field labels the client sends.
 *
 * "Who has access: Anyone" is required for the site (running in a
 * visitor's browser, not logged into Google) to be able to POST here at
 * all — it does NOT expose your sheet's data, only this one write
 * endpoint. The honeypot check below is the only spam filtering; there's
 * no equivalent of Formspree's more sophisticated bot detection.
 */

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var fields = body.fields || {};

  // Formspree-style honeypot — the client already checks this and won't
  // normally send a request at all if it's filled, but a bot could POST
  // here directly, bypassing the page's JS entirely. Silently drop it.
  if (fields._gotcha) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheetName = (body.formName || "Submissions").toString().slice(0, 100);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  var keys = Object.keys(fields);
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  if (headers.length === 0) {
    headers = ["Timestamp"].concat(keys);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    // A field set can grow over time (e.g. someone edits a form's fields
    // later) — add any new ones as new columns rather than dropping data.
    keys.forEach(function (k) {
      if (headers.indexOf(k) === -1) {
        headers.push(k);
        sheet.getRange(1, headers.length, 1, 1).setValue(k);
      }
    });
  }

  var row = headers.map(function (h) {
    if (h === "Timestamp") return body.timestamp || new Date().toISOString();
    return fields[h] || "";
  });
  sheet.appendRow(row);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
