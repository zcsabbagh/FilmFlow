import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";
import { join } from "path";

export const previewSceneTool = tool(
  "preview_scene",
  "Render a single frame from the Remotion project as a PNG screenshot for verification.",
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    frame: z.number().optional().default(30).describe("Which frame to render (default 30)"),
    outputPath: z.string().optional().describe("Output path for PNG"),
  },
  async ({ projectDir, frame, outputPath }) => {
    const out = outputPath || join(projectDir, "out", "preview.png");
    const cmd = `cd "${projectDir}" && npx remotion still Root "${out}" --frame=${frame}`;
    try {
      execSync(cmd, { stdio: "pipe", timeout: 60_000 });
    } catch (e: any) {
      throw new Error(`Remotion still failed: ${e.stderr?.toString() || e.message}`);
    }
    return { content: [{ type: "text" as const, text: JSON.stringify({ path: out, frame }) }] };
  },
  { annotations: { readOnlyHint: true } }
);
