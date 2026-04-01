import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { searchYouTube } from "../../lib/youtube.js";

export const youtubeSearchTool = tool(
  "youtube_search",
  "Search YouTube for videos on a topic. Returns video IDs, titles, channels, and descriptions. Use this to find source material for the video.",
  {
    query: z.string().describe("Search query for YouTube"),
    maxResults: z.number().optional().default(10).describe("Max results to return (default 10)"),
  },
  async ({ query, maxResults }) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YOUTUBE_API_KEY not set");
    const results = await searchYouTube(query, apiKey, maxResults);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
