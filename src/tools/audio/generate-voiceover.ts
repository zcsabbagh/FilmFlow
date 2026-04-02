import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const generateVoiceoverTool = tool(
  "generate_voiceover",
  `Generate narration audio from script text using ElevenLabs v3 TTS with emotional audio tags.
Returns the audio file path, exact duration, and word-level timing data.

ALWAYS use v3 with audio tags for emotional delivery:
[sighs], [excited], [whispers], [sad], [laughs], [serious], [curious], [angry], [pause]

Example: "[serious] The federal minimum wage [pause] is seven dollars and twenty-five cents."

Default speed is 1.15x (slightly faster for punchy delivery). Adjust with the speed parameter.

Available voices:
- "narrator-male" (default) — Joseph, British male, authoritative
- "narrator-female" — Dorothy, British female, clear and warm
- Custom voice ID string`,
  {
    text: z.string().describe("Narration text with inline audio tags like [pause], [serious], [sighs]"),
    outputDir: z.string().describe("Directory to save audio + timing files"),
    filename: z.string().describe("Output filename (e.g. 'scene01.mp3')"),
    voice: z.string().optional().default("narrator-male").describe("Voice: 'narrator-male', 'narrator-female', or a voice ID"),
    speed: z.number().optional().default(1.15).describe("Playback speed (1.0 = normal, 1.15 = slightly faster, 1.3 = fast)"),
  },
  async ({ text, outputDir, filename, voice, speed }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

    // Resolve voice ID
    const voiceMap: Record<string, string> = {
      "narrator-male": "Zlb1dXrM653N07WRdFW3",    // Joseph — British male
      "narrator-female": "ThT5KcBeYPX3keUQqHPh",   // Dorothy — British female
    };
    const voiceId = voiceMap[voice] || voice;

    await mkdir(outputDir, { recursive: true });
    const audioPath = join(outputDir, filename);
    const timingFilename = filename.replace(/\.[^.]+$/, ".timing.json");
    const timingPath = join(outputDir, timingFilename);

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_v3",
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            speed,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`ElevenLabs error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const audio = Buffer.from(data.audio_base64, "base64");

    // Aggregate character-level alignment into word-level
    const chars: string[] = data.alignment.characters;
    const starts: number[] = data.alignment.character_start_times_seconds;
    const ends: number[] = data.alignment.character_end_times_seconds;

    const words: Array<{ word: string; startSeconds: number; endSeconds: number }> = [];
    let cw = "", ws = 0, we = 0;
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === " " || chars[i] === "\n") {
        if (cw) { words.push({ word: cw, startSeconds: ws, endSeconds: we }); cw = ""; }
      } else {
        if (!cw) ws = starts[i];
        cw += chars[i];
        we = ends[i];
      }
    }
    if (cw) words.push({ word: cw, startSeconds: ws, endSeconds: we });

    const durationSeconds = words.length > 0 ? words[words.length - 1].endSeconds : 0;
    const durationFrames = Math.ceil(durationSeconds * 30);

    await writeFile(audioPath, audio);
    await writeFile(timingPath, JSON.stringify({ words, durationSeconds, durationFrames }, null, 2));

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
            voice,
            speed,
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
