# Editing Guide

Everything you need to keep the convenings hub current for a full year. No build tools, no npm, no framework — open a file, change some text, commit.

---

## The one block you will edit most

Near the bottom of `index.html`, inside `<script>`, there is a block marked:

```
/* =====================================================================
   SESSION CONFIG — EDIT THIS BLOCK ONLY
   ...
   ===================================================================== */
const SESSIONS = [ ... ];
/* ===================== END EDITABLE CONFIG ========================== */
```

That array drives the entire session ledger, the countdown, the "Next Up" badge, the completed count, and the progress bar. Nothing else on the page needs touching when a session moves, finishes, or gets renamed.

### What each field does

| Field | What it controls |
|---|---|
| `n` | Session number shown in the ledger |
| `title` | Session title |
| `focus` | The italic guiding question under the title |
| `date` | ISO date and time **with the Pacific offset** — this drives everything |
| `durationMin` | Length in minutes; used to decide when a session is "happening now" |
| `optional` | `true` adds an "Optional" tag (used for the Open Studio) |
| `poc` | Proof of Concept description |
| `voices` | Campus Voices description |
| `breakout` | Breakout Rooms description |
| `spotlight` | Spotlight description |
| `note` | Use *instead of* the four fields above for a session with a different format |
| `recording` | URL to the recording, or `null` |
| `brief` | URL to the Regional Signal brief, or `null` |
| `pageUrl` | Path to the session page, or `null` |

### The offset matters

Pacific Time changes twice a year, and the date string must carry the correct offset or the countdown will be an hour off:

- **`-07:00`** — Pacific Daylight Time, roughly March through early November
- **`-08:00`** — Pacific Standard Time, roughly November through early March

So a 10:00 AM session in October is `"2026-10-09T10:00:00-07:00"`, and a 10:00 AM session in December is `"2026-12-11T10:00:00-08:00"`. Check `docs/SESSION-CALENDAR.md` — every date is already set correctly there.

---

## Task: a session date changes

Find the session in `SESSIONS`, change its `date` value, save, commit. That is the whole job. Double-check the offset against the table above.

---

## Task: a session just happened

Three steps.

**1. Build the session page.**

```bash
cp sessions/_TEMPLATE.html sessions/session-01.html
```

Open it and work through every comment marked `EDIT:`. The template has slots for the recording embed, the four segment summaries, a brief summary, and featured faculty artifacts.

To embed a recording, replace the placeholder div inside `.video-frame`:

```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID"
        title="Session 01 recording"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowfullscreen></iframe>
```

For Zoom cloud recordings, link out with a button rather than embedding — Zoom's share pages do not embed reliably.

**2. Wire it into the hub.** In the `SESSIONS` array, set the fields for that session:

```js
recording: "https://youtu.be/VIDEO_ID",
brief: "briefs/2026-09-signal.html",
pageUrl: "sessions/session-01.html"
```

Any field left as `null` simply does not produce a button. The row will show the italic note explaining that the archive is being prepared.

**3. Commit.** The session automatically flips to "Completed," the progress bar fills one more segment, and the next session becomes "Next Up." All of that is computed from the current date.

---

## Task: publishing a Regional Signal brief

Open `briefs/index.html`. Delete the `<div class="empty">` block, uncomment the `<ul class="brief-list">` pattern below it, and fill in the entry. Add each new brief at the **top** of the list so the newest is first.

If the brief is a PDF rather than a page, put the PDF in `briefs/` and point the link at it directly.

Then set `brief:` for the matching session in `index.html`.

---

## Task: posting an urgent announcement

At the top of `<body>` in `index.html`:

```html
<div class="announcement" hidden>
  <strong>Update</strong> Edit this message...
</div>
```

Delete the word `hidden`, replace the message text, commit. It appears as a gold bar across the top of the page. Put `hidden` back when it is no longer relevant — do not leave stale announcements up.

---

## Task: adding or removing a college

The colleges list lives in the `.colleges-list` div inside the stats strip. It is a plain list of `<div>` elements in alphabetical order. If the count changes, update the `18` in the stats strip too.

---

## Task: changing a contact

The three contact cards are in the `#contact` section. Each is a `.contact-card` with a role, a name, a description of what to email that person about, and a `mailto:` link. The same three names appear in `README.md` — update both.

---

## Things to be careful about

**Apostrophes and quotes in the SESSIONS array.** Session text is inside JavaScript strings. A straight apostrophe in `what's` will break the page if the string is wrapped in single quotes. The existing entries use Unicode escapes for curly punctuation — `\u2019` for a curly apostrophe, `\u2014` for an em dash, `\u2013` for an en dash. Keep doing that and nothing will break.

**The ampersand in `Guardrails, Ethics & the D4 Lens`.** Inside a JavaScript string an ampersand is fine as-is. In HTML body text elsewhere on the page, write `&amp;`.

**Do not rename the CSS variables.** The four track colors (`--t1` through `--t4`) are referenced in several places, including the gradient rule above the countdown and the progress bar colors in the script.

**Check the page after editing.** Open `index.html` in a browser. If the session list is empty or the countdown shows `Loading…` forever, there is a JavaScript syntax error in the `SESSIONS` array — usually an unescaped quote or a missing comma. Open the browser console (F12) and the error message will name the line.

---

## Accessibility floor

Keep these when you edit:

- Every image keeps a meaningful `alt` attribute
- Session rows keep `role="button"`, `tabindex="0"`, and the `aria-expanded` toggle
- Text keeps AA contrast — the palette in `README.md` already meets it; new colors should be checked
- The skip link stays as the first element in `<body>`
- Any new animation respects `prefers-reduced-motion`

---

## Publishing changes

If you are editing directly on github.com: open the file, click the pencil icon, make the change, scroll down, write a short commit message, and click **Commit changes**. The live site updates in about a minute.

If you are working locally:

```bash
git add .
git commit -m "Add Session 1 archive and recording"
git push
```

Good commit messages make the year legible later. `"Add Session 3 page"` is better than `"update"`.
