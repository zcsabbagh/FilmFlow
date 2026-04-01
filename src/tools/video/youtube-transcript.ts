import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";

export const youtubeTranscriptTool = tool(
  "youtube_transcript",
  "Fetch timestamped captions/transcript for a YouTube video. Returns an array of {text, startSeconds, durationSeconds}. Use this to find specific moments by what is being said.",
  {
    videoId: z.string().describe("YouTube video ID (e.g. 'dQw4w9WgXcQ')"),
  },
  async ({ videoId }) => {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const formatted = transcript.map((entry) => ({
      text: entry.text,
      startSeconds: Math.round(entry.offset / 1000),
      durationSeconds: Math.round(entry.duration / 1000),
    }));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(formatted, null, 2) }],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
