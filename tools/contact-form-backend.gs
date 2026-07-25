/**
 * ============================================================================
 * LA-25 LARC & LBCC AI Literacy & Innovation Project
 * Monthly Regional Convenings — contact form backend (MINIMAL)
 * ============================================================================
 *
 * Purpose: prove the pipe. Every valid submission becomes one row in this
 * Sheet. No email routing, no notifications, no conditional logic — those
 * come next, once this is confirmed working.
 *
 * This is a CONTAINER-BOUND script. It lives inside the Sheet it writes to,
 * so there is no Sheet ID to paste and no way to point it at the wrong file.
 * That single change removes the failure mode the previous version hit.
 *
 * Setup: see CONTACT-FORM-SETUP.md
 * ============================================================================
 */

// ------------------------------------------------------------------- CONFIG

var SHEET_NAME = 'Responses';

var HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'College',
  'Topic',
  'Message',
  'Source page'
];

// ----------------------------------------------------------------- HANDLERS

/**
 * Visiting the /exec URL in a browser hits this.
 * If you see JSON with "status":"ready", the deployment is live.
 */
function doGet() {
  return json({
    ok: true,
    service: 'LA-25 convenings contact form',
    status: 'ready',
    sheet: SpreadsheetApp.getActiveSpreadsheet().getName(),
    tab: SHEET_NAME
  });
}

/**
 * Receives the POST from contact.html.
 */
function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // Honeypot. Bots fill the hidden "website" field.
    // Accept quietly so they get no signal, but store nothing.
    if (p.website) {
      return json({ ok: true });
    }

    var name    = clean(p.name);
    var email   = clean(p.email);
    var college = clean(p.college);
    var topic   = clean(p.topic);
    var message = clean(p.message);
    var page    = clean(p.page);

    if (!name || !email || !topic || !message) {
      return json({ ok: false, error: 'Missing required fields' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'Invalid email address' });
    }

    if (message.length > 5000) {
      message = message.substring(0, 5000) + ' [truncated]';
    }

    appendRow([new Date(), name, email, college, topic, message, page]);

    return json({ ok: true });

  } catch (err) {
    // Surfacing the real error makes debugging far faster than a generic failure.
    return json({ ok: false, error: String(err) });
  }
}

// ------------------------------------------------------- RUN THESE MANUALLY

/**
 * STEP 1 — Run this once from the Apps Script editor before deploying.
 *
 * It does two things:
 *   1. Triggers the Google permissions prompt (required, one time only)
 *   2. Creates the Responses tab and its bold, frozen header row
 */
function setUp() {
  var sheet = targetSheet();
  Logger.log('Ready. Writing to "%s" in "%s".',
    SHEET_NAME, SpreadsheetApp.getActiveSpreadsheet().getName());
  return sheet.getName();
}

/**
 * STEP 2 — Run this to prove the Sheet write works, before touching the website.
 *
 * If a test row appears in the Responses tab, the Sheet half is confirmed
 * and any remaining problem is on the web page side. That split saves a lot
 * of guessing.
 */
function testWrite() {
  appendRow([
    new Date(),
    'Test Submission',
    'test@example.com',
    'Long Beach City College',
    'Something else',
    'This row was written by testWrite(). Delete it once you see it.',
    'apps-script-editor'
  ]);
  Logger.log('Test row written. Check the "%s" tab.', SHEET_NAME);
}

// --------------------------------------------------------------------- UTIL

/**
 * Returns the Responses sheet, creating it with headers if it does not exist.
 */
function targetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setFontWeight('bold')
         .setBackground('#003366')
         .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);  // Timestamp
    sheet.setColumnWidth(6, 420);  // Message
  }

  return sheet;
}

/**
 * Appends a row, using a lock so two submissions landing at the same
 * moment cannot overwrite each other.
 */
function appendRow(row) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    targetSheet().appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

function clean(v) {
  return (v === undefined || v === null) ? '' : String(v).trim();
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
