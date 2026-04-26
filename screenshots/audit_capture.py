"""
Visual audit screenshot capture for Prime Outdoor Experts website.
Captures desktop (1920x1080) and mobile (375x812) screenshots
for all requested pages plus navigation dropdown tests.
"""
from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:3000"
OUT_DIR = "/Users/laurendutton/dev/prime/screenshots/audit"

PAGES = [
    ("homepage", "/"),
    ("lawn-care", "/services/lawn-care/"),
    ("winter-park", "/locations/winter-park-fl/"),
    ("blog-commercial-cost", "/blog/how-much-does-commercial-landscaping-cost-orlando/"),
]

VIEWPORTS = [
    ("desktop", 1920, 1080),
    ("mobile", 375, 812),
]

os.makedirs(OUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()

    for page_name, path in PAGES:
        for vp_name, w, h in VIEWPORTS:
            page = browser.new_page(viewport={"width": w, "height": h})
            url = BASE_URL + path
            print(f"Capturing {page_name} ({vp_name}) -> {url}")
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
                # Above-the-fold screenshot
                page.screenshot(
                    path=os.path.join(OUT_DIR, f"{page_name}_{vp_name}_above.png"),
                    full_page=False,
                )
                # Full-page screenshot
                page.screenshot(
                    path=os.path.join(OUT_DIR, f"{page_name}_{vp_name}_full.png"),
                    full_page=True,
                )
            except Exception as e:
                print(f"  ERROR: {e}")
            page.close()

    # Navigation dropdown tests on desktop
    print("Testing navigation dropdowns...")
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=15000)

    for dropdown_label in ["Services", "Commercial", "Locations"]:
        try:
            trigger = page.locator(f"nav a:has-text('{dropdown_label}'), nav button:has-text('{dropdown_label}'), nav li:has-text('{dropdown_label}') > a").first
            if trigger.count() == 0:
                # Try broader selector
                trigger = page.get_by_text(dropdown_label, exact=False).first
            trigger.hover()
            page.wait_for_timeout(500)
            page.screenshot(
                path=os.path.join(OUT_DIR, f"nav_dropdown_{dropdown_label.lower()}.png"),
                full_page=False,
            )
            print(f"  Captured dropdown: {dropdown_label}")
        except Exception as e:
            print(f"  Dropdown {dropdown_label} ERROR: {e}")

    # Also click to test click-based dropdowns
    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=15000)
    for dropdown_label in ["Services", "Commercial", "Locations"]:
        try:
            trigger = page.locator(f"nav a:has-text('{dropdown_label}'), nav button:has-text('{dropdown_label}')").first
            trigger.click()
            page.wait_for_timeout(500)
            page.screenshot(
                path=os.path.join(OUT_DIR, f"nav_click_{dropdown_label.lower()}.png"),
                full_page=False,
            )
            print(f"  Captured click dropdown: {dropdown_label}")
        except Exception as e:
            print(f"  Click dropdown {dropdown_label} ERROR: {e}")

    page.close()

    # Mobile menu test
    print("Testing mobile menu...")
    page = browser.new_page(viewport={"width": 375, "height": 812})
    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=15000)
    try:
        hamburger = page.locator(".mobile-menu-toggle, .hamburger, .menu-toggle, button[aria-label*='menu'], button[aria-label*='Menu'], .nav-toggle").first
        hamburger.click()
        page.wait_for_timeout(500)
        page.screenshot(
            path=os.path.join(OUT_DIR, "mobile_menu_open.png"),
            full_page=False,
        )
        print("  Captured mobile menu open")
    except Exception as e:
        print(f"  Mobile menu ERROR: {e}")
    page.close()

    browser.close()
    print("Done! All screenshots saved to", OUT_DIR)
