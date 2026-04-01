import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateSpeech } from "../../lib/elevenlabs.js";

export const generateVoiceoverTool = tool(
  "generate_voiceover",
  "Generate narration audio from script text using ElevenLabs TTS. Returns the file path and estimated duration.",
  {
    text: z.string().describe("The narration script text to convert to speech"),
    outputDir: z.string().describe("Directory to save the audio file"),
    filename: z.string().describe("Output filename (e.g. 'scene01_narration.mp3')"),
  },
  async ({ text, outputDir, filename }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");
    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, filename);
    const { audio } = await generateSpeech(text, apiKey);
    await writeFile(outputPath, audio);
    const wordCount = text.split(/\s+/).length;
    const estimatedDurationSeconds = Math.ceil((wordCount / 150) * 60);
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ path: outputPath, wordCount, estimatedDurationSeconds }),
      }],
    };
  }
);
