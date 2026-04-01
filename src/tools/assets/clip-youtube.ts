import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

export const clipYoutubeTool = tool(
  "clip_youtube_video",
  "Download a YouTube video and clip a segment using yt-dlp + ffmpeg. Returns the file path of the clipped video.",
  {
    videoId: z.string().describe("YouTube video ID"),
    startSeconds: z.number().describe("Start time in seconds"),
    endSeconds: z.number().describe("End time in seconds"),
    outputDir: z.string().describe("Directory to save the clip"),
    filename: z.string().optional().describe("Output filename (default: clip_<videoId>_<start>-<end>.mp4)"),
  },
  async ({ videoId, startSeconds, endSeconds, outputDir, filename }) => {
    mkdirSync(outputDir, { recursive: true });

    const outFile = filename || `clip_${videoId}_${startSeconds}-${endSeconds}.mp4`;
    const outputPath = join(outputDir, outFile);
    const tempPath = join(outputDir, `_full_${videoId}.mp4`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Step 1: Download full video with yt-dlp (if not already downloaded)
    if (!existsSync(tempPath)) {
      const dlCmd = `yt-dlp --format "bestvideo[height<=1080]+bestaudio/best[height<=1080]" --merge-output-format mp4 -o "${tempPath}" "${url}"`;
      try {
        execSync(dlCmd, { stdio: "pipe", timeout: 300_000 });
      } catch (e: any) {
        throw new Error(`yt-dlp download failed: ${e.stderr?.toString() || e.message}`);
      }
    }

    // Step 2: Trim with ffmpeg
    const duration = endSeconds - startSeconds;
    const trimCmd = `ffmpeg -y -ss ${startSeconds} -i "${tempPath}" -t ${duration} -c copy "${outputPath}"`;
    try {
      execSync(trimCmd, { stdio: "pipe", timeout: 120_000 });
    } catch (e: any) {
      throw new Error(`ffmpeg trim failed: ${e.stderr?.toString() || e.message}`);
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ path: outputPath, videoId, startSeconds, endSeconds, durationSeconds: duration }),
      }],
    };
  }
);
