# Prime Outdoor Experts — Full SEO Audit Report

**Site:** https://www.primeoutdoorexperts.com
**Source:** /Users/laurendutton/dev/prime/
**Date:** 2026-04-28
**Pages audited:** 49 (45 production + 4 dev/utility)
**Audit method:** 7 specialized subagents (Technical, Content, Schema, Sitemap, Performance, GEO/AI, Visual) ran in parallel against codebase + live deployment

---

## Executive Summary

### SEO Health Score: **69 / 100** (C+, "needs significant work but foundation is sound")

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 25% | 72 | 18.0 |
| Content Quality | 25% | 74 | 18.5 |
| On-Page SEO | 20% | 70 | 14.0 |
| Schema / Structured Data | 10% | 62 | 6.2 |
| Performance (CWV) | 10% | 60 | 6.0 |
| Images | 5% | 65 | 3.3 |
| AI Search Readiness | 5% | 62 | 3.1 |
| **Total** | **100%** | — | **69.0** |

**Business type detected:** Local service business (landscaping) — Orange & Seminole County FL.

### Top 5 Critical Issues (fix immediately)

1. **🔴 Every canonical URL points to a 307-redirected host.** All 45 pages declare `https://primeoutdoorexperts.com/...` but the site is served at `https://www.primeoutdoorexperts.com`. Apex 307-redirects to www, so every canonical signal is laundered through a temporary redirect. Fix: global host swap to `www.` + change Vercel apex redirect from 307 to 301.
2. **🔴 Editorial hero photos render at ~560px tall instead of 300/170/215px** because legacy `.hero-photo { min-height: 560px }` rules at lines 302 and 2046 of `florida-heat.css` cascade into the new editorial hero. The collage layout is currently broken on the local rebuild — and the rebuild is **not yet deployed** so the live site still shows the old hero.
3. **🔴 FAQPage JSON-LD is incorrectly nested inside BreadcrumbList.itemListElement on 15 service + commercial pages.** This breaks both schemas: BreadcrumbList becomes invalid, FAQPage becomes undiscoverable. Zero rich-result eligibility on every service page.
4. **🔴 All 13 location pages have `addressLocality: "Sanford"`** even on Winter Park, Lake Mary, Kissimmee, etc. NAP-consistency violation. Worse: Lake Mary page has 8 leftover "Sanford" references in title/meta/OG tags from the templating bug.
5. **🔴 3 Open Graph images are 404** (`og-home.jpg`, `og-default.jpg`, `og-commercial.jpg`). No social previews, no AI assistant thumbnails, no LinkedIn/Slack rich cards.

### Top 5 Quick Wins (high impact, <30 min each)

1. **Fix Lake Mary "Sanford" copy bug** (5 min, unblocks top-3 commercial city)
2. **Add `<link rel="preload">` for hero LCP image** (2 min, ~300ms LCP win)
3. **Set `loading="lazy"` on hero photos 2 & 3** (1 min, saves 1.4 MB of unused payload on mobile)
4. **Update sitemap.xml host + lastmods** (5 min, restores crawl signal)
5. **Add `OAI-SearchBot` and `Claude-Web` to robots.txt** (2 min, completes AI crawler allowlist)

---

## 1. Technical SEO (Score: 72/100)

### Critical
- **C1 · Canonical host mismatch on all 45 pages** — every `<link rel="canonical">`, `og:url`, `twitter:url`, and JSON-LD `@id`/`url` points to apex `primeoutdoorexperts.com`, but production is `www.primeoutdoorexperts.com`. Apex 307-redirects → all canonical signals routed through a temporary redirect.
- **C2 · 3 missing OG images** — `assets/og-home.jpg`, `assets/og-default.jpg`, `assets/og-commercial.jpg` referenced by 30+ pages, all 404.
- **C3 · 404.html relative asset paths** — `href="css/styles.css"` etc. break when the page is served at any non-root path. Confirmed: `/services/lawn-care/css/styles.css` returns 404 — nested 404s render unstyled.
- **C4 · Apex→www uses 307 instead of 301** — search engines treat 307 as "do not consolidate signals." Vercel dashboard fix.

### High
- **H1 · Homepage uses relative paths for CSS/JS/SVG sprite** — works at root but brittle. Subpages use `../../css/...` (also brittle but functional given fixed depth). Recommend absolute (`/css/...`) sitewide.
- **H2 · Sitemap lastmod stale** — 10 modified files post-2026-03-25 still show old lastmod. Real `git log` mtimes needed.
- **H3 · robots.txt sitemap line uses apex host** — should be `www.`.

### Medium
- **M1 · No Content-Security-Policy** in `vercel.json` headers (HSTS, X-Frame-Options, X-Content-Type-Options are present)
- **M2 · Inconsistent font loading** — local source loads Newsreader+Fraunces+Inter Tight+DM Mono; deployed `services/lawn-care` returns DM Serif Display+Inter (deployment out of sync OR different bundle path)
- **M3 · Dev-artifact files reachable** — `schema-audit-report.html`, `prime-outdoor-experts-website-rebuild-plan.html` are noindex+302 redirected, but blog/index.html line 31 has a public link to one. Confusing crawl signal.

### Low
- L1 · No IndexNow setup (Bing/Yandex/Naver instant updates)
- L2 · Empty `alt=""` on 3 hero images — fine if decorative, but hero photos could carry alt text for image search
- L3 · Legacy `<meta name="keywords">` on homepage (line 10) — ignored by all engines, harmless but dated

---

## 2. Content Quality / E-E-A-T (Score: 74/100)

| Factor | Weight | Score | Note |
|---|---|---|---|
| Experience | 20% | 12/20 | 28 reviews + gallery good; **zero images on service pages**, no neighborhood-specific photos |
| Expertise | 25% | 18/25 | Detailed cultivars (Floratam, Palmetto, Empire); **no author bylines, no credential callouts** |
| Authoritativeness | 25% | 17/25 | Google + IG + FB sameAs; **no third-party citations, no FNGLA/NALP badges** |
| Trustworthiness | 30% | 27/30 | Phone/address/license claim consistent; **license number itself never visible** |

### Critical
- **C1 · 13 location-page schema bugs** — `addressLocality: "Sanford"` hardcoded across all city pages
- **C2 · 13 location pages have ZERO FAQPage schema** — highest-intent geo content forfeits Google AIO eligibility

### High
- **H1 · Service pages have NO images** (8 pages × 0 images each). Strong cultivar copy but zero visual proof.
- **H2 · Location pages are heavily templated** — only city name + 1–2 landmarks differentiate. 60%+ unique content needed per Google's local SEO guidelines.
- **H3 · 4 thin hub pages**:
  - `/locations/index.html` — 224 words (target 500+)
  - `/blog/index.html` — 268 words
  - `/gallery/index.html` — 269 words of prose
  - `/services/index.html` — 289 words
- **H4 · Blog posts lack author byline + dateModified** — Helpful Content System penalty risk

### Medium
- M1 · No "Key Facts" 50-word block on any page (AIO citation surface)
- M2 · Service pages don't display pricing range or starting price
- M3 · Readability mid-tier — service pages run Flesch-Kincaid grade 11–12, target 8–9

### Thin Content List (under 300 words of prose)
| File | Words | Target |
|---|---|---|
| `/locations/index.html` | 224 | 500+ |
| `/blog/index.html` | 268 | 500+ |
| `/gallery/index.html` | 269 | Acceptable (image-heavy) |
| `/services/index.html` | 289 | 500+ |

**Good news:** All 8 service pages exceed 1,300 words; all 13 location pages exceed 880 words; all 3 blog posts exceed 1,800. Thin content concentrated in 4 hub pages only.

---

## 3. Schema / Structured Data (Score: 62/100)

### Critical
- **C1 · FAQPage incorrectly nested inside BreadcrumbList.itemListElement on 15 pages** (8 service + 7 commercial-landscaping subpages, all line 22 minified blocks). Both schemas invalid. **Highest-leverage fix in entire audit.**
- **C2 · Homepage geo coordinates wrong** — `28.7589, -81.3178` (downtown Orlando) but `addressLocality: Sanford`. Fix to `28.8005, -81.2729`.

### High
- **H1 · `@id: "#business"` collision** — every location page redefines `LocalBusiness` with the same `@id` but different `geo`/`areaServed`. Property conflicts on graph merge. Use distinct `@id`s or convert location pages to `Service` with `provider` reference.
- **H2 · WebSite SearchAction missing** (low priority — site has no search)
- **H3 · Service blocks are malformed-thin** — only `name`, `provider`, `areaServed`. Missing `serviceType`, `description`, `offers`, `url`. Forfeits rich-result + entity-disambiguation value.
- **H4 · Blog posts use `Article` instead of `BlogPosting`** + author should be `Person` (Manuel Saul) for E-E-A-T

### Medium
- **M1 · FAQPage rich results restricted** — Google only shows them on gov/health sites since Aug 2023. Keep them anyway (they help ChatGPT/Perplexity/AIO citations) but don't expect SERP rich results.
- **M2 · aggregateRating duplicated on 12 location pages without visible reviews** — Google policy violation risk. Either remove from location pages or add 1–2 visible reviews per page.
- **M3 · BreadcrumbList final ListItem includes self-URL** (Google prefers omission)
- **M4 · `/locations/` areaServed is array of strings** (should be City objects with `containedInPlace`)
- **M5 · `/gallery/` ImageGallery has no `image` array** populated
- **M6 · `priceRange: "$$"` only on homepage** — missing from location-page LocalBusiness clones

### Low
- L1 · `foundingDate: "2025"` should be ISO-8601 (`"2025-01-01"`)
- L2 · `sameAs` includes `share.google/...` short link — replace with canonical GBP URL
- L3 · No `logo` declared on canonical LocalBusiness/Organization

---

## 4. Sitemap (Score: 80/100)

- ✅ Well-formed XML, 44 URLs (well under 50k limit), correct namespace
- ✅ All 44 production pages indexed, dev artifacts properly excluded
- ✅ 404.html, schema-audit-report.html, prime-outdoor-experts-website-rebuild-plan.html correctly omitted

### Critical
- **Host mismatch** — sitemap uses apex `primeoutdoorexperts.com/` but should be `www.primeoutdoorexperts.com/` (44 URLs to update)

### High
- **Stale lastmods** — 42 of 44 URLs share `2026-03-25`; only `/residential/` and `/why-prime/` have `2026-04-26`. Use real per-file `git log -1 --format=%cI` mtimes.

### Medium
- **No image sitemap** — 30 unique landscaping photos in `/assets/photos/optimized/`. Image sitemap = significant Google Images upside for a visual business.

### Low
- **Location-page count quality gate** — at 13 cities, safe. Doorway-page risk activates at 30+. Audit content uniqueness before adding more cities.

---

## 5. Performance / Core Web Vitals (Score: 60/100)

**Estimated CrUX p75 (current):** LCP ~3.2–3.8s · INP ~220–280ms · CLS ~0.12–0.18 (all FAILING)

### Critical
- **C1 · Hero collage ships 1.78 MB of images on every load** (3 photos at 1200w AVIF: 360 KB + 661 KB + 766 KB). Photos 2 & 3 are decorative + offscreen on mobile but still load eagerly.
- **C2 · No `<link rel="preload">` for LCP image** — browser discovers img-5691 only after parsing 3 sequential CSS files. ~300ms LCP penalty.

### High
- **H1 · 4 Google variable fonts with 14 axis combinations** — Newsreader (7) + Fraunces (7) + Inter Tight (5) + DM Mono (2). Render-blocking, +200–500ms LCP, 0.05–0.10 CLS from FOUT.
- **H2 · 3 sequential render-blocking stylesheets** — styles.css → botanical-premium.css → florida-heat.css. Concatenate at build OR inline critical CSS.
- **H3 · INP risk: cursor parallax + tilt** — `florida-heat.js:286` mousemove on hero, plus `~20 mousemove listeners` on cards (lines 217+). Each move triggers `getBoundingClientRect()` (forced layout). 150–280ms INP on Android.

### Medium
- **M1 · Hero `<img>` elements lack width/height** — CLS 0.05–0.12 during font-load window
- **M2 · Stat counter + headline word-stagger cause text reflow** — add `tabular-nums` and ensure transforms are GPU-only
- **M3 · Stale CSS files orphaned** — `florida-estate.css` (36 KB) and `open-air.css` (40 KB) sit in `/css/` unused. Delete.
- **M4 · 3 separate `.hero-photo` rule sets compete** in styles.css, botanical-premium.css, and florida-heat.css. Dedupe.

### Low
- **L1 · SVG `feTurbulence` filter as background** in `.hero-grain` — CPU-expensive paint, ~15–30ms/frame on mobile. Pre-render to a 50×50 PNG tile.
- **L2 · ~132 KB CSS source** for one homepage. Run PurgeCSS — realistic target 70 KB.

**Estimated CrUX p75 after Critical+High fixes:** LCP ~2.0–2.4s · INP ~140–180ms · CLS ~0.04–0.08 (all PASSING).

---

## 6. AI Search Readiness / GEO (Score: 62/100)

| Dimension | Score | Weight |
|---|---|---|
| Citability (passage-level extractability) | 14/25 | 25% |
| Structural Readability (FAQ/H-tags) | 11/20 | 20% |
| Multi-Modal & Entity Coverage | 9/15 | 15% |
| Authority & Brand Signals | 16/20 | 20% |
| Technical Accessibility | 12/20 | 20% |

### Critical
- **C1 · Lake Mary page contaminated with "Sanford"** in title, meta, OG, hero badge (8 occurrences). AI engines will conflate Lake Mary queries with Sanford.
- **C2 · Homepage has ZERO FAQPage schema** — the page winning "landscaping company Orlando" searches has no Q&A structure.
- **C3 · All 13 location pages have ZERO FAQPage schema** — invisible in Google AIO for "near me" queries.

### High
- **H1 · `.hero-seo-text` 50-word citation block exists ONLY on homepage** — should be on every page. AI engines lift this verbatim.
- **H2 · `llms.txt` missing Founder section** + `/why-prime/` and `/commercial-landscaping/` index pages
- **H3 · robots.txt missing 2 AI bots** — `OAI-SearchBot` (new ChatGPT search index UA) and `Claude-Web` (legacy Anthropic web-fetch)
- **H4 · Homepage `.hero-seo-text` omits founder/year hooks** — never names Manuel Saul in extractable prose

### Medium
- **M1 · Homepage H2s are marketing-voice, not question-voice** ("The Prime Outdoor Experts Difference"). Add 2-3 question H2s.
- **M2 · Service-page FAQPage schema is gold-standard** (specific dollar ranges, cultivar names) — replicate exact pattern on 13 location pages
- **M3 · "Manuel Saul" in JSON-LD only** — never in plain text on locations/services. AI engines need co-occurrence in prose.

---

## 7. Visual / Above-the-Fold (Critical Issues)

### Critical
- **C1 · Editorial hero photos render at 560px height** instead of 300/170/215. Caused by 3 conflicting `.hero-photo` rule sets in `florida-heat.css` (lines 302–319, 2046–2071). Legacy `min-height: 560px` cascades into new editorial layout.
- **C2 · Mobile editorial hero — photo overlaps headline letters** (cascading from C1)
- **C3 · LIVE site doesn't have rebuild deployed** — primeoutdoorexperts.com still shows old hero ("Commercial Landscaping That Reflects the Value..."). Local rebuild has the editorial collage hero.

### High
- **H1 · Lawn-care, Sanford, Residential, Contact pages have empty hero space** — ~110px gap between breadcrumb and eyebrow chip on desktop. CTA below the fold on mobile.
- **H2 · Contact page has zero trust signals above the fold on mobile** — no stars, no review count, no license chip
- **H3 · No primary CTA above the fold on Sanford / Lawn-care mobile**
- **H4 · Header reviews stars dim** — gold on dark green at 12px barely visible

### Medium
- **M1 · "Next opening · Wednesday 10am" pulse dot in hero is fictional** — fabricated trust signal unless wired to real calendar (Calendly/GHL)
- **M2 · Newsreader weight 300 dips into wispy** at huge sizes — bump to 400 italic
- **M3 · Terracotta CTA contrast borderline** on cream — verify ratio
- **M4 · Primary CTA inconsistent across pages** — "Get a Free Quote" (lime) vs "Get an Instant Estimate" (terracotta) vs "Get a Free Residential Quote"
- **M5 · Mobile headline wraps awkwardly** — `.word.br` on "care" creates double-stack at 375px
- **M6 · Photo figcaptions hidden until hover** — invisible on touch devices

---

## Coverage Matrix

### Schema coverage by page type

| Page-type | LocalBusiness | Service | FAQPage | aggRating | Breadcrumb | Article |
|---|---|---|---|---|---|---|
| Homepage `/` | ✓ | ✗ | **✗** ← gap | ✓ | ✓ | n/a |
| `/about/` | ✓ (clone) | ✗ | ✓ | ✗ | ✓ | n/a |
| `/contact/` | ref | ✗ | ✗ | ✗ | ✓ | n/a |
| `/reviews/` | ✓ (partial) | ✗ | ✗ | ✓ + 3 Reviews | ✓ | n/a |
| `/why-prime/` | ref | ✗ | ✓ | ✗ | ✓ | n/a |
| `/services/` × 8 | ✗ | ✓ thin | **✗ broken** | ✗ | **✗ broken** | n/a |
| `/commercial-landscaping/` × 7 | ✗ | ✓ | **✗ broken** | ✗ | **✗ broken** | n/a |
| `/locations/` × 13 | ✓ clone (bug) | ✗ | **✗** ← biggest gap | ✓ (policy risk) | ✓ | n/a |
| `/blog/` × 3 | ✗ | ✗ | ✗ | ✗ | ✓ | Article (should be BlogPosting) |

---

## Summary by Severity

| Severity | Count | Estimated Total Fix Time |
|---|---|---|
| 🔴 Critical | 12 | ~6 hours |
| 🟠 High | 14 | ~10 hours |
| 🟡 Medium | 18 | ~15 hours |
| 🟢 Low | 11 | ~4 hours |

**See `ACTION-PLAN.md` for prioritized fix sequence.**
