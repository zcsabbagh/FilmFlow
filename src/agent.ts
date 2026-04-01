import { query, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync } from "fs";
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

type AskUserFn = (question: string) => Promise<string>;

function getSharedOptions() {
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

  return {
    systemPrompt: SYSTEM_PROMPT,
    cwd: process.cwd(),
    allowedTools: [
      "Read", "Write", "Edit", "Bash", "Glob", "Grep",
      "WebSearch", "WebFetch",
    ],
    mcpServers: {
      "filmflow-tools": filmflowTools,
    },
    permissionMode: "bypassPermissions" as const,
    allowDangerouslySkipPermissions: true,
    maxTurns: 200,
  };
}

async function runQuery(prompt: string, options: ReturnType<typeof getSharedOptions> & { resume?: string }): Promise<string | undefined> {
  let sessionId: string | undefined;

  for await (const message of query({ prompt, options })) {
    // Capture session ID from init message
    if (message.type === "system" && message.subtype === "init") {
      sessionId = message.session_id;
    }
    if ("result" in message) {
      console.log(message.result);
    }
  }

  return sessionId;
}

export async function runAgent(prompt: string, askUser: AskUserFn) {
  const outputDir = join(process.cwd(), "output");
  mkdirSync(outputDir, { recursive: true });

  const options = getSharedOptions();

  // First turn: send the initial prompt
  console.log("\n🎬 FilmFlow — starting...\n");
  const sessionId = await runQuery(prompt, options);

  if (!sessionId) {
    console.error("Failed to get session ID");
    return;
  }

  console.log(`\n📎 Session: ${sessionId}\n`);

  // Interactive loop: resume the session with user follow-ups
  while (true) {
    const response = await askUser("\n> ");
    const trimmed = response.trim().toLowerCase();

    if (trimmed === "exit" || trimmed === "quit" || trimmed === "") {
      console.log("👋 Done.");
      break;
    }

    // Resume the same session with the user's follow-up
    await runQuery(response, { ...options, resume: sessionId });
  }
}

/**
 * Resume a previous session by ID.
 * Usage: filmflow --resume <session-id> "your follow-up message"
 */
export async function resumeAgent(sessionId: string, prompt: string, askUser: AskUserFn) {
  const options = getSharedOptions();

  console.log(`\n🎬 FilmFlow — resuming session ${sessionId}...\n`);
  await runQuery(prompt, { ...options, resume: sessionId });

  // Interactive loop
  while (true) {
    const response = await askUser("\n> ");
    const trimmed = response.trim().toLowerCase();

    if (trimmed === "exit" || trimmed === "quit" || trimmed === "") {
      console.log("👋 Done.");
      break;
    }

    await runQuery(response, { ...options, resume: sessionId });
  }
}
