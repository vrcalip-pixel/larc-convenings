# Contact Form — Setup & Maintenance

How `contact.html` turns a submission into a row in a Google Sheet and an email to the right person.

The script that does this is **container-bound**: it lives inside the response spreadsheet, not at script.google.com. That is what lets `getActiveSpreadsheet()` work with no Sheet ID to configure, and it removes the most common failure mode — a script pointed at the wrong file, or at a placeholder ID that was never replaced.

---

## Where everything lives

| Piece | Location | Notes |
|---|---|---|
| Form page | `contact.html` (this repo) | The `ENDPOINT` constant near the bottom holds the `/exec` URL |
| Running code | Apps Script editor, reached from the response Sheet via **Extensions → Apps Script** | The only copy that executes |
| Archive copy | `tools/contact-form-backend.gs` (this repo) | Reference only. Nothing reads it. Keep it in sync by hand |
| Data | Google Sheet, `Responses` tab | Owned by the LBCC account that deployed the script |

**The archive copy is not live.** Editing `tools/contact-form-backend.gs` changes nothing. Every code change has to be made in the Apps Script editor and redeployed, then mirrored here so the two do not drift.

---

## First-time setup

1. Create a Google Sheet in Drive. Name it something durable, e.g. `LA-25 Convenings — Contact Form Responses`.
2. From inside that Sheet: **Extensions → Apps Script**.
3. Delete the sample `myFunction()` and paste in the full contents of `tools/contact-form-backend.gs`.
4. Rename the project from "Untitled project" to `LA-25 Convenings — Contact Form`.
5. Save.
6. Select **`whichSheet`** from the function dropdown and click **Run**. Approve the permission prompt. You will pass a *"Google hasn't verified this app"* screen — expected for an internal script. Click **Advanced → Go to … (unsafe) → Allow**.
7. Check the log. It should name your spreadsheet. If it says NOT BOUND, the script was created standalone — start again from step 2.
8. Run **`testWrite`**. A row should appear in a new `Responses` tab with a navy header. Delete the test row.
9. **Deploy → New deployment → Web app.** Execute as **Me**. Who has access **Anyone**.
10. Copy the `/exec` URL into `ENDPOINT` in `contact.html`. Commit and push.

### Two settings that cause most problems

**"Anyone" is not "Anyone with a Google account."** Those are separate options. The second one puts a login wall in front of every faculty member not currently signed in.

**Saving does not deploy.** After any code edit: **Deploy → Manage deployments → pencil icon → Version: New version → Deploy.** The URL stays the same. Skipping this is the number one reason a fix appears to do nothing.

---

## Confirming which code is live

Load the `/exec` URL in a browser. You will get JSON:

```json
{"ok":true,"service":"LA-25 convenings contact form",
 "version":"3.3-reply-safe","bound":true,"status":"ready"}
```

The `version` field is the point. If it does not match the `SCRIPT_VERSION` constant at the top of the file you just edited, your deployment did not take — go back and cut a new version.

Bump `SCRIPT_VERSION` every time the file changes. It costs nothing and turns "did that deploy?" into a two-second check.

---

## Topic routing

| Topic | Goes to |
|---|---|
| Logistics, stipends, or attendance | Ruth Amanuel |
| Canvas access or enrollment | Ruth Amanuel |
| Something is not working in Canvas | Vincent Calip |
| My track or a program deliverable | Vincent Calip |
| Presenting at a convening | Vincent Calip |
| Partnership or press inquiry | Koby Moridzadeh |
| Something else | Ruth Amanuel |

Each message goes to **one** recipient. There is no CC, so nobody else sees it. The `Routed to` column in the Sheet is the only shared record of who owns what — worth scanning if someone is out.

### Changing the topic list

The `ROUTING` keys in the script and the `<option>` text in `contact.html` are compared as exact strings. If they differ by so much as an apostrophe, that topic falls through to `FALLBACK` and nobody is told.

To change a topic safely:

1. Edit the `<option>` in `contact.html`.
2. Copy the new text — do not retype it — into the matching `ROUTING` key.
3. Run **`showRouting`** in the editor and read the log to confirm the table.
4. Redeploy, then push `contact.html`.
5. Deploy the script **before** pushing the page. The script tolerates old topic names by falling back; the page cannot route to a topic the script has never heard of.

This is why the topic *"Something is not working in Canvas"* avoids a contraction. An apostrophe can be written as `&rsquo;`, `&#39;`, or a literal character, and each arrives as a different string.

---

## Diagnostics

All run from the Apps Script editor's function dropdown.

| Function | What it does |
|---|---|
| `whichSheet` | Names the bound spreadsheet and its timezone. Run first when anything looks wrong |
| `testWrite` | Writes one row. Proves the Sheet half without sending mail |
| `testSubmission` | Simulates a full submission including the email. Edit the topic to test routing |
| `showRouting` | Prints the whole routing table to the log |
| `formatTimestamps` | Reapplies timestamp formatting to existing rows. Safe to re-run |

`testWrite` is the one that saves time: if a row appears, the Sheet works, and the problem is in the deployment or the page — not the script.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Green success panel, no row | Honeypot triggered — something autofilled the hidden `website` field. Try another browser |
| "Something went wrong sending your message" | Open DevTools → Network → the `exec` request → Response. The script returns the real error |
| CORS error in console | Deployment is not set to **Anyone**, or you are testing a local `file://` copy instead of the live URL |
| Edits have no effect | You saved but did not cut a new deployment version. Check `version` at the `/exec` URL |
| An old row shows `7/25/2026 14:39:41` | Run `formatTimestamps` to backfill. New rows self-format as of v3.1 |
| Messages reaching the wrong person | Run `showRouting`, then compare against the `<option>` text in `contact.html` |

---

## Sheet housekeeping

**Safe:** renaming the spreadsheet file, moving it between Drive folders, rewording header text in row 1, adding extra tabs, adding columns to the right of `Source page`.

**Not safe:** renaming the `Responses` tab without also updating `SHEET_NAME` in the script — the script will not error, it will create a fresh empty `Responses` tab and write there while your data sits in the renamed one. Equally unsafe: inserting, deleting, or reordering columns, since rows are written by position.

---

## Not yet built

- Acknowledgment email to the person who submitted
- Role/affiliation and track fields
- Conditional fields driven by topic selection
- Accessibility fixes: `aria-errormessage`, `role="alert"` on error text, focus management on the success panel
