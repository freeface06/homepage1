import asyncio
import os
from playwright.async_api import async_playwright

async def capture_legal_page(page, page_name, device_name, width, height, output_dir):
    url = f"http://localhost:8000/{page_name}.html"
    print(f"Capturing {page_name} on {device_name} ({width}x{height}) from {url}...")
    await page.set_viewport_size({"width": width, "height": height})
    await page.goto(url)
    await page.wait_for_timeout(2000) # wait for particles and elastic curves to load
    
    output_filename = f"{page_name}_{device_name}.png"
    output_path = os.path.join(output_dir, output_filename)
    
    # We want a full page screenshot to audit the entire content scroll
    await page.screenshot(path=output_path, full_page=True)
    print(f"Saved: {output_path}")

async def main():
    # Save directly to conversation artifact directory so Antigravity can display them visually
    output_dir = r"C:\Users\freef\.gemini\antigravity\brain\89e236c6-7361-4d68-ab27-227e09e8bf37"
    os.makedirs(output_dir, exist_ok=True)
    
    pages = ["terms", "privacy", "copyright"]
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        for pg in pages:
            # Desktop Capture
            await capture_legal_page(page, pg, "desktop", 1440, 900, output_dir)
            # Mobile Capture
            await capture_legal_page(page, pg, "mobile", 375, 812, output_dir)
            
        await browser.close()
    print("All legal pages successfully captured!")

if __name__ == "__main__":
    asyncio.run(main())
