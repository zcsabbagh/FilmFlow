import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile } from "fs/promises";
import { join } from "path";

export const addToTimelineTool = tool(
  "add_to_timeline",
  "Rewrite Root.tsx to compose all scenes into the video timeline. Pass all scenes in order with their durations.",
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    scenes: z.array(z.object({
      filename: z.string().describe("Scene filename without extension (e.g. 'Scene01-Intro')"),
      durationInFrames: z.number().describe("Duration of this scene in frames (30fps)"),
      audioPath: z.string().optional().describe("Path to audio file relative to public/"),
    })).describe("Ordered list of scenes"),
    fps: z.number().optional().default(30).describe("Frames per second (default 30)"),
  },
  async ({ projectDir, scenes, fps }) => {
    const totalFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
    const imports = scenes.map((s) => `import { Scene as ${s.filename.replace(/-/g, "_")} } from "./scenes/${s.filename}";`).join("\n");
    let offset = 0;
    const sequences = scenes.map((s) => {
      const componentName = s.filename.replace(/-/g, "_");
      const audioTag = s.audioPath ? `\n        <Audio src={staticFile("${s.audioPath}")} />` : "";
      const seq = `      <Sequence from={${offset}} durationInFrames={${s.durationInFrames}}>\n        <${componentName} />${audioTag}\n      </Sequence>`;
      offset += s.durationInFrames;
      return seq;
    });
    const code = `import { Composition, Sequence, Audio, staticFile } from "remotion";\nimport { tokens } from "./tokens";\n${imports}\n\nconst MainVideo: React.FC = () => {\n  return (\n    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background }}>\n${sequences.join("\n")}\n    </div>\n  );\n};\n\nexport const RemotionRoot: React.FC = () => {\n  return (\n    <Composition\n      id="Root"\n      component={MainVideo}\n      durationInFrames={${totalFrames}}\n      fps={${fps}}\n      width={tokens.layout.width}\n      height={tokens.layout.height}\n    />\n  );\n};\n`;
    const rootPath = join(projectDir, "src", "Root.tsx");
    await writeFile(rootPath, code);
    return { content: [{ type: "text" as const, text: JSON.stringify({ path: rootPath, totalFrames, totalDurationSeconds: Math.round(totalFrames / fps), sceneCount: scenes.length }) }] };
  }
);
