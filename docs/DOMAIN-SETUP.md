# Pointing a Custom Domain at the Convenings Site

Replaces `vrcalip-pixel.github.io/larc-convenings` with your own address.

**What this changes:** only the URL. Your files stay in the same GitHub repository, you edit and push exactly as you do now, and nothing about the site's contents changes.

**Time:** about 20 minutes of work, then a wait of anywhere from 15 minutes to 24 hours for the internet to catch up.

**Cost:** the domain only, roughly $10–20 per year. GitHub charges nothing for this, including the security certificate.

---

## Before you start

Pick your domain name and check it is available. Have a credit card ready.

One rule that matters more than it looks: **do the GitHub step before the DNS step.** Doing it backwards leaves a window where someone else can claim your address and serve their own content on it. It is a real attack, not a theoretical one.

---

## Part 1 — Buy the domain

1. Go to a registrar. **Cloudflare Registrar** sells at cost with no markup and no renewal price jumps. Porkbun and Namecheap are also fine. Skip GoDaddy.
2. Search for your domain. If it is taken, try the next name on your list.
3. Buy it. Turn on **auto-renew** — a lapsed domain takes your site offline without warning.
4. Turn on **WHOIS privacy** if offered. It is usually free and keeps your home address out of public records.

You now own the name. It does not point anywhere yet.

---

## Part 2 — Tell GitHub about the domain

**Do this part before Part 3.**

1. Go to `github.com/vrcalip-pixel/larc-convenings`
2. Click **Settings** (top row of tabs, on the right)
3. In the left sidebar, click **Pages**
4. Find the **Custom domain** box
5. Type your domain exactly — for example `aifacultyconvenings.org` — with no `https://` and no slash
6. Click **Save**

GitHub will show a warning that the domain is not configured yet. That is expected. You are about to fix it.

Behind the scenes GitHub just added a file called `CNAME` to your repository. **Do not delete that file.** If it disappears, your custom domain stops working. If you ever edit the repo on your computer, pull before you push so you do not overwrite it.

---

## Part 3 — Tell the registrar where to point

Log in to wherever you bought the domain and find the **DNS** settings. You are adding five records total.

### The four A records

These point the bare domain at GitHub's servers. Add each one separately:

| Type | Name / Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

`@` means "the domain itself." Some registrars want a blank field instead, and some want the full domain typed out. All three mean the same thing.

Four records, not one. They are backups for each other.

### The one CNAME record

This makes the `www.` version work too:

| Type | Name / Host | Value |
|---|---|---|
| CNAME | `www` | `vrcalip-pixel.github.io` |

Type it exactly as shown, including the trailing `.io` and no slash after it.

Save your changes.

---

## Part 4 — Wait

DNS changes spread across the internet gradually. Usually 15–60 minutes. Occasionally up to 24 hours.

Nothing is broken during this window. Your old `github.io` address keeps working the whole time.

Go do something else. Checking every two minutes does not speed it up.

---

## Part 5 — Turn on HTTPS

Once your new domain loads the site in a browser:

1. Back to **Settings → Pages** in your repository
2. Find the **Enforce HTTPS** checkbox and tick it

If the box is greyed out, GitHub is still issuing your security certificate. That can take up to an hour after the domain starts working. Check back later.

If it is still greyed out after a few hours: delete the domain from the Custom domain box, save, re-enter it, save again. That restarts the certificate process and fixes most cases.

**Do not skip this step.** Without it, visitors can reach an unencrypted version of the site and browsers will flag it as "Not secure."

---

## Part 6 — Check your work

- [ ] `yourdomain.org` loads the site
- [ ] `www.yourdomain.org` loads it too
- [ ] The address bar shows a padlock, not a "Not secure" warning
- [ ] `vrcalip-pixel.github.io/larc-convenings` redirects to the new address
- [ ] The **Ask a question** button opens the contact form
- [ ] Submitting a test message still writes a row to the Google Sheet

That last one matters. The form posts to Google Apps Script, which accepts requests from anywhere, so it should be unaffected — but confirm rather than assume.

---

## What does not change

- How you edit the site. Same repo, same commits, same push.
- Your Apps Script endpoint. No update needed.
- Internal links. Every link in the site is relative, so they follow the new domain automatically.
- The AI Readiness Assessment link. It points at a different repository and correctly stays as it is.

---

## If something goes wrong

| What you see | What to do |
|---|---|
| "Domain does not resolve to the GitHub Pages server" | DNS has not spread yet. Wait longer. If it persists past 24 hours, recheck the A records for typos |
| Site loads but shows "Not secure" | Certificate still being issued, or **Enforce HTTPS** is unticked |
| `www` works but the bare domain does not | An A record is missing or mistyped. There should be exactly four |
| Bare domain works but `www` does not | The CNAME record is missing or has a typo |
| Site was working, now shows a 404 | The `CNAME` file was deleted from the repo. Re-enter the domain in Settings → Pages |
| **Enforce HTTPS** stays greyed out | Remove the domain, save, re-add it, save |

---

## Handing it off later

If LARC or LBCC eventually takes ownership, this is a registrar-to-registrar transfer — a standard process, usually free, and the site never goes down. That is the advantage of putting the identity in a domain rather than in the hosting account: it moves independently of everything else.
