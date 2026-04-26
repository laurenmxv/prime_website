# Prime Outdoor Experts — Launch Runbook

Everything you (Lauren) need to do, in order. Most steps take <5 min each.

---

## 0 · URGENT: Rotate the leaked Google API key

You shared the key in chat — assume it's compromised.

1. Open https://console.cloud.google.com/apis/credentials
2. Find key `AIzaSyBHy6lBx0-lKpVRRvgHIKj-hIR2YnW0s5Q` → **Regenerate** (or Delete + create new)
3. On the new key, click **Edit** and set:
   - **Application restrictions:** HTTP referrers
     - `https://primeoutdoorexperts.com/*`
     - `https://www.primeoutdoorexperts.com/*`
     - `https://*.vercel.app/*`
   - **API restrictions:** Restrict key → enable **Places API (New)** only
4. Save the new key in your password manager. **Do not paste it in chat again.** When you get to step 5 below, you'll paste it directly into Vercel's dashboard.

---

## 1 · Confirm or create the Google Business Profile

Question: **does Manuel have a Google Business Profile (GBP) for "Prime Outdoor Experts"?**

The topbar shows "5.0 · 28 Google Reviews" — those reviews exist somewhere. The Place ID you gave me (`ChIJlY-Igl4N54gRwKBx4CPgMOA`) appears to be an address-point, not a business listing.

- **Search Google Maps for "Prime Outdoor Experts Lake Mary"** — does a business listing show up with reviews? If yes, click it → URL contains the real Place ID, copy it.
- **If no listing exists** but Manuel does have reviews somewhere (Yelp? Nextdoor? his personal Google profile?), the live Reviews API path is dead. We'll keep the 3 hardcoded testimonials I just added to `/reviews/` as the source of truth and ditch the Elfsight widget.
- **If Manuel doesn't have a GBP yet, he should create one.** It's free and the single biggest local-SEO lever. Start at https://business.google.com → "Manage now" → service-area business (no public street address) → Lake Mary metro.

Tell me which of those three applies and I'll wire (or unwire) the Reviews API integration accordingly.

---

## 2 · Get a Resend account for the contact form

We're moving the contact form from Formspree to a Vercel Function + Resend (cheaper, more control, custom-domain sender).

1. Sign up at https://resend.com — free tier is 3,000 emails/month + 100/day
2. Domains → **Add Domain** → enter `primeoutdoorexperts.com`
3. Resend will give you 3–4 DNS records (SPF/DKIM/DMARC) to add at GoDaddy. **Add those at GoDaddy alongside the Vercel records below — see step 4.**
4. After Resend says the domain is verified (~10 min), create an API key: **API Keys → Create API Key** (name it "Vercel Production"). Copy it. You'll paste it into Vercel in step 5.

---

## 3 · Sign up for Vercel + create the project

1. Sign up at https://vercel.com using GitHub (easiest) — Pro tier is $20/mo and recommended for a paying business site (the free Hobby tier has a non-commercial-use clause)
2. **Don't import the project yet.** I'll set up the GitHub repo first so the import is clean. Once you've signed up, just tell me your GitHub username so I can create the repo properly.

---

## 4 · GoDaddy — DNS records to add

Log into GoDaddy → **My Products** → **DNS** for `primeoutdoorexperts.com` → Manage.

### What to delete first
- Any existing **A record** at `@` (the apex) pointing to a GoDaddy hosting/parking IP
- Any existing **AAAA record** at `@`
- **Forwarding rule** at the apex (Domain Settings → Forwarding) — disable any forwarding. If a forwarding rule is active, it silently overrides A records and your site won't resolve to Vercel.
- Any existing **CNAME** at `www` pointing to GoDaddy

### What to add (Vercel hosting)
| Type | Name | Value | TTL |
|---|---|---|---|
| **A** | `@` | `76.76.21.21` | 600 |
| **CNAME** | `www` | `cname.vercel-dns.com.` | 600 |

> The 600-second TTL is intentional — it lets us flip back fast if anything goes sideways. After 24 hours of stability, bump to 3600.

### What to add (Resend email — for the contact form)
Resend will give you 3 records when you add the domain. Approximately:

| Type | Name | Value | TTL |
|---|---|---|---|
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | 600 |
| **TXT** | `resend._domainkey` | (long DKIM string Resend provides) | 600 |
| **MX** | `send` | `feedback-smtp.us-east-1.amazonses.com` priority 10 | 600 |

**Use the exact values Resend's dashboard shows you** — they're tied to your account. The above is illustrative.

### Optional: Email forwarding for `info@primeoutdoorexperts.com`
If `info@primeoutdoorexperts.com` doesn't already deliver mail somewhere, set up forwarding to Manuel's personal inbox. GoDaddy → Email & Office → free forwarding ($0 with most domain plans). Or use Cloudflare Email Routing (free, requires moving DNS to Cloudflare).

### After saving — verify
Open Terminal:
```bash
dig primeoutdoorexperts.com +short
# expect: 76.76.21.21

dig www.primeoutdoorexperts.com +short
# expect: cname.vercel-dns.com chain → 76.76.21.21

dig TXT primeoutdoorexperts.com +short
# expect: Resend SPF + DKIM records
```

DNS propagates in 5–15 minutes with TTL 600. Use https://www.whatsmydns.net to watch global propagation.

---

## 5 · Set up Vercel environment variables

Once the project is imported (I'll do that in step 6), go to **Project Settings → Environment Variables** and add:

| Name | Value | Environments |
|---|---|---|
| `RESEND_API_KEY` | (from step 2) | Production, Preview |
| `QUOTE_TO_EMAIL` | `info@primeoutdoorexperts.com` | Production, Preview |
| `QUOTE_FROM_EMAIL` | `quotes@primeoutdoorexperts.com` | Production, Preview |
| `GOOGLE_PLACES_API_KEY` | (rotated key from step 0) | Production, Preview |
| `GOOGLE_PLACES_PLACE_ID` | (real Place ID from step 1, or skip if no GBP) | Production, Preview |

**Never commit these to git.** They live only in Vercel.

---

## 6 · Cutover (when we're ready)

I'll handle the technical side. **You** confirm:
- ✅ Steps 0, 2, 3, 4 above are done
- ✅ A reasonable cutover window — recommend **Tue or Wed morning, ~10am ET**. Avoid Friday.

Cutover sequence:
1. T-48h: lower GoDaddy TTL on existing records to 600s (do this now if you can)
2. T-1h: I push final commit, Vercel deploys to preview, smoke test on preview URL
3. T-0: You change A and CNAME at GoDaddy to the values in step 4
4. T+5–15min: Site resolves to Vercel. Vercel auto-issues Let's Encrypt SSL within ~60s
5. T+30min: I run the verification curl/dig commands and Lighthouse pass
6. T+24h: Bump TTL back to 3600s

**Rollback option**: if anything breaks, we revert to a previous Vercel deployment (one click, ~5 seconds), or switch DNS back to old GoDaddy IP. Document the OLD GoDaddy hosting IP **before** cutover so we have it.

---

## 7 · After launch — the next 7 days

1. Submit sitemap to Google Search Console: https://search.google.com/search-console → Add property `https://primeoutdoorexperts.com` → verify via DNS TXT (Vercel dashboard generates the TXT for you) → Sitemaps → submit `https://primeoutdoorexperts.com/sitemap.xml`
2. Submit to Bing Webmaster Tools (carries Bing + DuckDuckGo + ChatGPT search): https://www.bing.com/webmasters
3. Enable Vercel Web Analytics + Speed Insights (Project → Analytics → Enable)
4. Set up an uptime monitor — free at https://betterstack.com/uptime, every 5 min on the homepage
5. Test the contact form end-to-end → confirm email arrives + auto-reply works
6. Check Web Vitals after 7 days — target LCP < 2.5s, INP < 200ms, CLS < 0.1

---

## 8 · What I still need from you

- [ ] **Confirm key rotation done** (step 0)
- [ ] **GBP answer** (step 1) — does Manuel have one?
- [ ] **Resend signup + domain verified** (step 2)
- [ ] **GitHub username** so I can create the repo
- [ ] **Vercel account ready** (step 3)
- [ ] **Cutover window approved** (step 6)

Reply with these and I'll execute the deploy.

---

## Appendix: What I'm shipping (so you know what to test)

- Full design system rebuild — cream/deep-green/chartreuse Botanical Premium aesthetic across all 44 pages
- Logo restoration (PRIME wordmark visible site-wide)
- Hero badge / button arrows / dark-section button visibility — all fixed
- Reviews page now has 3 hardcoded testimonials + Review schema (crawlable) + Elfsight widget for "live latest"
- Commercial-landscaping featured project genericized (no "nationally-recognized gastropub" tell)
- Photo pipeline: 31 raw iPhone photos → optimized AVIF + WebP + JPEG at 1× and 2× (~186 output files)
- Form backend: `/api/quote` Vercel Function with Resend, owner-notification + user-confirmation emails, honeypot anti-spam
- `vercel.json` with cleanUrls, trailingSlash, cache headers, security headers (HSTS, X-Frame-Options, CSP-related)
- Internal docs (`schema-audit-report.html`, `prime-outdoor-experts-website-rebuild-plan.html`) noindex'd + redirected to `/` on Vercel
- 404 page wired to Vercel's automatic 404 handler

Still pending (Phase D-3 + after deploy):
- Place real photos across hero, homepage gallery, services, about, location pages, gallery page
- Beef up `/commercial-landscaping/hoa-communities/` from 243 → 1,200 words
- Beef up `/residential/` from 260 → 700 words
- Add FAQ schema to all 8 service pages + 7 commercial verticals + 13 location pages
- Add `GeoCoordinates` to all 13 location LocalBusiness schemas
- Fix Group B location schema (7 location pages skeletal)
- Fix blog `logo.png` reference (file doesn't exist)
- Footer standardization (5 pages have full footer, 5 have lite — make it consistent)
- Locations → commercial-vertical cross-links (currently zero hrefs)
- Privacy/Terms expansion for CCPA/cookies/processors
- llms.txt at root
- /why-prime/ comparison page
