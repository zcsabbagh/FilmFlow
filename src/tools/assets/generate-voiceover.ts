import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateSpeechWithTiming } from "../../lib/elevenlabs.js";

export const generateVoiceoverTool = tool(
  "generate_voiceover",
  `Generate narration audio from script text using ElevenLabs TTS.
Returns the audio file path, exact duration, and word-level timing data.
Use the word timing to sync animations precisely with the narration —
each word has startSeconds and endSeconds so you know exactly when
"four hundred and thirty-five" is spoken and can animate the number at that moment.`,
  {
    text: z.string().describe("The narration script text to convert to speech"),
    outputDir: z.string().describe("Directory to save the audio and timing files"),
    filename: z.string().describe("Output filename for audio (e.g. 'scene01_narration.mp3')"),
  },
  async ({ text, outputDir, filename }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

    await mkdir(outputDir, { recursive: true });

    const audioPath = join(outputDir, filename);
    const timingFilename = filename.replace(/\.[^.]+$/, ".timing.json");
    const timingPath = join(outputDir, timingFilename);

    const { audio, words, durationSeconds } = await generateSpeechWithTiming(
      text,
      apiKey
    );

    // Save audio
    await writeFile(audioPath, audio);

    // Save word timing as JSON (the agent can read this to sync animations)
    await writeFile(timingPath, JSON.stringify({ words, durationSeconds }, null, 2));

    // Calculate frames at 30fps for convenience
    const durationFrames = Math.ceil(durationSeconds * 30);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            audioPath,
            timingPath,
            durationSeconds: Math.round(durationSeconds * 100) / 100,
            durationFrames,
            wordCount: words.length,
            // Include a summary of key timing points so the agent can use them directly
            words: words.map((w) => ({
              word: w.word,
              startFrame: Math.round(w.startSeconds * 30),
              endFrame: Math.round(w.endSeconds * 30),
            })),
          }),
        },
      ],
    };
  }
);
