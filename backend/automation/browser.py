import webbrowser
import logging
import urllib.parse
from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)

def open_url(url: str) -> bool:
    try:
        # Standardize URL
        if not url.startswith('http://') and not url.startswith('https://'):
            url = 'https://' + url
        webbrowser.open(url)
        logger.info(f"Opened URL: {url}")
        return True
    except Exception as e:
        logger.error(f"Failed to open URL {url}: {e}")
        return False

def search_google(query: str) -> bool:
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://www.google.com/search?q={encoded_query}"
        return open_url(url)
    except Exception as e:
        logger.error(f"Failed to search Google: {e}")
        return False

def run_playwright_search(query: str, site: str = "google.com") -> dict:
    """Uses Playwright to perform a search, scrape top titles/URLs, and return them.
    This demonstrates real browser scraping and automation."""
    try:
        with sync_playwright() as p:
            # Launch browser (headed=False for background scraping)
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            if "google" in site:
                page.goto("https://www.google.com")
                # Wait for search box, fill, and press enter
                # Google search box usually has name="q"
                page.fill('textarea[name="q"]', query)
                page.press('textarea[name="q"]', 'Enter')
                page.wait_for_selector('#search')
                
                # Extract results
                results = []
                elements = page.query_selector_all('div.g')[:5]
                for idx, el in enumerate(elements):
                    title_el = el.query_selector('h3')
                    link_el = el.query_selector('a')
                    if title_el and link_el:
                        results.append({
                            "title": title_el.inner_text(),
                            "url": link_el.get_attribute('href')
                        })
                browser.close()
                return {"success": True, "results": results}
            elif "youtube" in site:
                page.goto("https://www.youtube.com")
                page.fill('input[name="search_query"]', query)
                page.press('input[name="search_query"]', 'Enter')
                page.wait_for_selector('ytd-video-renderer')
                
                # Get first video details
                video_el = page.query_selector('ytd-video-renderer')
                title_el = video_el.query_selector('#video-title')
                link = title_el.get_attribute('href') if title_el else ""
                full_url = f"https://www.youtube.com{link}" if link else ""
                title = title_el.inner_text() if title_el else "Unknown Video"
                
                browser.close()
                
                # Open the video in the default user browser for them to watch
                if full_url:
                    open_url(full_url)
                return {"success": True, "results": [{"title": title, "url": full_url}]}
                
            browser.close()
            return {"success": False, "error": "Unsupported search site"}
    except Exception as e:
        logger.error(f"Playwright automation error: {e}")
        # Fallback to standard webbrowser search
        search_google(query)
        return {"success": False, "error": str(e), "fallback": True}
