import asyncio
import os
from playwright.async_api import async_playwright

async def capture_alert(page, device_name, width, height, output_dir):
    print(f"Setting viewport to {width}x{height} for {device_name}...")
    await page.set_viewport_size({"width": width, "height": height})
    await page.goto("http://localhost:8000/")
    await page.wait_for_timeout(2000)
    
    # 1. 설문조사 섹션으로 스크롤
    await page.evaluate("document.getElementById('waitlist-section').scrollIntoView();")
    await page.wait_for_timeout(1000)
    
    # 2. 아무것도 답변하지 않고 "다음" 버튼 클릭
    print("Clicking next-step button to trigger custom alert...")
    await page.click("#onboarding-form .next-step")
    await page.wait_for_timeout(1000) # Wait for scale/fade modal animation to finish
    
    # 3. 캡처 저장
    output_path = os.path.join(output_dir, f"alert_{device_name}.png")
    await page.screenshot(path=output_path, full_page=False)
    print(f"Captured alert screenshot for {device_name} to {output_path}")

async def main():
    # Save directly to the conversation's brain artifact directory for Walkthrough embedding
    output_dir = r"C:\Users\freef\.gemini\antigravity\brain\89e236c6-7361-4d68-ab27-227e09e8bf37"
    os.makedirs(output_dir, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Desktop custom alert capture
        await capture_alert(page, "desktop", 1440, 900, output_dir)
        
        # Mobile custom alert capture
        await capture_alert(page, "mobile", 375, 812, output_dir)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
