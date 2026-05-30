# Katabasis website — deployment & recovery runbook

The site at **https://katabasis.pro** is the `katabasis-privacy` repo served by
**GitHub Pages** (deploy from the `main` branch), with the custom domain bound by
the `CNAME` file in the repo root.

## Health monitoring

- **GitHub Action** (`.github/workflows/site-health.yml`): on every push it verifies
  the `CNAME` file; every 30 min it curls the live site + key assets and fails the run
  (→ GitHub emails the repo owner) if anything is down.
  - Make sure Actions failure emails are on: GitHub → Settings → Notifications → Actions.
- **UptimeRobot** (external monitor): 5-minute checks on https://katabasis.pro with
  email/SMS alerts. Independent of GitHub, so it also catches a GitHub-wide outage.

## DNS records (registrar: Squarespace)

These must stay in place or the site / email breaks. If they are ever lost, restore
exactly these:

### Website (GitHub Pages)
| Type  | Host | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| CNAME | www  | sta-1.github.io |

Plus the `CNAME` file in this repo root must contain exactly: `katabasis.pro`

### Email deliverability (Brevo) — do not delete
| Type  | Host    | Value |
|-------|---------|-------|
| TXT   | @       | `v=spf1 include:spf.brevo.com mx ~all` |
| CNAME | brevo1._domainkey | b1.katabasis-pro.dkim.brevo.com |
| CNAME | brevo2._domainkey | b2.katabasis-pro.dkim.brevo.com |
| TXT   | _dmarc  | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |
| TXT   | @       | `brevo-code:...` (Brevo domain verification) |
| TXT   | @       | `google-site-verification=...` |

## Common failure → fix

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `katabasis.pro` 404 on every path, but `sta-1.github.io/katabasis-privacy` works | Custom-domain binding lost / `CNAME` file removed | Ensure repo root `CNAME` = `katabasis.pro`, push. 1–2 min to recover. |
| HTTPS warning / cert error | Let's Encrypt cert needs re-issue after a domain change | GitHub → Settings → Pages → re-save custom domain, wait for "Enforce HTTPS" to re-tick |
| Whole site gone, DNS not resolving | A records changed/removed, or **domain expired** | Restore A records above; confirm domain auto-renew is ON at Squarespace |
| Pages not updating after push | Pages build failed | Check repo → Actions / Pages build log |

## Domain expiry — the biggest silent risk
Confirm **auto-renew is ON** for katabasis.pro at the registrar. An expired domain
takes the site down with no warning and the name can be lost.
