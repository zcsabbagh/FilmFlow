import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const pexelsSearchTool = tool(
  "search_pexels",
  "Search Pexels for free stock photos and videos. No attribution required (CC0). Returns URLs and metadata. Use for B-roll backgrounds, establishing shots, and contextual imagery.",
  {
    query: z.string().describe("Search query (e.g. 'hospital corridor', 'fast food restaurant')"),
    type: z.enum(["photos", "videos"]).optional().default("photos").describe("Search for photos or videos"),
    perPage: z.number().optional().default(5).describe("Number of results (max 15)"),
  },
  async ({ query, type, perPage }) => {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) throw new Error("PEXELS_API_KEY not set");

    const endpoint = type === "videos"
      ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`
      : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;

    const res = await fetch(endpoint, { headers: { Authorization: apiKey } });
    if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
    const data = await res.json();

    if (type === "videos") {
      const results = (data.videos || []).map((v: any) => ({
        id: v.id,
        url: v.url,
        duration: v.duration,
        width: v.width,
        height: v.height,
        downloadUrl: v.video_files?.find((f: any) => f.quality === "hd")?.link || v.video_files?.[0]?.link,
        photographer: v.user?.name,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
    } else {
      const results = (data.photos || []).map((p: any) => ({
        id: p.id,
        url: p.url,
        width: p.width,
        height: p.height,
        downloadUrl: p.src?.large2x || p.src?.original,
        photographer: p.photographer,
        alt: p.alt,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
    }
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);

export const pexelsDownloadTool = tool(
  "download_pexels",
  "Download a photo or video from Pexels by its URL. Use after search_pexels to save media locally.",
  {
    url: z.string().url().describe("The download URL from search_pexels results"),
    outputDir: z.string().describe("Directory to save the file"),
    filename: z.string().describe("Output filename (e.g. 'hospital-bg.jpg' or 'city-broll.mp4')"),
  },
  async ({ url, outputDir, filename }) => {
    const apiKey = process.env.PEXELS_API_KEY;
    await mkdir(outputDir, { recursive: true });
    const res = await fetch(url, apiKey ? { headers: { Authorization: apiKey } } : {});
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const outputPath = join(outputDir, filename);
    await writeFile(outputPath, buffer);
    return { content: [{ type: "text" as const, text: JSON.stringify({ path: outputPath, sizeBytes: buffer.length }) }] };
  }
);
