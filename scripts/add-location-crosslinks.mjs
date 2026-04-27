#!/usr/bin/env node
/**
 * Inserts a "Commercial Properties in <City>" cross-link section into each
 * location page, just before the closing CTA band.
 *
 * Each city gets 3 contextually-relevant commercial vertical links
 * to strengthen the location ↔ vertical hub-and-spoke topology.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// City → 3 most-relevant verticals, with context blurb
const CITIES = {
  'altamonte-springs-fl': {
    name: 'Altamonte Springs',
    verticals: [
      ['office-parks', 'Office Parks', 'Cranes Roost and the Altamonte Mall corridor — corporate campuses with high-visibility entrance landscaping needs.'],
      ['retail-centers', 'Retail Centers', 'Altamonte Mall outparcels, restaurant rows, and shopping center landscaping.'],
      ['apartment-complexes', 'Apartment Complexes', 'Multifamily properties along SR-436 and Maitland Boulevard.'],
    ],
  },
  'apopka-fl': {
    name: 'Apopka',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'Master-planned developments in north Apopka including Wekiva Springs and Errol Estates.'],
      ['industrial-facilities', 'Industrial Facilities', 'Apopka\'s industrial and warehouse corridor along US-441 and SR-429.'],
      ['apartment-complexes', 'Apartment Complexes', 'Multifamily properties throughout north Apopka.'],
    ],
  },
  'celebration-fl': {
    name: 'Celebration',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'The master-planned Celebration community has some of the most rigorous landscape standards in Central Florida.'],
      ['hospitality-hotels', 'Hospitality & Hotels', 'Hotels and short-term rentals serving the Disney corridor.'],
      ['retail-centers', 'Retail Centers', 'Downtown Celebration Avenue retail and Water Tower Place.'],
    ],
  },
  'dr-phillips-fl': {
    name: 'Dr. Phillips',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'Bay Hill, Phillips Bay, and the broader Dr. Phillips master-planned communities.'],
      ['hospitality-hotels', 'Hospitality & Hotels', 'Restaurant Row, Sand Lake Road hotels, and convention-corridor hospitality.'],
      ['office-parks', 'Office Parks', 'Corporate campuses along Sand Lake Road and the I-Drive business corridor.'],
    ],
  },
  'kissimmee-fl': {
    name: 'Kissimmee',
    verticals: [
      ['hospitality-hotels', 'Hospitality & Hotels', 'Hotels and resorts serving the Disney/Universal tourist corridor along US-192.'],
      ['retail-centers', 'Retail Centers', 'Tourist-corridor retail and outlet shopping landscaping.'],
      ['apartment-complexes', 'Apartment Complexes', 'Multifamily and short-term rental properties throughout Osceola County.'],
    ],
  },
  'lake-mary-fl': {
    name: 'Lake Mary',
    verticals: [
      ['office-parks', 'Office Parks', 'Heathrow corporate campuses, Lake Mary Boulevard tech corridor, and Primera Boulevard offices.'],
      ['hoa-communities', 'HOA Communities', 'Heathrow, Magnolia Plantation, and Lake Mary\'s master-planned residential communities.'],
      ['medical-campuses', 'Medical Campuses', 'AdventHealth Lake Mary and surrounding medical office buildings.'],
    ],
  },
  'lake-nona-fl': {
    name: 'Lake Nona',
    verticals: [
      ['medical-campuses', 'Medical Campuses', 'Lake Nona Medical City — UCF Health, VA Hospital, Nemours Children\'s, and surrounding medical office complexes.'],
      ['office-parks', 'Office Parks', 'Tavistock Lake Nona corporate campuses and the Lake Nona Town Center business district.'],
      ['hoa-communities', 'HOA Communities', 'Laureate Park, Eagle Creek, and the master-planned Lake Nona communities with strict landscape covenants.'],
    ],
  },
  'maitland-fl': {
    name: 'Maitland',
    verticals: [
      ['office-parks', 'Office Parks', 'Maitland Center and the Maitland Summit corporate campuses.'],
      ['hoa-communities', 'HOA Communities', 'Established neighborhoods along Lake Maitland and Lake Lily.'],
      ['medical-campuses', 'Medical Campuses', 'Maitland medical office buildings and hospital outpatient centers.'],
    ],
  },
  'ocoee-fl': {
    name: 'Ocoee',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'Wesmere, Forest Lake, and the master-planned communities of west Ocoee.'],
      ['apartment-complexes', 'Apartment Complexes', 'Multifamily properties along West Colonial Drive.'],
      ['industrial-facilities', 'Industrial Facilities', 'Industrial and distribution facilities along the SR-429 corridor.'],
    ],
  },
  'sanford-fl': {
    name: 'Sanford',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'Heathrow Park, Lake Forest, and the master-planned communities of north Sanford.'],
      ['hospitality-hotels', 'Hospitality & Hotels', 'Downtown Sanford restaurants and hotels along the historic riverfront.'],
      ['industrial-facilities', 'Industrial Facilities', 'The Sanford Airport industrial corridor and SR-417 distribution facilities.'],
    ],
  },
  'windermere-fl': {
    name: 'Windermere',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'Isleworth, Casabella, and Windermere\'s lakefront luxury communities.'],
      ['office-parks', 'Office Parks', 'Corporate offices along Conroy-Windermere Road and Winter Garden Vineland.'],
      ['hospitality-hotels', 'Hospitality & Hotels', 'Golf course resorts and luxury short-term rentals.'],
    ],
  },
  'winter-garden-fl': {
    name: 'Winter Garden',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'The Hamlin master-planned community, Stoneybrook West, and Independence — high-standard residential developments.'],
      ['retail-centers', 'Retail Centers', 'Winter Garden Village outparcels and downtown Plant Street retail.'],
      ['office-parks', 'Office Parks', 'Hamlin Town Center business district and Daniels Road corporate campuses.'],
    ],
  },
  'winter-park-fl': {
    name: 'Winter Park',
    verticals: [
      ['hoa-communities', 'HOA Communities', 'College Quarter, Comstock-Adelaide, and Kenilworth Shores — historic communities with rigorous landscape standards.'],
      ['office-parks', 'Office Parks', 'Fairbanks Avenue corporate offices and Lee Road business corridor.'],
      ['retail-centers', 'Retail Centers', 'Park Avenue, Hannibal Square, and Winter Park Village retail districts.'],
    ],
  },
};

function buildSection(city) {
  const cards = city.verticals.map(([slug, name, blurb]) => `
        <a href="/commercial-landscaping/${slug}/" class="card fade-in" style="text-decoration:none; color:inherit;">
          <h4>${name} in ${city.name}</h4>
          <p>${blurb}</p>
          <div style="margin-top:12px; font-weight:600; color:var(--bp-green-leaf);">View ${name.toLowerCase()} services →</div>
        </a>`).join('');

  return `
  <!-- Commercial Properties Cross-link -->
  <section class="section section-grey" aria-labelledby="commercial-${city.name.toLowerCase().replace(/[^a-z]/g, '-')}-heading">
    <div class="container">
      <div class="section-intro">
        <div class="section-eyebrow">Commercial Properties</div>
        <h2 id="commercial-${city.name.toLowerCase().replace(/[^a-z]/g, '-')}-heading">Commercial Landscaping in ${city.name}</h2>
        <p class="lead mt-3">${city.name} is home to a wide range of commercial properties we service across Central Florida.</p>
      </div>
      <div class="grid-3 mt-6">${cards}
      </div>
    </div>
  </section>
`;
}

let updated = 0;
for (const [slug, city] of Object.entries(CITIES)) {
  const file = join(ROOT, 'locations', slug, 'index.html');
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`✗ ${slug}: cannot read — ${err.message}`);
    continue;
  }

  if (html.includes('aria-labelledby="commercial-')) {
    console.log(`  ${slug}: already has cross-link section — skipped`);
    continue;
  }

  const before = html;
  // Insert just before <!-- CTA Band --> or before the cta-band <section>
  html = html.replace(
    /(\s*<!-- CTA Band -->\s*<section class="cta-band">|\s*<section class="cta-band">)/,
    `${buildSection(city)}$1`
  );

  if (html === before) {
    console.error(`✗ ${slug}: could not find CTA band insertion point`);
    continue;
  }

  writeFileSync(file, html);
  console.log(`✓ ${slug}: cross-link section added`);
  updated++;
}

console.log(`\n${updated} of ${Object.keys(CITIES).length} location pages updated.`);
