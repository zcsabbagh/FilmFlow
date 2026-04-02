import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const generateSfxTool = tool(
  "generate_sound_effect",
  `Generate a sound effect from a text prompt using ElevenLabs SFX v2.
Use for transition whooshes, data reveal impacts, ambient backgrounds, UI sounds.

Common prompts for video transitions:
- "subtle whoosh transition" — for scene changes
- "soft digital reveal impact" — for number/stat reveals
- "gentle paper slide" — for text appearing
- "low ambient hum" — for background atmosphere
- "quick snap click" — for data point appearing
- "dramatic bass drop impact" — for shocking stat reveals`,
  {
    prompt: z.string().describe("Description of the sound effect (e.g. 'subtle whoosh transition')"),
    outputDir: z.string().describe("Directory to save the audio file"),
    filename: z.string().describe("Output filename (e.g. 'whoosh.mp3')"),
    durationSeconds: z.number().optional().describe("Duration in seconds (0.5-30, auto if omitted)"),
    loop: z.boolean().optional().default(false).describe("Create a looping sound effect"),
  },
  async ({ prompt, outputDir, filename, durationSeconds, loop }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, filename);

    const body: Record<string, unknown> = {
      text: prompt,
      model_id: "eleven_text_to_sound_v2",
      prompt_influence: 0.3,
    };
    if (durationSeconds) body.duration_seconds = durationSeconds;
    if (loop) body.loop = true;

    const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs SFX error: ${res.status} ${await res.text()}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(outputPath, buffer);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            path: outputPath,
            sizeBytes: buffer.length,
            prompt,
            loop,
          }),
        },
      ],
    };
  }
);
