# FilmFlow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a terminal agent that takes a natural language prompt and produces a fully rendered Vox-style explainer video with narration, sourced footage, data visualizations, and motion graphics.

**Architecture:** Claude Agent SDK (TypeScript) orchestrating custom MCP tools. Tools are grouped into research, visual search, asset, composition, and render/critique categories. Each video is a Remotion project that the agent writes as React components and renders to MP4.

**Tech Stack:** Claude Agent SDK, Remotion 4, Bun, Zod, D3.js, yt-dlp, ElevenLabs API, SentrySearch, Gemini API, Cheerio

---

## File Structure

```
/Users/zane/projects/FilmFlow/
├── src/
│   ├── index.ts                    # CLI entry point
│   ├── agent.ts                    # Agent orchestration (query + tools + system prompt)
│   ├── tools/
│   │   ├── research/
│   │   │   ├── youtube-search.ts   # YouTube Data API v3 search
│   │   │   ├── youtube-transcript.ts # Fetch timestamped captions
│   │   │   ├── dataset-search.ts   # Search public data APIs
│   │   │   └── scrape-table.ts     # Extract tables from web pages
│   │   ├── visual-search/
│   │   │   ├── index-video.ts      # Index video with SentrySearch
│   │   │   └── visual-search.ts    # Semantic search over indexed video
│   │   ├── assets/
│   │   │   ├── clip-youtube.ts     # Download + clip via yt-dlp
│   │   │   ├── generate-voiceover.ts # ElevenLabs TTS
│   │   │   └── process-dataset.ts  # Clean/transform data for viz
│   │   ├── composition/
│   │   │   ├── create-scene.ts     # Write a Remotion scene component
│   │   │   ├── create-data-viz.ts  # Create data viz from template + data
│   │   │   ├── add-to-timeline.ts  # Add scene to Root.tsx composition
│   │   │   └── preview-scene.ts    # Render a single scene to screenshot
│   │   └── render/
│   │       ├── render-video.ts     # Full Remotion render to MP4
│   │       └── critique-video.ts   # Gemini Video Understanding review
│   ├── templates/                  # Remotion project template (copied per video)
│   │   ├── package.json
│   │   ├── remotion.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── Root.tsx            # Base timeline composition
│   │       ├── tokens.ts           # Design tokens
│   │       └── components/
│   │           ├── AnimatedBarChart.tsx
│   │           ├── AnimatedLineChart.tsx
│   │           ├── StatCard.tsx
│   │           ├── ChoroplethMap.tsx
│   │           ├── AnimatedTimeline.tsx
│   │           └── ComparisonChart.tsx
│   └── lib/
│       ├── elevenlabs.ts           # ElevenLabs API client
│       ├── youtube.ts              # YouTube Data API client
│       └── gemini.ts               # Gemini API client
├── tests/
│   ├── tools/
│   │   ├── youtube-search.test.ts
│   │   ├── youtube-transcript.test.ts
│   │   ├── clip-youtube.test.ts
│   │   ├── generate-voiceover.test.ts
│   │   ├── scrape-table.test.ts
│   │   ├── dataset-search.test.ts
│   │   ├── process-dataset.test.ts
│   │   ├── create-scene.test.ts
│   │   ├── create-data-viz.test.ts
│   │   ├── add-to-timeline.test.ts
│   │   ├── render-video.test.ts
│   │   └── critique-video.test.ts
│   └── lib/
│       ├── elevenlabs.test.ts
│       ├── youtube.test.ts
│       └── gemini.test.ts
├── output/                         # Generated video projects (gitignored)
├── package.json
├── tsconfig.json
├── .env.local
└── .gitignore
```

---

### Task 1: Project Scaffolding & Agent SDK Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/index.ts`
- Create: `src/agent.ts`

- [ ] **Step 1: Initialize the project with bun**

```bash
cd /Users/zane/projects/FilmFlow
bun init -y
```

- [ ] **Step 2: Install core dependencies**

```bash
bun add @anthropic-ai/claude-agent-sdk zod dotenv
bun add -d @types/node typescript
```

- [ ] **Step 3: Configure tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "skipLibCheck": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "output", "tests"]
}
```

- [ ] **Step 4: Update package.json scripts**

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "start": "bun run src/index.ts",
    "typecheck": "tsc --noEmit",
    "test": "bun test"
  }
}
```

- [ ] **Step 5: Write the CLI entry point**

Create `src/index.ts`:
```typescript
import "dotenv/config";
import { runAgent } from "./agent.js";

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error("Usage: filmflow <prompt>");
  console.error('Example: filmflow "Make a video about the housing crisis in SF"');
  process.exit(1);
}

await runAgent(prompt);
```

- [ ] **Step 6: Write the agent orchestration stub**

Create `src/agent.ts`:
```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const SYSTEM_PROMPT = `You are FilmFlow, an AI video journalist that creates Vox-style explainer videos.

You operate in three modes:

1. PLAN MODE (default): Research the topic, write a script, and produce a storyboard.
   Present the storyboard to the user for review. Wait for approval before proceeding.

2. EXECUTE MODE: After the user approves the storyboard, build the video:
   - Download and clip YouTube footage
   - Process datasets for visualization
   - Generate voiceover narration
   - Write Remotion scene components
   - Assemble the timeline

3. CRITIQUE MODE: After rendering, send the video for AI review.
   Fix issues automatically where possible, report others to the user.

Always start in PLAN MODE. Research thoroughly before proposing the storyboard.`;

export async function runAgent(prompt: string) {
  // Tools will be added in subsequent tasks
  const filmflowTools = createSdkMcpServer({
    name: "filmflow-tools",
    tools: [],
  });

  for await (const message of query({
    prompt,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      cwd: process.cwd(),
      allowedTools: [
        "Read", "Write", "Edit", "Bash", "Glob", "Grep",
        "WebSearch", "WebFetch",
      ],
      mcpServers: {
        "filmflow-tools": filmflowTools,
      },
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      maxTurns: 100,
    },
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}
```

- [ ] **Step 7: Verify typecheck passes**

```bash
cd /Users/zane/projects/FilmFlow
bun run typecheck
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/ package.json tsconfig.json bun.lock*
git commit -m "feat: scaffold Agent SDK project with CLI entry point and agent stub"
```

---

### Task 2: API Client Libraries

**Files:**
- Create: `src/lib/youtube.ts`
- Create: `src/lib/elevenlabs.ts`
- Create: `src/lib/gemini.ts`
- Create: `tests/lib/youtube.test.ts`
- Create: `tests/lib/elevenlabs.test.ts`
- Create: `tests/lib/gemini.test.ts`

- [ ] **Step 1: Write YouTube API client test**

Create `tests/lib/youtube.test.ts`:
```typescript
import { describe, it, expect, mock } from "bun:test";
import { searchYouTube, type YouTubeSearchResult } from "../../src/lib/youtube.js";

describe("searchYouTube", () => {
  it("returns structured search results", async () => {
    const mockFetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            items: [
              {
                id: { videoId: "abc123" },
                snippet: {
                  title: "Housing Crisis Explained",
                  channelTitle: "VoxMedia",
                  description: "A deep dive into housing",
                  publishedAt: "2024-01-15T00:00:00Z",
                },
              },
            ],
          })
        )
      )
    );
    globalThis.fetch = mockFetch as any;

    const results = await searchYouTube("housing crisis san francisco", "fake-key");

    expect(results).toHaveLength(1);
    expect(results[0].videoId).toBe("abc123");
    expect(results[0].title).toBe("Housing Crisis Explained");
    expect(results[0].channelTitle).toBe("VoxMedia");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test tests/lib/youtube.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement YouTube API client**

Create `src/lib/youtube.ts`:
```typescript
export type YouTubeSearchResult = {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
};

export async function searchYouTube(
  query: string,
  apiKey: string,
  maxResults = 10
): Promise<YouTubeSearchResult[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    key: apiKey,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`
  );

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  return data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun test tests/lib/youtube.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write ElevenLabs client test**

Create `tests/lib/elevenlabs.test.ts`:
```typescript
import { describe, it, expect, mock } from "bun:test";
import { generateSpeech } from "../../src/lib/elevenlabs.js";

describe("generateSpeech", () => {
  it("returns audio buffer and metadata", async () => {
    const fakeAudio = new Uint8Array([0x00, 0x01, 0x02]);
    const mockFetch = mock(() =>
      Promise.resolve(
        new Response(fakeAudio, {
          headers: { "content-type": "audio/mpeg" },
        })
      )
    );
    globalThis.fetch = mockFetch as any;

    const result = await generateSpeech("Hello world", "fake-key");

    expect(result.audio).toBeInstanceOf(Buffer);
    expect(result.audio.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6: Implement ElevenLabs client**

Create `src/lib/elevenlabs.ts`:
```typescript
export type SpeechResult = {
  audio: Buffer;
};

export async function generateSpeech(
  text: string,
  apiKey: string,
  voiceId = "21m00Tcm4TlvDq8ikWAM" // Rachel — default narrator voice
): Promise<SpeechResult> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`ElevenLabs API error: ${res.status} ${await res.text()}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return { audio: Buffer.from(arrayBuffer) };
}
```

- [ ] **Step 7: Run ElevenLabs test**

```bash
bun test tests/lib/elevenlabs.test.ts
```

Expected: PASS.

- [ ] **Step 8: Write Gemini client test**

Create `tests/lib/gemini.test.ts`:
```typescript
import { describe, it, expect, mock } from "bun:test";
import { critiqueVideo } from "../../src/lib/gemini.js";

describe("critiqueVideo", () => {
  it("returns structured critique", async () => {
    const mockFetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        pacing: { score: 8, notes: "Good rhythm" },
                        visual_coherence: { score: 7, notes: "Clean transitions" },
                        data_accuracy: { score: 9, notes: "Charts match narration" },
                        audio_sync: { score: 8, notes: "Well aligned" },
                        overall: { score: 8, notes: "Professional quality" },
                      }),
                    },
                  ],
                },
              },
            ],
          })
        )
      )
    );
    globalThis.fetch = mockFetch as any;

    const result = await critiqueVideo("/path/to/video.mp4", "fake-key");

    expect(result.overall.score).toBe(8);
    expect(result.pacing.score).toBe(8);
  });
});
```

- [ ] **Step 9: Implement Gemini client**

Create `src/lib/gemini.ts`:
```typescript
import { readFile } from "fs/promises";

export type CritiqueCategory = {
  score: number;
  notes: string;
};

export type VideoCritique = {
  pacing: CritiqueCategory;
  visual_coherence: CritiqueCategory;
  data_accuracy: CritiqueCategory;
  audio_sync: CritiqueCategory;
  overall: CritiqueCategory;
};

export async function critiqueVideo(
  videoPath: string,
  apiKey: string
): Promise<VideoCritique> {
  const videoBytes = await readFile(videoPath);
  const base64Video = videoBytes.toString("base64");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "video/mp4",
                  data: base64Video,
                },
              },
              {
                text: `You are a professional video editor reviewing an explainer video.
Evaluate this video and return a JSON object with these categories:
- pacing: { score: 1-10, notes: string }
- visual_coherence: { score: 1-10, notes: string }
- data_accuracy: { score: 1-10, notes: string }
- audio_sync: { score: 1-10, notes: string }
- overall: { score: 1-10, notes: string }

Return ONLY valid JSON, no markdown.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text) as VideoCritique;
}
```

- [ ] **Step 10: Run all lib tests**

```bash
bun test tests/lib/
```

Expected: all PASS.

- [ ] **Step 11: Typecheck**

```bash
bun run typecheck
```

Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add src/lib/ tests/lib/
git commit -m "feat: add YouTube, ElevenLabs, and Gemini API client libraries"
```

---

### Task 3: Research Tools

**Files:**
- Create: `src/tools/research/youtube-search.ts`
- Create: `src/tools/research/youtube-transcript.ts`
- Create: `src/tools/research/dataset-search.ts`
- Create: `src/tools/research/scrape-table.ts`
- Create: `tests/tools/youtube-search.test.ts`
- Create: `tests/tools/youtube-transcript.test.ts`

- [ ] **Step 1: Install transcript dependency**

```bash
bun add youtube-transcript
```

- [ ] **Step 2: Write youtube_search tool test**

Create `tests/tools/youtube-search.test.ts`:
```typescript
import { describe, it, expect } from "bun:test";
import { youtubeSearchTool } from "../../src/tools/research/youtube-search.js";

describe("youtubeSearchTool", () => {
  it("has correct name and description", () => {
    expect(youtubeSearchTool.name).toBe("youtube_search");
  });
});
```

- [ ] **Step 3: Implement youtube_search tool**

Create `src/tools/research/youtube-search.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { searchYouTube } from "../../lib/youtube.js";

export const youtubeSearchTool = tool(
  "youtube_search",
  "Search YouTube for videos on a topic. Returns video IDs, titles, channels, and descriptions. Use this to find source material for the video.",
  {
    query: z.string().describe("Search query for YouTube"),
    maxResults: z.number().optional().default(10).describe("Max results to return (default 10)"),
  },
  async ({ query, maxResults }) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YOUTUBE_API_KEY not set");

    const results = await searchYouTube(query, apiKey, maxResults);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
```

- [ ] **Step 4: Run test**

```bash
bun test tests/tools/youtube-search.test.ts
```

Expected: PASS.

- [ ] **Step 5: Implement youtube_transcript tool**

Create `src/tools/research/youtube-transcript.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";

export const youtubeTranscriptTool = tool(
  "youtube_transcript",
  "Fetch timestamped captions/transcript for a YouTube video. Returns an array of {text, offset, duration} objects. Use this to find specific moments in a video by what is being said.",
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
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(formatted, null, 2),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
```

- [ ] **Step 6: Implement dataset_search tool**

Create `src/tools/research/dataset-search.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const datasetSearchTool = tool(
  "dataset_search",
  "Search public data sources for datasets. Searches data.gov and World Bank APIs. Returns dataset names, descriptions, and download URLs.",
  {
    query: z.string().describe("Search query for datasets"),
    source: z
      .enum(["datagov", "worldbank"])
      .optional()
      .default("datagov")
      .describe("Which data source to search"),
  },
  async ({ query, source }) => {
    let results: any[];

    if (source === "worldbank") {
      const res = await fetch(
        `https://api.worldbank.org/v2/indicator?format=json&per_page=10&source=2&search=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error(`World Bank API error: ${res.status}`);
      const data = await res.json();
      results = (data[1] || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.sourceNote,
        source: "World Bank",
        url: `https://api.worldbank.org/v2/country/all/indicator/${item.id}?format=json&per_page=1000`,
      }));
    } else {
      const res = await fetch(
        `https://catalog.data.gov/api/3/action/package_search?q=${encodeURIComponent(query)}&rows=10`
      );
      if (!res.ok) throw new Error(`data.gov API error: ${res.status}`);
      const data = await res.json();
      results = (data.result?.results || []).map((item: any) => ({
        id: item.id,
        name: item.title,
        description: item.notes,
        source: "data.gov",
        url: item.resources?.[0]?.url || null,
        format: item.resources?.[0]?.format || null,
      }));
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
```

- [ ] **Step 7: Implement scrape_table tool**

Install cheerio:
```bash
bun add cheerio
```

Create `src/tools/research/scrape-table.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import * as cheerio from "cheerio";

export const scrapeTableTool = tool(
  "scrape_table",
  "Extract data tables from a web page URL. Returns tables as arrays of objects with column headers as keys. Useful for getting data from Wikipedia, news articles, or government sites.",
  {
    url: z.string().url().describe("URL of the web page to scrape tables from"),
    tableIndex: z.number().optional().default(0).describe("Which table to extract (0-indexed, default first)"),
  },
  async ({ url, tableIndex }) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const tables = $("table");

    if (tables.length === 0) {
      return { content: [{ type: "text" as const, text: "No tables found on page." }] };
    }

    const table = tables.eq(Math.min(tableIndex, tables.length - 1));
    const headers: string[] = [];

    table.find("thead th, tr:first-child th").each((_, el) => {
      headers.push($(el).text().trim());
    });

    // Fallback: use first row as headers if no th found
    if (headers.length === 0) {
      table.find("tr:first-child td").each((_, el) => {
        headers.push($(el).text().trim());
      });
    }

    const rows: Record<string, string>[] = [];
    const dataRows = headers.length > 0
      ? table.find("tbody tr, tr").slice(1)
      : table.find("tr").slice(1);

    dataRows.each((_, row) => {
      const cells: Record<string, string> = {};
      $(row).find("td").each((i, cell) => {
        const key = headers[i] || `col_${i}`;
        cells[key] = $(cell).text().trim();
      });
      if (Object.keys(cells).length > 0) rows.push(cells);
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { tableCount: tables.length, headers, rowCount: rows.length, rows },
            null,
            2
          ),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
```

- [ ] **Step 8: Typecheck and run tests**

```bash
bun run typecheck && bun test tests/tools/
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/tools/research/ tests/tools/ package.json bun.lock*
git commit -m "feat: add research tools (youtube_search, youtube_transcript, dataset_search, scrape_table)"
```

---

### Task 4: Asset Tools (clip, voiceover, dataset processing)

**Files:**
- Create: `src/tools/assets/clip-youtube.ts`
- Create: `src/tools/assets/generate-voiceover.ts`
- Create: `src/tools/assets/process-dataset.ts`

- [ ] **Step 1: Implement clip_youtube_video tool**

Create `src/tools/assets/clip-youtube.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

export const clipYoutubeTool = tool(
  "clip_youtube_video",
  "Download and clip a segment from a YouTube video. Requires yt-dlp installed. Returns the file path of the clipped video.",
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

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const duration = endSeconds - startSeconds;

    // Download section with yt-dlp's built-in section support
    const cmd = [
      "yt-dlp",
      `--download-sections "*${startSeconds}-${endSeconds}"`,
      "--force-keyframes-at-cuts",
      `-o "${outputPath}"`,
      "--format bestvideo[height<=1080]+bestaudio/best[height<=1080]",
      "--merge-output-format mp4",
      `"${url}"`,
    ].join(" ");

    try {
      execSync(cmd, { stdio: "pipe", timeout: 120_000 });
    } catch (e: any) {
      throw new Error(`yt-dlp failed: ${e.stderr?.toString() || e.message}`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            path: outputPath,
            videoId,
            startSeconds,
            endSeconds,
            durationSeconds: duration,
          }),
        },
      ],
    };
  }
);
```

- [ ] **Step 2: Implement generate_voiceover tool**

Create `src/tools/assets/generate-voiceover.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateSpeech } from "../../lib/elevenlabs.js";

export const generateVoiceoverTool = tool(
  "generate_voiceover",
  "Generate narration audio from script text using ElevenLabs TTS. Returns the file path and estimated duration of the generated audio.",
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

    // Rough estimate: ~150 words per minute for narration
    const wordCount = text.split(/\s+/).length;
    const estimatedDurationSeconds = Math.ceil((wordCount / 150) * 60);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            path: outputPath,
            wordCount,
            estimatedDurationSeconds,
          }),
        },
      ],
    };
  }
);
```

- [ ] **Step 3: Implement process_dataset tool**

Create `src/tools/assets/process-dataset.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const processDatasetTool = tool(
  "process_dataset",
  "Fetch a dataset from a URL (CSV or JSON), then filter/transform it using a JavaScript expression. Outputs viz-ready JSON to a file. Use this to prepare data for create_data_viz.",
  {
    url: z.string().url().describe("URL of the dataset (CSV or JSON)"),
    outputDir: z.string().describe("Directory to save processed data"),
    filename: z.string().describe("Output filename (e.g. 'housing_prices.json')"),
    transformExpression: z
      .string()
      .optional()
      .describe(
        "JavaScript expression to transform the parsed data. The variable `data` holds the parsed array. Example: `data.filter(d => d.year >= 2010).map(d => ({year: d.year, value: d.price}))`"
      ),
  },
  async ({ url, outputDir, filename, transformExpression }) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    let data: any[];

    if (contentType.includes("json") || url.endsWith(".json")) {
      const parsed = JSON.parse(text);
      data = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // Parse CSV
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string | number> = {};
        headers.forEach((h, i) => {
          const num = Number(values[i]);
          row[h] = isNaN(num) ? values[i] : num;
        });
        return row;
      });
    }

    // Apply transform if provided
    if (transformExpression) {
      const fn = new Function("data", `return ${transformExpression}`);
      data = fn(data);
    }

    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, filename);
    await writeFile(outputPath, JSON.stringify(data, null, 2));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            path: outputPath,
            rowCount: data.length,
            columns: data.length > 0 ? Object.keys(data[0]) : [],
            sample: data.slice(0, 3),
          }),
        },
      ],
    };
  }
);
```

- [ ] **Step 4: Typecheck**

```bash
bun run typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/tools/assets/
git commit -m "feat: add asset tools (clip_youtube_video, generate_voiceover, process_dataset)"
```

---

### Task 5: Visual Search Tools (SentrySearch Integration)

**Files:**
- Create: `src/tools/visual-search/index-video.ts`
- Create: `src/tools/visual-search/visual-search.ts`

- [ ] **Step 1: Install SentrySearch as a dependency**

```bash
# SentrySearch is a Python CLI tool — we'll call it via subprocess
# Ensure it's installed in the user's environment
which sentrysearch || echo "SentrySearch not installed — run: uv tool install sentrysearch"
```

- [ ] **Step 2: Implement index_video tool**

Create `src/tools/visual-search/index-video.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";

export const indexVideoTool = tool(
  "index_video",
  "Index a video file for semantic visual search using SentrySearch. Chunks the video into segments and embeds each using Gemini Embedding 2. After indexing, use visual_search to find specific moments.",
  {
    videoPath: z.string().describe("Path to the video file to index"),
  },
  async ({ videoPath }) => {
    try {
      const output = execSync(`sentrysearch index "${videoPath}"`, {
        stdio: "pipe",
        timeout: 300_000, // 5 min — indexing can take a while
        env: { ...process.env },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Successfully indexed: ${videoPath}\n${output.toString()}`,
          },
        ],
      };
    } catch (e: any) {
      throw new Error(`SentrySearch index failed: ${e.stderr?.toString() || e.message}`);
    }
  }
);
```

- [ ] **Step 3: Implement visual_search tool**

Create `src/tools/visual-search/visual-search.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";

export const visualSearchTool = tool(
  "visual_search",
  "Search indexed videos for visually matching moments using natural language. Returns the best matching clip. The video must have been indexed first with index_video.",
  {
    query: z.string().describe("Natural language description of the visual content to find (e.g. 'traffic congestion on a highway')"),
  },
  async ({ query }) => {
    try {
      const output = execSync(`sentrysearch search "${query}"`, {
        stdio: "pipe",
        timeout: 60_000,
        env: { ...process.env },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: output.toString(),
          },
        ],
      };
    } catch (e: any) {
      throw new Error(`SentrySearch query failed: ${e.stderr?.toString() || e.message}`);
    }
  },
  { annotations: { readOnlyHint: true } }
);
```

- [ ] **Step 4: Typecheck**

```bash
bun run typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/tools/visual-search/
git commit -m "feat: add SentrySearch visual search tools (index_video, visual_search)"
```

---

### Task 6: Remotion Template (Data Viz Components)

**Files:**
- Create: `src/templates/package.json`
- Create: `src/templates/remotion.config.ts`
- Create: `src/templates/tsconfig.json`
- Create: `src/templates/src/Root.tsx`
- Create: `src/templates/src/tokens.ts`
- Create: `src/templates/src/components/AnimatedBarChart.tsx`
- Create: `src/templates/src/components/AnimatedLineChart.tsx`
- Create: `src/templates/src/components/StatCard.tsx`
- Create: `src/templates/src/components/ChoroplethMap.tsx`
- Create: `src/templates/src/components/AnimatedTimeline.tsx`
- Create: `src/templates/src/components/ComparisonChart.tsx`

- [ ] **Step 1: Create template package.json**

Create `src/templates/package.json`:
```json
{
  "name": "filmflow-video",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "remotion studio",
    "render": "remotion render Root out/video.mp4",
    "still": "remotion still Root out/thumbnail.png"
  },
  "dependencies": {
    "remotion": "4.0.443",
    "@remotion/cli": "4.0.443",
    "@remotion/bundler": "4.0.443",
    "react": "^19",
    "react-dom": "^19",
    "d3": "^7"
  },
  "devDependencies": {
    "@types/d3": "^7",
    "@types/react": "^19",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create template tsconfig.json**

Create `src/templates/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create remotion.config.ts**

Create `src/templates/remotion.config.ts`:
```typescript
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
```

- [ ] **Step 4: Create design tokens**

Create `src/templates/src/tokens.ts`:
```typescript
export const tokens = {
  colors: {
    primary: "#1a1a2e",
    accent: "#e94560",
    secondary: "#0f3460",
    background: "#16213e",
    text: "#eeeeee",
    textMuted: "#aaaaaa",
    chart: ["#e94560", "#0f3460", "#533483", "#48c9b0", "#f39c12", "#3498db"],
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
  },
  animation: {
    easeIn: [0.4, 0, 1, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
  },
  layout: {
    width: 1920,
    height: 1080,
    padding: 80,
  },
} as const;
```

- [ ] **Step 5: Create Root.tsx base composition**

Create `src/templates/src/Root.tsx`:
```tsx
import { Composition } from "remotion";
import { tokens } from "./tokens";

// Scenes are dynamically imported — the agent writes them to scenes/ dir
// and adds them here via the add_to_timeline tool.
// This is the base template; it starts empty.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Root"
        component={() => (
          <div
            style={{
              width: tokens.layout.width,
              height: tokens.layout.height,
              backgroundColor: tokens.colors.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.colors.text,
              fontFamily: tokens.fonts.heading,
              fontSize: 48,
            }}
          >
            FilmFlow — No scenes added yet
          </div>
        )}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
    </>
  );
};
```

- [ ] **Step 6: Create AnimatedBarChart component**

Create `src/templates/src/components/AnimatedBarChart.tsx`:
```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

export type BarChartData = {
  label: string;
  value: number;
};

type Props = {
  data: BarChartData[];
  title?: string;
  caption?: string;
  yAxisLabel?: string;
  colorOverrides?: string[];
};

export const AnimatedBarChart: React.FC<Props> = ({
  data,
  title,
  caption,
  yAxisLabel,
  colorOverrides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxValue = Math.max(...data.map((d) => d.value));
  const colors = colorOverrides || tokens.colors.chart;
  const barWidth = Math.min(80, (tokens.layout.width - tokens.layout.padding * 2 - 100) / data.length - 10);

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        display: "flex",
        flexDirection: "column",
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            marginBottom: 20,
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {title}
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 10,
          paddingBottom: 60,
        }}
      >
        {data.map((item, i) => {
          const barProgress = spring({
            frame: frame - i * 5,
            fps,
            config: { damping: 20, stiffness: 100 },
          });
          const barHeight = (item.value / maxValue) * 500 * barProgress;

          return (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontSize: 18,
                  marginBottom: 8,
                  opacity: barProgress,
                  color: tokens.colors.textMuted,
                }}
              >
                {item.value.toLocaleString()}
              </div>
              <div
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: colors[i % colors.length],
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  fontSize: 16,
                  marginTop: 12,
                  opacity: barProgress,
                  textAlign: "center",
                  maxWidth: barWidth + 20,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {caption && (
        <div
          style={{
            fontSize: 16,
            color: tokens.colors.textMuted,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 7: Create AnimatedLineChart component**

Create `src/templates/src/components/AnimatedLineChart.tsx`:
```tsx
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

export type LineChartPoint = { x: string | number; y: number };

type Props = {
  data: LineChartPoint[];
  title?: string;
  caption?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
};

export const AnimatedLineChart: React.FC<Props> = ({
  data,
  title,
  caption,
  color = tokens.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chartWidth = tokens.layout.width - tokens.layout.padding * 2 - 100;
  const chartHeight = 500;
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const range = maxY - minY || 1;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth + 100,
    y: chartHeight - ((d.y - minY) / range) * chartHeight + 80,
  }));

  const progress = interpolate(frame, [10, 10 + data.length * 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  const pathData = points
    .slice(0, Math.ceil(points.length * progress))
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        position: "relative",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            marginBottom: 20,
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {title}
        </div>
      )}

      <svg width={chartWidth + 100} height={chartHeight + 80}>
        <path d={pathData} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        {points.slice(0, Math.ceil(points.length * progress)).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
        ))}
      </svg>

      {caption && (
        <div
          style={{
            fontSize: 16,
            color: tokens.colors.textMuted,
            position: "absolute",
            bottom: tokens.layout.padding,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 8: Create StatCard component**

Create `src/templates/src/components/StatCard.tsx`:
```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  caption?: string;
};

export const StatCard: React.FC<Props> = ({ value, label, prefix = "", suffix = "", caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 30, stiffness: 80 } });
  const displayValue = Math.round(value * progress);

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: tokens.fonts.heading,
        color: tokens.colors.text,
      }}
    >
      <div style={{ fontSize: 120, fontWeight: 800, color: tokens.colors.accent }}>
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>
      <div style={{ fontSize: 36, marginTop: 20, opacity: progress }}>{label}</div>
      {caption && (
        <div
          style={{
            fontSize: 18,
            color: tokens.colors.textMuted,
            marginTop: 16,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 9: Create placeholder components for remaining viz types**

Create `src/templates/src/components/ChoroplethMap.tsx`:
```tsx
import { useCurrentFrame, interpolate } from "remotion";
import { tokens } from "../tokens";

// Placeholder — full GeoJSON + D3 geo projection implementation in a follow-up task
type Props = {
  title?: string;
  caption?: string;
  data: Array<{ region: string; value: number }>;
};

export const ChoroplethMap: React.FC<Props> = ({ title, caption, data }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {title && <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 40 }}>{title}</div>}
      <div style={{ fontSize: 24, color: tokens.colors.textMuted }}>
        [Map: {data.length} regions]
      </div>
      {caption && <div style={{ fontSize: 16, color: tokens.colors.textMuted, marginTop: 20 }}>{caption}</div>}
    </div>
  );
};
```

Create `src/templates/src/components/AnimatedTimeline.tsx`:
```tsx
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type TimelineEvent = { date: string; title: string; description?: string };

type Props = { events: TimelineEvent[]; title?: string };

export const AnimatedTimeline: React.FC<Props> = ({ events, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
      }}
    >
      {title && <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 40 }}>{title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingLeft: 40 }}>
        {events.map((event, i) => {
          const progress = spring({ frame: frame - i * 10, fps, config: { damping: 20, stiffness: 100 } });
          return (
            <div key={i} style={{ opacity: progress, transform: `translateX(${(1 - progress) * 30}px)`, display: "flex", gap: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: tokens.colors.accent, marginTop: 8, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 16, color: tokens.colors.textMuted }}>{event.date}</div>
                <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{event.title}</div>
                {event.description && <div style={{ fontSize: 18, color: tokens.colors.textMuted, marginTop: 4 }}>{event.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

Create `src/templates/src/components/ComparisonChart.tsx`:
```tsx
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  title?: string;
  caption?: string;
  unit?: string;
};

export const ComparisonChart: React.FC<Props> = ({ leftLabel, rightLabel, leftValue, rightValue, title, caption, unit = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxVal = Math.max(leftValue, rightValue);

  const leftProgress = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 80 } });
  const rightProgress = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 80 } });

  const barMaxWidth = 600;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {title && (
        <div style={{ fontSize: 42, fontWeight: 700, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
          {title}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: barMaxWidth + 200 }}>
        {[
          { label: leftLabel, value: leftValue, progress: leftProgress, color: tokens.colors.chart[0] },
          { label: rightLabel, value: rightValue, progress: rightProgress, color: tokens.colors.chart[1] },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: (item.value / maxVal) * barMaxWidth * item.progress, height: 40, backgroundColor: item.color, borderRadius: 4 }} />
              <div style={{ fontSize: 22, fontWeight: 600, opacity: item.progress }}>
                {Math.round(item.value * item.progress).toLocaleString()}{unit}
              </div>
            </div>
          </div>
        ))}
      </div>
      {caption && (
        <div style={{ fontSize: 16, color: tokens.colors.textMuted, opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" }) }}>
          {caption}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 10: Commit**

```bash
git add src/templates/
git commit -m "feat: add Remotion video template with 6 data viz components"
```

---

### Task 7: Composition & Render Tools

**Files:**
- Create: `src/tools/composition/create-scene.ts`
- Create: `src/tools/composition/create-data-viz.ts`
- Create: `src/tools/composition/add-to-timeline.ts`
- Create: `src/tools/composition/preview-scene.ts`
- Create: `src/tools/render/render-video.ts`
- Create: `src/tools/render/critique-video.ts`

- [ ] **Step 1: Implement create_scene tool**

Create `src/tools/composition/create-scene.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const createSceneTool = tool(
  "create_scene",
  "Write a Remotion React component for a video scene. The component will be saved to the project's scenes/ directory. You must write valid TSX that imports from 'remotion' and '../tokens'. Available Remotion hooks: useCurrentFrame(), useVideoConfig(), interpolate(), spring(), Sequence, Audio, Img, Video, AbsoluteFill.",
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

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ path: filePath, filename }),
        },
      ],
    };
  }
);
```

- [ ] **Step 2: Implement create_data_viz tool**

Create `src/tools/composition/create-data-viz.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

export const createDataVizTool = tool(
  "create_data_viz",
  `Create an animated data visualization scene from a template and data file.

Available templates:
- AnimatedBarChart: { data: [{label, value}], title?, caption?, yAxisLabel? }
- AnimatedLineChart: { data: [{x, y}], title?, caption?, color? }
- StatCard: { value: number, label: string, prefix?, suffix?, caption? }
- ChoroplethMap: { data: [{region, value}], title?, caption? }
- AnimatedTimeline: { events: [{date, title, description?}], title? }
- ComparisonChart: { leftLabel, rightLabel, leftValue, rightValue, title?, caption?, unit? }`,
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    filename: z.string().describe("Scene filename (e.g. 'Scene02-RentPrices.tsx')"),
    template: z.enum([
      "AnimatedBarChart",
      "AnimatedLineChart",
      "StatCard",
      "ChoroplethMap",
      "AnimatedTimeline",
      "ComparisonChart",
    ]).describe("Which viz template to use"),
    dataPath: z.string().describe("Path to the JSON data file (output of process_dataset)"),
    props: z.string().describe("JSON string of additional props for the template (title, caption, etc.)"),
  },
  async ({ projectDir, filename, template, dataPath, props }) => {
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    const extraProps = JSON.parse(props);

    const scenesDir = join(projectDir, "src", "scenes");
    await mkdir(scenesDir, { recursive: true });

    // Build the prop assignments
    const allProps = { ...extraProps, data };
    const propsStr = JSON.stringify(allProps, null, 2);

    const code = `import { ${template} } from "../components/${template}";

const data = ${propsStr};

export const Scene: React.FC = () => {
  return <${template} {...data} />;
};
`;

    const filePath = join(scenesDir, filename);
    await writeFile(filePath, code);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ path: filePath, template, dataRows: Array.isArray(data.data) ? data.data.length : 0 }),
        },
      ],
    };
  }
);
```

- [ ] **Step 3: Implement add_to_timeline tool**

Create `src/tools/composition/add-to-timeline.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export const addToTimelineTool = tool(
  "add_to_timeline",
  "Add a scene to the video timeline by rewriting Root.tsx. Pass all scenes in order with their durations. This replaces the current Root.tsx entirely.",
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    scenes: z.array(
      z.object({
        filename: z.string().describe("Scene filename without extension (e.g. 'Scene01-Intro')"),
        durationInFrames: z.number().describe("Duration of this scene in frames (30fps)"),
        audioPath: z.string().optional().describe("Path to audio file for this scene (relative to public/)"),
      })
    ).describe("Ordered list of scenes to compose into the timeline"),
    fps: z.number().optional().default(30).describe("Frames per second (default 30)"),
  },
  async ({ projectDir, scenes, fps }) => {
    const totalFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

    const imports = scenes
      .map((s) => `import { Scene as ${s.filename.replace(/-/g, "_")} } from "./scenes/${s.filename}";`)
      .join("\n");

    let offset = 0;
    const sequences = scenes.map((s) => {
      const componentName = s.filename.replace(/-/g, "_");
      const audioTag = s.audioPath
        ? `\n        <Audio src={staticFile("${s.audioPath}")} />`
        : "";
      const seq = `      <Sequence from={${offset}} durationInFrames={${s.durationInFrames}}>
        <${componentName} />${audioTag}
      </Sequence>`;
      offset += s.durationInFrames;
      return seq;
    });

    const code = `import { Composition, Sequence, Audio, staticFile } from "remotion";
import { tokens } from "./tokens";
${imports}

const MainVideo: React.FC = () => {
  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background }}>
${sequences.join("\n")}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Root"
      component={MainVideo}
      durationInFrames={${totalFrames}}
      fps={${fps}}
      width={tokens.layout.width}
      height={tokens.layout.height}
    />
  );
};
`;

    const rootPath = join(projectDir, "src", "Root.tsx");
    await writeFile(rootPath, code);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            path: rootPath,
            totalFrames,
            totalDurationSeconds: Math.round(totalFrames / fps),
            sceneCount: scenes.length,
          }),
        },
      ],
    };
  }
);
```

- [ ] **Step 4: Implement preview_scene tool**

Create `src/tools/composition/preview-scene.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";
import { join } from "path";

export const previewSceneTool = tool(
  "preview_scene",
  "Render a single frame (still) from the current Remotion project as a PNG screenshot. Useful for verifying a scene looks correct before full render.",
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    frame: z.number().optional().default(30).describe("Which frame to render (default 30 — 1 second in)"),
    outputPath: z.string().optional().describe("Output path for the PNG (default: projectDir/out/preview.png)"),
  },
  async ({ projectDir, frame, outputPath }) => {
    const out = outputPath || join(projectDir, "out", "preview.png");

    const cmd = `cd "${projectDir}" && npx remotion still Root "${out}" --frame=${frame}`;

    try {
      execSync(cmd, { stdio: "pipe", timeout: 60_000 });
    } catch (e: any) {
      throw new Error(`Remotion still failed: ${e.stderr?.toString() || e.message}`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ path: out, frame }),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true } }
);
```

- [ ] **Step 5: Implement render_video tool**

Create `src/tools/render/render-video.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { execSync } from "child_process";
import { join } from "path";

export const renderVideoTool = tool(
  "render_video",
  "Render the full Remotion project to an MP4 video file. This is the final step — call this after all scenes are composed in the timeline.",
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    outputFilename: z.string().optional().default("video.mp4").describe("Output filename (default: video.mp4)"),
  },
  async ({ projectDir, outputFilename }) => {
    const outputPath = join(projectDir, "out", outputFilename);

    // Install deps first if needed
    try {
      execSync(`cd "${projectDir}" && bun install`, { stdio: "pipe", timeout: 120_000 });
    } catch {
      // deps might already be installed
    }

    const cmd = `cd "${projectDir}" && npx remotion render Root "${outputPath}"`;

    try {
      const output = execSync(cmd, { stdio: "pipe", timeout: 600_000 }); // 10 min timeout
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              path: outputPath,
              status: "success",
              log: output.toString().slice(-500),
            }),
          },
        ],
      };
    } catch (e: any) {
      throw new Error(`Remotion render failed: ${e.stderr?.toString() || e.message}`);
    }
  }
);
```

- [ ] **Step 6: Implement critique_video tool**

Create `src/tools/render/critique-video.ts`:
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { critiqueVideo } from "../../lib/gemini.js";

export const critiqueVideoTool = tool(
  "critique_video",
  "Send a rendered video to Gemini Video Understanding for quality review. Returns scores and notes on pacing, visual coherence, data accuracy, audio sync, and overall quality. Use after render_video to evaluate the output.",
  {
    videoPath: z.string().describe("Path to the rendered MP4 file"),
  },
  async ({ videoPath }) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY not set");

    const critique = await critiqueVideo(videoPath, apiKey);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(critique, null, 2),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true } }
);
```

- [ ] **Step 7: Typecheck**

```bash
bun run typecheck
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/tools/composition/ src/tools/render/
git commit -m "feat: add composition tools (create_scene, create_data_viz, add_to_timeline, preview_scene) and render tools (render_video, critique_video)"
```

---

### Task 8: Wire All Tools Into Agent

**Files:**
- Modify: `src/agent.ts`

- [ ] **Step 1: Update agent.ts to register all tools**

Replace `src/agent.ts` with:
```typescript
import { query, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { cpSync, mkdirSync } from "fs";
import { join } from "path";

// Research tools
import { youtubeSearchTool } from "./tools/research/youtube-search.js";
import { youtubeTranscriptTool } from "./tools/research/youtube-transcript.js";
import { datasetSearchTool } from "./tools/research/dataset-search.js";
import { scrapeTableTool } from "./tools/research/scrape-table.js";

// Visual search tools
import { indexVideoTool } from "./tools/visual-search/index-video.js";
import { visualSearchTool } from "./tools/visual-search/visual-search.js";

// Asset tools
import { clipYoutubeTool } from "./tools/assets/clip-youtube.js";
import { generateVoiceoverTool } from "./tools/assets/generate-voiceover.js";
import { processDatasetTool } from "./tools/assets/process-dataset.js";

// Composition tools
import { createSceneTool } from "./tools/composition/create-scene.js";
import { createDataVizTool } from "./tools/composition/create-data-viz.js";
import { addToTimelineTool } from "./tools/composition/add-to-timeline.js";
import { previewSceneTool } from "./tools/composition/preview-scene.js";

// Render tools
import { renderVideoTool } from "./tools/render/render-video.js";
import { critiqueVideoTool } from "./tools/render/critique-video.js";

const SYSTEM_PROMPT = `You are FilmFlow, an AI video journalist that creates Vox-style explainer videos.

You have access to powerful tools for researching topics, finding footage, processing data,
creating visualizations, and rendering videos. Each video you create is a Remotion project.

## Workflow

### 1. PLAN MODE (always start here)
- Research the topic using web_search, youtube_search, youtube_transcript, dataset_search, scrape_table
- Write a complete narration script
- Produce a storyboard: scene-by-scene breakdown with descriptions, data viz specs, clip references, timing
- Present the storyboard to the user and wait for approval

### 2. EXECUTE MODE (after user approves)
- Create a new video project directory under output/
- Copy the Remotion template into it
- For each scene in the storyboard:
  a. If it needs YouTube footage: clip_youtube_video (and optionally index_video + visual_search for precise moments)
  b. If it needs data viz: process_dataset → create_data_viz (using templates: AnimatedBarChart, AnimatedLineChart, StatCard, ChoroplethMap, AnimatedTimeline, ComparisonChart)
  c. If it needs custom visuals: create_scene (write TSX directly)
  d. Generate voiceover: generate_voiceover for each scene's narration
- Assemble timeline: add_to_timeline with all scenes in order
- Preview key frames: preview_scene to verify
- Render: render_video

### 3. CRITIQUE MODE (after rendering)
- Send the video to critique_video for AI review
- If scores are below 7: fix issues and re-render
- If scores are 7+: present the final video to the user

## Data Viz Templates
Use create_data_viz with these templates for consistent, animated visualizations:
- AnimatedBarChart: for comparisons between categories
- AnimatedLineChart: for trends over time
- StatCard: for highlighting a single key number
- ChoroplethMap: for geographic data (placeholder — limited in MVP)
- AnimatedTimeline: for chronological events
- ComparisonChart: for A vs B comparisons

## Important Rules
- Always research thoroughly before writing the script
- Keep individual scenes under 30 seconds each
- Use 30fps, 1080p (1920x1080)
- Estimate voiceover duration at ~150 words per minute
- Convert voiceover duration to frames: seconds * 30
`;

export async function runAgent(prompt: string) {
  // Create output directory
  const outputDir = join(process.cwd(), "output");
  mkdirSync(outputDir, { recursive: true });

  const filmflowTools = createSdkMcpServer({
    name: "filmflow-tools",
    tools: [
      // Research
      youtubeSearchTool,
      youtubeTranscriptTool,
      datasetSearchTool,
      scrapeTableTool,
      // Visual search
      indexVideoTool,
      visualSearchTool,
      // Assets
      clipYoutubeTool,
      generateVoiceoverTool,
      processDatasetTool,
      // Composition
      createSceneTool,
      createDataVizTool,
      addToTimelineTool,
      previewSceneTool,
      // Render
      renderVideoTool,
      critiqueVideoTool,
    ],
  });

  for await (const message of query({
    prompt,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      cwd: process.cwd(),
      allowedTools: [
        "Read", "Write", "Edit", "Bash", "Glob", "Grep",
        "WebSearch", "WebFetch",
      ],
      mcpServers: {
        "filmflow-tools": filmflowTools,
      },
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      maxTurns: 200,
    },
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}
```

- [ ] **Step 2: Create a helper script to scaffold video projects**

The agent will copy the template to create new video projects. Verify the template copy logic works:

```bash
bun run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/agent.ts
git commit -m "feat: wire all 15 custom tools into the FilmFlow agent"
```

---

### Task 9: End-to-End Smoke Test

**Files:**
- No new files — testing the full pipeline

- [ ] **Step 1: Verify all dependencies are installed**

```bash
cd /Users/zane/projects/FilmFlow
bun install
which yt-dlp || echo "Install yt-dlp: brew install yt-dlp"
which ffmpeg || echo "Install ffmpeg: brew install ffmpeg"
```

- [ ] **Step 2: Verify typecheck passes**

```bash
bun run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Run all tests**

```bash
bun test
```

Expected: all pass.

- [ ] **Step 4: Test the CLI invocation (dry run)**

```bash
bun run src/index.ts "Make a 30-second video explaining why the sky is blue"
```

This will start the agent. Verify:
- Agent enters plan mode
- Agent uses web_search to research
- Agent presents a storyboard
- (Can Ctrl+C after storyboard is presented)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify end-to-end pipeline and fix any remaining issues"
git push origin main
```

---

## Summary

| Task | Description | Tools Implemented |
|------|-------------|-------------------|
| 1 | Project scaffolding + Agent SDK | CLI entry, agent stub |
| 2 | API client libraries | YouTube, ElevenLabs, Gemini clients |
| 3 | Research tools | youtube_search, youtube_transcript, dataset_search, scrape_table |
| 4 | Asset tools | clip_youtube_video, generate_voiceover, process_dataset |
| 5 | Visual search tools | index_video, visual_search (SentrySearch) |
| 6 | Remotion template | 6 data viz components + design tokens |
| 7 | Composition & render tools | create_scene, create_data_viz, add_to_timeline, preview_scene, render_video, critique_video |
| 8 | Agent wiring | All 15 tools connected + system prompt |
| 9 | Smoke test | End-to-end verification |
