import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { mkdir } from "fs/promises";
import { join } from "path";

export const headlineScreenshotTool = tool(
  "screenshot_headline",
  "Screenshot a news article's headline with yellow highlight marker effect on specified text. Uses Playwright to render the page and apply highlights. Returns the screenshot file path.",
  {
    url: z.string().url().describe("URL of the news article"),
    highlightText: z.string().describe("Text within the headline to highlight with yellow marker"),
    outputDir: z.string().describe("Directory to save the screenshot"),
    filename: z.string().optional().describe("Output filename (default: headline_screenshot.png)"),
    viewport: z.object({
      width: z.number().optional().default(1920),
      height: z.number().optional().default(1080),
    }).optional().describe("Viewport size"),
  },
  async ({ url, highlightText, outputDir, filename, viewport }) => {
    const { chromium } = await import("playwright");

    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, filename || "headline_screenshot.png");

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: {
        width: viewport?.width || 1920,
        height: viewport?.height || 1080,
      },
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for content to render
    await page.waitForTimeout(2000);

    // Inject highlight effect — find the text and wrap it with a yellow marker span
    await page.evaluate((textToHighlight: string) => {
      // Find all text nodes containing the highlight text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        if (node.textContent && node.textContent.includes(textToHighlight)) {
          textNodes.push(node);
        }
      }

      // If exact match not found, try case-insensitive
      if (textNodes.length === 0) {
        const walker2 = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );
        while ((node = walker2.nextNode() as Text | null)) {
          if (
            node.textContent &&
            node.textContent.toLowerCase().includes(textToHighlight.toLowerCase())
          ) {
            textNodes.push(node);
          }
        }
      }

      for (const textNode of textNodes) {
        const parent = textNode.parentElement;
        if (!parent) continue;

        const text = textNode.textContent || "";
        const idx = text.toLowerCase().indexOf(textToHighlight.toLowerCase());
        if (idx === -1) continue;

        const before = text.slice(0, idx);
        const match = text.slice(idx, idx + textToHighlight.length);
        const after = text.slice(idx + textToHighlight.length);

        const span = document.createElement("span");
        span.style.cssText = `
          background: linear-gradient(180deg, transparent 45%, #ffe135 45%, #ffe135 90%, transparent 90%);
          padding: 0 4px;
          margin: 0 -4px;
          display: inline;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        `;
        span.textContent = match;

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(span);
        if (after) fragment.appendChild(document.createTextNode(after));

        parent.replaceChild(fragment, textNode);
        break; // Only highlight first occurrence
      }
    }, highlightText);

    // Find the headline element and screenshot just that area
    // Try common headline selectors
    const headlineSelectors = [
      "h1",
      '[data-testid="headline"]',
      ".headline",
      ".article-title",
      "article h1",
      ".post-title",
    ];

    let headlineElement = null;
    for (const selector of headlineSelectors) {
      headlineElement = await page.$(selector);
      if (headlineElement) break;
    }

    if (headlineElement) {
      // Get bounding box and add some padding
      const box = await headlineElement.boundingBox();
      if (box) {
        // Also try to include the subtitle/deck if it's right below
        const subtitleSelectors = [
          "h1 + p",
          "h1 ~ .subtitle",
          "h1 ~ .deck",
          '[data-testid="subtitle"]',
          ".article-subtitle",
        ];
        let maxBottom = box.y + box.height;

        for (const sel of subtitleSelectors) {
          const sub = await page.$(sel);
          if (sub) {
            const subBox = await sub.boundingBox();
            if (subBox && subBox.y < box.y + box.height + 200) {
              maxBottom = Math.max(maxBottom, subBox.y + subBox.height);
            }
          }
        }

        await page.screenshot({
          path: outputPath,
          clip: {
            x: Math.max(0, box.x - 60),
            y: Math.max(0, box.y - 40),
            width: Math.min(viewport?.width || 1920, box.width + 120),
            height: maxBottom - box.y + 80,
          },
        });
      } else {
        // Fallback: screenshot top of page
        await page.screenshot({
          path: outputPath,
          clip: { x: 0, y: 0, width: viewport?.width || 1920, height: 600 },
        });
      }
    } else {
      // No headline found — screenshot top of page
      await page.screenshot({
        path: outputPath,
        clip: { x: 0, y: 0, width: viewport?.width || 1920, height: 600 },
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
            highlightedText: highlightText,
          }),
        },
      ],
    };
  }
);
