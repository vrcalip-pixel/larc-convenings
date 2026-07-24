/**
 * Backend for the Monthly Regional Convenings contact form.
 *
 * Receives a POST from contact.html, appends the submission to a Google
 * Sheet, and emails the team member responsible for that topic.
 *
 * The full deployment walkthrough is in docs/CONTACT-FORM-SETUP.md.
 * Quick version:
 *   1. script.google.com  ->  New project  ->  paste this file
 *   2. Set SHEET_ID below
 *   3. Deploy  ->  New deployment  ->  Web app
 *        Execute as ............ Me
 *        Who has access ........ Anyone          <-- must be "Anyone"
 *   4. Copy the /exec URL into ENDPOINT in contact.html
 */

// ------------------------------------------------------------------ CONFIG

// From the Sheet's URL: docs.google.com/spreadsheets/d/THIS_PART/edit
var SHEET_ID   = 'PASTE_YOUR_SHEET_ID_HERE';
var SHEET_NAME = 'Responses';

var TEAM = {
  faculty: 'vcalip@lbcc.edu',      // Vincent Calip  — Faculty Lead
  manager: 'ramanuel@lbcc.edu',    // Ruth Amanuel   — Project Manager
  lead:    'kmoridzadeh@lbcc.edu'  // Koby Moridzadeh — Project Lead
};

// Keys must match the <option> values in contact.html exactly.
var ROUTING = {
  'Logistics, stipends, or attendance': TEAM.manager,
  'Canvas access or technical trouble':  TEAM.manager,
  'My track or a program deliverable':   TEAM.faculty,
  'Presenting at a convening':           TEAM.faculty,
  'Partnership or press inquiry':        TEAM.lead,
  'Something else':                      TEAM.faculty
};

var FALLBACK = TEAM.faculty;
var HEADERS  = ['Timestamp', 'Name', 'Email', 'College', 'Topic', 'Message', 'Routed to', 'Source page'];

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

    appendRow([new Date(), name, email, college, topic, message, to, clean(p.page)]);
    notify(to, name, email, college, topic, message);

    return json({ ok: true });

  } catch (err) {
    try {
      MailApp.sendEmail(FALLBACK, '[Convenings] Contact form error',
        'A submission failed.\n\nError: ' + err + '\n\nCheck the response sheet.');
    } catch (ignored) {}
    return json({ ok: false, error: String(err) });
  }
}

// Visiting the /exec URL in a browser confirms the deployment is live.
function doGet() {
  return json({ ok: true, service: 'LA-25 convenings contact form', status: 'ready' });
}

// -------------------------------------------------------------------- UTIL

function appendRow(row) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow(row);
}

function notify(to, name, email, college, topic, message) {
  var cc = [TEAM.faculty, TEAM.manager, TEAM.lead]
    .filter(function (a) { return a !== to; })
    .join(',');

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

  MailApp.sendEmail(to, subject, body, { cc: cc, replyTo: email, name: 'LA-25 Convenings' });
}

function clean(v) {
  return v === undefined || v === null ? '' : String(v).trim();
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
