import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { critiqueVideo } from "../../lib/gemini.js";

export const critiqueVideoTool = tool(
  "critique_video",
  "Send a rendered video to Gemini Video Understanding for quality review. Returns scores on pacing, visual coherence, data accuracy, audio sync, and overall quality.",
  {
    videoPath: z.string().describe("Path to the rendered MP4 file"),
  },
  async ({ videoPath }) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY not set");
    const critique = await critiqueVideo(videoPath, apiKey);
    return { content: [{ type: "text" as const, text: JSON.stringify(critique, null, 2) }] };
  },
  { annotations: { readOnlyHint: true } }
);
