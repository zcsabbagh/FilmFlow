import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";
import { join } from "path";

export const renderVideoTool = tool(
  "render_video",
  "Render the full Remotion project to MP4. Call after all scenes are composed in the timeline.",
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    outputFilename: z.string().optional().default("video.mp4").describe("Output filename"),
  },
  async ({ projectDir, outputFilename }) => {
    const outputPath = join(projectDir, "out", outputFilename);
    try {
      execSync(`cd "${projectDir}" && bun install`, { stdio: "pipe", timeout: 120_000 });
    } catch { /* deps might already be installed */ }
    const cmd = `cd "${projectDir}" && npx remotion render Root "${outputPath}"`;
    try {
      const output = execSync(cmd, { stdio: "pipe", timeout: 600_000 });
      return { content: [{ type: "text" as const, text: JSON.stringify({ path: outputPath, status: "success", log: output.toString().slice(-500) }) }] };
    } catch (e: any) {
      throw new Error(`Remotion render failed: ${e.stderr?.toString() || e.message}`);
    }
  }
);
