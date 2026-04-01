import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const pixabaySearchTool = tool(
  "search_pixabay",
  "Search Pixabay for free stock photos, illustrations, videos, and music. Royalty-free. Returns URLs and metadata.",
  {
    query: z.string().describe("Search query"),
    type: z.enum(["photo", "illustration", "vector", "video", "music"]).optional().default("photo"),
    perPage: z.number().optional().default(5),
  },
  async ({ query, type, perPage }) => {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) throw new Error("PIXABAY_API_KEY not set");

    if (type === "video") {
      const res = await fetch(`https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${perPage}`);
      if (!res.ok) throw new Error(`Pixabay error: ${res.status}`);
      const data = await res.json();
      const results = (data.hits || []).map((v: any) => ({
        id: v.id,
        tags: v.tags,
        duration: v.duration,
        downloadUrl: v.videos?.large?.url || v.videos?.medium?.url,
        user: v.user,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
    } else if (type === "music") {
      // Pixabay music API
      const res = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&media_type=music&per_page=${perPage}`);
      if (!res.ok) throw new Error(`Pixabay error: ${res.status}`);
      const data = await res.json();
      return { content: [{ type: "text" as const, text: JSON.stringify(data.hits?.slice(0, perPage) || [], null, 2) }] };
    } else {
      const imageType = type === "photo" ? "photo" : type === "illustration" ? "illustration" : "vector";
      const res = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=${imageType}&per_page=${perPage}`);
      if (!res.ok) throw new Error(`Pixabay error: ${res.status}`);
      const data = await res.json();
      const results = (data.hits || []).map((p: any) => ({
        id: p.id,
        tags: p.tags,
        width: p.imageWidth,
        height: p.imageHeight,
        downloadUrl: p.largeImageURL,
        user: p.user,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
    }
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
