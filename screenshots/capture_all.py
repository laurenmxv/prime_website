from playwright.sync_api import sync_playwright
import json, os

BASE = "http://localhost:8000"
OUT = "/Users/laurendutton/dev/prime/screenshots"

pages = [
    ("homepage", "/"),
    ("commercial-landscaping", "/commercial-landscaping/"),
    ("about", "/about/"),
    ("reviews", "/reviews/"),
    ("contact", "/contact/"),
    ("lawn-care", "/services/lawn-care/"),
    ("winter-park", "/locations/winter-park-fl/"),
]

viewports = [
    ("desktop", 1920, 1080),
    ("mobile", 375, 812),
]

with sync_playwright() as p:
    browser = p.chromium.launch()

    for vp_name, w, h in viewports:
        page = browser.new_page(viewport={"width": w, "height": h})

        for page_name, path in pages:
            url = BASE + path
            fname = f"{page_name}_{vp_name}"
            try:
                resp = page.goto(url, wait_until="networkidle", timeout=10000)
                status = resp.status if resp else "no response"
                # Above-fold screenshot
                page.screenshot(path=os.path.join(OUT, f"{fname}_above.png"), full_page=False)
                # Full page screenshot
                page.screenshot(path=os.path.join(OUT, f"{fname}_full.png"), full_page=True)
                print(f"OK  {fname} (status={status})")
            except Exception as e:
                print(f"ERR {fname}: {e}")

        # Mobile-specific checks
        if vp_name == "mobile":
            page.goto(BASE + "/", wait_until="networkidle", timeout=10000)
            # Check for hamburger menu
            hamburger = page.query_selector('[class*="hamburger"], [class*="mobile-menu"], [class*="menu-toggle"], [aria-label*="menu"], [aria-label*="Menu"], button.nav-toggle, .nav-toggle, .mobile-toggle')
            print(f"\nMobile hamburger element found: {hamburger is not None}")
            if hamburger:
                print(f"  Tag: {hamburger.evaluate('el => el.tagName')}")
                print(f"  Visible: {hamburger.is_visible()}")
                # Click it and screenshot
                try:
                    hamburger.click()
                    page.wait_for_timeout(500)
                    page.screenshot(path=os.path.join(OUT, "mobile_menu_open.png"), full_page=False)
                    print("  Captured open menu screenshot")
                except Exception as e:
                    print(f"  Could not click hamburger: {e}")

        page.close()

    # Font check
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.goto(BASE + "/", wait_until="networkidle", timeout=10000)

    fonts_info = page.evaluate("""() => {
        const results = {};
        // Check computed fonts on key elements
        const h1 = document.querySelector('h1');
        if (h1) results.h1_font = getComputedStyle(h1).fontFamily;
        const body = document.body;
        results.body_font = getComputedStyle(body).fontFamily;
        // Check all link/style tags for font references
        const links = Array.from(document.querySelectorAll('link[href*="font"], link[href*="Font"]'));
        results.font_links = links.map(l => l.href);
        // Check if fonts loaded
        results.fonts_loaded = document.fonts ? Array.from(document.fonts).map(f => `${f.family} ${f.status}`) : [];
        return results;
    }""")
    print(f"\nFont Analysis:\n{json.dumps(fonts_info, indent=2)}")

    # Broken images check
    broken = page.evaluate("""() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
            src: img.src,
            alt: img.alt,
            natural_width: img.naturalWidth,
            displayed: img.offsetWidth > 0,
            broken: img.naturalWidth === 0 && img.src !== ''
        }));
    }""")
    print(f"\nImage Analysis ({len(broken)} images):")
    for img in broken:
        status = "BROKEN" if img['broken'] else "OK"
        print(f"  [{status}] {img['src'][:80]}  alt=\"{img['alt'][:40]}\"")

    # H1 and CTA check across pages
    print("\n--- H1 and CTA Analysis ---")
    for page_name, path in pages:
        try:
            page.goto(BASE + path, wait_until="networkidle", timeout=10000)
            analysis = page.evaluate("""() => {
                const h1 = document.querySelector('h1');
                const h1_rect = h1 ? h1.getBoundingClientRect() : null;
                // Find CTA buttons/links
                const ctas = Array.from(document.querySelectorAll('a, button')).filter(el => {
                    const text = el.textContent.toLowerCase();
                    return text.includes('quote') || text.includes('call') || text.includes('contact') || text.includes('get started') || text.includes('free');
                });
                const cta_info = ctas.slice(0, 5).map(c => ({
                    text: c.textContent.trim().substring(0, 60),
                    tag: c.tagName,
                    visible_above_fold: c.getBoundingClientRect().top < 1080,
                    top: Math.round(c.getBoundingClientRect().top)
                }));
                return {
                    h1_text: h1 ? h1.textContent.trim().substring(0, 80) : null,
                    h1_above_fold: h1_rect ? h1_rect.bottom < 1080 : false,
                    h1_top: h1_rect ? Math.round(h1_rect.top) : null,
                    ctas: cta_info
                };
            }""")
            print(f"\n{page_name} ({path}):")
            print(f"  H1: \"{analysis['h1_text']}\" (top={analysis['h1_top']}px, above_fold={analysis['h1_above_fold']})")
            for cta in analysis['ctas']:
                print(f"  CTA: \"{cta['text']}\" ({cta['tag']}, top={cta['top']}px, above_fold={cta['visible_above_fold']})")
        except Exception as e:
            print(f"\n{page_name}: ERROR - {e}")

    # Contrast check - sample key text/bg combos
    print("\n--- Contrast Spot Check ---")
    page.goto(BASE + "/", wait_until="networkidle", timeout=10000)
    contrast = page.evaluate("""() => {
        const samples = [];
        const elements = [
            {sel: 'h1', label: 'H1'},
            {sel: 'p', label: 'Body paragraph'},
            {sel: '.hero, [class*="hero"]', label: 'Hero section'},
            {sel: 'nav, header', label: 'Navigation'},
            {sel: 'footer', label: 'Footer'},
        ];
        for (const {sel, label} of elements) {
            const el = document.querySelector(sel);
            if (el) {
                const style = getComputedStyle(el);
                samples.push({
                    label,
                    color: style.color,
                    bg: style.backgroundColor,
                    fontSize: style.fontSize
                });
            }
        }
        return samples;
    }""")
    for s in contrast:
        print(f"  {s['label']}: color={s['color']} bg={s['bg']} size={s['fontSize']}")

    page.close()
    browser.close()
    print("\nDone.")
