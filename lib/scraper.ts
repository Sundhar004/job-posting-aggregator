import * as cheerio from 'cheerio';

const SCRAPE_TIMEOUT_MS = 10_000;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function scrapeUrl(url: string): Promise<string> {
  let html: string;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} when fetching ${url}`);
    }

    html = await res.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fetch URL: ${msg}`);
  }

  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, noscript, header, footer, nav, aside, [role="banner"], [role="navigation"], [role="complementary"], iframe, img, svg').remove();

  // Try to find main content area first
  const selectors = [
    'main',
    'article',
    '[class*="job-description"]',
    '[class*="description"]',
    '[class*="content"]',
    '[id*="job-description"]',
    '[id*="description"]',
    'body',
  ];

  let text = '';
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length) {
      text = el.text();
      if (text.trim().length > 200) break;
    }
  }

  // Normalise whitespace
  text = text
    .replace(/\t/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (text.length < 50) {
    throw new Error('Could not extract meaningful text from this URL. Please paste the job description manually.');
  }

  // Truncate to 8 000 chars to keep within Gemini context limits
  return text.slice(0, 8_000);
}
