import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const wikimediaImageTool = tool(
  "fetch_wikimedia_image",
  "Search Wikimedia Commons for historical images and photos, then download them. Great for finding public domain images of historical figures, events, places, and objects. Returns the file path of the downloaded image.",
  {
    query: z.string().describe("Search query (e.g. 'Abraham Lincoln portrait', 'Golden Gate Bridge construction')"),
    outputDir: z.string().describe("Directory to save the image"),
    filename: z.string().optional().describe("Output filename (auto-generated if not provided)"),
    maxWidth: z.number().optional().default(1920).describe("Maximum image width in pixels"),
  },
  async ({ query, outputDir, filename, maxWidth }) => {
    // Step 1: Search Wikimedia Commons
    const searchParams = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrnamespace: "6", // File namespace
      gsrsearch: query,
      gsrlimit: "5",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: String(maxWidth),
    });

    const searchRes = await fetch(
      `https://commons.wikimedia.org/w/api.php?${searchParams}`
    );
    if (!searchRes.ok) {
      throw new Error(`Wikimedia search failed: ${searchRes.status}`);
    }

    const searchData = await searchRes.json();
    const pages = searchData.query?.pages;

    if (!pages || Object.keys(pages).length === 0) {
      throw new Error(`No images found for: ${query}`);
    }

    // Pick the first result with a valid image URL
    let imageUrl: string | null = null;
    let imageTitle = "";
    let imageLicense = "";
    let imageDescription = "";

    for (const page of Object.values(pages) as any[]) {
      const info = page.imageinfo?.[0];
      if (info && info.mime?.startsWith("image/")) {
        // Use the thumbnail URL if available (respects maxWidth), otherwise original
        imageUrl = info.thumburl || info.url;
        imageTitle = page.title?.replace("File:", "") || "image";
        const meta = info.extmetadata || {};
        imageLicense = meta.LicenseShortName?.value || "Unknown";
        imageDescription = meta.ImageDescription?.value?.replace(/<[^>]*>/g, "") || "";
        break;
      }
    }

    if (!imageUrl) {
      throw new Error(`No downloadable image found for: ${query}`);
    }

    // Step 2: Download the image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to download image: ${imgRes.status}`);
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    await mkdir(outputDir, { recursive: true });

    // Generate filename from title if not provided
    const ext = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
    const outFilename =
      filename ||
      imageTitle
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 60) + `.${ext}`;

    const outputPath = join(outputDir, outFilename);
    await writeFile(outputPath, buffer);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              path: outputPath,
              title: imageTitle,
              license: imageLicense,
              description: imageDescription.slice(0, 200),
              sizeBytes: buffer.length,
              sourceUrl: imageUrl,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);
