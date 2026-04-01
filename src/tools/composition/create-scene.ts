import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const createSceneTool = tool(
  "create_scene",
  "Write a Remotion React component for a video scene. Saved to the project's scenes/ directory. Write valid TSX importing from 'remotion' and '../tokens'.",
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    filename: z.string().describe("Scene filename (e.g. 'Scene01-Intro.tsx')"),
    code: z.string().describe("Complete TSX source code for the scene component"),
  },
  async ({ projectDir, filename, code }) => {
    const scenesDir = join(projectDir, "src", "scenes");
    await mkdir(scenesDir, { recursive: true });
    const filePath = join(scenesDir, filename);
    await writeFile(filePath, code);
    return { content: [{ type: "text" as const, text: JSON.stringify({ path: filePath, filename }) }] };
  }
);
