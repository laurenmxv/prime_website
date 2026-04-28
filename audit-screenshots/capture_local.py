from playwright.sync_api import sync_playwright
import os

OUT = "/Users/laurendutton/dev/prime/audit-screenshots"
LOCAL = "file:///Users/laurendutton/dev/prime/index.html"

VIEWPORTS = [("desktop-local", 1440, 900), ("mobile-local", 375, 812)]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for vname, w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
        page = ctx.new_page()
        try:
            page.goto(LOCAL, wait_until="networkidle", timeout=20000)
        except Exception as e:
            print(f"WARN: {e}")
        page.wait_for_timeout(2500)  # let staggered animations finish
        atf = os.path.join(OUT, f"home-{vname}-atf.png")
        page.screenshot(path=atf, full_page=False)
        print(f"saved {atf}")
        ctx.close()
    browser.close()
print("DONE")
