import asyncio
import os
from playwright.async_api import async_playwright

async def capture_full_pages(page, device_name, width, height, output_dir):
    print(f"Setting viewport to {width}x{height} for {device_name}...")
    await page.set_viewport_size({"width": width, "height": height})
    await page.goto("http://localhost:8000/")
    await page.wait_for_timeout(3000) # wait for animations/particles to settle
    
    # Capture multiple scroll positions to audit everything
    # 1. Hero / Top portion
    await page.screenshot(path=os.path.join(output_dir, f"{device_name}_1_hero.png"), full_page=False)
    
    # 2. Scroll to features
    await page.evaluate("document.getElementById('features').scrollIntoView();")
    await page.wait_for_timeout(1000)
    await page.screenshot(path=os.path.join(output_dir, f"{device_name}_2_features.png"), full_page=False)

    # 3. Scroll to waitlist / survey
    await page.evaluate("document.getElementById('waitlist-section').scrollIntoView();")
    await page.wait_for_timeout(1000)
    await page.screenshot(path=os.path.join(output_dir, f"{device_name}_3_survey.png"), full_page=False)

    # 4. Scroll to stats and upcoming
    await page.evaluate("document.getElementById('upcoming').scrollIntoView();")
    await page.wait_for_timeout(1000)
    await page.screenshot(path=os.path.join(output_dir, f"{device_name}_4_upcoming.png"), full_page=False)
    
    # 5. Full Page capture
    await page.screenshot(path=os.path.join(output_dir, f"{device_name}_full.png"), full_page=True)
    print(f"Captured screenshots for {device_name}")

async def main():
    output_dir = r"C:\Users\freef\workspace\homepage2\images"
    os.makedirs(output_dir, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Desktop
        await capture_full_pages(page, "desktop", 1440, 900, output_dir)
        
        # Mobile
        await capture_full_pages(page, "mobile", 375, 812, output_dir)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
