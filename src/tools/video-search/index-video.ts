import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";

export const indexVideoTool = tool(
  "index_video",
  "Index a video file for semantic visual search using SentrySearch. Chunks the video and embeds each segment using Gemini Embedding 2. After indexing, use visual_search to find specific moments.",
  {
    videoPath: z.string().describe("Path to the video file to index"),
  },
  async ({ videoPath }) => {
    try {
      const output = execSync(`sentrysearch index "${videoPath}"`, {
        stdio: "pipe",
        timeout: 300_000,
        env: { ...process.env },
      });
      return {
        content: [{ type: "text" as const, text: `Successfully indexed: ${videoPath}\n${output.toString()}` }],
      };
    } catch (e: any) {
      throw new Error(`SentrySearch index failed: ${e.stderr?.toString() || e.message}`);
    }
  }
);
