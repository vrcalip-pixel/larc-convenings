/**
 * Contact form routing for the Monthly Regional Convenings hub.
 *
 * Sends each Google Form submission to the right person on the team and
 * copies the others, so nothing lands in a single inbox and stalls.
 *
 * SETUP
 *  1. Open the Google Form, click the three-dot menu, choose "Script editor".
 *  2. Delete whatever is in the file and paste this in. Save.
 *  3. Click the clock icon (Triggers) in the left sidebar.
 *  4. Add Trigger:
 *       Function .................. onFormSubmit
 *       Event source .............. From form
 *       Event type ................ On form submit
 *  5. Save and approve the permission prompt.
 *  6. Submit a test response and confirm the email arrives.
 *
 * The QUESTION_TITLES below must match your form's question wording exactly.
 * If you reword a question on the form, update it here too.
 */

// ---------------------------------------------------------------- CONFIG

var TEAM = {
  faculty: 'vcalip@lbcc.edu',      // Vincent Calip — Faculty Lead
  manager: 'ramanuel@lbcc.edu',    // Ruth Amanuel — Project Manager
  lead:    'kmoridzadeh@lbcc.edu'  // Koby Moridzadeh — Project Lead
};

// Which topic goes to whom. Keys must match the dropdown options on the form.
var ROUTING = {
  'Logistics, stipends, or attendance':        TEAM.manager,
  'Canvas access or technical trouble':        TEAM.manager,
  'My track or a program deliverable':         TEAM.faculty,
  'Presenting at a convening':                 TEAM.faculty,
  'Partnership or press inquiry':              TEAM.lead,
  'Something else':                            TEAM.faculty
};

var FALLBACK = TEAM.faculty;

// Exact question titles as they appear on the form.
var QUESTION_TITLES = {
  name:    'Your name',
  email:   'Your email',
  college: 'Your college',
  topic:   'What is your question about?',
  message: 'Your question or request'
};

// --------------------------------------------------------------- HANDLER

function onFormSubmit(e) {
  try {
    var v = e.namedValues || {};

    var name    = first(v[QUESTION_TITLES.name]);
    var email   = first(v[QUESTION_TITLES.email]);
    var college = first(v[QUESTION_TITLES.college]);
    var topic   = first(v[QUESTION_TITLES.topic]);
    var message = first(v[QUESTION_TITLES.message]);

    var to = ROUTING[topic] || FALLBACK;
    var cc = Object.keys(TEAM)
      .map(function (k) { return TEAM[k]; })
      .filter(function (addr) { return addr !== to; })
      .join(',');

    var subject = '[Convenings] ' + (topic || 'New inquiry') +
                  ' — ' + (name || 'Unnamed') +
                  (college ? ', ' + college : '');

    var body =
      'A new inquiry came in through the convenings hub contact form.\n\n' +
      'From:     ' + (name || '(not given)') + '\n' +
      'Email:    ' + (email || '(not given)') + '\n' +
      'College:  ' + (college || '(not given)') + '\n' +
      'Topic:    ' + (topic || '(not given)') + '\n\n' +
      '------------------------------------------------------------\n' +
      (message || '(no message)') + '\n' +
      '------------------------------------------------------------\n\n' +
      'Reply directly to this email to respond to the sender.\n' +
      'All responses are also recorded in the linked Google Sheet.';

    var options = { cc: cc };
    if (email && /\S+@\S+\.\S+/.test(email)) {
      options.replyTo = email;   // hitting Reply goes to the person who wrote in
    }

    MailApp.sendEmail(to, subject, body, options);

  } catch (err) {
    // Never let a routing failure lose the submission — the Sheet still has it.
    MailApp.sendEmail(
      FALLBACK,
      '[Convenings] Contact form routing error',
      'A form response was recorded but could not be routed.\n\n' +
      'Error: ' + err + '\n\n' +
      'Check the linked Google Sheet for the submission.'
    );
  }
}

// ----------------------------------------------------------------- UTIL

function first(values) {
  if (!values || !values.length) return '';
  return String(values[0]).trim();
}
