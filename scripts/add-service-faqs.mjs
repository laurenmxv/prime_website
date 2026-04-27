#!/usr/bin/env node
/**
 * Adds FAQPage JSON-LD to each /services/<name>/ and /commercial-landscaping/<name>/
 * page by appending a FAQPage object to the existing @graph array.
 *
 * If a FAQPage already exists on the page, it's left alone.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Service-page FAQs — 5 questions per service, AI-citation-friendly
const SERVICE_FAQS = {
  'lawn-care': [
    ['How often should I mow my lawn in Orlando, FL?',
     'In Orlando, lawns should be mowed weekly during the growing season (April–October) and bi-weekly during the cooler months (November–March). Florida turfgrasses like St. Augustine and Zoysia grow most aggressively in our long, humid summers and benefit from consistent weekly cuts. Prime Outdoor Experts services residential lawns weekly or bi-weekly across Orange and Seminole counties.'],
    ['What grass types grow best in Central Florida?',
     'St. Augustine (especially Floratam and Palmetto cultivars) is the most common Central Florida lawn grass — it tolerates heat, humidity, and partial shade. Zoysia (Empire and JaMur) is a denser, finer-bladed alternative for sunny lawns. Bahia is a low-maintenance option for larger properties. Our blog post on the best grass types for Orlando covers each in detail.'],
    ['How much does residential lawn care cost in Orlando?',
     'Weekly residential lawn maintenance in the Orlando area typically runs $35–$80 per visit depending on lot size, edging requirements, and bedding work. Bi-weekly service runs $45–$110 per visit. Prime Outdoor Experts provides custom quotes after a free property walk-through.'],
    ['Do you treat for chinch bugs and lawn pests?',
     'Yes. Chinch bugs are the most damaging pest for St. Augustine lawns in Central Florida — they cause yellowing patches in summer heat. We monitor for chinch bug pressure during every visit and recommend targeted treatment when activity is detected. We also watch for sod webworms, fall armyworms, and fungal issues like gray leaf spot.'],
    ['Are you licensed and insured?',
     'Yes. Prime Outdoor Experts LLC is fully licensed and insured for residential and commercial landscaping in Florida. We carry general liability and workers compensation. Certificates of insurance are available on request for HOA boards and property managers.'],
  ],
  'landscape-design-installation': [
    ['How long does a residential landscape installation take?',
     'A typical residential refresh — replacing tired beds, adding plants, mulch, and edging — takes 1–3 days for a quarter-acre lot. Larger transformations involving sod replacement, irrigation tie-in, and new hardscape can take 1–2 weeks. We provide a detailed project timeline with every quote.'],
    ['What plants work best for Orlando landscapes?',
     'Florida-friendly plant choices that thrive in Central Florida heat and humidity include hibiscus, plumbago, firebush, podocarpus, viburnum, sago palm, queen palm, magnolia, crepe myrtle, and Florida-native saw palmetto. We design beds with year-round interest and water-wise selections appropriate to your property.'],
    ['Do you handle sod installation?',
     'Yes. We install Floratam, Palmetto, Empire Zoysia, and Bahia sod for residential and commercial properties. Sod work includes site prep, soil amendment, installation, initial watering schedule setup, and a 30-day establishment check.'],
    ['Can you coordinate with my hardscape contractor?',
     'Yes. We routinely coordinate with paver, fence, and pool contractors so landscape installation, irrigation, and lighting align with the larger project. Communicating directly with your other trades reduces delays and prevents incompatible installations.'],
    ['Do you offer landscape design plans?',
     'For larger residential and commercial installations we provide a written design plan with plant placement, hardscape layout, irrigation zones, and a phased installation schedule. Smaller refreshes are quoted from an on-site walk-through and photos.'],
  ],
  'irrigation-systems': [
    ['How often should I run my sprinklers in Orlando?',
     'Most Central Florida lawns need 0.5–1 inch of water per week. During summer that means 2–3 watering days; in cooler months, often just one day per week. Orange and Seminole counties enforce specific watering days based on address — we set your controller to comply with current SJRWMD restrictions.'],
    ['Do you repair Rain Bird and Hunter sprinkler systems?',
     'Yes. We repair all major irrigation brands — Rain Bird, Hunter, Toro, Rachio, K-Rain, Orbit. Common repairs include leaking valves, broken sprinkler heads, clogged nozzles, controller failures, and rain sensor replacement. Most repairs are completed in a single visit.'],
    ['What is a smart irrigation controller?',
     'A smart controller (like Rachio, Hunter Hydrawise, or Rain Bird ESP) automatically adjusts watering based on local weather data and soil moisture. Smart controllers reduce water bills by 20–40% on average and ensure your lawn never runs the sprinklers during or after rain. We install and configure smart controllers throughout Orlando.'],
    ['Do you offer irrigation audits?',
     'Yes. An irrigation audit checks every zone for proper coverage, pressure, head spacing, and runtime. We document broken heads, misaligned spray patterns, and overlap issues, then provide a written report and quote for any repairs. Audits are recommended annually or when you notice dry patches in your lawn.'],
    ['Are you licensed for irrigation work in Florida?',
     'Yes. Prime Outdoor Experts is licensed and insured to perform irrigation installation and repair work in Florida. We comply with all St. Johns River Water Management District (SJRWMD) requirements for new installations.'],
  ],
  'tree-shrub-care': [
    ['When should palm trees be trimmed in Orlando?',
     'Florida palms should be trimmed once or twice per year — typically late spring after seed pods drop, and again in late summer if needed. We remove only fully-brown fronds; trimming green fronds (a practice called "hurricane cuts") weakens the tree and is no longer recommended by the University of Florida IFAS Extension.'],
    ['How do I take care of an oak tree in Florida?',
     'Live oaks and laurel oaks in Central Florida benefit from selective canopy thinning every 3–5 years to improve airflow and reduce hurricane wind load. Avoid heavy pruning in summer (wound healing is slowest then) and never paint cuts — modern arboriculture lets oak wounds heal naturally.'],
    ['Do you handle tree removal?',
     'We handle tree pruning, canopy management, and small-tree removal. For larger removals (oaks, mature palms, trees near structures) we partner with licensed arborists and tree services in our network. We coordinate the work and clean up debris afterward.'],
    ['What shrubs work best in Orlando hedge plantings?',
     'Common Florida hedge choices include podocarpus, viburnum, ligustrum, simpson stopper, clusia, and Florida privet. Each has different growth rates, sun requirements, and trim frequencies. We recommend hedging plants based on your specific property conditions.'],
    ['How often should hedges be trimmed?',
     'Most Central Florida hedges look best with monthly shaping during the growing season (April–October) and quarterly maintenance the rest of the year. Faster-growing varieties like ligustrum may need bi-weekly attention in summer.'],
  ],
  'landscape-enhancements': [
    ['What is a landscape enhancement?',
     'A landscape enhancement is a one-time refresh project that improves the appearance of an existing landscape — fresh mulch, edged beds, seasonal flower color, plant replacement, and bed reshaping. Enhancements are typically scheduled quarterly or seasonally, separate from routine weekly maintenance.'],
    ['How often should I refresh mulch?',
     'In Orlando, mulch should be refreshed every 6–9 months. Florida sun and rain break down organic mulches faster than in cooler climates. Most properties get the best appearance with a spring refresh and a fall touch-up.'],
    ['Do you do seasonal flower color rotations?',
     'Yes. We design and install seasonal annual rotations — typically pansies and snapdragons for cool-season color, then begonias, vincas, and salvia for warm-season displays. Commercial properties often run 2–3 rotations per year for entrance features and high-visibility areas.'],
    ['What is bed edging and why does it matter?',
     'Crisp bed edging is the single most visible improvement to a landscape. We use mechanical edging on every visit to maintain a clean line between turf and beds, which prevents grass encroachment, defines plantings, and dramatically improves curb appeal.'],
    ['Can enhancements be added to an existing maintenance contract?',
     'Yes. Existing residential and commercial clients can add seasonal color, mulch refresh, plant replacement, or bed reshaping to their account at any time. Enhancement work is quoted per project and scheduled separately from routine visits.'],
  ],
  'seasonal-cleanup': [
    ['When should I do a hurricane prep cleanup in Orlando?',
     'Hurricane season runs June 1 through November 30. We recommend a pre-season cleanup in May (clear loose debris, secure outdoor furniture cues, identify weak limbs) and a post-storm cleanup as needed during the season. Properties under contract get priority response after named storms.'],
    ['What does a fall cleanup include in Central Florida?',
     'A typical fall cleanup includes removing fallen leaves and debris, cutting back perennials, refreshing mulch, edging beds, trimming hedges, and inspecting irrigation for winter scheduling adjustments. While Florida doesn\'t have the dramatic leaf-drop of northern climates, oak and laurel oak shedding is significant in Central Florida.'],
    ['Do you handle storm debris removal?',
     'Yes. After tropical storms and hurricanes we provide priority cleanup for our clients — clearing fallen palm fronds, downed limbs, and debris. We can also coordinate larger tree work with licensed arborists.'],
    ['When should St. Augustine grass be dethatched?',
     'St. Augustine in Central Florida rarely needs dethatching — the grass naturally breaks down its own thatch layer in our climate. Topdressing with sand once every few years is more useful. Excessive thatch usually indicates over-fertilization rather than a need for dethatching.'],
    ['What is the best time for a property refresh?',
     'The best time for a comprehensive landscape refresh in Orlando is February–March (before peak heat) or October–November (after the worst of summer humidity). Both seasons offer better plant establishment and easier installation conditions.'],
  ],
  'sustainable-landscaping': [
    ['What is Florida-Friendly Landscaping?',
     'Florida-Friendly Landscaping (FFL) is a University of Florida IFAS program promoting nine principles for environmentally responsible landscapes: right plant right place, water efficiently, fertilize appropriately, mulch, attract wildlife, manage yard pests responsibly, recycle yard waste, reduce stormwater runoff, and protect the waterfront. Prime Outdoor Experts incorporates FFL principles in all installations.'],
    ['What are good native plants for Central Florida?',
     'Native plant choices that thrive in Orlando include saw palmetto, simpson stopper, beautyberry, firebush, coontie, muhly grass, fakahatchee grass, blanket flower, and dune sunflower. Natives require less water, less fertilizer, and fewer pesticides once established.'],
    ['How do I reduce my lawn watering bill?',
     'The biggest water-saving moves are: install a smart controller and rain sensor, group beds by water need (hydrozoning), expand native plant beds and reduce turf area, and use drip irrigation in beds rather than spray. Properties that adopt all four typically see 30–50% lower water bills.'],
    ['What is a rain garden?',
     'A rain garden is a planted low spot designed to capture and absorb stormwater runoff from roofs, driveways, and lawns. Rain gardens reduce stormwater pollution, recharge groundwater, and create habitat for pollinators. Common Central Florida rain garden plants include muhly grass, swamp milkweed, blue flag iris, and pickerelweed.'],
    ['Can sustainable landscaping work for HOAs?',
     'Yes. Many Orlando-area HOAs are updating covenants to allow Florida-Friendly Landscaping practices — Florida law explicitly protects homeowners\' right to install FFL plantings. We work with HOA boards to design entrance features and common areas that meet community standards while reducing water and chemical inputs.'],
  ],
  'hoa-maintenance-programs': [
    ['What is included in an HOA maintenance contract?',
     'A standard HOA maintenance contract includes routine mowing and edging of common areas, hedge trimming, irrigation management, seasonal color rotations, mulch refresh, palm and tree care, and storm cleanup. We deliver a digital service report after every visit so the board has documented proof of work performed.'],
    ['Do you attend HOA board meetings?',
     'Yes. For HOA accounts under contract we make ourselves available for board meetings as needed — typically quarterly or monthly depending on the community. We come prepared with property condition reports, photo documentation, and recommendations for upcoming seasonal work.'],
    ['How are HOA contracts priced?',
     'HOA contracts are priced per month based on common-area square footage, frequency of service, scope (turf only vs. full landscape), and any seasonal enhancements. Typical Central Florida HOA contracts range from $500–$8,000+ per month. We provide a detailed scope document with every quote.'],
    ['What kind of digital reporting do you provide?',
     'After every service visit, we send a digital report to the property manager and/or HOA board. The report includes: date and time of service, scope completed, photo documentation, any issues observed (irrigation problems, plant decline, pest pressure), and recommended follow-up actions.'],
    ['Can you provide certificates of insurance?',
     'Yes. We provide certificates of insurance — general liability and workers compensation — to HOA boards and property management companies upon request. COIs can be issued for the property manager, the association, or both as additional insureds.'],
  ],
};

// Commercial vertical FAQs — 4 questions per vertical
const VERTICAL_FAQS = {
  'hoa-communities': [
    ['What does HOA landscaping in Orlando typically cost?',
     'HOA landscaping contracts in Central Florida typically run $500–$8,000+ per month depending on community size, common-area acreage, service frequency, and scope (turf only vs. full landscape with seasonal color and irrigation management). Prime Outdoor Experts provides itemized quotes after a free walk-through with the property manager and board.'],
    ['How often should HOA common areas be serviced?',
     'Most HOA common areas in Orlando are serviced weekly during the growing season (April–October) and bi-weekly during cooler months. Entrance features, monument signs, and high-visibility areas often warrant additional touch-up visits between full services.'],
    ['Do you respond to HOA board complaints?',
     'Yes. Under our HOA contracts we provide a direct point of contact for the property manager and board. Complaints, questions, or scope changes are addressed within one business day, and corrections are typically completed within the next service visit.'],
    ['Can you handle multiple HOAs under one management company?',
     'Yes. We work with property management companies overseeing multiple Central Florida HOAs and can scale crew assignments and reporting to fit a portfolio approach. Each community gets the same crew weekly, with consolidated billing and reporting available at the management-company level.'],
  ],
  'office-parks': [
    ['What does office park landscaping include?',
     'Office park landscaping covers entrance features, parking-lot island maintenance, building-perimeter beds, walkway edges, exterior turf, hedge maintenance, seasonal color rotations, irrigation management, and routine debris cleanup. We service Orlando-area corporate campuses with the same crew every visit.'],
    ['How often is corporate campus landscape maintenance needed?',
     'Most Orlando office parks need weekly maintenance during the growing season and bi-weekly during winter months. Higher-visibility properties — corporate headquarters, multi-tenant campuses — often add monthly enhancement touch-ups for entrance features and seasonal color.'],
    ['Do you provide property managers with reporting?',
     'Yes. After every visit we send a digital service report to the property manager including photos, scope completed, and any items observed (irrigation issues, pest pressure, hardscape damage). Property managers use these reports for tenant communications, owner reporting, and capital-planning records.'],
    ['Can you maintain irrigation for corporate campuses?',
     'Yes. We manage smart controllers, repair irrigation issues, and ensure SJRWMD watering-restriction compliance for office park properties. Corporate campuses with smart controllers typically see 20–40% lower water bills compared to time-clock irrigation.'],
  ],
  'retail-centers': [
    ['What landscaping services do retail centers need in Orlando?',
     'Retail centers need consistent curb appeal — entrance maintenance, parking-lot island care, building-front beds, palm and tree care, and high-visibility seasonal color. Tenants and customers form impressions in seconds, so retail landscape contracts emphasize visible quality and prompt response to issues.'],
    ['How quickly do you respond to retail landscape issues?',
     'Retail centers under contract get same-business-day response for visible issues (broken irrigation, fallen branches, debris) and next-visit response for routine items. Time-sensitive work — leasing tour prep, special events — is scheduled on demand.'],
    ['Do you handle parking-lot landscape islands?',
     'Yes. Parking-lot islands are some of the highest-visibility, lowest-maintenance landscape spots in retail. We design islands with drought-tolerant plantings (muhly grass, agave, juniper), maintain mulch, and replace failed plants seasonally to keep the property looking new.'],
    ['Can you coordinate with retail tenants on outdoor improvements?',
     'Yes. We coordinate with retail tenants and property managers on outdoor improvements — tenant-funded entrance landscaping, outdoor seating area maintenance, and seasonal display rotations. Landlord-paid common-area work and tenant-paid storefront work are billed separately when requested.'],
  ],
  'apartment-complexes': [
    ['What landscape services do apartment complexes need?',
     'Multifamily properties need full-service landscape maintenance — entrance and clubhouse features, pool deck plantings, walking paths, perimeter beds, building entrance features, seasonal color, irrigation management, and routine cleanup of leasing-tour zones. Curb appeal directly impacts leasing velocity and tenant retention.'],
    ['How often should apartment-complex landscapes be serviced?',
     'Most Orlando apartment complexes need weekly or twice-weekly service in the growing season. Properties with active leasing pipelines often add monthly enhancement work — fresh mulch, color refresh, hedge shaping — to keep tour-ready appearance.'],
    ['Do you work with regional property management companies?',
     'Yes. We service apartment portfolios for regional and national management companies, with consolidated reporting, single-point invoicing, and consistent crew assignments across portfolio properties.'],
    ['Can you handle pool deck and amenity area plantings?',
     'Yes. Pool decks, fitness center entrances, and amenity area plantings need salt-tolerant, sun-loving species and frequent grooming. We use Florida-friendly choices like crepe myrtle, hibiscus, plumbago, and ornamental grasses for these high-visibility areas.'],
  ],
  'medical-campuses': [
    ['What landscape considerations are unique to medical campuses?',
     'Medical campuses prioritize accessibility (ADA-compliant pathways, no overhanging branches), patient comfort (quiet equipment scheduling, low-fragrance plantings near entrances), and infection-control awareness (no flowering species near sterile areas). Our medical-campus contracts include scheduled visits during low-traffic hours when possible.'],
    ['Do you work around hospital and clinic schedules?',
     'Yes. We coordinate with facilities managers to schedule mowing and equipment work outside critical patient windows — early morning, late afternoon, or designated non-clinical days. Specialty work like tree trimming is scheduled with operations leadership.'],
    ['How do you handle landscape near patient entrances?',
     'Patient entrances and emergency-department approaches need year-round visible appeal, low-allergen plantings, accessible pathways, and quick debris response. We service these areas more frequently than back-of-house zones and use plant choices that minimize pollen, fragrance, and pest attraction.'],
    ['Can you provide certificates of insurance for healthcare facilities?',
     'Yes. We provide standard certificates of insurance for medical campus contracts — general liability, auto, and workers compensation — and can add specific named insureds, additional insureds, and waivers of subrogation as required by facility risk management.'],
  ],
  'industrial-facilities': [
    ['What landscape services do industrial properties need?',
     'Industrial facilities need perimeter maintenance, entrance and signage area landscaping, retention-pond edging, fence-line clearing, and detention-area mowing. Most industrial properties prioritize reliability and code compliance over decorative work — clear sightlines and unobstructed access matter most.'],
    ['How often is industrial landscape maintenance needed?',
     'Most Central Florida industrial facilities are serviced bi-weekly or monthly during the growing season, with quarterly heavier work for retention-pond edging, fence-line clearing, and detention-area mowing. Higher-traffic gates and signage areas typically get more frequent attention.'],
    ['Do you handle retention pond and detention area maintenance?',
     'Yes. Retention ponds and detention areas need regular bank mowing, vegetation control, and outflow structure clearing to maintain stormwater compliance. We coordinate with facility engineering on inspection schedules and document compliance for environmental reporting.'],
    ['Can you maintain large industrial perimeter fencing?',
     'Yes. We mow and clear vegetation along industrial perimeter fencing — both inside and outside the fence line — and trim back encroaching trees and shrubs. Clear sightlines are important for security and many industrial property insurance requirements.'],
  ],
  'hospitality-hotels': [
    ['What landscape services do hotels in Orlando need?',
     'Hotel landscapes are high-visibility — entrance porte-cochères, lobby-window views, pool deck plantings, walkway lighting beds, and signage areas. Most Orlando hospitality properties need daily or every-other-day grooming during peak season and consistent year-round seasonal color.'],
    ['Do you offer same-day or next-day service for hotel events?',
     'Yes. Hospitality properties under contract get priority scheduling for events, weddings, and special tour days. Pre-event grooming, post-event cleanup, and holiday display work are common add-ons to standard hotel contracts.'],
    ['Can you handle pool deck landscape maintenance?',
     'Yes. Pool deck plantings need salt-tolerant, sun-loving choices and frequent grooming to stay tour-ready. Common Florida hotel pool deck plants include hibiscus, bougainvillea, croton, and ornamental palms. We service hotel pool decks with the same frequency as primary entrance areas.'],
    ['How do you minimize disruption to hotel guests?',
     'We schedule mowing and high-equipment work during low-occupancy hours (typically early morning before check-out or mid-morning after housekeeping starts) and use lower-noise tools near guest rooms when possible. Specialty work is coordinated with the hotel manager and posted in advance to staff.'],
  ],
};

function buildFaqPage(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

function processFile(file, faqs) {
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`✗ ${file}: cannot read — ${err.message}`);
    return false;
  }

  // Skip if already has FAQPage
  if (html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"')) {
    console.log(`  ${file.replace(ROOT, '.')}: already has FAQPage — skipped`);
    return false;
  }

  // Find the @graph array — match the closing ]} and inject FAQPage before
  // The pattern in these minified schemas: `"@graph":[ ... ]}`
  const newFaq = JSON.stringify(buildFaqPage(faqs));

  // Try to inject right before the final `]}`. Pattern: `]}}</script>` or `]}</script>`
  const before = html;
  html = html.replace(
    /(\{"@type":"BreadcrumbList"[\s\S]*?\})(\]\})/,
    (_, breadcrumb, end) => `${breadcrumb},${newFaq}${end}`
  );

  if (html === before) {
    console.error(`✗ ${file.replace(ROOT, '.')}: could not inject (no BreadcrumbList anchor found)`);
    return false;
  }

  writeFileSync(file, html);
  console.log(`✓ ${file.replace(ROOT, '.')}: FAQPage added (${faqs.length} Q&As)`);
  return true;
}

let total = 0;
let updated = 0;

console.log('=== Service pages ===');
for (const [slug, faqs] of Object.entries(SERVICE_FAQS)) {
  total++;
  if (processFile(join(ROOT, 'services', slug, 'index.html'), faqs)) updated++;
}

console.log('\n=== Commercial verticals ===');
for (const [slug, faqs] of Object.entries(VERTICAL_FAQS)) {
  total++;
  if (processFile(join(ROOT, 'commercial-landscaping', slug, 'index.html'), faqs)) updated++;
}

console.log(`\n${updated} of ${total} files updated.`);
