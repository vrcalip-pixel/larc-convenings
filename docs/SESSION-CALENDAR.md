# Session Calendar — 2026–27

Cadence: **first Fridays, 1:00 – 2:30 PM Pacific**. Three dates depart from that pattern; all three are explained below.

Use this table as the source of truth when editing the `date` values in the `SESSIONS` array in `index.html`. The offset column is not optional — it is what keeps the countdown accurate.

| # | Session | Date | ISO value for `date` | Offset |
|---|---|---|---|---|
| 1 | Foundations: Same Map, Different Starting Points | Fri Aug 28, 2026 | `2026-08-28T13:00:00-07:00` | PDT |
| 2 | Explore: The Tool Landscape by Sector | Fri Sep 11, 2026 | `2026-09-11T13:00:00-07:00` | PDT |
| 3 | Design: From Idea to Integration Plan | Fri Oct 2, 2026 | `2026-10-02T13:00:00-07:00` | PDT |
| 4 | Build: Guardrails, Ethics & the D4 Lens | Fri Nov 6, 2026 | `2026-11-06T13:00:00-08:00` | PST |
| 5 | Midpoint Showcase: Evidence of Momentum | Fri Dec 4, 2026 | `2026-12-04T13:00:00-08:00` | PST |
| 6 | Open Studio (Winter Intersession) — *optional* | Fri Jan 8, 2027 | `2027-01-08T13:00:00-08:00` | PST |
| 7 | Deploy: AI in the Live Classroom | Fri Feb 5, 2027 | `2027-02-05T13:00:00-08:00` | PST |
| 8 | Evaluate: What's Working, and What Counts as Evidence | Fri Mar 5, 2027 | `2027-03-05T13:00:00-08:00` | PST |
| 9 | Scale: Architecting What Comes Next | Fri Apr 2, 2027 | `2027-04-02T13:00:00-07:00` | PDT |
| 10 | Culminate: Credentials, Capstones & the Road Ahead | Fri May 7, 2027 | `2027-05-07T13:00:00-07:00` | PDT |

All ten dates were verified against 2026 and 2027 calendars. Every one falls on a Friday.

---

## Departures from the first-Friday pattern

**Session 1 — Friday, August 28 rather than August 7.**
The first Friday of August falls well before fall semesters begin across the region. Launching on the last Friday of the month puts the first convening after faculty are back on contract at every partner college.

**Session 2 — Friday, September 11 rather than September 4.**
September 4 sits only one week after the launch session. Moving to the second Friday gives participants room to get their bearings, choose a track, and complete the readiness assessment before the second convening.

**Session 6 — Friday, January 8 rather than January 1.**
The first Friday of January 2027 is New Year's Day. Campuses are closed and faculty are on winter break. The second Friday is the first workable date.

From Session 3 onward, every other session sits on the first Friday of its month.

---

## Dates still to verify

- [ ] **Fri Apr 2, 2027 (Session 9)** — spring break varies across the eighteen partner colleges. Confirm this does not land inside a break week at a college with significant participation.
- [ ] **Fri Jan 8, 2027 (Session 6)** — winter intersession start dates vary. This session is optional, so a conflict is tolerable, but worth knowing.

Once verified, check the boxes and note the date of verification.

---

## Daylight saving reference for this cycle

| Change | Date | Effect on the `date` offset |
|---|---|---|
| PDT ends | Sun Nov 1, 2026 | Sessions from Nov 2026 use `-08:00` |
| PDT begins | Sun Mar 14, 2027 | Sessions from Mar 14, 2027 use `-07:00` |

Sessions 1 through 3 are `-07:00`. Sessions 4 through 8 are `-08:00`. Sessions 9 and 10 are `-07:00`.

The one that catches people out is **Session 8 on March 5, 2027** — it is still PST, because daylight saving does not begin until March 14 that year.

---

## If a date has to move

1. Update the row in this table, including the offset if the month changed.
2. Update the matching `date` value in the `SESSIONS` array in `index.html`.
3. If the change is close to the session, post an announcement — remove `hidden` from the `.announcement` div in `index.html`.
4. Coordinate with Ruth Amanuel so the Canvas course and the calendar invitation match.
