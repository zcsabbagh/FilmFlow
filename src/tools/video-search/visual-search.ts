import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";

export const visualSearchTool = tool(
  "visual_search",
  "Search indexed videos for visually matching moments using natural language. Returns the best matching clip. The video must have been indexed first with index_video.",
  {
    query: z.string().describe("Natural language description of the visual content to find (e.g. 'traffic congestion on a highway')"),
  },
  async ({ query }) => {
    try {
      const output = execSync(`sentrysearch search "${query}"`, {
        stdio: "pipe",
        timeout: 60_000,
        env: { ...process.env },
      });
      return {
        content: [{ type: "text" as const, text: output.toString() }],
      };
    } catch (e: any) {
      throw new Error(`SentrySearch query failed: ${e.stderr?.toString() || e.message}`);
    }
  },
  { annotations: { readOnlyHint: true } }
);
