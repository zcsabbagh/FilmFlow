import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const locSearchTool = tool(
  "search_library_of_congress",
  "Search the Library of Congress for historical photos, maps, newspapers, and documents. Public domain, no API key needed. Great for historical context imagery.",
  {
    query: z.string().describe("Search query (e.g. 'Great Depression breadline', 'civil rights march 1963')"),
    type: z.enum(["photos", "maps", "newspapers", "all"]).optional().default("photos"),
    count: z.number().optional().default(5),
  },
  async ({ query, type, count }) => {
    const faParam = type === "photos" ? "&fa=online-format:image"
      : type === "maps" ? "&fa=online-format:map"
      : type === "newspapers" ? "&fa=partof:chronicling+america"
      : "";

    const res = await fetch(
      `https://www.loc.gov/search/?q=${encodeURIComponent(query)}${faParam}&fo=json&c=${count}`
    );
    if (!res.ok) throw new Error(`LOC API error: ${res.status}`);
    const data = await res.json();

    const results = (data.results || []).map((item: any) => ({
      title: item.title,
      date: item.date,
      url: item.url,
      imageUrl: item.image_url?.[0] || null,
      description: item.description?.[0]?.slice(0, 200) || "",
      rights: "Public Domain (Library of Congress)",
    }));

    return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);

export const locDownloadTool = tool(
  "download_loc_image",
  "Download an image from the Library of Congress. No API key needed, public domain.",
  {
    imageUrl: z.string().url().describe("Image URL from search_library_of_congress results"),
    outputDir: z.string().describe("Directory to save the image"),
    filename: z.string().describe("Output filename"),
  },
  async ({ imageUrl, outputDir, filename }) => {
    await mkdir(outputDir, { recursive: true });
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const outputPath = join(outputDir, filename);
    await writeFile(outputPath, buffer);
    return { content: [{ type: "text" as const, text: JSON.stringify({ path: outputPath, sizeBytes: buffer.length, rights: "Public Domain" }) }] };
  }
);
