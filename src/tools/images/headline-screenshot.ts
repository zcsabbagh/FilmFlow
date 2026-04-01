import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { mkdir } from "fs/promises";
import { join } from "path";

export const headlineScreenshotTool = tool(
  "screenshot_headline",
  `Screenshot a news article's headline area with optional yellow highlight marker effect.
Handles cookie popups, consent banners, and paywalls automatically.
Captures the headline, subtitle, lead image, and byline as a clean clip.`,
  {
    url: z.string().url().describe("URL of the news article"),
    highlightText: z.string().optional().describe("Text to highlight with yellow marker (optional)"),
    outputDir: z.string().describe("Directory to save the screenshot"),
    filename: z.string().optional().describe("Output filename (default: headline_screenshot.png)"),
    fullArticleTop: z.boolean().optional().default(false).describe("Capture the full top of the article (headline + image + first paragraph) instead of just the headline"),
  },
  async ({ url, highlightText, outputDir, filename, fullArticleTop }) => {
    const { chromium } = await import("playwright");

    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, filename || "headline_screenshot.png");

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "America/New_York",
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "Upgrade-Insecure-Requests": "1",
      },
    });

    // Stealth: hide automation indicators from bot detection (NYT, New Yorker, etc.)
    await context.addInitScript(() => {
      // Remove webdriver flag — primary bot detection signal
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      // Fake plugins array (empty array is a bot signal)
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
      // Override languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      // Fake chrome runtime object
      // @ts-ignore
      window.chrome = { runtime: {} };
      // Override permissions query for notifications
      const originalQuery = window.navigator.permissions.query;
      // @ts-ignore
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === "notifications"
          ? Promise.resolve({
              state: Notification.permission,
            } as PermissionStatus)
          : originalQuery(parameters);
    });

    const page = await context.newPage();

    // Block unnecessary resources to speed up loading
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (["media", "font", "stylesheet"].includes(type)) {
        // Allow stylesheets but block heavy media
        if (type === "media") return route.abort();
      }
      return route.continue();
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // ── Step 1: Dismiss cookie popups, consent banners, and paywalls ──
    await page.evaluate(() => {
      // Common cookie/consent selectors to click "Accept" or dismiss
      const acceptSelectors = [
        // Generic consent buttons
        'button[id*="accept"]',
        'button[class*="accept"]',
        'button[class*="consent"]',
        'button[id*="consent"]',
        'button[class*="agree"]',
        'a[id*="accept"]',
        '[data-testid*="accept"]',
        '[data-testid*="ACCEPT"]',
        // GDPR / cookie specific
        '#onetrust-accept-btn-handler',
        '.onetrust-accept-btn-handler',
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        '#sp_message_iframe_*',
        '.fc-cta-consent',
        '.cc-btn.cc-allow',
        '#cookie-consent-accept',
        '.cookie-consent-accept',
        '.js-cookie-consent-agree',
        // "Continue" / "Got it" buttons
        'button[class*="continue"]',
        'button[class*="got-it"]',
        'button[class*="dismiss"]',
        'button[class*="close"]',
      ];

      for (const sel of acceptSelectors) {
        try {
          const btn = document.querySelector(sel) as HTMLElement;
          if (btn && btn.offsetParent !== null) {
            btn.click();
            break;
          }
        } catch {
          // ignore
        }
      }

      // Remove common overlay/modal elements entirely
      const overlaySelectors = [
        '[class*="cookie"]',
        '[class*="consent"]',
        '[id*="cookie"]',
        '[id*="consent"]',
        '[class*="gdpr"]',
        '[class*="paywall"]',
        '[class*="subscriber"]',
        '[class*="overlay"]',
        '[class*="modal"]',
        '[class*="popup"]',
        '[id*="onetrust"]',
        '[id*="sp_message"]',
        ".fc-consent-root",
        "#credential_picker_container",
        "[role=dialog]",
      ];

      for (const sel of overlaySelectors) {
        document.querySelectorAll(sel).forEach((el) => {
          const elem = el as HTMLElement;
          // Only remove if it looks like a popup (fixed/absolute positioned, covers the page)
          const style = window.getComputedStyle(elem);
          if (
            style.position === "fixed" ||
            style.position === "absolute" ||
            style.position === "sticky" ||
            elem.style.zIndex > "100"
          ) {
            elem.remove();
          }
        });
      }

      // Remove any remaining fixed-position elements that might block the view
      document.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          style.position === "fixed" &&
          el.tagName !== "NAV" &&
          el.tagName !== "HEADER"
        ) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          // If it covers more than 30% of the viewport, remove it
          if (
            rect.width > window.innerWidth * 0.3 &&
            rect.height > window.innerHeight * 0.3
          ) {
            (el as HTMLElement).remove();
          }
        }
      });

      // Restore scrolling (paywalls often disable it)
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    });

    await page.waitForTimeout(500);

    // ── Step 2: Apply yellow highlight if requested ──
    if (highlightText) {
      await page.evaluate((textToHighlight: string) => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );

        let found = false;
        let node: Text | null;
        while ((node = walker.nextNode() as Text | null)) {
          if (!node.textContent) continue;

          // Case-insensitive search
          const idx = node.textContent
            .toLowerCase()
            .indexOf(textToHighlight.toLowerCase());
          if (idx === -1) continue;

          const parent = node.parentElement;
          if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE")
            continue;

          const text = node.textContent;
          const match = text.slice(idx, idx + textToHighlight.length);

          const span = document.createElement("span");
          span.style.cssText = `
            background: linear-gradient(180deg, transparent 40%, #ffe135 40%, #ffe135 85%, transparent 85%);
            padding: 0 6px;
            margin: 0 -6px;
            display: inline;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
          `;
          span.textContent = match;

          const fragment = document.createDocumentFragment();
          const before = text.slice(0, idx);
          const after = text.slice(idx + textToHighlight.length);
          if (before) fragment.appendChild(document.createTextNode(before));
          fragment.appendChild(span);
          if (after) fragment.appendChild(document.createTextNode(after));

          parent.replaceChild(fragment, node);
          found = true;
          break;
        }

        if (!found) {
          console.warn(`Highlight text not found: "${textToHighlight}"`);
        }
      }, highlightText);
    }

    // ── Step 3: Find and screenshot the article header area ──
    const headlineSelectors = [
      "h1",
      '[data-testid="headline"]',
      ".headline",
      ".article-title",
      "article h1",
      ".post-title",
      ".entry-title",
      ".story-title",
      '[itemprop="headline"]',
    ];

    let headlineElement = null;
    for (const selector of headlineSelectors) {
      headlineElement = await page.$(selector);
      if (headlineElement) break;
    }

    if (headlineElement) {
      const box = await headlineElement.boundingBox();
      if (box) {
        let captureBottom = box.y + box.height;

        if (fullArticleTop) {
          // Capture headline + subtitle + lead image + first paragraph
          const extraSelectors = [
            "h1 + p",
            "h1 ~ p",
            "h1 ~ .subtitle",
            "h1 ~ .deck",
            "h1 ~ .summary",
            '[data-testid="subtitle"]',
            ".article-subtitle",
            ".article-dek",
            "article img",
            ".lead-image",
            ".featured-image",
            "figure img",
            ".byline",
            ".article-byline",
            "time",
          ];

          for (const sel of extraSelectors) {
            const elements = await page.$$(sel);
            for (const el of elements.slice(0, 3)) {
              const elBox = await el.boundingBox();
              if (elBox && elBox.y < box.y + 800) {
                captureBottom = Math.max(captureBottom, elBox.y + elBox.height);
              }
            }
          }
        } else {
          // Just headline + subtitle
          const subtitleSelectors = [
            "h1 + p",
            "h1 ~ .subtitle",
            "h1 ~ .deck",
            '[data-testid="subtitle"]',
            ".article-subtitle",
          ];
          for (const sel of subtitleSelectors) {
            const sub = await page.$(sel);
            if (sub) {
              const subBox = await sub.boundingBox();
              if (subBox && subBox.y < box.y + box.height + 200) {
                captureBottom = Math.max(captureBottom, subBox.y + subBox.height);
              }
            }
          }
        }

        const clipX = Math.max(0, box.x - 60);
        const clipY = Math.max(0, box.y - 40);
        const clipWidth = Math.min(1920, box.width + 120);
        const clipHeight = captureBottom - box.y + 80;

        await page.screenshot({
          path: outputPath,
          clip: {
            x: clipX,
            y: clipY,
            width: clipWidth,
            height: Math.min(clipHeight, 1200), // Cap at reasonable height
          },
        });
      } else {
        await page.screenshot({
          path: outputPath,
          clip: { x: 0, y: 0, width: 1920, height: 700 },
        });
      }
    } else {
      // No headline found — screenshot the full top of the page
      await page.screenshot({
        path: outputPath,
        clip: { x: 0, y: 0, width: 1920, height: 700 },
      });
    }

    await browser.close();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            path: outputPath,
            url,
            highlightedText: highlightText || null,
            fullArticleTop,
          }),
        },
      ],
    };
  }
);
