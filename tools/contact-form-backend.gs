/**
 * Backend for the Monthly Regional Convenings contact form.
 *
 * Receives a POST from contact.html, appends the submission to this
 * spreadsheet, and emails the one team member who handles that topic.
 *
 * IMPORTANT: this is a CONTAINER-BOUND script. Create it from the response
 * spreadsheet itself via  Extensions -> Apps Script  — not from
 * script.google.com. Being bound to the sheet is what lets
 * getActiveSpreadsheet() work without an ID or extra permissions.
 *
 * Full walkthrough: docs/CONTACT-FORM-SETUP.md
 *
 * DEPLOY
 *   Deploy -> New deployment -> Web app
 *     Execute as ............ Me
 *     Who has access ........ Anyone        <-- must be "Anyone"
 *   Copy the /exec URL into ENDPOINT in contact.html.
 *
 * AFTER ANY EDIT you must redeploy:
 *   Deploy -> Manage deployments -> pencil -> Version: New version -> Deploy
 *   Saving alone does NOT update the live endpoint.
 *
 * ---------------------------------------------------------------------------
 * CHANGES IN 3.0
 *   - "Canvas access or technical trouble" split into two topics:
 *       access/enrollment  -> Ruth      |  something broken -> Vincent
 *   - FALLBACK moved from faculty to manager, so the catch-all and any
 *     unmatched topic land with the designated primary contact.
 *   - Sheet creation now applies timestamp format, timezone, and header
 *     styling, so a recreated tab comes back correctly formatted.
 *   - appendRow() wrapped in LockService to survive simultaneous submissions.
 *
 * WARNING: the ROUTING keys below must match the <option> text in
 * contact.html CHARACTER FOR CHARACTER. If they drift, routing silently
 * falls through to FALLBACK and nobody notices. Ship both files together.
 * ---------------------------------------------------------------------------
 */

// ------------------------------------------------------------------ CONFIG

var SCRIPT_VERSION = '3.1-stamp-fix';    // shown by doGet — proves which code is deployed
var SHEET_NAME     = 'Responses';
var TIMEZONE       = 'America/Los_Angeles';
var STAMP_FORMAT   = 'dddd, mm/dd/yyyy, h:mm AM/PM';

var TEAM = {
  faculty: 'vcalip@lbcc.edu',      // Vincent Calip   — Faculty Lead
  manager: 'ramanuel@lbcc.edu',    // Ruth Amanuel    — Program Manager
  lead:    'kmoridzadeh@lbcc.edu'  // Koby Moridzadeh — Project Lead
};

// Keys must match the <option> text in contact.html exactly.
var ROUTING = {
  'Logistics, stipends, or attendance':   TEAM.manager,
  'Canvas access or enrollment':          TEAM.manager,
  'Something is not working in Canvas':   TEAM.faculty,
  'My track or a program deliverable':    TEAM.faculty,
  'Presenting at a convening':            TEAM.faculty,
  'Partnership or press inquiry':         TEAM.lead,
  'Something else':                       TEAM.manager
};

// Used when a topic has no routing entry — i.e. when this file and
// contact.html have drifted apart. Ruth is the designated front door.
var FALLBACK = TEAM.manager;

var HEADERS = ['Date & Time Received', 'Name', 'Email', 'College', 'Topic',
               'Message', 'Routed to', 'Source page'];

// ----------------------------------------------------------------- HANDLERS

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // Honeypot: bots fill the hidden "website" field. Accept quietly, store nothing.
    if (p.website) return json({ ok: true });

    var name    = clean(p.name);
    var email   = clean(p.email);
    var college = clean(p.college);
    var topic   = clean(p.topic);
    var message = clean(p.message);

    if (!name || !email || !topic || !message) {
      return json({ ok: false, error: 'Missing required fields' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'Invalid email address' });
    }
    if (message.length > 5000) message = message.substring(0, 5000) + ' [truncated]';

    var to = ROUTING[topic] || FALLBACK;

    // Write first. If mail fails later, the submission is already safe.
    appendRow([new Date(), name, email, college, topic, message, to, clean(p.page)]);
    notify(to, name, email, college, topic, message);

    return json({ ok: true });

  } catch (err) {
    logError(err, e);
    return json({ ok: false, error: String(err) });
  }
}

// Visiting the /exec URL in a browser confirms the deployment is live.
function doGet() {
  return json({
    ok: true,
    service: 'LA-25 convenings contact form',
    version: SCRIPT_VERSION,
    bound:   SpreadsheetApp.getActiveSpreadsheet() ? true : false,
    status:  'ready'
  });
}

// ------------------------------------------------------------------- CORE

/**
 * Returns the Responses sheet, creating and formatting it if absent.
 * Formatting lives here so a recreated tab is never a plain grey grid.
 */
function ensureSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (ss.getSpreadsheetTimeZone() !== TIMEZONE) {
    ss.setSpreadsheetTimeZone(TIMEZONE);
  }

  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setFontWeight('bold')
         .setBackground('#003366')
         .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.getRange('A2:A').setNumberFormat(STAMP_FORMAT);
    sheet.setColumnWidth(1, 240);   // Timestamp
    sheet.setColumnWidth(6, 420);   // Message
  }

  return sheet;
}

/**
 * Appends a row under a script lock, so two submissions arriving in the
 * same moment cannot land on top of each other.
 */
function appendRow(row) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = ensureSheet();
    sheet.appendRow(row);

    // Format the timestamp cell we just wrote. Column-level number formats
    // are NOT reliably inherited by rows added via appendRow(), so the
    // format has to be applied to the new cell directly.
    sheet.getRange(sheet.getLastRow(), 1).setNumberFormat(STAMP_FORMAT);

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function notify(to, name, email, college, topic, message) {
  var subject = '[Convenings] ' + topic + ' \u2014 ' + name + (college ? ', ' + college : '');

  var body =
    'A new inquiry came in through the convenings hub contact form.\n\n' +
    'From:     ' + name + '\n' +
    'Email:    ' + email + '\n' +
    'College:  ' + (college || '(not given)') + '\n' +
    'Topic:    ' + topic + '\n\n' +
    '------------------------------------------------------------\n' +
    message + '\n' +
    '------------------------------------------------------------\n\n' +
    'Reply to this email to respond directly to the sender.\n' +
    'Every submission is also recorded in the response sheet.';

  // Single recipient — no CC. Each inquiry goes only to the person who handles it.
  MailApp.sendEmail(to, subject, body, { replyTo: email, name: 'LA-25 Convenings' });
}

// --------------------------------------------------------------- DIAGNOSTICS

/**
 * Run from the editor to prove the script can write to the sheet.
 * If a row appears, the sheet half works and any problem is in the
 * deployment or the form. No email is sent.
 */
function testWrite() {
  appendRow([new Date(), 'Test Row', 'test@example.com', 'Long Beach City College',
             'Something else', 'Written by testWrite()', '(diagnostic only)', 'editor']);
  Logger.log('OK — check the "' + SHEET_NAME + '" tab for a new row.');
}

/**
 * Simulates a real submission end to end, including the email.
 * Change the topic to test different routing.
 */
function testSubmission() {
  var fake = { parameter: {
    name:    'Diagnostic Test',
    email:   'vcalip@lbcc.edu',
    college: 'Long Beach City College',
    topic:   'Logistics, stipends, or attendance',
    message: 'This is a test submission from testSubmission().',
    page:    'editor'
  }};
  Logger.log(doPost(fake).getContent());
}

/**
 * Prints the full routing table to the log. Run this after any edit to
 * confirm each topic points where you expect before redeploying.
 */
function showRouting() {
  var lines = ['Routing table — ' + SCRIPT_VERSION, ''];
  Object.keys(ROUTING).forEach(function (topic) {
    lines.push(pad(topic, 38) + ' -> ' + ROUTING[topic]);
  });
  lines.push('');
  lines.push(pad('(unmatched topic)', 38) + ' -> ' + FALLBACK);
  Logger.log(lines.join('\n'));
}

/** Confirms the script is bound to the right spreadsheet. */
function whichSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('NOT BOUND. This script is standalone. Recreate it from the '
             + 'spreadsheet via Extensions -> Apps Script.');
    return;
  }
  Logger.log('Bound to: ' + ss.getName() + '\n' + ss.getUrl()
           + '\nTimezone: ' + ss.getSpreadsheetTimeZone());
}

/**
 * One-time maintenance for rows that already exist. Reapplies the timestamp
 * display format and the header wording. Safe to re-run.
 */
function formatTimestamps() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TIMEZONE);

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No "' + SHEET_NAME + '" tab found.');

  sheet.getRange('A2:A').setNumberFormat(STAMP_FORMAT);
  sheet.setColumnWidth(1, 240);
  sheet.getRange('A1').setValue(HEADERS[0]).setNumberFormat('@');

  Logger.log('Done. Timezone: %s', ss.getSpreadsheetTimeZone());
}

// -------------------------------------------------------------------- UTIL

function logError(err, e) {
  try {
    var detail = 'Error: ' + err + '\n\n' +
      'Parameters received: ' + JSON.stringify((e && e.parameter) || {}) + '\n\n' +
      'Check the response sheet and the Apps Script execution log.';
    MailApp.sendEmail(FALLBACK, '[Convenings] Contact form error', detail);
  } catch (ignored) {}
  Logger.log(err);
}

function pad(s, n) {
  while (s.length < n) s += ' ';
  return s;
}

function clean(v) {
  return v === undefined || v === null ? '' : String(v).trim();
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
