#!/usr/bin/env node
/**
 * Rewrites the LocalBusiness JSON-LD schema on each /locations/<city>-fl/ page
 * to include the full set of properties + per-city GeoCoordinates.
 *
 * - Group B pages (skeletal schema) get fully populated
 * - Group A pages get GeoCoordinates added
 * - All pages get aggregateRating/address/etc kept consistent with the GBP
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// City data: slug → { displayName, latitude, longitude }
// Coordinates are city-center approximations (good enough for local-pack SEO)
const CITIES = {
  'altamonte-springs-fl': { name: 'Altamonte Springs', lat: 28.6611, lng: -81.3656 },
  'apopka-fl':            { name: 'Apopka',            lat: 28.6934, lng: -81.5223 },
  'celebration-fl':       { name: 'Celebration',       lat: 28.3133, lng: -81.5365 },
  'dr-phillips-fl':       { name: 'Dr. Phillips',      lat: 28.4459, lng: -81.4834 },
  'kissimmee-fl':         { name: 'Kissimmee',         lat: 28.2920, lng: -81.4076 },
  'lake-mary-fl':         { name: 'Lake Mary',         lat: 28.7589, lng: -81.3178 },
  'lake-nona-fl':         { name: 'Lake Nona',         lat: 28.4178, lng: -81.2461 },
  'maitland-fl':          { name: 'Maitland',          lat: 28.6275, lng: -81.3631 },
  'ocoee-fl':             { name: 'Ocoee',             lat: 28.5694, lng: -81.5440 },
  'sanford-fl':           { name: 'Sanford',           lat: 28.8005, lng: -81.2729 },
  'windermere-fl':        { name: 'Windermere',        lat: 28.4956, lng: -81.5345 },
  'winter-garden-fl':     { name: 'Winter Garden',     lat: 28.5654, lng: -81.5862 },
  'winter-park-fl':       { name: 'Winter Park',       lat: 28.6000, lng: -81.3392 },
};

function buildSchema(slug, city) {
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://primeoutdoorexperts.com/' },
      { '@type': 'ListItem', position: 2, name: 'Service Areas', item: 'https://primeoutdoorexperts.com/locations/' },
      { '@type': 'ListItem', position: 3, name: city.name,        item: `https://primeoutdoorexperts.com/locations/${slug}/` },
    ],
  };

  const local = {
    '@type': 'LocalBusiness',
    '@id': 'https://primeoutdoorexperts.com/#business',
    name: 'Prime Outdoor Experts LLC',
    telephone: '+14074434505',
    email: 'info@primeoutdoorexperts.com',
    url: 'https://primeoutdoorexperts.com',
    foundingDate: '2025',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sanford',
      addressRegion: 'FL',
      postalCode: '32771',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.lat,
      longitude: city.lng,
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      addressRegion: 'FL',
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Central Florida',
      },
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61579258783372',
      'https://www.instagram.com/primeoutdoorexperts/',
      'https://share.google/nlQ9sk1cYwFJAGqls',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '28',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [local, breadcrumb],
  };
}

let updated = 0;
let unchanged = 0;

for (const [slug, city] of Object.entries(CITIES)) {
  const file = join(ROOT, 'locations', slug, 'index.html');
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`✗ ${slug}: cannot read — ${err.message}`);
    continue;
  }

  // Match the JSON-LD <script> block that contains the LocalBusiness schema
  // The minified pattern is: <script type="application/ld+json"> ... </script>
  const newSchemaJson = JSON.stringify(buildSchema(slug, city));
  const scriptBlock = `<script type="application/ld+json">\n  ${newSchemaJson}\n  </script>`;

  // Replace the existing JSON-LD block (greedy match the first script of that type)
  const before = html;
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    scriptBlock
  );

  if (html === before) {
    console.log(`  ${slug}: no schema block found — skipped`);
    unchanged++;
    continue;
  }

  writeFileSync(file, html);
  console.log(`✓ ${slug}: schema updated (${city.name}, ${city.lat}, ${city.lng})`);
  updated++;
}

console.log(`\nUpdated ${updated} files, ${unchanged} unchanged.`);
