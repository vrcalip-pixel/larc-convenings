# Session Calendar — 2026–27

Cadence: **second Fridays, 10:00 – 11:30 AM Pacific**, set by the participant survey. Two dates depart from that pattern; both are flagged below.

Use this table as the source of truth when editing the `date` values in the `SESSIONS` array in `index.html`. The offset column is not optional — it is what keeps the countdown accurate.

| # | Session | Date | ISO value for `date` | Offset |
|---|---|---|---|---|
| 1 | Foundations: Same Map, Different Starting Points | Fri Aug 28, 2026 | `2026-08-28T10:00:00-07:00` | PDT |
| 2 | Explore: The Tool Landscape by Sector | Fri Sep 11, 2026 | `2026-09-11T10:00:00-07:00` | PDT |
| 3 | Design: From Idea to Integration Plan | Fri Oct 9, 2026 | `2026-10-09T10:00:00-07:00` | PDT |
| 4 | Build: Guardrails, Ethics & the D4 Lens | Fri Nov 13, 2026 | `2026-11-13T10:00:00-08:00` | PST |
| 5 | Midpoint Showcase: Evidence of Momentum | Fri Dec 11, 2026 | `2026-12-11T10:00:00-08:00` | PST |
| 6 | Open Studio (Winter Intersession) — *optional* | Fri Jan 8, 2027 | `2027-01-08T10:00:00-08:00` | PST |
| 7 | Deploy: AI in the Live Classroom | Fri Feb 19, 2027 | `2027-02-19T10:00:00-08:00` | PST |
| 8 | Evaluate: What's Working, and What Counts as Evidence | Fri Mar 12, 2027 | `2027-03-12T10:00:00-08:00` | PST |
| 9 | Scale: Architecting What Comes Next | Fri Apr 9, 2027 | `2027-04-09T10:00:00-07:00` | PDT |
| 10 | Culminate: Credentials, Capstones & the Road Ahead | Fri May 14, 2027 | `2027-05-14T10:00:00-07:00` | PDT |

---

## Departures from the second-Friday pattern

**Session 1 — Friday, August 28 rather than August 14.**
The second Friday of August falls before most fall semesters begin across the region. Launching on the fourth Friday puts the first convening after faculty are back on contract at every partner college.

**Session 7 — Friday, February 19 rather than February 12.**
February 12 is the Lincoln Day holiday. Moving to the third Friday avoids a closed-campus date.

---

## Dates still to verify

Two items should be checked against the academic calendars of the partner colleges before the schedule is announced publicly. Neither is likely to be a problem, but neither has been confirmed.

- [ ] **Fri Apr 9, 2027 (Session 9)** — spring break varies across the eighteen partner colleges. Confirm this does not land inside a break week at a college with significant participation.
- [ ] **Fri Mar 12, 2027 (Session 8)** — daylight saving time begins Sunday, March 14, 2027, two days after this session. The March 12 session is therefore still PST (`-08:00`). Listed correctly above; noting it here because it is an easy one to get wrong.

Once verified, check the boxes and note the date of verification.

---

## Daylight saving reference for this cycle

| Change | Date | Effect on the `date` offset |
|---|---|---|
| PDT ends | Sun Nov 1, 2026 | Sessions from Nov 2026 use `-08:00` |
| PDT begins | Sun Mar 14, 2027 | Sessions from Mar 14, 2027 use `-07:00` |

Every session before November 1, 2026 is `-07:00`. Sessions from November 1, 2026 through March 13, 2027 are `-08:00`. Sessions from March 14, 2027 onward are `-07:00`.

---

## If a date has to move

1. Update the row in this table, including the offset if the month changed.
2. Update the matching `date` value in the `SESSIONS` array in `index.html`.
3. If the change is close to the session, post an announcement — remove `hidden` from the `.announcement` div in `index.html`.
4. Coordinate with Ruth Amanuel so the Canvas course and the calendar invitation match.
