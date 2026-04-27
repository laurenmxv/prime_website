#!/usr/bin/env node
/**
 * Standardizes the <footer class="footer">...</footer> block across all
 * production HTML pages. The canonical full footer has 4 columns
 * (brand, services, commercial, company) plus social icons.
 *
 * The script auto-detects each page's relative depth so the SVG icon
 * <use href="..."> gets the correct ../ prefix.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, dirname } from 'node:path';

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === '.vercel' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (name.endsWith('.html')) files.push(p);
  }
  return files;
}

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Compute depth: how many '../' to prepend to assets/icons.svg
function relPathFor(file) {
  const rel = relative(ROOT, file);
  const depth = rel.split('/').length - 1;  // index.html at root → depth 0; about/index.html → depth 1
  return depth === 0 ? 'assets/icons.svg' : '../'.repeat(depth) + 'assets/icons.svg';
}

function buildFooter(iconPath) {
  return `<footer class="footer" aria-label="Site footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a href="/" class="nav-logo" style="text-decoration:none;">
          <div class="nav-logo-mark">P</div>
          <div class="nav-logo-text">
            <span class="nav-logo-name">Prime Outdoor Experts</span>
            <span class="nav-logo-tagline">Orlando, FL</span>
          </div>
        </a>
        <p class="footer-brand-desc">Professional commercial and residential landscaping across Central Florida since 2025.</p>
        <a href="tel:+14074434505" class="footer-phone"><svg class="icon-svg" aria-hidden="true" width="18" height="18"><use href="${iconPath}#icon-phone"></use></svg> (407) 443-4505</a>
        <a href="mailto:info@primeoutdoorexperts.com" class="footer-email">info@primeoutdoorexperts.com</a>
        <div class="footer-socials">
          <a href="https://www.facebook.com/profile.php?id=61579258783372" class="social-link" aria-label="Facebook" rel="noopener">f</a>
          <a href="https://www.instagram.com/primeoutdoorexperts/" class="social-link" aria-label="Instagram" rel="noopener">ig</a>
          <a href="https://share.google/nlQ9sk1cYwFJAGqls" class="social-link" aria-label="Google Business" rel="noopener">G</a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Services</h5>
        <ul>
          <li><a href="/services/lawn-care/">Lawn Care</a></li>
          <li><a href="/services/landscape-design-installation/">Landscape Design</a></li>
          <li><a href="/services/irrigation-systems/">Irrigation Systems</a></li>
          <li><a href="/services/tree-shrub-care/">Tree &amp; Shrub Care</a></li>
          <li><a href="/services/">View All Services →</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Commercial</h5>
        <ul>
          <li><a href="/commercial-landscaping/hoa-communities/">HOA Communities</a></li>
          <li><a href="/commercial-landscaping/office-parks/">Office Parks</a></li>
          <li><a href="/commercial-landscaping/retail-centers/">Retail Centers</a></li>
          <li><a href="/commercial-landscaping/apartment-complexes/">Apartments</a></li>
          <li><a href="/contact/?type=commercial">Get Commercial Quote →</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Company</h5>
        <ul>
          <li><a href="/about/">About Us</a></li>
          <li><a href="/why-prime/">Why Prime</a></li>
          <li><a href="/reviews/">Reviews</a></li>
          <li><a href="/gallery/">Our Work</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>© 2026 Prime Outdoor Experts LLC · Sanford, FL</div>
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <a href="/sitemap.xml">Sitemap</a>
        <a href="/privacy-policy/">Privacy Policy</a>
        <a href="/terms-of-service/">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>`;
}

function findAllHtml() {
  return walk(ROOT);
}

let updated = 0;
let skipped = 0;
let errors = 0;

for (const file of findAllHtml()) {
  const skipFiles = ['schema-audit-report.html', 'prime-outdoor-experts-website-rebuild-plan.html', '404.html'];
  if (skipFiles.some(s => file.endsWith(s) && !file.endsWith('/404.html'))) {
    continue;
  }

  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
    errors++;
    continue;
  }

  // Skip if no <footer class="footer"> exists
  if (!html.includes('<footer class="footer"')) {
    console.log(`  ${relative(ROOT, file)}: no footer found — skipping`);
    skipped++;
    continue;
  }

  const iconPath = relPathFor(file);
  const newFooter = buildFooter(iconPath);

  // Replace the existing footer (greedy match across single-line minified or multi-line)
  const before = html;
  html = html.replace(
    /<footer class="footer"[^>]*>[\s\S]*?<\/footer>/,
    newFooter
  );

  if (html === before) {
    console.error(`✗ ${relative(ROOT, file)}: footer regex didn't match`);
    errors++;
    continue;
  }

  writeFileSync(file, html);
  console.log(`✓ ${relative(ROOT, file)}: footer standardized (icon path: ${iconPath})`);
  updated++;
}

console.log(`\n${updated} updated, ${skipped} skipped, ${errors} errors.`);
