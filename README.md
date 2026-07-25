# Monthly Regional Convenings

The public hub for the monthly regional convenings of the **LA-25 LARC and LBCC AI Literacy & Innovation Project** — a Strong Workforce Program (Round 10) regional initiative led by Long Beach City College across community colleges in Los Angeles County.

The site is a static, no-build website hosted on GitHub Pages. It holds the ten-session schedule, a live countdown to the next convening, and a growing archive of recordings, monthly briefs, and faculty-created work.

**Live site:** `https://vrcalip-pixel.github.io/larc-convenings/` *(update after Pages is enabled)*

---

## What is in here

```
larc-convenings/
├── index.html                  Main hub — schedule, countdown, tracks, resources
├── 404.html                    Custom not-found page
├── .nojekyll                   Tells GitHub Pages to serve files as-is
├── robots.txt
├── assets/                     Logos and shared images
│   ├── larc-logo.png
│   ├── lbcc-logo.png
│   ├── ailit-logo.png
│   └── cccc-workforce-emblem.png
├── sessions/                   One page per convening, added as the year goes
│   └── _TEMPLATE.html          Copy this to start a new session page
├── briefs/                     The Regional Signal archive
│   └── index.html
├── docs/                       Maintenance guides (not published as pages)
│   ├── EDITING-GUIDE.md        How to update the site month to month
│   └── SESSION-CALENDAR.md     All ten dates, with the exceptions flagged
└── tools/
    ├── contact-form-backend.gs Archive copy of the Apps Script backend (not live)
    └── extract-assets.py       Pulls the logos out of the original draft file
```

There is no build step, no framework, and no dependencies. Every page is a single HTML file with its styles inline in a `<style>` block. Edit, commit, done.

---

## Before the site goes public

Two things in `index.html` need attention:

1. **Remove the draft banner.** Delete the `<div class="draft-banner">` near the top of `<body>`. It reads *"Draft — for internal review · not for distribution."*
2. **Confirm the contact form is wired up.** The "Questions & Inquiries" card and the "Ask a question" button both point to `contact.html`. That page posts to a Google Apps Script endpoint — see `docs/CONTACT-FORM-SETUP.md`. Load the `/exec` URL in a browser and check the `version` field before launch.

Also confirm the four logo files exist in `assets/`. If any are missing, see the next section.

---

## Restoring the logos

`assets/larc-logo.png` and `assets/lbcc-logo.png` ship with this repository. The AI Literacy project logo and the CCC Workforce emblem were embedded as base64 in the original draft. To pull all four out of that file:

```bash
python3 tools/extract-assets.py path/to/original-draft.html
```

The script matches images by their `alt` text and writes them into `assets/` with the filenames the pages expect. Run it once from the repository root.

---

## Month-to-month maintenance

The full walkthrough is in **[docs/EDITING-GUIDE.md](docs/EDITING-GUIDE.md)**. The short version:

| When | What to do |
|---|---|
| A date changes | Edit the `SESSIONS` array in `index.html` |
| A session finishes | Copy `sessions/_TEMPLATE.html`, fill it in, then set `pageUrl` and `recording` in the `SESSIONS` array |
| A brief is published | Add it to `briefs/index.html` and set `brief` in the `SESSIONS` array |
| Something urgent | Remove `hidden` from the `.announcement` div in `index.html` and edit the message |

The countdown, the "Next Up" badge, the completed count, and the progress bar all read from the `SESSIONS` array and update themselves. You never edit them by hand.

---

## Working on the site locally

Open `index.html` in a browser and it works. If you want relative links and the 404 page to behave exactly as they do on the live site, run a small local server from the repository root:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

---

## Design system

Fonts are Fraunces (display) and Manrope (body), loaded from Google Fonts. Program colors:

| Role | Hex |
|---|---|
| Program navy | `#003366` |
| Program gold | `#FFB81C` |
| Accent crimson | `#C8102E` |
| Track 1 — Research & Professional Development | `#003366` |
| Track 2 — Curriculum Development | `#0F6E56` |
| Track 3 — Instructional Practice Integration | `#854F0B` |
| Track 4 — Train the Trainer | `#7A2855` |

These match the program's Canvas conventions. Track colors are used as accents only, and Track 4 is plum throughout.

Pages are built to WCAG 2.1 AA: visible keyboard focus, a skip link, `aria-expanded` on the session rows, and `prefers-reduced-motion` respected on the countdown pulse.

---

## Contact form

`contact.html` posts to a container-bound Google Apps Script that writes each
submission to a Google Sheet and emails the team member who handles that topic.

The live code is **not in this repository**. It lives in the Apps Script editor
attached to the response Sheet. `tools/contact-form-backend.gs` is an archive
copy kept in sync by hand — editing it changes nothing on its own.

Full setup, routing table, diagnostics, and troubleshooting:
[`docs/CONTACT-FORM-SETUP.md`](docs/CONTACT-FORM-SETUP.md)

---

## Contacts

| Role | Name | Email |
|---|---|---|
| Project Lead | Koby Moridzadeh | kmoridzadeh@lbcc.edu |
| Faculty Lead | Vincent Calip | vcalip@lbcc.edu |
| Program Manager | Ruth Amanuel | ramanuel@lbcc.edu |

---

## Attribution

© Long Beach City College. Developed for the LA-25 LARC and LBCC AI Literacy & Innovation Project, funded by the California Community Colleges Strong Workforce Program, Round 10, in partnership with the Los Angeles Regional Consortium.

Program content is consortium-owned. Institutional logos and marks belong to their respective owners and are used with permission for program purposes.
