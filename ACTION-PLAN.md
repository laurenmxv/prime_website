# Prime Outdoor Experts — SEO Action Plan

**Generated:** 2026-04-28
**SEO Health Score:** 69/100 → projected **88/100** after Critical+High items
**Total estimated work:** ~35 hours across 4 priority tiers

---

## 🔴 CRITICAL (fix this week — blocks indexing or causes penalties)

### CR-1 · Swap canonical host from apex to www across entire site
**Impact:** Every backlink + canonical signal currently routed through a 307 redirect. Massive PageRank leakage.
**Files:** all 45 HTML pages (canonical, og:url, twitter:url, JSON-LD `@id`/`url`), `sitemap.xml`, `robots.txt`
**Fix:**
```bash
cd /Users/laurendutton/dev/prime
# HTML pages: replace apex with www in canonical/og/twitter/JSON-LD
find . -name "*.html" -not -path "*/node_modules/*" -exec \
  sed -i '' 's|https://primeoutdoorexperts.com|https://www.primeoutdoorexperts.com|g' {} +
# sitemap + robots
sed -i '' 's|https://primeoutdoorexperts.com|https://www.primeoutdoorexperts.com|g' sitemap.xml robots.txt
```
**Time:** 5 min · **Verify:** `grep -r "https://primeoutdoorexperts" --include="*.html" .` returns only `www.` URLs

### CR-2 · Change apex→www redirect from 307 to 301 in Vercel
**Impact:** Stops PageRank leakage on apex links forever
**Where:** Vercel dashboard → Project → Domains → primeoutdoorexperts.com → set permanent redirect to `www.primeoutdoorexperts.com`
**Time:** 2 min

### CR-3 · Fix editorial hero CSS cascade conflict
**Impact:** Hero photos rendering at 560px height instead of 300/170/215px → entire editorial collage broken
**File:** `/Users/laurendutton/dev/prime/css/florida-heat.css`
**Fix:** Scope legacy `.hero-photo` rules to `.hero-split` only:
```css
/* Line 302 — was: */
.hero-photo { position: relative; min-height: 560px; ... }
/* Change to: */
.hero-split .hero-photo { position: relative; min-height: 560px; ... }

/* Same for .hero-photo img/picture rules at lines 309-319 */
.hero-split .hero-photo img,
.hero-split .hero-photo picture { ... }

/* Line 326: scope the cream-gradient overlay */
.hero-split .hero-photo::after { ... }

/* Line 2046-2071: delete or also scope to .hero-split */
```
**Time:** 15 min · **Verify:** view `index.html` locally; photos should render at 220×300, 170×170, 165×215

### CR-4 · Fix FAQPage schema nesting bug on 15 pages
**Impact:** Both BreadcrumbList AND FAQPage are invalid on every service + commercial subpage. Zero rich-result eligibility.
**Files:** all 8 `/services/*/index.html` + all 7 `/commercial-landscaping/*/index.html` (line 22 each)
**Fix:** Move the FAQPage block out of `BreadcrumbList.itemListElement` and add as a sibling in `@graph`:
```json
"@graph": [
  { "@type": "Service", ... },
  { "@type": "BreadcrumbList", "itemListElement": [...3 ListItems only...] },
  { "@type": "FAQPage", "mainEntity": [...] }   ← was nested inside itemListElement above
]
```
**Time:** 30 min (3 min × 15 files) · **Verify:** paste each into https://validator.schema.org/

### CR-5 · Fix homepage geo coordinates
**File:** `/Users/laurendutton/dev/prime/index.html` line 64
**Fix:** Change `"latitude": 28.7589, "longitude": -81.3178` → `"latitude": 28.8005, "longitude": -81.2729` (Sanford coords match the stated `addressLocality`)
**Time:** 1 min

### CR-6 · Fix Lake Mary page contamination
**File:** `/Users/laurendutton/dev/prime/locations/lake-mary-fl/index.html`
**Issue:** 8 leftover "Sanford" references in title, meta description, OG title/description, hero badge (lines 6, 7, 8, 9, 40)
**Fix:** Replace every "Sanford" except the literal `addressLocality` field (HQ is Sanford 32771) with "Lake Mary"
**Time:** 5 min

### CR-7 · Patch addressLocality across 13 location pages
**Files:** `/locations/*/index.html` (LocalBusiness `address.addressLocality`)
**Fix:** Each location page's `addressLocality` should match its city, not "Sanford":
```bash
# Example for winter-park-fl:
sed -i '' 's|"addressLocality": "Sanford"|"addressLocality": "Winter Park"|' \
  locations/winter-park-fl/index.html
```
**Time:** 30 min (one targeted sed per city)

### CR-8 · Create 3 missing OG images
**Files:** Generate `/assets/og-home.jpg`, `/assets/og-default.jpg`, `/assets/og-commercial.jpg` at 1200×630
**Fix:** Either commission designed cards OR repoint existing references to existing photos:
```bash
# Quick fix: copy a hero photo and crop to 1200x630
cd /Users/laurendutton/dev/prime/assets
sips -c 630 1200 photos/optimized/img-5691-2400.jpg --out og-home.jpg
sips -c 630 1200 photos/optimized/img-5697-2400.jpg --out og-default.jpg
sips -c 630 1200 photos/optimized/img-5927-2400.jpg --out og-commercial.jpg
```
**Time:** 10 min

### CR-9 · Fix 404.html relative paths
**File:** `/Users/laurendutton/dev/prime/404.html` lines 11–13 (and any `<a href>` to assets)
**Fix:** Change `href="css/styles.css"` → `href="/css/styles.css"` (prefix with `/`)
**Time:** 3 min

### CR-10 · Add LCP preload for hero photo
**File:** `/Users/laurendutton/dev/prime/index.html` between lines 31 and 32
**Fix:** Insert before the stylesheets:
```html
<link rel="preload" as="image"
      href="/assets/photos/optimized/img-5691-1200.avif"
      type="image/avif"
      fetchpriority="high">
```
**Time:** 2 min · **Win:** ~300ms LCP improvement

### CR-11 · Lazy-load hero photos 2 & 3
**File:** `/Users/laurendutton/dev/prime/index.html` lines 366, 375
**Fix:** Change `loading="eager"` → `loading="lazy"` on the secondary collage photos (they're decorative + offscreen on mobile)
**Time:** 1 min · **Win:** 1.4 MB payload saved on mobile

### CR-12 · Re-encode oversized hero photos
**Files:** `/assets/photos/optimized/img-5927-1200.avif` (661 KB) and `img-6640-1200.avif` (766 KB)
**Fix:** Re-encode at lower quality, target ≤280 KB each:
```bash
npx @squoosh/cli --avif '{"cqLevel":34}' \
  assets/photos/optimized/img-5927-1200.jpg \
  -d assets/photos/optimized/
```
**Time:** 15 min · **Win:** 800 KB+ payload reduction

### CR-13 · Deploy the rebuild to production
**Status:** Live primeoutdoorexperts.com still shows the old hero. Local rebuild is editorial cinematic.
**Fix:** After CR-3 (CSS cascade fix), `git add -A && git commit -m "Editorial hero rebuild + SEO audit fixes" && git push` — Vercel auto-deploys
**Time:** 5 min

---

## 🟠 HIGH (fix within 1 week — significant ranking impact)

### HI-1 · Add FAQPage to homepage
**File:** `/Users/laurendutton/dev/prime/index.html` after BreadcrumbList at line 138
**Fix:** Add 5 Q&As in JSON-LD covering: Orlando landscaping cost · Who owns Prime · Service areas · Licensed/insured · Best HOA landscaper in Lake Mary. (See full snippet in GEO audit Drop-In C, FULL-AUDIT-REPORT.md)
**Time:** 10 min

### HI-2 · Add FAQPage to all 13 location pages
**Files:** `/locations/*/index.html`
**Fix:** Each location page needs 4 city-specific Qs — clone the gold-standard pattern from `/services/lawn-care/index.html` line 22. City-specific: "Do you serve [neighborhood]?" / "[City] turfgrass tips" / "[City] HOA considerations" / "Pricing for [City]"
**Time:** 3 hours (10 min × 13 cities, write specific neighborhood + landmark references)

### HI-3 · Add `.hero-seo-text` 50-word citation block to all pages
**Files:** all 13 location pages + 8 service pages + 7 commercial-landscaping pages = 28 pages
**Fix:** Add aria-hidden paragraph with founder name, founding year, owner-operated, service area, phone. Pattern:
```html
<p class="hero-seo-text" aria-hidden="true">
Prime Outdoor Experts is an owner-operated landscaping company in Orlando, FL, founded in 2025 by Manuel Saul, serving HOAs, property managers, and homeowners in [CITY], FL. Services include weekly lawn care, irrigation repair, landscape design, tree and shrub care, and seasonal cleanup. 5.0 stars on Google. Call (407) 443-4505.
</p>
```
**Time:** 1 hour

### HI-4 · Update sitemap.xml lastmods to real per-file mtimes
**File:** `/Users/laurendutton/dev/prime/sitemap.xml`
**Fix:**
```bash
# Generate real lastmods from git
for f in $(find . -name "index.html" -o -name "*.html"); do
  echo "$f: $(git log -1 --format=%cI -- $f)"
done
```
Then update the 42 stale `<lastmod>` entries. Better: add a build script that regenerates sitemap from git mtimes on every deploy.
**Time:** 30 min

### HI-5 · Standardize asset paths to absolute (`/css/...`, `/assets/...`)
**Files:** `index.html` (relative refs throughout), `404.html`
**Fix:** Find/replace `href="css/` → `href="/css/`, `src="js/` → `src="/js/`, `href="assets/` → `href="/assets/`, `<use href="assets/icons.svg` → `<use href="/assets/icons.svg`
**Time:** 15 min

### HI-6 · Resolve `@id: "#business"` collision across location pages
**Files:** all 13 `/locations/*/index.html` + `/about/` + `/reviews/`
**Fix:** Drop the `@id: "https://primeoutdoorexperts.com/#business"` from location/about/reviews LocalBusiness blocks. Or convert location pages from `LocalBusiness` clone to `Service` with `provider: {"@id": "https://www.primeoutdoorexperts.com/#business"}`.
**Time:** 1 hour

### HI-7 · Trim Google Fonts payload
**File:** `index.html` line 32 (and 44 other pages)
**Fix:** Audit which weights are actually used in CSS, drop unused. Realistic minimum: Newsreader 400/500 italic, Fraunces 500/600, Inter Tight 500/600/700, DM Mono 500. Remove italic axes for fonts that don't use it.
**Time:** 1 hour · **Win:** 40% font payload reduction

### HI-8 · Concatenate 3 stylesheets into one bundle
**Build step:** `cat css/styles.css css/botanical-premium.css css/florida-heat.css > css/site.css` then update HTML to reference single file. Add to a `package.json` build script that runs pre-deploy.
**Time:** 30 min · **Win:** −2 round-trips, −50–150ms LCP

### HI-9 · Add real photos to 8 service pages
**Files:** `/services/*/index.html`
**Fix:** Each service page needs ≥3 images: hero showing service in progress, before/after pair, photo-report screenshot. Use existing `/assets/photos/optimized/` library.
**Time:** 2 hours · **Win:** E-E-A-T Experience score 12→18

### HI-10 · Expand 4 thin hub pages to 500+ words each
**Files:** `/locations/index.html`, `/services/index.html`, `/blog/index.html`, `/gallery/index.html`
**Fix:** Add 250–300 words of decision-tree / comparison / county-by-county content per page. (See content audit report H3 for specific recipes.)
**Time:** 3 hours

### HI-11 · Add author byline + dateModified to 3 blog posts
**Files:** `/blog/*/index.html`
**Fix:** Add under H1: "Written by the Prime Outdoor Experts crew · Reviewed [Month YYYY]". Update Article schema to BlogPosting + add `dateModified` + `wordCount`.
**Time:** 30 min

### HI-12 · Add `OAI-SearchBot` and `Claude-Web` to robots.txt
**File:** `/Users/laurendutton/dev/prime/robots.txt`
**Fix:** Append:
```
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-Web
Allow: /
```
**Time:** 1 min

### HI-13 · Add explicit width/height to hero `<img>` elements
**File:** `/Users/laurendutton/dev/prime/index.html` lines 357, 366, 375
**Fix:** Add `width="900" height="1200"` (or appropriate intrinsic ratios) — eliminates 0.05–0.12 CLS
**Time:** 5 min

### HI-14 · Throttle/disable card-tilt on touch devices
**File:** `/Users/laurendutton/dev/prime/js/florida-heat.js` lines 196–298
**Fix:** Wrap tilt loop with `(any-pointer: fine)` check. Use event delegation (one mousemove per section, not 20 listeners).
**Time:** 30 min · **Win:** 80–100ms INP improvement on Android

---

## 🟡 MEDIUM (fix within 1 month — optimization opportunities)

### ME-1 · Replace templated location-page bodies with unique recipes
**Files:** all 13 `/locations/*/index.html`
**Recipes (per audit):**
- **Altamonte Springs** — SR-436 retail strip case study + high-traffic Bahia vs shaded St. Aug
- **Sanford** — Lakefront salt-tolerance plant choices + SunRail commuter properties
- **Winter Park** — Live-oak shade lawns (Palmetto cultivar) + historic-district covenants
- **Lake Nona** — Medical City campus tier specifics
- **Windermere** — Lakefront + estate-property irrigation zones
- Each: 3 named neighborhoods + 1 named landmark + 1 local turfgrass observation
**Time:** 6 hours (~25 min × 13 cities)

### ME-2 · Add CSP header to vercel.json
**File:** `/Users/laurendutton/dev/prime/vercel.json` — append to `/(.*)` headers block:
```json
{ "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'self';" }
```
**Time:** 10 min

### ME-3 · Add 50-word "Key Facts" block under H1 on every page
**Files:** all 45 production pages
**Fix:** Insert `<aside class="key-facts">` directly under H1 with third-person factual summary. (See content audit M1.)
**Time:** 3 hours

### ME-4 · Display pricing range on every service page
**Files:** `/services/*/index.html`
**Fix:** Add "Typical Pricing" block: starting price, what's included, what affects price up/down. Current FAQ schema already has dollar ranges — surface them to UI.
**Time:** 2 hours

### ME-5 · Remove aggregateRating from location pages OR add visible reviews
**Files:** 12 `/locations/*/index.html`
**Issue:** Google policy violation — aggregateRating must reference reviews actually present on the page
**Choose:** (a) remove aggregateRating from location-page LocalBusiness blocks (only keep on homepage + `/reviews/`), OR (b) add 1–2 visible review cards to each location page
**Time:** 1 hour (option a) or 4 hours (option b)

### ME-6 · Convert blog posts to BlogPosting + Person author
**Files:** 3 `/blog/*/index.html`
**Fix:** Change `Article` → `BlogPosting`, add `author: {"@type":"Person","name":"Manuel Saul"}` (per E-E-A-T)
**Time:** 15 min

### ME-7 · Build image sitemap at `/sitemap-images.xml`
**Files:** new file at `/Users/laurendutton/dev/prime/sitemap-images.xml`
**Fix:** Reference 30 unique photos with image:image children on `/gallery/`, top service pages, top location pages. Add `Sitemap:` line to robots.txt.
**Time:** 1 hour

### ME-8 · Upgrade Service schema with description, serviceType, offers, url
**Files:** all 8 `/services/*/index.html`
**Fix:** Replace minimal `Service` block with full schema. (See schema audit H3 for drop-in template.)
**Time:** 1 hour

### ME-9 · Standardize CTA verb + color sitewide
**Files:** All page heroes — `/contact/`, `/sanford-fl/`, `/lawn-care/`, `/residential/`, etc.
**Fix:** Pick one verb ("Get a Free Quote") and one color (terracotta if committing to Florida Heat palette). Replace inconsistent variants.
**Time:** 30 min

### ME-10 · Tighten subpage hero padding
**Files:** subpage CSS (search for `.page-hero` or equivalent in florida-heat.css)
**Fix:** Reduce `padding-top` by ~60px on `.page-hero` to bring CTAs above the fold on mobile (currently ~110px empty space between breadcrumb and eyebrow)
**Time:** 30 min

### ME-11 · Self-host fonts + add size-adjust @font-face
**Files:** download Newsreader/Fraunces/Inter Tight/DM Mono woff2 → `/assets/fonts/`, update CSS with `@font-face` + `size-adjust`/`ascent-override` to neutralize CLS swap
**Time:** 2 hours · **Win:** −1 third-party connection, lower CLS

### ME-12 · Pre-render SVG noise to PNG tile
**File:** `/Users/laurendutton/dev/prime/css/florida-heat.css` lines 2165, 2293
**Fix:** Render the `feTurbulence` filter once to a 50×50 PNG tile, replace data: SVG with the tile path
**Time:** 30 min · **Win:** 80% paint cost reduction on `.hero-grain`

### ME-13 · Run PurgeCSS to remove unused selectors
**Build step:** `npx purgecss --css css/site.css --content '**/*.html' --output css/site.purged.css`
**Time:** 1 hour · **Win:** ~60 KB CSS reduction

### ME-14 · Add `priceRange: "$$"` to location-page LocalBusiness clones
**Files:** 13 `/locations/*/index.html`
**Time:** 15 min

### ME-15 · Convert `/locations/` areaServed strings to City objects
**File:** `/Users/laurendutton/dev/prime/locations/index.html` line 22
**Fix:** Replace `["Winter Park", "Lake Nona", ...]` with `[{"@type":"City","name":"Winter Park","containedInPlace":{"@type":"AdministrativeArea","name":"Orange County, FL"}}, ...]`
**Time:** 30 min

### ME-16 · Populate `/gallery/` ImageGallery with image array
**File:** `/Users/laurendutton/dev/prime/gallery/index.html`
**Fix:** Add `image: [{"@type":"ImageObject","url":"...","caption":"..."}, ...]` for each gallery photo
**Time:** 30 min

### ME-17 · Replace fictional "Next opening · Wednesday 10am" pulse
**File:** `/Users/laurendutton/dev/prime/index.html` hero meta strip
**Fix:** Either wire to real Calendly/GHL availability, OR replace with "Same-day callback" / "2-hour quote response"
**Time:** 30 min (or 4 hours if integrating real calendar)

### ME-18 · Show always-on figcaptions on touch / drop them
**File:** `/Users/laurendutton/dev/prime/css/florida-heat.css`
**Fix:** Either set `opacity: 0.85` on `.hero-photo figcaption` for `(hover: none)` media query, or remove captions entirely
**Time:** 5 min

---

## 🟢 LOW (backlog — nice to have)

- **LO-1** · Add IndexNow setup at `/.well-known/<key>.txt` for Bing/Yandex/Naver
- **LO-2** · Add descriptive alt text to hero photos (currently empty `alt=""`)
- **LO-3** · Delete `<meta name="keywords">` from all pages (ignored, dated)
- **LO-4** · Delete orphaned CSS files: `css/florida-estate.css`, `css/open-air.css`
- **LO-5** · Add `logo` property to canonical LocalBusiness schema on homepage
- **LO-6** · Replace `sameAs` `share.google/...` short link with canonical GBP URL
- **LO-7** · Update `foundingDate: "2025"` → `"2025-01-01"` (ISO-8601 preferred)
- **LO-8** · Bump header star color from gold to brighter brass for legibility
- **LO-9** · Add Newsreader weight 400 italic option (hero italic currently dips to wispy at 300)
- **LO-10** · Add 1–2 contextual location links per blog post (currently 0)
- **LO-11** · Update Sanford hero copy from "since 2025" to "since our founding in 2025"

---

## Suggested Execution Order (week-by-week)

### Week 1 (CRITICAL tier): ~6 hours
**Focus:** Stop the bleeding — fix indexing/canonical issues + visual breakage + biggest performance wins

CR-1, CR-2 (canonical host fix) → CR-3 (hero CSS) → CR-4 (FAQ schema) → CR-5/6/7 (Sanford/Lake Mary fixes) → CR-8 (OG images) → CR-9 (404.html) → CR-10/11/12 (LCP wins) → CR-13 (deploy)

**Expected result:** SEO Health Score 69 → 80

### Week 2 (HIGH tier, part 1): ~10 hours
**Focus:** AI search readiness + content depth

HI-1, HI-2, HI-3 (FAQPage + citation blocks across all pages) → HI-9 (service page images) → HI-12 (robots.txt AI bots) → HI-13 (CLS fix)

### Week 3 (HIGH tier, part 2): ~7 hours
**Focus:** Performance + structural cleanup

HI-4 (sitemap lastmods) → HI-5 (asset paths) → HI-6 (@id collision) → HI-7 (font trim) → HI-8 (CSS bundle) → HI-14 (INP fix)

**Expected result after Week 3:** SEO Health Score 80 → 88

### Weeks 4–8 (MEDIUM tier): ~25 hours
**Focus:** Content quality, schema completeness, polish

ME-1 (location-page rewrites) is the biggest single item — schedule across multiple days.

### Backlog (LOW tier): ~4 hours
Knock out during slow weeks or while waiting for content writes.

---

## Tracking & Verification

After each tier:
- ✅ Run `find . -name "*.html" | xargs grep -L "https://www\."` (should return 0 files post-CR-1)
- ✅ Paste each schema block into https://validator.schema.org/ (post-CR-4)
- ✅ Run PageSpeed Insights at https://pagespeed.web.dev/ on homepage + 1 service + 1 location (post-Week 3)
- ✅ Submit updated sitemap to Google Search Console (post-HI-4)
- ✅ Verify in GSC's "Why pages aren't indexed" report — should drop to near-zero

## Tools Used
- 7 specialized SEO subagents (Technical, Content, Schema, Sitemap, Performance, GEO/AI, Visual)
- Playwright (visual screenshots)
- curl (live HTTP probes)
- Schema.org validator
- llmstxt.org spec
- Google's E-E-A-T guidelines + Helpful Content System

## Files Generated
- `/Users/laurendutton/dev/prime/FULL-AUDIT-REPORT.md` — comprehensive findings
- `/Users/laurendutton/dev/prime/ACTION-PLAN.md` — this file
- `/Users/laurendutton/dev/prime/audit-screenshots/` — 12 desktop + mobile captures
