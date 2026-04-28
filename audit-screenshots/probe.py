from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("file:///Users/laurendutton/dev/prime/index.html", wait_until="load", timeout=20000)
    page.wait_for_timeout(3500)
    # Inspect each hero photo's first <img> natural size + computed bg
    info = page.evaluate("""() => {
      const out = [];
      document.querySelectorAll('.hero-photo').forEach(fig => {
        const img = fig.querySelector('img');
        const cs = getComputedStyle(fig);
        out.push({
          cls: fig.className,
          imgSrc: img && img.currentSrc,
          natW: img && img.naturalWidth,
          natH: img && img.naturalHeight,
          rect: fig.getBoundingClientRect(),
          bg: cs.backgroundColor,
        });
      });
      const h1 = document.querySelector('.hero-h1');
      out.push({ h1Rect: h1 && h1.getBoundingClientRect() });
      return out;
    }""")
    for row in info:
        print(row)
    browser.close()
