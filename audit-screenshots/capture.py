from playwright.sync_api import sync_playwright
import os

OUT = "/Users/laurendutton/dev/prime/audit-screenshots"
BASE = "https://www.primeoutdoorexperts.com"

PAGES = [
    ("home", "/"),
    ("lawn-care", "/services/lawn-care/"),
    ("sanford", "/locations/sanford-fl/"),
    ("contact", "/contact/"),
    ("residential", "/residential/"),
]

VIEWPORTS = [
    ("desktop", 1440, 900),
    ("mobile", 375, 812),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for vname, w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
        for slug, path in PAGES:
            page = ctx.new_page()
            url = BASE + path
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
            except Exception as e:
                print(f"WARN {url}: {e}")
            page.wait_for_timeout(800)
            # above the fold
            atf = os.path.join(OUT, f"{slug}-{vname}-atf.png")
            page.screenshot(path=atf, full_page=False)
            print(f"saved {atf}")
            page.close()
        ctx.close()
    browser.close()
print("DONE")
