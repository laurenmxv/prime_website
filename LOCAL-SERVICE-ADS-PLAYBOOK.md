# Local Service Ads (LSA) — Google Guaranteed Setup Playbook

> **What this is:** Local Service Ads (LSA) appear ABOVE the regular Local Pack (Maps results) when someone searches "landscaper near me" or "lawn care Orlando." Each listing has the green **"Google Guaranteed"** badge, the business's review score, and a click-to-call button. **Top placement, instant lead flow.**
>
> **Cost model:** Pay-per-lead (not pay-per-click). You only pay when a real lead actually reaches out via phone or message. Average cost per lead in Orlando landscaping: $30–$80.
>
> **Time to first lead:** Typically 7–14 days after approval.
>
> **Required:** Active business license, general liability insurance, EIN, background check on owner.

---

## Step 1 — Apply (30 min, you do this once)

1. Go to https://www.google.com/local-services-ads
2. Click **"Get started"** at the top
3. Enter business name: **Prime Outdoor Experts LLC**
4. Enter zip: **32771**
5. Choose business category: **Landscaper** (primary)
   - Add secondary categories: **Lawn care service**, **Tree service**, **Sprinkler system contractor**

6. Service areas: select up to 50 zip codes. **Recommended starter set (24 zips covering Orange + Seminole highest-value areas):**

   ```
   Lake Mary:        32746
   Heathrow:         32746 (same)
   Sanford:          32771, 32773
   Winter Park:      32789, 32792, 32790
   Lake Nona:        32827, 32832
   Windermere:       34786
   Dr. Phillips:     32819, 32836
   Celebration:      34747
   Kissimmee:        34741, 34744, 34746, 34747, 34759
   Maitland:         32751, 32794
   Altamonte Springs: 32701, 32714, 32715
   Winter Garden:    34787
   Ocoee:            34761
   Apopka:           32703, 32712
   ```

7. Set weekly budget: **start at $300/week** (Google will spend less initially while learning). Cap at $500/week until you have data.

8. Upload required docs (Google verifies these in 3–5 business days):
   - Florida landscaping license (or LLC + business tax receipt if no license required for unlicensed lawn care)
   - **General liability insurance certificate** (minimum $1M, $2M preferred)
   - **Workers comp** if you have any W2 employees
   - **EIN letter** from IRS
   - **Driver's licenses** for all owners (background check)

9. Submit. Google emails confirmation. Expect approval in 5–10 business days.

---

## Step 2 — While waiting for approval, set up Google Ads conversion tracking

This wires LSA leads into your existing Google Ads tag (already installed sitewide).

1. Login to **Google Ads** (you should have access via the same account you used for LSA): https://ads.google.com
2. Top right: **Tools & Settings** → **Conversions**
3. Click **+ New conversion action**
4. Choose **"Phone calls"** → **"Calls from ads using call extensions or call-only ads"**
5. Set:
   - **Category:** Lead → Submit lead form
   - **Conversion name:** LSA Call
   - **Value:** Different values per conversion → set to **$50 per lead** (this is your estimated avg lead value)
   - **Count:** One
   - **Call length:** **Count only calls longer than 30 seconds** (filters out hang-ups)
   - **Attribution model:** Data-driven

6. **Repeat** for one more conversion action — this time choose **"Website"** → **"Submit lead form"**
   - Name: **Website form submit**
   - Value: $75 per lead (form submits are higher-quality than calls)

7. After both are created, click each → **Tag setup** → copy the **Conversion Label** (looks like `Abc1d-EFghIjk2lMNoP`)

8. **Send me both conversion labels** and I'll wire them into the code:
   - `js/main.js` line ~325: replace `REPLACE_WITH_CONVERSION_LABEL` with the form-submit label
   - `js/florida-heat.js` line ~155: replace `REPLACE_WITH_CALL_LABEL` with the call label

---

## Step 3 — Once approved, optimize the LSA profile

This is where most landscapers leave money on the table. Spend 30 min doing all of these the day approval lands:

### A) Reviews score (most important factor in LSA ranking)
- LSA pulls reviews from your existing GBP (Google Business Profile)
- **Bid eligibility threshold:** 3.0+ stars
- **Auto-pause threshold:** Drops below 3.0 stars
- **Top placement threshold:** Effectively 4.7+ stars
- Your current 5.0 ★ / 28 reviews is great — protect this above all else

### B) Photos
- LSA shows 1–3 photos in each listing
- Upload **8–12 best work photos** to LSA (separate from GBP — they don't auto-sync everything)
- Best photo types: completed front-yard work, in-progress crew shots, manicured commercial property
- Avoid: stock photos, blurry/dark shots, photos of just one bed

### C) Bio / Highlights
- 200-character business description — make it count:
  > "Owner-operated Orlando landscaping. Same crew every visit. Photo-documented service. Licensed & insured. Serving Orange & Seminole counties since 2025. 5.0★ on Google."

### D) Booking calendar (optional but huge)
- LSA lets you connect a booking calendar (Calendly, Google Calendar, etc.)
- When enabled, customers can self-book a property walk-through directly from the LSA listing
- **Massive conversion boost** — typically 2-3x lead volume vs phone-only
- Recommended: connect Manuel's Google Calendar; create 30-minute "Free property walk-through" slots Mon-Sat 8am-4pm

### E) Highlights badges (auto-earned, but you can prompt for them)
- LSA shows up to 3 badges per listing
- Available: Veteran-owned, Women-owned, BBB Accredited, Years in Business, etc.
- Apply for BBB Accreditation (https://www.bbb.org/get-accredited) → unlocks the BBB badge → typically 2-3% CTR boost

---

## Step 4 — Daily operations rhythm (Manuel)

LSA leads come via the Google Local Services Lead app (free, iOS + Android). Install it.

**The two rules that determine LSA ranking:**

1. **Respond within 5 minutes during business hours.** Google measures your response time. Slow responders get auto-deprioritized. Set the app to push-notify Manuel directly.

2. **Mark every lead as "Booked" or "Not a fit" within 24 hours.** Don't leave them as "Open." Google uses your disposition rate as a ranking signal.

**Asking for reviews after LSA jobs:**
After completing an LSA-originated job, **always** text the customer:
> "Hi [name], it was great working on your property. If you have 30 seconds, would you mind leaving a Google review? It really helps small local businesses like ours. Here's the direct link: https://search.google.com/local/writereview?placeid=ChIJq9_1XVHOq6oRIJKtmctfo-8"

LSA-originated reviews are weighted more heavily by Google than organic GBP reviews — they're a flywheel.

---

## Step 5 — Tracking & optimization (Lauren)

Once LSA has 30 days of data, review weekly:

- **Cost per lead trend** — should drop as Google's algorithm learns. Starting at $60–80 is normal; should settle at $35–50 by week 6.
- **Lead-to-customer conversion rate** — track how many LSA leads become paying customers. Target: 35–45%.
- **Customer lifetime value** by lead source — LSA customers tend to be one-off projects; GBP organic tends to be recurring contracts. Adjust budget allocation accordingly.

If cost per lead is consistently >$70 after week 6, the issue is usually:
- Bid budget too low (Google starves you of impressions)
- Service area too broad (you're paying for leads in zips with low close rates)
- Reviews stagnating (no new 5-star reviews in 30+ days)

---

## What to expect realistically

- **Month 1:** 15–25 leads at $50–70 cost per lead = $750–1,750 spent
- **Month 3:** 30–50 leads at $35–50 CPL = $1,000–2,500/month
- **Month 6:** 60–100 leads/month, top-3 placement most of the time

If you close 35% at $4,500 average annual customer value:
- Month 1: ~7 customers × $4,500 = $31,500 in pipeline against $1,250 spend = 25:1 ROI
- Month 6: ~28 customers × $4,500 = $126,000 against $4,000 = 31:1 ROI

LSA is the highest-ROI channel for local service businesses. Get it set up.
